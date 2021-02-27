const test = require("ava");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const { rollup } = require("rollup");
const { outputSnapshotMacro } = require("./macros");
const externalAssets = require("..");

const falsy = [undefined, null, false, "", NaN, 0];

for (const value of falsy) {
	const replacement = value !== value ? "NaN" : JSON.stringify(value);

	test(`Throws if pattern = ${replacement}`, t => {
		t.throws(() => {
			externalAssets(value);
		});
	});
}

// Solved by re-positioning the plugin to be the first on the list.
test("Plugin works even if it's not the first in the list", async t => {
	await t.notThrowsAsync(
		rollup({
			input: "tests/fixtures/src/index2.js",
			plugins: [
				nodeResolve({
					moduleDirectories: ["tests/fixtures/node_modules"],
				}),
				externalAssets(["tests/fixtures/assets/*", /@fontsource\/open-sans/]),
			],
		})
	);
});

test("Multiple instances of the plugin can be used at the same time", outputSnapshotMacro,
	{
		input: "tests/fixtures/src/index2.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
			nodeResolve({
				moduleDirectories: ["tests/fixtures/node_modules"],
			}),
			externalAssets(/@fontsource\/open-sans/),
		],
	}
);
