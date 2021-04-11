import fs from "fs/promises";
import path from "path";
import { rollup, InputOptions, OutputOptions, OutputChunk, OutputAsset } from "rollup";
import { getAssetsSnapshot, getChunksSnapshot, noop } from "./helpers";

export async function outputSnapshotMacro(inputOptions: InputOptions, outputOptions?: OutputOptions) {
	if (process.env.ROLLUP_WARNINGS === "false") {
		inputOptions = { ...inputOptions, onwarn: noop };
	}

	const bundle = await rollup(inputOptions);
	const { output } = await bundle.generate(outputOptions || {});

	const chunks = output.filter(element => element.type === "chunk") as OutputChunk[];
	const assets = output.filter(element => element.type === "asset") as OutputAsset[];
	const chunksSnapshot = getChunksSnapshot(chunks);
	const assetsSnapshot = getAssetsSnapshot(assets);


	expect(chunksSnapshot).toMatchSnapshot();
	expect(assetsSnapshot).toMatchSnapshot();

	for (const asset of assets) {
		const fixture_path = /\.woff$/.test(asset.name as string) // font assets from the @fontsource/open-sans package.
			? `tests/fixtures/node_modules/@fontsource/open-sans/files/${asset.name}`
			: `tests/fixtures/assets/${asset.name}`;

		const fixture_buffer = await fs.readFile(fixture_path);
		const asset_buffer = Buffer.from(asset.source);
		const isEqual = fixture_buffer.equals(asset_buffer);

		expect(isEqual).toBe(true);
	}
};
