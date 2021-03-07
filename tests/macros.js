const { rollup } = require("rollup");
const fs = require("fs/promises");

function noop() { }

const getChunksSnapshot = output => output.map(chunk => {
	const whiteList = [
		"code",
		"fileName",
		"name",
		"isDynamicEntry",
		"isEntry",
		"isImplicitEntry",
		"map",
	];

	const obj = {};
	whiteList.forEach(key => {
		let value = chunk[key];
		// normalize for windows.
		if (key === "code") value = value.replace(/\r\n/g, "\n");
		obj[key] = value;
	});
	return obj;
});

const getAssetsSnapshot = output => output.map(asset => {
	const whiteList = [
		"fileName",
		"name",
	];

	const obj = {};
	whiteList.forEach(key => obj[key] = asset[key]);
	return obj;
});

module.exports.outputSnapshotMacro = async function (t, options) {
	let { output: outputOptions = {}, ...inputOptions } = options;

	if (process.argv.includes("no-rollup-warnings")) {
		inputOptions = { ...inputOptions, onwarn: noop };
	}

	const bundle = await rollup(inputOptions);
	t.teardown(async () => await bundle.close());
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
