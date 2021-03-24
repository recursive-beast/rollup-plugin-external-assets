import fs from "fs";
import path from "path";
import crypto from "crypto";
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

export function getContentHash(filepath: string) {
	const md5sum = crypto.createHash("md5");

	return new Promise<string>((resolve, reject) =>
		fs.createReadStream(filepath)
			.on("data", chunk => md5sum.update(chunk))
			.on("end", () => resolve(md5sum.digest("hex")))
			.on("error", err => reject(err))
	);
}

export function getIdDeduplicator() {
	const hashToIdMap: Record<string, string | undefined> = {};

	return async (id: string) => {
		const hash = await getContentHash(id);
		let result = hashToIdMap[hash];

		if (result) return result;

		hashToIdMap[hash] = id;
		return id;
	}
}
