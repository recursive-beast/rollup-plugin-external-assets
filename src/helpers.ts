import { FilterPattern, normalizePath } from "@rollup/pluginutils";
import path from "path";
import { OutputOptions } from "rollup";

export function getOutputId(filename: string, outputOptions: OutputOptions) {
	// Extract output directory from outputOptions.
	let output_dir = outputOptions.dir || ".";
	if (outputOptions.file) {
		output_dir = path.dirname(outputOptions.file);
	}

	// Note: `filename` can have sub-directories. eg: a/b/name.ext
	return path.resolve(output_dir, filename);
}

export function getRelativeImportPath(from: string, to: string) {
	let import_path = path.relative(from, to)
		.split(path.sep)
		.join("/");

	// Prepend "./" if needed.
	if (!import_path.startsWith("../")) {
		import_path = `./${import_path}`;
	}

	return import_path;
}

export function normalizeFilterPattern(pattern?: FilterPattern): FilterPattern | undefined {
	if (typeof pattern === "string") return normalizePath(pattern);

	if (Array.isArray(pattern)) {
		return pattern.map(element => {
			if (typeof element === "string") return normalizePath(element);
			return element;
		});
	}

	return pattern;
}
