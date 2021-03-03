const test = require("ava");
const { outputSnapshotMacro } = require("./macros");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const alias = require("@rollup/plugin-alias");
const externalAssets = require("..");

test("Skips resolving entrypoints", async t => {
	const plugin = externalAssets("dummy_patern");
	const resolution = await plugin.resolveId("dummy_source", undefined, {});

	t.is(resolution, null);
});

test(`Resolve with @rollup/plugin-node-resolve`, outputSnapshotMacro,
	{
		input: "tests/fixtures/src/index2.js",
		plugins: [
			externalAssets(["tests/fixtures/assets/*", /@fontsource\/open-sans/]),
			nodeResolve({
				moduleDirectories: ["tests/fixtures/node_modules"],
			}),
		],
	}
);

test(`Resolve with @rollup/plugin-alias && @rollup/plugin-node-resolve`, outputSnapshotMacro,
	{
		input: "tests/fixtures/src/sub/index3.js",
		plugins: [
			externalAssets(["tests/fixtures/assets/*", /@fontsource\/open-sans/]),
			nodeResolve({
				moduleDirectories: ["tests/fixtures/node_modules"],
			}),
			alias({
				entries: [
					{ find: '@assets_alias', replacement: '../../assets' },
				],
			}),
		],
	}
);
