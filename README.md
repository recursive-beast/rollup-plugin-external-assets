[![npm](https://img.shields.io/npm/dt/rollup-plugin-external-assets)](https://www.npmjs.com/package/rollup-plugin-external-assets)
[![npm](https://img.shields.io/npm/v/rollup-plugin-external-assets)](https://www.npmjs.com/package/rollup-plugin-external-assets)
[![build](https://github.com/recursive-beast/rollup-plugin-external-assets/actions/workflows/build.yml/badge.svg)](https://github.com/recursive-beast/rollup-plugin-external-assets/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/recursive-beast/rollup-plugin-external-assets/branch/master/graph/badge.svg)](https://codecov.io/gh/recursive-beast/rollup-plugin-external-assets)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)][1]

# rollup-plugin-external-assets
> A rollup plugin to make assets external but include them in the output.

## Installation

Via [npm][2]

```sh
npm install --save-dev rollup-plugin-external-assets
```

Via [yarn][3]

```sh
yarn add -D rollup-plugin-external-assets
```

## Usage

```javascript
import nodeResolve from "@rollup/plugin-node-resolve";
import externalAssets from "rollup-plugin-external-assets";

export default {
	input: "src/index.js",
	output: {
		file: "dist/index.js",
		format: "es",
		sourcemap: true,
	},
	plugins: [
		nodeResolve(),
		externalAssets("assets/*.png"),
	],
};
```

## API

```typescript
function externalAssets(
	include?: string | RegExp | (string | RegExp)[],
	exclude?: string | RegExp | (string | RegExp)[],
	options?: { resolve?: string | false | null },
);
```

### include / exclude

`string | RegExp | (string | RegExp)[]`

A valid [picomatch][9] pattern, or array of patterns.
If `include` is omitted or has zero length, all imports will be considered as assets.
Otherwise, an import path must match one or more of the `include` patterns,
and must not match any of the `exclude` patterns.

**Note**: patterns that include windows paths are normalized to be valid picomatch patterns.

```javascript
import path from "path";

// Operate on images located in the ./assets directory.
externalAssets("assets/**/*.jpg");

// Operate on images located in the ./assets directory.
// and all stylesheet files.
externalAssets(["assets/**/*.{jpg,png}", /\.(css|scss)$/]);

// Operate on all assets except text files.
externalAssets("assets/**/*", "**/*.txt");

// Operate on all assets except text files.
// `__dirname` is the pattern's base dir instead of `process.cwd()`.
externalAssets(path.resolve(__dirname, "assets/**/*"), "**/*.txt");
```

### options

- `resolve` `{string | false | null}`: Optionally resolves the patterns against a directory other than `process.cwd()`.
If a `string` is specified, then the value will be used as the base directory.
Relative paths will be resolved against `process.cwd()` first.
If `false`, then the patterns will not be resolved against any directory.

## Contributing

### Prerequisites
- [nodejs][4]
- [npm][2]

### Getting Started

After cloning this repo, ensure dependencies are installed by running:

```sh
npm install
```

Then to build the final bundle:

```sh
npm run build
```

### Tests

To run tests:

```sh
npm test
```

Note that rollup may emit warnings for unspecified options, or for some other reasons.
I made sure they are ignored with the `ROLLUP_WARNINGS` environment variable in the npm test script.

If you want to see all the warnings when running tests, use this command instead:

```sh
npm run test:warn
```

Coverage report is located in `tests/coverage`.
You might want to review it in your browser, and for example,
write tests for non-covered blocks, or remove them if they're useless.

To run tests and update snapshots, pass the `-u` flag to [jest][8] through the `test` (or `test:warn`) npm script:

```sh
npm test -- -u
```

### Commiting changes

Please follow the [conventional commits][5] specification, because [semantic-release][6] is used to automate the whole package release workflow including: determining the next version number, generating the release notes and publishing the package.

## License

[MIT][1]

[1]: LICENSE
[2]: https://npmjs.org/
[3]: https://yarnpkg.com
[4]: https://nodejs.org
[5]: https://www.conventionalcommits.org/en/v1.0.0/
[6]: https://github.com/semantic-release/semantic-release
[7]: https://github.com/concordancejs/concordance/issues/68
[8]: https://jestjs.io/
[9]: https://github.com/micromatch/picomatch#globbing-features
