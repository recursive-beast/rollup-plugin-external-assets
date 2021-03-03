# [2.0.0](https://github.com/soufyakoub/rollup-plugin-external-assets/compare/v1.1.0...v2.0.0) (2021-03-03)


### Bug Fixes

* inconsistant hash in the load hook ([da51590](https://github.com/soufyakoub/rollup-plugin-external-assets/commit/da51590e41c50c30c33ed093aa3add0abf726660))


### Features

* added support for watch mode ([f080246](https://github.com/soufyakoub/rollup-plugin-external-assets/commit/f08024649d84e4762ba59f47169e5a8af32931d0))


### BREAKING CHANGES

* The `options` parameter is now deprecated, the reason
is that `exclude` and `include` do not make sense when importing the same
asset from both excluded and included modules

# [1.1.0](https://github.com/soufyakoub/rollup-plugin-external-assets/compare/v1.0.0...v1.1.0) (2021-03-03)


### Features

* added deprecation warning for options parameter ([57b6315](https://github.com/soufyakoub/rollup-plugin-external-assets/commit/57b6315c5d419b2ae59120086d30ecf21fb41e3a))

# 1.0.0 (2021-02-27)


### Features

* implement resolveId and renderChunk hooks ([0b6464d](https://github.com/soufyakoub/rollup-plugin-external-assets/commit/0b6464da548fb1bb8b29390cc137afc48637053a))
* plugin can be positioned anywhere in the plugins list ([a7f1a89](https://github.com/soufyakoub/rollup-plugin-external-assets/commit/a7f1a89bcca2de430a0d38472e01016e69eb7a6a))
* plugin factory function can be used to produce multiple instances ([95089b5](https://github.com/soufyakoub/rollup-plugin-external-assets/commit/95089b583821e762ec12c0c53771d9a9a20feda9))
