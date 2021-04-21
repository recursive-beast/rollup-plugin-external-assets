import path from "path";
import fs from "fs/promises";
import externalAssets from "../src/index";
import { getRollupOutput } from "./helpers";
import { InputOptions, OutputOptions } from "rollup";

const assetBuffersMap: Record<string, Buffer> = {};

beforeAll(async () => {
	const filepaths = [
		"tests/fixtures/assets/image.png",
		"tests/fixtures/assets/image2.png",
		"tests/fixtures/assets/styles.css",
		"tests/fixtures/assets/text.txt",
		"tests/fixtures/node_modules/@fontsource/open-sans/files/open-sans-all-300-italic.woff",
	].map(filepath => path.resolve(filepath));
	const promises = filepaths.map(filepath => fs.readFile(filepath));
	const buffers = await Promise.all(promises);

	for (let i = 0; i < filepaths.length; i++) {
		assetBuffersMap[filepaths[i]] = buffers[i];
	}
});

const specs: [string, InputOptions, OutputOptions, string[], { name: string | RegExp, filepath: string }[]][] = [
	[
		"output.format = 'es'",
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			format: "es",
		},
		["index1"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"output.format = 'cjs'",
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			format: "cjs",
		},
		["index1"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"output.format = 'amd'",
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			format: "amd",
		},
		["index1"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"output.format = 'umd'",
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			format: "umd",
			name: "test",
		},
		["index1"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"output.format = 'system'",
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			format: "system",
		},
		["index1"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"output.dir = 'sub/abcd'",
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			dir: "sub/abcd",
		},
		["index1"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"output.dir = 'sub/abcd' && output.entryFileNames = 'a/b/[name].js'",
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			dir: "sub/abcd",
			entryFileNames: "a/b/[name].js",
		},
		["index1"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"output.dir = 'sub/abcd' && output.entryFileNames = 'a/b/[name].js' && output.assetFileNames = 'assets/sub/[name]-[hash][extname]'",
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			dir: "sub/abcd",
			entryFileNames: "a/b/[name].js",
			assetFileNames: "assets/sub/[name]-[hash][extname]",
		},
		["index1"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"output.file = 'sub/abcd/out.js' && output.assetFileNames = 'assets/sub/[name]-[hash][extname]'",
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			file: "sub/abcd/out.js",
			assetFileNames: "assets/sub/[name]-[hash][extname]",
		},
		["index1"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"output.dir = 'sub/abcd' && preserveModules = true",
		{
			input: "tests/fixtures/src/sub/index4.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			dir: "sub/abcd",
			preserveModules: true,
		},
		["index4", "file1", "file2"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"multiple inputs with shared chunks && output.chunkFileNames = 'chunks/sub/[name].js'",
		{
			input: ["tests/fixtures/src/index1.js", "tests/fixtures/src/sub/index4.js"],
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			chunkFileNames: "chunks/sub/[name].js"
		},
		["index4", "index1", "file2"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"treeshake.moduleSideEffects = false",
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
			treeshake: { moduleSideEffects: false }
		},
		{},
		["index1"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"deduplicate assets with different names",
		{
			input: "tests/fixtures/src/index6.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{},
		["index6"],
		[
			{
				name: /^image2?\.png$/,
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"dynamic imports",
		{
			input: "tests/fixtures/src/index5.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{},
		["index5"],
		[
			{
				name: "image.png",
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
	[
		"dynamic imports && duplicate assets",
		{
			input: "tests/fixtures/src/index7.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{},
		["index7"],
		[
			{
				name: /^image2?\.png$/,
				filepath: path.resolve("tests/fixtures/assets/image.png"),
			},
			{
				name: "styles.css",
				filepath: path.resolve("tests/fixtures/assets/styles.css"),
			},
			{
				name: "text.txt",
				filepath: path.resolve("tests/fixtures/assets/text.txt"),
			},
		],
	],
];

test.each(specs)("%s", async (title, inputOptions, outputOptions, expectedChunkNames, expectedAssets) => {
	const { chunks, assets } = await getRollupOutput(inputOptions, outputOptions);

	expect(chunks.length).toBe(expectedChunkNames.length);

	expectedChunkNames.sort();
	chunks.sort((a, b) => a.name.localeCompare(b.name));

	for (const [index, chunk] of chunks.entries()) {
		expect(chunk.name).toBe(expectedChunkNames[index]);
		expect(chunk.code).toMatchSnapshot(expectedChunkNames[index]);
	}

	expect(assets.length).toBe(expectedAssets.length);

	for (const expectedAsset of expectedAssets) {
		expect(assets).toContainEqual(expect.objectContaining({
			name: expect.stringMatching(expectedAsset.name),
			source: assetBuffersMap[expectedAsset.filepath],
		}));
	}
});
