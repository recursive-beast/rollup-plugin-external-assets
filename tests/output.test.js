const test = require("ava");
const { outputSnapshotMacro } = require("./macros");
const externalAssets = require("..");

function outputSnapshotWithFixedInputMacro(t, outputOptions) {
	return outputSnapshotMacro(t,
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [
				externalAssets("tests/fixtures/assets/*"),
			],
		},
		outputOptions,
	);
};

const outputFormats = ["es", "cjs", "amd", "iife", "umd", "system"];

for (const format of outputFormats) {
	test(`output.format = '${format}'`, outputSnapshotWithFixedInputMacro,
		{
			name: "mybundle", // required for iife bundles.
			format,
		}
	);
}


test("output.sourcemaps = true", outputSnapshotWithFixedInputMacro,
	{
		sourcemap: true,
	}
);

test("output.dir = 'sub/abcd'", outputSnapshotWithFixedInputMacro,
	{
		dir: "sub/abcd",
	}
);

test(
	[
		"output.dir = 'sub/abcd'",
		"output.entryFileNames = 'a/b/[name].js'",
	].join(" && "),
	outputSnapshotWithFixedInputMacro,
	{
		dir: "sub/abcd",
		entryFileNames: "a/b/[name].js",
	}
);

test(
	[
		"output.dir = 'sub/abcd'",
		"output.entryFileNames = 'a/b/[name].js'",
		"output.assetFileNames = 'assets/sub/[name]_[hash][extname]'",
	].join(" && "),
	outputSnapshotWithFixedInputMacro,
	{
		dir: "sub/abcd",
		entryFileNames: "a/b/[name].js",
		assetFileNames: "assets/sub/[name]_[hash][extname]",
	}
);

// TODO: recast throws an error when a chunk contains dynamic imports,
// I tried to use acorn instead of the default esprima parser, but the error is still the same.
// I'll invistigate the source of that error later, but for now I'll only test static imports.
