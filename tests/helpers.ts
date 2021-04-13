import path from "path";
import fsp from "fs/promises";
import { rollup, OutputChunk, OutputAsset, InputOptions, OutputOptions, RollupBuild } from "rollup";

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

export async function getAssetsExpectation(filepaths: string[]) {
	const promises = filepaths.map(async filepath => ({
		type: "asset",
		name: path.basename(filepath),
		source: await fsp.readFile(filepath),
	}));

	const assets = await Promise.all(promises);
	const assetObjects = assets.map(assetObject => expect.objectContaining(assetObject));

	return expect.arrayContaining(assetObjects);
}
