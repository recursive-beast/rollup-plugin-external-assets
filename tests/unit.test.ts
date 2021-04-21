import path from "path";
import { getOutputId } from "../src/helpers";

test("getOutputId", () => {
	expect(getOutputId("a.ext", { dir: "out" })).toBe(path.resolve("out/a.ext"));
	expect(getOutputId("a/b.ext", { dir: "out" })).toBe(path.resolve("out/a/b.ext"));
	expect(getOutputId("a/b.ext", { dir: "out/sub" })).toBe(path.resolve("out/sub/a/b.ext"));
	expect(getOutputId("a.b", { file: "dist/x.ext" })).toBe(path.resolve("dist/a.b"));
	expect(getOutputId("sub/a.b", { file: "dist/x.ext" })).toBe(path.resolve("dist/sub/a.b"));
	expect(getOutputId("a/b.ext", { file: "dist/x/y.ext" })).toBe(path.resolve("dist/x/a/b.ext"));
	expect(getOutputId("a/b.ext", { file: "dist/x.ext" })).toBe(path.resolve("dist/a/b.ext"));
	expect(getOutputId("a.ext", {})).toBe(path.resolve("a.ext"));
	expect(getOutputId("a/b.ext", {})).toBe(path.resolve("a/b.ext"));
});
