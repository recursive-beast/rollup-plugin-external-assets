import { describe, expect, test } from "@jest/globals";
import { externalAssets } from "../src";

describe("validation", () => {
  describe("pattern or array of patterns", () => {
    test("throws on invalid pattern", () => {
      expect(() => externalAssets(null as any)).toThrow();
      expect(() => externalAssets("" as any)).toThrow();
      expect(() => externalAssets(1 as any)).toThrow();
      expect(() => externalAssets(false as any)).toThrow();
    });

    test("throws when a pattern in the array is invalid", () => {
      expect(() => externalAssets([] as any)).toThrow();
      expect(() => externalAssets([1] as any)).toThrow();
      expect(() => externalAssets([1, null] as any)).toThrow();
      expect(() => externalAssets(["assets/*.txt", null] as any)).toThrow();
      expect(() => externalAssets(["assets/*.txt", ""] as any)).toThrow();
      expect(() => externalAssets(["assets/*.txt", 1] as any)).toThrow();
      expect(() => externalAssets(["assets/*.txt", false] as any)).toThrow();
    });

    test("accepts a valid filter pattern", () => {
      expect(() => externalAssets("assets/*.txt")).not.toThrow();
      expect(() => externalAssets(/.txt$/)).not.toThrow();
    });

    test("accepts an array of valid filter patterns", () => {
      expect(() => externalAssets(["assets/*.txt", "assets/images/*.png"])).not.toThrow();
      expect(() =>externalAssets([/.txt$/, "assets/images/*.png"])).not.toThrow();
      expect(() => externalAssets([/.jpeg$/, /.txt$/])).not.toThrow();
    });
  });

  describe("options object", () => {
    test("include is mandatory", () => {
      expect(() => externalAssets({} as any)).toThrow();
      expect(() => externalAssets({ exclude: "assets/*.txt" } as any)).toThrow();
      expect(() => externalAssets({ resolve: "dir" } as any)).toThrow();
    });

    test("throws on invalid include pattern or array of patterns", () => {
      expect(() => externalAssets({ include: null } as any)).toThrow();
      expect(() => externalAssets({ include: "" } as any)).toThrow();
      expect(() => externalAssets({ include: 1 } as any)).toThrow();
      expect(() => externalAssets({ include: false } as any)).toThrow();
      expect(() => externalAssets({ include: [] } as any)).toThrow();
      expect(() => externalAssets({ include: [1] } as any)).toThrow();
      expect(() => externalAssets({ include: [1, null] } as any)).toThrow();
      expect(() => externalAssets({ include: ["assets/*.txt", null] } as any)).toThrow();
      expect(() => externalAssets({ include: ["assets/*.txt", ""] } as any)).toThrow();
      expect(() => externalAssets({ include: ["assets/*.txt", 1] } as any)).toThrow();
      expect(() => externalAssets({ include: ["assets/*.txt", false] } as any)).toThrow();
    });

    test("throws on invalid exclude pattern or array of patterns", () => {
      expect(() => externalAssets({ include: "assets/*.txt", exclude: null } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: "" } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: 1 } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: false } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: [] } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: [1] } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: [1, null] } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: ["assets/*.txt", null] } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: ["assets/*.txt", ""] } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: ["assets/*.txt", 1] } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: ["assets/*.txt", false] } as any)).toThrow();
    });

    test("throws if resolve is not a non-empty string", () => {
      expect(() => externalAssets({ include: "assets/*.txt", resolve: null } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", resolve: "" } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", resolve: 1 } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", resolve: false } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", resolve: [] } as any)).toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", resolve: ["dir1", "dir2"] } as any)).toThrow();
    });

    test("include accepts a valid filter pattern", () => {
      expect(() => externalAssets({ include: "assets/*.txt" })).not.toThrow();
      expect(() => externalAssets({ include: /.txt$/ })).not.toThrow();
    });

    test("include accepts an array of valid filter patterns", () => {
      expect(() => externalAssets({ include: ["assets/*.txt", "assets/images/*.png"] })).not.toThrow();
      expect(() => externalAssets({ include: [/.txt$/, "assets/images/*.png"] })).not.toThrow();
      expect(() => externalAssets({ include: [/.jpeg$/, /.txt$/] })).not.toThrow();
    });

    test("exclude accepts a valid filter pattern", () => {
      expect(() => externalAssets({ include: "assets/*.txt", exclude: "assets/*.txt" })).not.toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: /.txt$/ })).not.toThrow();
    });

    test("exclude accepts an array of valid filter patterns", () => {
      expect(() => externalAssets({ include: "assets/*.txt", exclude: ["assets/*.txt", "assets/images/*.png"] })).not.toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: [/.txt$/, "assets/images/*.png"] })).not.toThrow();
      expect(() => externalAssets({ include: "assets/*.txt", exclude: [/.jpeg$/, /.txt$/] })).not.toThrow();
    });

    test("resolve accepts a non-empty string", () => {
      expect(() => externalAssets({ include: "assets/*.txt", resolve: "dir" })).not.toThrow();
    });
  });
});
