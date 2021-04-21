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
