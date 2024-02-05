# [4.1.0](https://github.com/recursive-beast/rollup-plugin-external-assets/compare/v4.0.2...v4.1.0) (2024-02-05)


### Features

* update deps ([025b7c9](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/025b7c9cc92d17f6fd8624a15f43a842f70efab3))

# [4.0.0](https://github.com/recursive-beast/rollup-plugin-external-assets/compare/v3.0.1...v4.0.0) (2023-08-08)


* feat!: use only named export ([7d0e03c](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/7d0e03c05d4558f8afdc5c7b105e12200baaa8e5))
* feat!: change function signature ([df7ad53](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/df7ad534a8d83cc0a3928cf7cc6fc80a7758285f))


### Features

* add argument validation using joi ([4ee6b01](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/4ee6b011ee42b264e13f64c3bd56c411249952d1))


### BREAKING CHANGES

* the plugin is now provided using a named export
* more convenient and future proof function signature

## [3.0.1](https://github.com/recursive-beast/rollup-plugin-external-assets/compare/v3.0.0...v3.0.1) (2022-02-19)


### Bug Fixes

* update dependencies ([6f3e72d](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/6f3e72dd5e6fd2cc10683b60600136c4f795d2ad))

# [3.0.0](https://github.com/recursive-beast/rollup-plugin-external-assets/compare/v2.2.1...v3.0.0) (2021-04-24)


### Bug Fixes

* errors caused by non-normalized windows paths ([cf9f716](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/cf9f716c4fcc024fe959dfca7a9d96b88c85fd4d))


### Code Refactoring

* delegate asset deduplication to this.emitFile ([adafff7](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/adafff7e583c5f6fab11dce892f7607a3ea40c7a))


### Features

* added full support for dynamic imports ([f16c69d](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/f16c69d44a386962251da33c7e34e9b8f98415e5))
* filtering paths is delegated to createFilter from @rollup/pluginutils ([9ec6e63](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/9ec6e6365037817754dddd92e12ce27929d1f6b0))
* support for windows absolute paths in filter patterns ([76249e4](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/76249e400f782d02e6f119317a1ee732b2967fd8))


### BREAKING CHANGES

* imports to deduplicated assets are not merged into one
* the plugin itself is not responsible for filtering
paths

## [2.2.1](https://github.com/recursive-beast/rollup-plugin-external-assets/compare/v2.2.0...v2.2.1) (2021-03-13)


### Bug Fixes

* correct export assignments in declaration files ([8fed136](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/8fed136fd9a9e64a50b946ea53066f5a5ad14d73))

# [2.2.0](https://github.com/recursive-beast/rollup-plugin-external-assets/compare/v2.1.1...v2.2.0) (2021-03-08)


### Features

* **package.json:** added sideEffects flag ([6d2c71d](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/6d2c71d911cca1b007c6e3e42bf0b68dba109acd))

## [2.1.1](https://github.com/recursive-beast/rollup-plugin-external-assets/compare/v2.1.0...v2.1.1) (2021-03-04)


### Bug Fixes

* removed jsdoc comment for deprecated options parameter ([9dfb4fc](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/9dfb4fcbe59a7d723d64d79ffabc2aa50d13c20e))

# [2.1.0](https://github.com/recursive-beast/rollup-plugin-external-assets/compare/v2.0.0...v2.1.0) (2021-03-04)


### Features

* added support for dynamic imports ([feff91f](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/feff91f1143153bb042704dda7cb38e02924e6be))

# [2.0.0](https://github.com/recursive-beast/rollup-plugin-external-assets/compare/v1.1.0...v2.0.0) (2021-03-03)


### Bug Fixes

* inconsistant hash in the load hook ([da51590](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/da51590e41c50c30c33ed093aa3add0abf726660))


### Features

* added support for watch mode ([f080246](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/f08024649d84e4762ba59f47169e5a8af32931d0))


### BREAKING CHANGES

* The `options` parameter is now deprecated, the reason
is that `exclude` and `include` do not make sense when importing the same
asset from both excluded and included modules

# [1.1.0](https://github.com/recursive-beast/rollup-plugin-external-assets/compare/v1.0.0...v1.1.0) (2021-03-03)


### Features

* added deprecation warning for options parameter ([57b6315](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/57b6315c5d419b2ae59120086d30ecf21fb41e3a))

# 1.0.0 (2021-02-27)


### Features

* implement resolveId and renderChunk hooks ([0b6464d](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/0b6464da548fb1bb8b29390cc137afc48637053a))
* plugin can be positioned anywhere in the plugins list ([a7f1a89](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/a7f1a89bcca2de430a0d38472e01016e69eb7a6a))
* plugin factory function can be used to produce multiple instances ([95089b5](https://github.com/recursive-beast/rollup-plugin-external-assets/commit/95089b583821e762ec12c0c53771d9a9a20feda9))
