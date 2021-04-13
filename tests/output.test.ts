import externalAssets from "../src/index";
import { getAssetsExpectation, getRollupOutput } from "./helpers";

describe("output formats", () => {
	const outputFormats = ["es", "cjs", "amd", "umd", "system"] as const;

	for (const format of outputFormats) {
		test(format, async () => {
			const { chunks, assets } = await getRollupOutput(
				{
					input: "tests/fixtures/src/index1.js",
					plugins: [externalAssets("tests/fixtures/assets/*")],
				},
				{
					name: "mybundle", // required for iife bundles.
					format,
				}
			);

			expect(chunks.length).toBe(1);

			expect({
				filename: chunks[0].fileName,
				code: chunks[0].code,
			}).toMatchSnapshot();

			expect(assets.length).toBe(3);

			const expectedAssets = await getAssetsExpectation([
				"tests/fixtures/assets/image.png",
				"tests/fixtures/assets/styles.css",
				"tests/fixtures/assets/text.txt",
			]);

			expect(assets).toEqual(expectedAssets);
		});
	}
});

test("output.dir = 'sub/abcd'", async () => {
	const { chunks, assets } = await getRollupOutput(
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{ dir: "sub/abcd" }
	);

	expect(chunks.length).toBe(1);

	expect({
		filename: chunks[0].fileName,
		code: chunks[0].code,
	}).toMatchSnapshot();

	expect(assets.length).toBe(3);

	const expectedAssets = await getAssetsExpectation([
		"tests/fixtures/assets/image.png",
		"tests/fixtures/assets/styles.css",
		"tests/fixtures/assets/text.txt",
	]);

	expect(assets).toEqual(expectedAssets);
});

test("output.dir = 'sub/abcd' && output.entryFileNames = 'a/b/[name].js'", async () => {
	const { chunks, assets } = await getRollupOutput(
		{
			input: "tests/fixtures/src/index1.js",
			plugins: [externalAssets("tests/fixtures/assets/*")],
		},
		{
			dir: "sub/abcd",
			entryFileNames: "a/b/[name].js",
		}
	);

	expect(chunks.length).toBe(1);

	expect({
		filename: chunks[0].fileName,
		code: chunks[0].code,
	}).toMatchSnapshot();

	expect(assets.length).toBe(3);

	const expectedAssets = await getAssetsExpectation([
		"tests/fixtures/assets/image.png",
		"tests/fixtures/assets/styles.css",
		"tests/fixtures/assets/text.txt",
	]);

	expect(assets).toEqual(expectedAssets);
});

test("output.dir = 'sub/abcd' && output.entryFileNames = 'a/b/[name].js' && output.assetFileNames = 'assets/sub/[name]-[hash][extname]'",
	async () => {
		const { chunks, assets } = await getRollupOutput(
			{
				input: "tests/fixtures/src/index1.js",
				plugins: [externalAssets("tests/fixtures/assets/*")],
			},
			{
				dir: "sub/abcd",
				entryFileNames: "a/b/[name].js",
				assetFileNames: "assets/sub/[name]-[hash][extname]",
			}
		);

		expect(chunks.length).toBe(1);

		expect({
			filename: chunks[0].fileName,
			code: chunks[0].code,
		}).toMatchSnapshot();

		expect(assets.length).toBe(3);

		const expectedAssets = await getAssetsExpectation([
			"tests/fixtures/assets/image.png",
			"tests/fixtures/assets/styles.css",
			"tests/fixtures/assets/text.txt",
		]);

		expect(assets).toEqual(expectedAssets);
	}
);

test("output.file = 'sub/abcd/out.js' && output.assetFileNames = 'assets/sub/[name]-[hash][extname]'",
	async () => {
		const { chunks, assets } = await getRollupOutput(
			{
				input: "tests/fixtures/src/index1.js",
				plugins: [externalAssets("tests/fixtures/assets/*")],
			},
			{
				file: "sub/abcd/out.js",
				assetFileNames: "assets/sub/[name]-[hash][extname]",
			}
		);

		expect(chunks.length).toBe(1);

		expect({
			filename: chunks[0].fileName,
			code: chunks[0].code,
		}).toMatchSnapshot();

		expect(assets.length).toBe(3);

		const expectedAssets = await getAssetsExpectation([
			"tests/fixtures/assets/image.png",
			"tests/fixtures/assets/styles.css",
			"tests/fixtures/assets/text.txt",
		]);

		expect(assets).toEqual(expectedAssets);
	}
);

test("output.dir = 'sub/abcd' && preserveModules = true",
	async () => {
		const { chunks, assets } = await getRollupOutput(
			{
				input: "tests/fixtures/src/sub/index4.js",
				plugins: [externalAssets("tests/fixtures/assets/*")],
			},
			{
				dir: "sub/abcd",
				preserveModules: true,
			}
		);

		expect(chunks.length).toBe(3);

		for (let i = 0; i < 3; i++) {
			expect({
				filename: chunks[i].fileName,
				code: chunks[i].code,
			}).toMatchSnapshot();
		}

		expect(assets.length).toBe(3);

		const expectedAssets = await getAssetsExpectation([
			"tests/fixtures/assets/image.png",
			"tests/fixtures/assets/styles.css",
			"tests/fixtures/assets/text.txt",
		]);

		expect(assets).toEqual(expectedAssets);
	}
);

test("multiple inputs with shared chunks && output.chunkFileNames = 'chunks/sub/[name].js'",
	async () => {
		const { chunks, assets } = await getRollupOutput(
			{
				input: ["tests/fixtures/src/index1.js", "tests/fixtures/src/sub/index4.js"],
				plugins: [externalAssets("tests/fixtures/assets/*")],
			},
			{
				chunkFileNames: "chunks/sub/[name].js",
			}
		);

		expect(chunks.length).toBe(3);

		for (let i = 0; i < 3; i++) {
			expect({
				filename: chunks[i].fileName,
				code: chunks[i].code,
			}).toMatchSnapshot();
		}

		expect(assets.length).toBe(3);

		const expectedAssets = await getAssetsExpectation([
			"tests/fixtures/assets/image.png",
			"tests/fixtures/assets/styles.css",
			"tests/fixtures/assets/text.txt",
		]);

		expect(assets).toEqual(expectedAssets);
	}
);

// Will remove empty imports.
test("treeshake.moduleSideEffects = false", async () => {
	const { chunks, assets } = await getRollupOutput({
		input: "tests/fixtures/src/index1.js",
		plugins: [externalAssets("tests/fixtures/assets/*")],
		treeshake: {
			moduleSideEffects: false,
		}
	});

	expect(chunks.length).toBe(1);

	expect({
		filename: chunks[0].fileName,
		code: chunks[0].code,
	}).toMatchSnapshot();

	expect(assets.length).toBe(2);

	const expectedAssets = await getAssetsExpectation([
		"tests/fixtures/assets/image.png",
		"tests/fixtures/assets/text.txt",
	]);

	expect(assets).toEqual(expectedAssets);
});

test("deduplicate assets with different names", async () => {
	const { chunks, assets } = await getRollupOutput({
		input: "tests/fixtures/src/index6.js",
		plugins: [externalAssets("tests/fixtures/assets/*")],
	});

	expect(chunks.length).toBe(1);

	expect({
		filename: chunks[0].fileName,
		code: chunks[0].code,
	}).toMatchSnapshot();

	expect(assets.length).toBe(3);

	const expectedAssets = await getAssetsExpectation([
		"tests/fixtures/assets/image2.png", // not image.png
		"tests/fixtures/assets/styles.css",
		"tests/fixtures/assets/text.txt",
	]);

	expect(assets).toEqual(expectedAssets);
});

test.todo("dynamic imports");
