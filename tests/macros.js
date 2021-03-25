const fs = require("fs/promises");
const { getAssetsSnapshot, getChunksSnapshot, getRollupBundle } = require("./helpers");

module.exports.outputSnapshotMacro = async function (t, options) {
	let { output: outputOptions = {}, ...inputOptions } = options;

	const bundle = await getRollupBundle(t, inputOptions);
	const { output } = await bundle.generate(outputOptions);

	const chunks = output.filter(element => element.type === "chunk");
	const assets = output.filter(element => element.type === "asset");
	const chunksSnapshot = getChunksSnapshot(chunks);
	const assetsSnapshot = getAssetsSnapshot(assets);

	t.snapshot(chunksSnapshot);
	t.snapshot(assetsSnapshot);

	for (const asset of assets) {
		const fixture_path = /\.woff$/.test(asset.name) // font assets from the @fontsource/open-sans package.
			? `tests/fixtures/node_modules/@fontsource/open-sans/files/${asset.name}`
			: `tests/fixtures/assets/${asset.name}`;

		const fixture_buffer = await fs.readFile(fixture_path);
		const asset_buffer = Buffer.from(asset.source);
		const message = `fixture buffer does not equal asset buffer. asset.fileName='${asset.fileName}'`;

		t.true(fixture_buffer.equals(asset_buffer), message);
	}
};
