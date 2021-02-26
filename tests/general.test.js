const test = require("ava");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const { bundleThrowsMacro } = require("./macros");
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

// If there's a plugin that resolves paths before ours, non-external imports trigger the load hook.
test("Plugin doesn't work if it's not the first in the list", bundleThrowsMacro,
	{
		input: "tests/fixtures/src/index2.js",
		plugins: [
			nodeResolve({
				moduleDirectories: ["tests/fixtures/node_modules"],
			}),
			externalAssets(["tests/fixtures/assets/*", /@fontsource\/open-sans/]),
		],
	},
	{
		code: "PARSE_ERROR",
	},
);
