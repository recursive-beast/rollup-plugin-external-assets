const { rollup } = require("rollup");

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

async function getRollupBundle(t, inputOptions) {
	if (process.argv.includes("no-rollup-warnings")) {
		inputOptions = { ...inputOptions, onwarn: noop };
	}

	const bundle = await rollup(inputOptions);
	t.teardown(async () => await bundle.close());

	return bundle;
};

module.exports = {
	noop,
	getAssetsSnapshot,
	getChunksSnapshot,
	getRollupBundle,
};
