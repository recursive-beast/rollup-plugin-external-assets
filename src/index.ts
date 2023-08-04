import fs from "fs/promises";
import path from "path";
import { Plugin } from "rollup";
import { createFilter, normalizePath } from "@rollup/pluginutils";
import { parse, print, types, visit } from "recast";
import { getOutputId, getRelativeImportPath } from "./helpers";

const PLUGIN_NAME = "external-assets";
const PREFIX = `\0${PLUGIN_NAME}:`;

export type FilterPattern = string | RegExp | (string | RegExp)[];

export function isFilterPattern(value: unknown): value is FilterPattern {
	let tmp: unknown[];

	if (Array.isArray(value)) tmp = value;
	else tmp = [value];

	return tmp.every((e) => typeof e === "string" || e instanceof RegExp);
}

export interface ExternalAssetsOptions {
	/** A pattern, or array of patterns, to match files the plugin should ignore. */
	include: FilterPattern;
	/** A pattern, or array of patterns, to match files the plugin should operate on. */
	exclude?: FilterPattern;
	/** The value will be used as the base directory for resolving patterns. By default it's `process.cwd()`. */
	resolve?: string;
}

/**
 * Make assets external but include them in the output.
 * @param options The options object.
 */
function externalAssets(options: ExternalAssetsOptions): Plugin;

/**
 * Make assets external but include them in the output.
 * @param pattern A pattern, or array of patterns, to match files the plugin should ignore.
 */
function externalAssets(pattern: FilterPattern): Plugin;

function externalAssets(arg: FilterPattern | ExternalAssetsOptions): Plugin {
	let idFilter: ReturnType<typeof createFilter>;

	if (isFilterPattern(arg)) {
		idFilter = createFilter(arg);
	} else {
		const { include, exclude, resolve } = arg;
		idFilter = createFilter(include, exclude, { resolve });
	}

	const assets = new Map<string, Buffer>();

	return {
		name: PLUGIN_NAME,

		async resolveId(source, importer) {
			// We're not resolving anything here,
			// we only need to ignore the proxy imports introduced in the loaded module (check the load hook).
			if (importer && source.startsWith(PREFIX)) {
				return {
					id: source,
					external: true
				};
			}

			return null;
		},

		async resolveDynamicImport(specifier, importer) {
			if (typeof specifier !== "string") return null;

			const resolution = await this.resolve(specifier, importer, { skipSelf: true });

			if (!resolution || !idFilter(resolution.id)) return null;

			const id = resolution.id;
			const normalizedId = normalizePath(id);

			assets.set(normalizedId, await fs.readFile(id));

			this.addWatchFile(id);

			return {
				id: PREFIX + normalizedId,
				external: true,
			};
		},

		async load(id) {
			if (!idFilter(id)) return null;

			const normalizedId = normalizePath(id);

			assets.set(normalizedId, await fs.readFile(id));

			// Load a proxy module that rollup will discard in favor of inligning the imports.
			// The benefit of doing it this way, instead of resolving asset imports to external ids,
			// is that we get watch mode support out of the box.
			return `export * from "${PREFIX + normalizedId}";\n`
				+ `export { default } from "${PREFIX + normalizedId}";\n`;
		},

		async renderChunk(code, chunk, outputOptions) {
			const chunk_id = getOutputId(chunk.fileName, outputOptions);
			const chunk_basename = path.basename(chunk_id);
			const rollup_context = this;

			const customParser = {
				parse(source: string) {
					// Use rollup's internal acorn instance to parse `source`.
					return rollup_context.parse(source, {
						ecmaVersion: "latest",
						locations: true, // Needed by `recast` to preserve code formatting.
					});
				},
			};

			const ast = parse(code, {
				sourceFileName: chunk_basename,
				parser: customParser,
			});

			visit(ast, {
				visitLiteral(nodePath) {
					const value = nodePath.node.value;

					if (typeof value !== "string" || !value.startsWith(PREFIX)) return this.traverse(nodePath);

					const target_id = value.slice(PREFIX.length);

					// Emit the targeted asset.
					const asset_reference_id = rollup_context.emitFile({
						type: "asset",
						source: assets.get(target_id),
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

export { externalAssets };
export default externalAssets;
