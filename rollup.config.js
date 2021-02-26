import nodeResolve from '@rollup/plugin-node-resolve';
import ts from "@wessberg/rollup-plugin-ts";
import transformDefaultExport from "ts-transform-default-export";
import pkg from "./package.json";

export default {
	input: "src/index.ts",
	output: [
		{
			file: pkg.main,
			format: "cjs",
			exports: "default",
			sourcemap: true,
		},
		{
			file: pkg.module,
			format: "es",
			sourcemap: true,
		},
	],
	external: [
		...Object.keys(pkg.dependencies),
		// ...Object.keys(pkg.peerDependencies),
		"fs",
		"path",
	],
	plugins: [
		nodeResolve(),
		ts({
			exclude: "node_modules/**/*",
			transformers: ({ program }) => ({
				afterDeclarations: transformDefaultExport(program, { keepOriginalExport: true }),
			}),
		}),
	],
	watch: {
		exclude: /node_modules/,
	},
};
