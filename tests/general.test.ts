import nodeResolve from "@rollup/plugin-node-resolve";
import { outputSnapshotMacro } from "./macros";
import externalAssets from "../src/index";

describe("falsy values as filter patterns", () => {
	const falsy = [undefined, null, false, "", NaN, 0];

	for (const value of falsy) {
		const stringified = value !== value ? "NaN" : JSON.stringify(value);

		test("" + stringified, () => {
			expect(() => externalAssets(value as any)).toThrow(Error);
		});
	}
});

test("Multiple instances of the plugin can be used at the same time", () => {
	return outputSnapshotMacro({
		input: "tests/fixtures/src/index2.js",
		plugins: [
			externalAssets("tests/fixtures/assets/*"),
			nodeResolve({
				moduleDirectories: ["tests/fixtures/node_modules"],
			}),
			externalAssets(/@fontsource\/open-sans/),
		],
	});
});
