import path from "path";
import fs from "fs/promises";
import fse from "fs-extra";
import os from "os";
import { rollup, OutputChunk, OutputAsset, InputOptions, OutputOptions, RollupBuild, RollupWatcher, RollupWatcherEvent } from "rollup";
import pkg from "../package.json";

export function noop() { }

export function isAsset(file: OutputChunk | OutputAsset): file is OutputAsset {
	return file.type === "asset";
}

export function isChunk(file: OutputChunk | OutputAsset): file is OutputChunk {
	return file.type === "chunk";
}

export function getRollupBundle(inputOptions: InputOptions) {
	if (process.env.ROLLUP_WARNINGS === "false") {
		inputOptions = { ...inputOptions, onwarn: noop };
	}

	return rollup(inputOptions);
}

export function getRollupOutput(inputOptions: InputOptions, outputOptions?: OutputOptions) {
	let bundle: RollupBuild | null = null;

	return getRollupBundle(inputOptions)
		.then(_bundle => {
			bundle = _bundle;
			return bundle.generate(outputOptions || {});
		})
		.then(({ output }) => ({
			chunks: output.filter(isChunk).map(chunk => ({ ...chunk, code: chunk.code.replace("\r\n", "\n") })),
			assets: output.filter(isAsset),
		}))
		.finally(() => bundle?.close());
}

export async function copyDirToTempdir(src: string) {
	const prefix = path.join(os.tmpdir(), pkg.name, "/");
	await fse.ensureDir(prefix);
	const tempdir = await fs.mkdtemp(prefix);
	await fse.copy(src, tempdir);
	return tempdir;
}

export const listenForRebuild = (watcher: RollupWatcher, changeTrigger: () => void) => new Promise<RollupBuild>((resolve, reject) => {

	function callback(event: RollupWatcherEvent) {
		if (event.code !== "ERROR" && event.code !== "BUNDLE_END") watcher.once("event", callback);
		else {
			if (event.code === "ERROR") reject(event.error);
			if (event.code === "BUNDLE_END") resolve(event.result);

			event.result?.close();
		}
	}

	watcher.once("event", callback);
	changeTrigger();
});
