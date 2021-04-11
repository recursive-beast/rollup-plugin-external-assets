import { outputSnapshotMacro } from "./macros";
import externalAssets from "../src/index";

describe("output formats", () => {
	const outputFormats = ["es", "cjs", "amd", "iife", "umd", "system"] as const;

	for (const format of outputFormats) {
		test(format, () => {
			return outputSnapshotMacro(
				{
					input: "tests/fixtures/src/index1.js",
					plugins: [
						externalAssets("tests/fixtures/assets/*"),
					],
				},
				{
					name: "mybundle", // required for iife bundles.
					format,
				}
			);
		});
	}
});

test("output.sourcemaps = true", () => {
	return outputSnapshotMacro(
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [
				externalAssets("tests/fixtures/assets/*"),
			],
		},
		{
			sourcemap: true,
		}
	);
});

test("output.dir = 'sub/abcd'", () => {
	return outputSnapshotMacro(
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [
				externalAssets("tests/fixtures/assets/*"),
			],
		},
		{
			dir: "sub/abcd",
		}
	);
});

test(
	[
		"output.dir = 'sub/abcd'",
		"output.entryFileNames = 'a/b/[name].js'",
	].join(" && "),
	() => {
		return outputSnapshotMacro(
			{
				input: "tests/fixtures/src/index1.js",
				plugins: [
					externalAssets("tests/fixtures/assets/*"),
				],
			},
			{
				dir: "sub/abcd",
				entryFileNames: "a/b/[name].js",
			}
		);
	}
);

test(
	[
		"output.dir = 'sub/abcd'",
		"output.entryFileNames = 'a/b/[name].js'",
		"output.assetFileNames = 'assets/sub/[name]_[hash][extname]'",
	].join(" && "),
	() => {
		return outputSnapshotMacro(
			{
				input: "tests/fixtures/src/index1.js",
				plugins: [
					externalAssets("tests/fixtures/assets/*"),
				],
			},
			{
				dir: "sub/abcd",
				entryFileNames: "a/b/[name].js",
				assetFileNames: "assets/sub/[name]_[hash][extname]",
			}
		);
	}
);

test(
	[
		"output.file = 'sub/abcd/out.js'",
		"output.assetFileNames = 'assets/sub/[name]_[hash][extname]'",
	].join(" && "),
	() => {
		return outputSnapshotMacro(
			{
				input: "tests/fixtures/src/index1.js",
				plugins: [
					externalAssets("tests/fixtures/assets/*"),
				],
			},
			{
				dir: "sub/abcd",
				assetFileNames: "assets/sub/[name]_[hash][extname]",
			}
		);
	}
);

test(
	[
		"output.dir = 'sub/abcd'",
		"preserveModules = true",
	].join(" && "),
	() => {
		return outputSnapshotMacro(
			{
				input: "tests/fixtures/src/sub/index4.js",
				plugins: [
					externalAssets("tests/fixtures/assets/*"),
				],
			},
			{
				dir: "sub/abcd",
				preserveModules: true,
			}
		);
	}
);

test(
	[
		"multiple inputs with shared chunks",
		"output.chunkFileNames = 'chunks/sub/[name]_[hash].js'",
	].join(" && "),
	() => {
		return outputSnapshotMacro(
			{
				input: ["tests/fixtures/src/index1.js", "tests/fixtures/src/sub/index4.js"],
				plugins: [
					externalAssets("tests/fixtures/assets/*"),
				],
			},
			{
				chunkFileNames: "chunks/sub/[name]_[hash].js",
			}
		);
	}
);

// Will remove empty imports.
test("treeshake.moduleSideEffects = false", () => {
	return outputSnapshotMacro({
		input: "tests/fixtures/src/index1.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
		treeshake: {
			moduleSideEffects: false,
		}
	});
});

test("deduplicate assets with different names", () => {
	return outputSnapshotMacro({
		input: "tests/fixtures/src/index6.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
	});
});
