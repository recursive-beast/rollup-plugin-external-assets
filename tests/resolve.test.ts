import path from "path";
import nodeResolve from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import { getRollupBundle } from "./helpers";
import externalAssets from "../src/index";

test("Skips resolving entrypoints", async () => {
	const plugin = externalAssets("dummy_patern");
	// @ts-ignore
	const resolution = await plugin.resolveId("dummy_source", undefined, {});

	expect(resolution).toBe(null);
});

test(`Resolve with @rollup/plugin-node-resolve`, async () => {
	const plugin = externalAssets(["tests/fixtures/assets/*", /@fontsource\/open-sans/]);
	const spy = jest.spyOn(plugin, "load");

	const bundle = await getRollupBundle({
		input: "tests/fixtures/src/index2.js",
		plugins: [
			nodeResolve({ moduleDirectories: ["tests/fixtures/node_modules"] }),
			plugin,
		],
	});

	const expectedIds = [
		"src/index2.js",
		"src/index1.js",
		"node_modules/@fontsource/open-sans/files/open-sans-all-300-italic.woff",
		"assets/image.png",
		"src/file1.js",
		"src/file2.js",
		"assets/styles.css",
		"assets/text.txt",
	].map(filepath => path.resolve("tests/fixtures", filepath));

	// Flatten single level array.
	const loadedIds = ([] as string[]).concat(...spy.mock.calls);

	expect(loadedIds.length).toBe(expectedIds.length);
	expect(loadedIds).toEqual(expect.arrayContaining(expectedIds));
});

test(`Resolve with @rollup/plugin-alias && @rollup/plugin-node-resolve`, async () => {
	const plugin = externalAssets(["tests/fixtures/assets/*", /@fontsource\/open-sans/]);
	const spy = jest.spyOn(plugin, "load");

	const bundle = await getRollupBundle({
		input: "tests/fixtures/src/sub/index3.js",
		plugins: [
			nodeResolve({ moduleDirectories: ["tests/fixtures/node_modules"] }),
			alias({ entries: [{ find: '@assets_alias', replacement: '../../assets' }] }),
			plugin,
		],
	});

	const expectedIds = [
		"src/sub/index3.js",
		"src/index2.js",
		"src/index1.js",
		"node_modules/@fontsource/open-sans/files/open-sans-all-300-italic.woff",
		"assets/image.png",
		"src/file1.js",
		"src/file2.js",
		"assets/styles.css",
		"assets/text.txt",
	].map(filepath => path.resolve("tests/fixtures", filepath));

	// Flatten single level array.
	const loadedIds = ([] as string[]).concat(...spy.mock.calls);

	expect(loadedIds.length).toBe(expectedIds.length);
	expect(loadedIds).toEqual(expect.arrayContaining(expectedIds));
});
