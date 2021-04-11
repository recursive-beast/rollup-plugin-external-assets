import { outputSnapshotMacro } from "./macros";
import nodeResolve from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import externalAssets from "../src/index";

test("Skips resolving entrypoints", async () => {
	const plugin = externalAssets("dummy_patern");
	// @ts-ignore
	const resolution = await plugin.resolveId("dummy_source", undefined, {});

	expect(resolution).toBe(null);
});

test(`Resolve with @rollup/plugin-node-resolve`, () => {
	return outputSnapshotMacro({
		input: "tests/fixtures/src/index2.js",
		plugins: [
			nodeResolve({
				moduleDirectories: ["tests/fixtures/node_modules"],
			}),
			externalAssets(["tests/fixtures/assets/*", /@fontsource\/open-sans/]),
		],
	});
});

test(`Resolve with @rollup/plugin-alias && @rollup/plugin-node-resolve`, () => {
	return outputSnapshotMacro({
		input: "tests/fixtures/src/sub/index3.js",
		plugins: [
			nodeResolve({
				moduleDirectories: ["tests/fixtures/node_modules"],
			}),
			alias({
				entries: [
					{ find: '@assets_alias', replacement: '../../assets' },
				],
			}),
			externalAssets(["tests/fixtures/assets/*", /@fontsource\/open-sans/]),
		],
	});
});

test.skip("dynamic imports", () => {
	return outputSnapshotMacro({
		input: "tests/fixtures/src/index5.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
		],
	});
});
