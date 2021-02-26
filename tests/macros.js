const { rollup } = require("rollup");

function noop() { }

function cleanUpRollupOutput(output) {
	return output.map(chunkOrAsset => {
		if (chunkOrAsset.type === "asset") return chunkOrAsset;

		// These properties contain absolute paths,
		// and the path separator is not consistent between platforms.
		const {
			dynamicImports,
			facadeModuleId,
			importedBindings,
			imports,
			modules,
			referencedFiles,
			...rest
		} = chunkOrAsset;

		return { ...rest };
	});
}

module.exports.bundleThrowsMacro = async function (t, inputOptions, errorExpectations, expected_message) {
	await t.throwsAsync(async () => {
		const bundle = await rollup(inputOptions);

		// Just in case the test fails (rollup doesn't throw),
		// we should teardown the bundle.
		await bundle.close();
	},
		errorExpectations,
		expected_message
	);
};

module.exports.outputSnapshotMacro = async function (t, inputOptions, outputOptions = {}) {
	if (process.argv.includes("no-rollup-warnings")) {
		inputOptions = { ...inputOptions, onwarn: noop };
	}

	const bundle = await rollup(inputOptions);
	t.teardown(async () => await bundle.close());
	const { output } = await bundle.generate(outputOptions);
	const cleanOutput = cleanUpRollupOutput(output);

	t.snapshot(cleanOutput);
};
