import { builtinModules } from "module";
import nodeResolve from '@rollup/plugin-node-resolve';
import ts from "rollup-plugin-ts";
import transformDefaultExport from "ts-transform-default-export";
import pkg from "./package.json";

const external = [
	...Object.keys(pkg.dependencies),
	// ...Object.keys(pkg.peerDependencies),
	...builtinModules,
];

export default [
	{
		input: "src/index.ts",
		output: {
			file: pkg.main,
			format: "cjs",
			exports: "default",
			sourcemap: true,
		},
		external,
		plugins: [
			nodeResolve(),
			ts({
				transformers: ({ program }) => ({
					afterDeclarations: transformDefaultExport(program),
				}),
			}),
		],
	},
	{
		input: "src/index.ts",
		output: {
			file: pkg.module,
			format: "es",
			sourcemap: true,
		},
		external,
		plugins: [
			nodeResolve(),
			ts(),
		],
	},
];
