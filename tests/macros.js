const { rollup } = require("rollup");

function noop() { }

const normalizeChunks = chunks => chunks.map(chunk => {
	// These properties are inconsistent between platforms.
	// (absolute paths, end of line chars)
	const {
		dynamicImports,
		facadeModuleId,
		importedBindings,
		imports,
		modules,
		referencedFiles,
		code,
		...rest
	} = chunk;

	return {
		...rest,
		code: code.replace(/\r\n|\n/g, "\n"),
	};
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
	const normalizedChunks = normalizeChunks(chunks);

	t.snapshot(normalizedChunks);
	t.snapshot(assets);
};
