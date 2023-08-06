import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { afterEach, describe, expect, test } from "@jest/globals";
import fs from "fs/promises";
import mockfs from "mock-fs";
import {
  InputOptions,
  InternalModuleFormat,
  OutputAsset,
  OutputChunk,
  OutputOptions,
  rollup,
} from "rollup";
import { externalAssets } from "../src";

async function build(inputOptions: InputOptions, outputOptions: OutputOptions) {
  const bundle = await rollup(inputOptions);
  try {
    const { output } = await bundle.generate(outputOptions);

    const chunks = output.filter(
      (file): file is OutputChunk => file.type === "chunk"
    );
    const assets = output.filter(
      (file): file is OutputAsset => file.type === "asset"
    );

    return { chunks, assets };
  } finally {
    await bundle.close();
  }
}

function relativePaths(code: string) {
  const ast = parse(code, { sourceType: "unambiguous" });
  const paths = new Set<string>();

  traverse(ast, {
    StringLiteral(path) {
      const value = path.node.value;
      if (value.startsWith("./") || value.startsWith("../")) {
        paths.add(value);
      }
    },
  });

  return Array.from(paths);
}

const formats: InternalModuleFormat[] = [
  "es",
  "cjs",
  "umd",
  "amd",
  "system",
  "iife",
];

afterEach(() => {
  mockfs.restore();
});

describe.each(formats)("format %s", (format) => {
  describe("static imports", () => {
    test("no nested dirs", async () => {
      mockfs({
        "assets/text.txt": "Lorem Ipsum is simply dummy text",
        "src/index.js": `
          import txt from "../assets/text.txt";
          console.log(txt);
        `,
      });
      const { chunks, assets } = await build(
        {
          logLevel: "silent",
          input: "src/index.js",
          plugins: [externalAssets("assets/*")],
        },
        {
          format,
          assetFileNames: "[name][extname]",
          file: "index.js",
        }
      );

      expect(chunks).toHaveLength(1);
      expect(assets).toHaveLength(1);
      expect(assets[0].fileName).toBe("text.txt");
      expect(assets[0].source).toEqual(await fs.readFile("assets/text.txt"));

      if (format !== "iife")
        expect(relativePaths(chunks[0].code)).toEqual(["./text.txt"]);
    });

    test("assetFileNames with nested dir", async () => {
      mockfs({
        "assets/text.txt": "Lorem Ipsum is simply dummy text",
        "src/index.js": `
          import txt from "../assets/text.txt";
          console.log(txt);
        `,
      });
      const { chunks, assets } = await build(
        {
          logLevel: "silent",
          input: "src/index.js",
          plugins: [externalAssets("assets/*")],
        },
        {
          format,
          assetFileNames: "assets/[name][extname]",
          file: "index.js",
        }
      );

      expect(chunks).toHaveLength(1);
      expect(assets).toHaveLength(1);
      expect(assets[0].fileName).toBe("assets/text.txt");
      expect(assets[0].source).toEqual(await fs.readFile("assets/text.txt"));

      if (format !== "iife")
        expect(relativePaths(chunks[0].code)).toEqual(["./assets/text.txt"]);
    });

    test.failing("no emitted asset for unused import", async () => {
      mockfs({
        "assets/text.txt": "Lorem Ipsum is simply dummy text",
        "assets/image.png": Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]),
        "src/index.js": `
          import txt from "../assets/text.txt";
          import png from "../assets/image.png";
          console.log(txt);
        `,
      });
      const { chunks, assets } = await build(
        {
          logLevel: "silent",
          input: "src/index.js",
          plugins: [externalAssets("assets/*")],
        },
        {
          format,
          assetFileNames: "assets/[name][extname]",
          file: "index.js",
        }
      );

      expect(chunks).toHaveLength(1);
      expect(assets).toHaveLength(1);
      expect(assets[0].fileName).toBe("assets/text.txt");
      expect(assets[0].source).toEqual(await fs.readFile("assets/text.txt"));

      if (format !== "iife")
        expect(relativePaths(chunks[0].code)).toEqual(["./assets/text.txt"]);
    });
  });

  // no code splitting support
  if (format === "umd" || format === "iife") return;

  describe("dynamic imports", () => {
    test("no nested dirs", async () => {
      mockfs({
        "assets/text.txt": "Lorem Ipsum is simply dummy text",
        "src/index.js": `
          import("./dynamic.js").then((txt => {
            console.log(txt);
          }));
        `,
        "src/dynamic.js": `
          import txt from "../assets/text.txt";
          console.log(txt);
        `,
      });
      const { chunks, assets } = await build(
        {
          logLevel: "silent",
          input: "src/index.js",
          plugins: [externalAssets("assets/*")],
        },
        {
          format,
          chunkFileNames: "[name].js",
          assetFileNames: "[name][extname]",
        }
      );

      expect(chunks).toHaveLength(2);
      expect(assets).toHaveLength(1);
      expect(assets[0].fileName).toBe("text.txt");
      expect(assets[0].source).toEqual(await fs.readFile("assets/text.txt"));
      expect(relativePaths(chunks[1].code)).toEqual(["./text.txt"]);
    });

    test("chunkFileNames with nested dir", async () => {
      mockfs({
        "assets/text.txt": "Lorem Ipsum is simply dummy text",
        "src/index.js": `
          import("./dynamic.js").then((txt => {
            console.log(txt);
          }));
        `,
        "src/dynamic.js": `
          import txt from "../assets/text.txt";
          console.log(txt);
        `,
      });
      let { chunks, assets } = await build(
        {
          logLevel: "silent",
          input: "src/index.js",
          plugins: [externalAssets("assets/*")],
        },
        {
          format,
          chunkFileNames: "chunks/[name].js",
          assetFileNames: "[name][extname]",
        }
      );

      expect(chunks).toHaveLength(2);
      expect(assets).toHaveLength(1);
      expect(assets[0].fileName).toBe("text.txt");
      expect(assets[0].source).toEqual(await fs.readFile("assets/text.txt"));
      expect(relativePaths(chunks[1].code)).toEqual(["../text.txt"]);
    });

    test.failing("dynamic asset import", async () => {
      mockfs({
        "assets/text.txt": "Lorem Ipsum is simply dummy text",
        "src/index.js": `
          import("../assets/text.txt").then(txt => {
            console.log(txt);
          });
        `,
      });
      let { chunks, assets } = await build(
        {
          logLevel: "silent",
          input: "src/index.js",
          plugins: [externalAssets("assets/*")],
        },
        {
          format,
          chunkFileNames: "[name].js",
          assetFileNames: "assets/[name][extname]",
        }
      );

      expect(chunks).toHaveLength(1);
      expect(assets).toHaveLength(1);
      expect(assets[0].fileName).toBe("assets/text.txt");
      expect(assets[0].source).toEqual(await fs.readFile("assets/text.txt"));
      expect(relativePaths(chunks[0].code)).toEqual(["./assets/text.txt"]);
    });
  });
});
