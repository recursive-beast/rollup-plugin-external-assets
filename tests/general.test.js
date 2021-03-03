const test = require("ava");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
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
