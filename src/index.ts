import fs from "fs";
import path from "path";
import { Plugin, OutputOptions } from "rollup";
import { createFilter, FilterPattern } from "@rollup/pluginutils";
import { parse, print, types, visit } from "recast";

interface PluginOptions {
	/**
	 * A picomatch pattern, or array of patterns,
	 * which correspond to modules the plugin should operate on.
	 * By default all modules are targeted.
	 */
	include?: FilterPattern;
	/**
	 * A picomatch pattern, or array of patterns,
	 * which correspond to modules the plugin should ignore.
	 * By default no modules are ignored.
	 */
	exclude?: FilterPattern;
}

const PLUGIN_NAME = "external-assets";
const REGEX_ESCAPED_PLUGIN_NAME = PLUGIN_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function getOutputId(filename: string, outputOptions: OutputOptions) {
	// Extract output directory from outputOptions.
	let output_dir = outputOptions.dir || ".";
	if (outputOptions.file) {
		output_dir = path.dirname(outputOptions.file);
	}

	// Note: `filename` can have sub-directories. eg: a/b/name.ext
	return path.resolve(output_dir, filename);
}

function getRelativeImportPath(from: string, to: string) {
	let import_path = path.relative(from, to)
		.split(path.sep)
		.join("/");

	// Prepend "./" if needed.
	if (!import_path.startsWith("../")) {
		import_path = `./${import_path}`;
	}

	return import_path;
}

/**
 * Make assets external but include them in the output.
 * @param pattern - A picomatch pattern, or array of patterns,
 * which correspond to assets the plugin should operate on.
 * @param options - The options object.
 */
export default function externalAssets(pattern: FilterPattern, options?: PluginOptions): Plugin {
	if (!pattern) throw new Error("please specify a pattern for targeted assets");

	const importerFilter = createFilter(options?.include, options?.exclude);
	const sourceFilter = createFilter(pattern);

	return {
		name: PLUGIN_NAME,

		async options(inputOptions) {
			const plugins = inputOptions.plugins;

			// No transformations.
			if (!plugins) return null;

			// Separate our plugin from other plugins.
			const externalAssetsPlugins: Plugin[] = [];
			const otherPlugins = plugins.filter(plugin => {
				if (plugin.name !== PLUGIN_NAME) return true;

				externalAssetsPlugins.push(plugin);
				return false;
			});

			// Re-position our plugin to be the first in the list.
			// Otherwise, if there's a plugin that resolves paths before ours,
			// non-external imports can trigger the load hook for assets that can't be parsed by other plugins.
			return {
				...inputOptions,
				plugins: [
					...externalAssetsPlugins,
					...otherPlugins,
				],
			};
		},

		async resolveId(source, importer, options) {
			// `this.resolve` was called from another instance of this plugin. skip to avoid infinite loop.
			// or skip resolving entrypoints.
			// or don't resolve imports from filtered out modules.
			if (
				options.custom?.[PLUGIN_NAME]?.skip
				|| !importer
				|| !importerFilter(importer)
			) return null;

			// We'll delegate resolving to other plugins (alias, node-resolve ...),
			// or eventually, rollup itself.
			// We need to skip this plugin to avoid an infinite loop.
			const resolution = await this.resolve(source, importer, {
				skipSelf: true,
				custom: {
					[PLUGIN_NAME]: {
						skip: true,
					}
				}
			});

			// If it cannot be resolved, or if the id is filtered out,
			// return `null` so that Rollup displays an error.
			if (!resolution || !sourceFilter(resolution.id)) return null;

			return {
				...resolution,
				// We'll need `target_id` to emit the asset in the output phase.
				id: `${resolution.id}?${PLUGIN_NAME}&target_id=${resolution.id}`,
				external: true,
			};
		},

		async renderChunk(code, chunk, outputOptions) {
			const chunk_id = getOutputId(chunk.fileName, outputOptions);
			const chunk_basename = path.basename(chunk_id);

			const ast = parse(code, { sourceFileName: chunk_basename });
			const pattern = new RegExp(`.+\\?${REGEX_ESCAPED_PLUGIN_NAME}&target_id=(.+)`);
			const rollup_context = this;

			visit(ast, {
				visitLiteral(nodePath) {
					const node = nodePath.node;

					// We're only concerned with string literals.
					if (typeof node.value !== "string") return this.traverse(nodePath);

					const match = node.value.match(pattern);

					// This string does not refer to an import path that we resolved in the `resolveId` hook.
					if (!match) return this.traverse(nodePath);

					// Emit the targeted asset.
					const target_id = match[1];
					const asset_reference_id = rollup_context.emitFile({
						type: "asset",
						source: fs.readFileSync(target_id),
						name: path.basename(target_id),
					});

					// Get a relative path from this chunk to the emitted asset.
					const asset_filename = rollup_context.getFileName(asset_reference_id);
					const asset_id = getOutputId(asset_filename, outputOptions);
					const chunk_dir = path.dirname(chunk_id);
					let new_import_string = getRelativeImportPath(chunk_dir, asset_id);

					// Replace the import string literal with our new relative path.
					const replacementNode = types.builders.literal(new_import_string);
					nodePath.replace(replacementNode);

					// Continue traversing the ast.
					this.traverse(nodePath);
				},
			});

			const result = print(ast, { sourceMapName: `${chunk_basename}.map` });
			return {
				code: result.code,
				map: result.map,
			};
		},
	};
}
