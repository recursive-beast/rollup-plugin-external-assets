import path from "path";
import {
	getOutputId,
	getIdDeduplicator,
} from "../src/helpers";

test("getIdDeduplicator", async () => {
	const deduplicateId = getIdDeduplicator();

	const image = path.resolve("tests/fixtures/assets/image.png");
	const image2 = path.resolve("tests/fixtures/assets/image2.png");
	const text = path.resolve("tests/fixtures/assets/text.txt");

	expect(async () => await deduplicateId("/non/existent/path")).rejects.toThrow();
	expect(await deduplicateId(image)).toBe(image);
	expect(await deduplicateId(text)).toBe(text);
	expect(await deduplicateId(image2)).toBe(image);
	expect(await deduplicateId(image)).toBe(image);
	expect(await deduplicateId(image2)).toBe(image);
});

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
