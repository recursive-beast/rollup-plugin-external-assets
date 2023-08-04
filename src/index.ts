import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { createFilter } from "@rollup/pluginutils";
import fs from "fs/promises";
import Joi from "joi";
import path from "path";
import { Plugin } from "rollup";

const PLUGIN_NAME = "external-assets";
const PREFIX = `\0${PLUGIN_NAME}:`;

export type FilterPattern = string | RegExp | (string | RegExp)[];

export interface ExternalAssetsOptions {
	/** A pattern, or array of patterns, to match files the plugin should ignore. */
	include: FilterPattern;
	/** A pattern, or array of patterns, to match files the plugin should operate on. */
	exclude?: FilterPattern;
	/** The value will be used as the base directory for resolving patterns. By default it's `process.cwd()`. */
	resolve?: string;
}

const union = Joi.alternatives(Joi.string(), Joi.object().regex());
const patternSchema = Joi.alternatives<FilterPattern>(
	union,
	Joi.array().items(union).min(1)
);
const optionsSchema = Joi.object<ExternalAssetsOptions>({
	include: patternSchema.required(),
	exclude: patternSchema,
	resolve: Joi.string(),
});

function validate(arg: unknown): ExternalAssetsOptions {
	const pattern = patternSchema.validate(arg);

	if (!pattern.error) return { include: pattern.value };

	const options = optionsSchema.validate(arg);

	if (!options.error) return options.value;

	throw new TypeError("Invalid argument");
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

function externalAssets(arg: unknown): Plugin {
	const { include, exclude, resolve } = validate(arg);
	const idFilter = createFilter(include, exclude, { resolve });

	return {
		name: PLUGIN_NAME,

		resolveId(source, importer, options) {
			// skip resolving entry points or imports not introduced by us in the load hook.
			if (!importer || options.isEntry || !source.startsWith(PREFIX))
				return null;

			return {
				id: source,
				external: true,
			};
		},

		async load(id) {
			if (!idFilter(id)) return null;

			const ref = this.emitFile({
				type: "asset",
				name: path.basename(id),
				source: await fs.readFile(id),
			});

			return `export * from "${PREFIX}${ref}";
			export { default } from "${PREFIX}${ref}";
			`;
		},

		async renderChunk(code, chunk) {
			const context = this;
			const ast = parse(code, { sourceType: "unambiguous" });

			traverse(ast, {
				StringLiteral(nodePath) {
					const node = nodePath.node;
					const value = node.value;

					if (!value.startsWith(PREFIX)) return;

					const ref = value.slice(PREFIX.length);
					const assetFileName = context.getFileName(ref);
					const dir = path.dirname(chunk.fileName);
					let relative = path.posix.relative(dir, assetFileName);

					if (
						!relative.startsWith("./") &&
						!relative.startsWith("../")
					) {
						relative = "./" + relative;
					}

					node.value = relative;
				},
			});

			return generate(ast, { sourceMaps: true });
		},
	};
}

export { externalAssets };
export default externalAssets;
