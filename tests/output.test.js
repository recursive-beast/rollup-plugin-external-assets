const test = require("ava");
const { outputSnapshotMacro } = require("./macros");
const externalAssets = require("..");

const outputFormats = ["es", "cjs", "amd", "iife", "umd", "system"];

for (const format of outputFormats) {
	test(`output.format = '${format}'`, outputSnapshotMacro,
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [
				externalAssets("tests/fixtures/assets/*"),
			],
			output: {
				name: "mybundle", // required for iife bundles.
				format,
			},
		}
	);
}


test("output.sourcemaps = true", outputSnapshotMacro,
	{
		input: "tests/fixtures/src/index1.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
		output: {
			sourcemap: true,
		},
	}
);

test("output.dir = 'sub/abcd'", outputSnapshotMacro,
	{
		input: "tests/fixtures/src/index1.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
		output: {
			dir: "sub/abcd",
		},
	}
);

test(
	[
		"output.dir = 'sub/abcd'",
		"output.entryFileNames = 'a/b/[name].js'",
	].join(" && "),
	outputSnapshotMacro,
	{
		input: "tests/fixtures/src/index1.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
		output: {
			dir: "sub/abcd",
			entryFileNames: "a/b/[name].js",
		},
	}
);

test(
	[
		"output.dir = 'sub/abcd'",
		"output.entryFileNames = 'a/b/[name].js'",
		"output.assetFileNames = 'assets/sub/[name]_[hash][extname]'",
	].join(" && "),
	outputSnapshotMacro,
	{
		input: "tests/fixtures/src/index1.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
		output: {
			dir: "sub/abcd",
			entryFileNames: "a/b/[name].js",
			assetFileNames: "assets/sub/[name]_[hash][extname]",
		},
	}
);

test(
	[
		"output.file = 'sub/abcd/out.js'",
		"output.assetFileNames = 'assets/sub/[name]_[hash][extname]'",
	].join(" && "),
	outputSnapshotMacro,
	{
		input: "tests/fixtures/src/index1.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
		output: {
			file: "sub/abcd/out.js",
			assetFileNames: "assets/sub/[name]_[hash][extname]",
		},
	}
);

test(
	[
		"output.dir = 'sub/abcd'",
		"preserveModules = true",
	].join(" && "),
	outputSnapshotMacro,
	{
		input: "tests/fixtures/src/sub/index4.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
		output: {
			dir: "sub/abcd",
			preserveModules: true,
		},
	}
);

test(
	[
		"multiple inputs with shared chunks",
		"output.chunkFileNames = 'chunks/sub/[name]_[hash].js'",
	].join(" && "),
	outputSnapshotMacro,
	{
		input: ["tests/fixtures/src/index1.js", "tests/fixtures/src/sub/index4.js"],
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
		output: {
			chunkFileNames: "chunks/sub/[name]_[hash].js",
		},
	}
);

// Will remove empty imports.
test("treeshake.moduleSideEffects = false", outputSnapshotMacro,
	{
		input: "tests/fixtures/src/index1.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
		treeshake: {
			moduleSideEffects: false,
		},
	}
);

test.failing("dynamic imports", outputSnapshotMacro,
	{
		input: "tests/fixtures/src/index5.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
	}
);

test("deduplicate assets with different names", outputSnapshotMacro,
	{
		input: "tests/fixtures/src/index6.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
	}
);
