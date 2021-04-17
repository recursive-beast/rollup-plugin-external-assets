import fs from "fs";
import path from "path";
import { Plugin } from "rollup";
import { createFilter, FilterPattern } from "@rollup/pluginutils";
import { parse, print, types, visit } from "recast";
import { getIdDeduplicator, getOutputId, getRelativeImportPath } from "./helpers";

const PLUGIN_NAME = "external-assets";
const PREFIX = `\0${PLUGIN_NAME}:`;

interface Options {
	/**
	 * Optionally resolves the patterns against a directory other than `process.cwd()`.
	 * If a `string` is specified, then the value will be used as the base directory.
	 * Relative paths will be resolved against `process.cwd()` first.
	 * If `false`, then the patterns will not be resolved against any directory.
	 */
	resolve?: string | false | null;
}

/**
 * Make assets external but include them in the output.
 * @param include A valid picomatch pattern, or array of patterns.
 * If `include` is omitted or has zero length, all imports will be processed.
 *
 * **Note**: patterns that include windows paths are normalized to be valid picomatch patterns.
 * @param exclude If an asset matches one of the `exclude` patterns, its import will not be processed.
 *
 * **Note**: patterns that include windows paths are normalized to be valid picomatch patterns.
 * @param options The options object.
 */
export default function externalAssets(
	include?: FilterPattern,
	exclude?: FilterPattern,
	options?: Options,
): Plugin {
	const idFilter = createFilter(include, exclude, options);
	const deduplicateId = getIdDeduplicator();

	return {
		name: PLUGIN_NAME,

		async resolveId(source, importer) {
			if (
				!importer // Skip entrypoints.
				|| !source.startsWith(PREFIX) // Not one of our internal ids (see the `load` hook).
			) return null;

			return {
				id: source,
				external: true
			};
		},

		async load(id) {
			if (!idFilter(id)) return null;

			// For two or more assets with the same content, only one asset is going to be emitted.
			// `this.emitFile` deduplicates in the same way.
			id = await deduplicateId(id);

			// Load a proxy module that rollup will discard in favor of inligning the imports.
			// The benefit of doing it this way, instead of resolving asset imports to external ids,
			// is that we get watch mode support out of the box.
			return `export * from "${PREFIX + id}";\n`
				+ `export { default } from "${PREFIX + id}";\n`;
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

					if (
						typeof value !== "string" // We're only concerned with string literals.
						|| !value.startsWith(PREFIX) // Not one of our internal ids (see the `load` hook).
					) return this.traverse(nodePath);

					const target_id = value.slice(PREFIX.length);

					// Emit the targeted asset.
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
