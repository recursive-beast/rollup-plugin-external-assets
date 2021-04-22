import path from "path";
import { getOutputId, normalizeFilterPattern } from "../src/helpers";

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

test("normalizeFilterPattern", () => {
	expect(normalizeFilterPattern()).toBeUndefined();
	expect(normalizeFilterPattern(null)).toBeNull();
	expect(normalizeFilterPattern(/\.txt/g)).toStrictEqual(/\.txt/g);
	expect(normalizeFilterPattern("abc/def/**/*")).toBe("abc/def/**/*");
	expect(normalizeFilterPattern("abc\\def\\**\\*")).toBe("abc/def/**/*");
	expect(normalizeFilterPattern(path.resolve("abc/def/**/*"))).toBe(path.resolve("abc/def/**/*").replace(/\\/g, "/"));
	expect([
		normalizeFilterPattern(/\.txt/g),
		normalizeFilterPattern("abc/def/**/*"),
		normalizeFilterPattern("abc\\def\\**\\*"),
		normalizeFilterPattern(path.resolve("abc/def/**/*")),
	]).toStrictEqual([
		/\.txt/g,
		"abc/def/**/*",
		"abc/def/**/*",
		path.resolve("abc/def/**/*").replace(/\\/g, "/"),
	]);
});
