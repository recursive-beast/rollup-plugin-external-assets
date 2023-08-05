import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { builtinModules } from "module";
import pkg from "./package.json";

const external = [/node_modules/g, ...builtinModules];

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: true,
    },
  ],
  external,
  plugins: [nodeResolve(), typescript()],
};
