import path from "path";
import nodeResolve from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import { getRollupBundle } from "./helpers";
import externalAssets from "../src/index";
import { InputOptions, Plugin } from "rollup";

test("Skips resolving entrypoints", async () => {
	const plugin = externalAssets("dummy_patern");
	// @ts-ignore
	const resolution = await plugin.resolveId("dummy_source", undefined, {});

	expect(resolution).toBe(null);
});

const specs: [string, InputOptions, string[]][] = [
	[
		"Resolve with @rollup/plugin-node-resolve",
		{
			input: "tests/fixtures/src/index2.js",
			plugins: [
				nodeResolve({ moduleDirectories: ["tests/fixtures/node_modules"] }),
				externalAssets(["tests/fixtures/assets/*", /@fontsource\/open-sans/]),
			],
		},
		[
			"src/index2.js",
			"src/index1.js",
			"node_modules/@fontsource/open-sans/files/open-sans-all-300-italic.woff",
			"assets/image.png",
			"src/file1.js",
			"src/file2.js",
			"assets/styles.css",
			"assets/text.txt",
		],
	],
	[
		"Resolve with @rollup/plugin-alias && @rollup/plugin-node-resolve",
		{
			input: "tests/fixtures/src/sub/index3.js",
			plugins: [
				nodeResolve({ moduleDirectories: ["tests/fixtures/node_modules"] }),
				alias({ entries: [{ find: '@assets_alias', replacement: '../../assets' }] }),
				externalAssets(["tests/fixtures/assets/*", /@fontsource\/open-sans/]),
			],
		},

		[
			"src/sub/index3.js",
			"src/index2.js",
			"src/index1.js",
			"node_modules/@fontsource/open-sans/files/open-sans-all-300-italic.woff",
			"assets/image.png",
			"src/file1.js",
			"src/file2.js",
			"assets/styles.css",
			"assets/text.txt",
		],
	],
];

test.each(specs)("%s", async (title, inputOptions, expectedLoadedFixtures) => {
	const plugins = inputOptions.plugins as Plugin[];
	const spy = jest.spyOn(plugins[plugins.length - 1], "load");

	await getRollupBundle(inputOptions);

	const expectedIds = expectedLoadedFixtures.map(fixture => path.resolve("tests/fixtures", fixture));

	// Flatten single level array.
	const loadedIds = ([] as string[]).concat(...spy.mock.calls);

	expect(loadedIds.length).toBe(expectedIds.length);
	expect(loadedIds).toEqual(expect.arrayContaining(expectedIds));
});
