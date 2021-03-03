const { rollup } = require("rollup");

function noop() { }

function normalizeRollupOutput(output) {
	return output.map(chunkOrAsset => {
		if (chunkOrAsset.type === "asset") return chunkOrAsset;

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
		} = chunkOrAsset;

		return {
			...rest,
			code: code.replace(/\r\n|\n/g, "\n"),
		};
	});
}

module.exports.outputSnapshotMacro = async function (t, inputOptions, outputOptions = {}) {
	if (process.argv.includes("no-rollup-warnings")) {
		inputOptions = { ...inputOptions, onwarn: noop };
	}

	const bundle = await rollup(inputOptions);
	t.teardown(async () => await bundle.close());
	const { output } = await bundle.generate(outputOptions);
	const normalizedOutput = normalizeRollupOutput(output);

	t.snapshot(normalizedOutput);
};
