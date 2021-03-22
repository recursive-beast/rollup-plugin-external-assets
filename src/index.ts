import fs from "fs";
import path from "path";
import { Plugin } from "rollup";
import { createFilter, FilterPattern } from "@rollup/pluginutils";
import { parse, print, types, visit } from "recast";
import { getIdHash, getOutputId, getRelativeImportPath } from "./helpers";

const PLUGIN_NAME = "external-assets";
const PREFIX = `\0${PLUGIN_NAME}:`;

/**
 * Make assets external but include them in the output.
 * @param pattern - A picomatch pattern, or array of patterns,
 * which correspond to assets the plugin should operate on.
 */
export default function externalAssets(pattern: FilterPattern): Plugin {
	if (!pattern) throw new Error("please specify a pattern for targeted assets");

	const idFilter = createFilter(pattern);
	const hashToIdMap: Partial<Record<string, string>> = {};

	return {
		name: PLUGIN_NAME,

		async resolveId(source, importer) {
			if (
				!importer // Skip entrypoints.
				|| !source.startsWith(PREFIX) // Not a hash that was calculated in the `load` hook.
			) return null;

			return {
				id: source,
				external: true
			};
		},

		async load(id) {
			if (
				id.startsWith("\0") // Virtual module.
				|| id.includes("?") // Id reserved by some other plugin.
				|| !idFilter(id) // Filtered out id.
			) return null;

			const hash = await getIdHash(id);

			// In the output phase,
			// We'll use this mapping to replace the hash with a relative path from a chunk to the emitted asset.
			// Note that for two assets that have the same content, the hash is the same, so imports will get deduplicated,
			// also, `this.emitFile` deduplicates in the same way.
			hashToIdMap[hash] = id;

			// Load a proxy module with a hash as the import.
			// The hash will be resolved as external.
			// The benefit of doing it this way, instead of resolving asset imports to external ids,
			// is that we get watch mode support out of the box.
			return `export * from "${PREFIX + hash}";\n`
				+ `export { default } from "${PREFIX + hash}";\n`;
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
						|| !value.startsWith(PREFIX) // Not a hash that was calculated in the `load` hook.
					) return this.traverse(nodePath);

					const hash = value.slice(PREFIX.length);
					const target_id = hashToIdMap[hash];

					// The hash belongs to another instance of this plugin.
					if (!target_id) return this.traverse(nodePath);

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
