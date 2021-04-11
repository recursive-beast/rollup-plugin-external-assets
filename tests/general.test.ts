import externalAssets from "../src/index";

test("pattern is required", () => {
	// @ts-ignore
	expect(() => externalAssets()).toThrow(Error);
});
