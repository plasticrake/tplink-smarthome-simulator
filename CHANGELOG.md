# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v1.10.0...v2.0.0) (2020-06-01)


### ⚠ BREAKING CHANGES

* requires node >= v10

### Features

* return error for dimmer brightness of 0 ([212f141](https://github.com/plasticrake/tplink-smarthome-simulator/commit/212f141421ea54a24af958345cd55a09c279a2ae))
* support multiple commands per response ([#11](https://github.com/plasticrake/tplink-smarthome-simulator/issues/11)) ([6cc97f3](https://github.com/plasticrake/tplink-smarthome-simulator/commit/6cc97f3088025837fa9969c3a39da976fd5764d4))


### Bug Fixes

* `mic_mac` was not being used for bulbs ([dd74621](https://github.com/plasticrake/tplink-smarthome-simulator/commit/dd74621c99c4c4e58e453880f705ddf0ecbe809b))
* children child_id issue from multiple commands changes ([1374011](https://github.com/plasticrake/tplink-smarthome-simulator/commit/1374011f4f5634c8ad26d95e0368ff56bc60de74))
* context module behavior ([4169a25](https://github.com/plasticrake/tplink-smarthome-simulator/commit/4169a2593226cdb090376a562b500095a091b07c))
* don't rethrow JSON.parse errors ([880b9ee](https://github.com/plasticrake/tplink-smarthome-simulator/commit/880b9eee2dd1879eca56718a26790e6f82836091))
* not setting alias passed in device constructor ([6d311bd](https://github.com/plasticrake/tplink-smarthome-simulator/commit/6d311bd826f1955b8a76ea107161b2165c0b69e0)), closes [#10](https://github.com/plasticrake/tplink-smarthome-simulator/issues/10)
* typos, add cspell ([8d24aab](https://github.com/plasticrake/tplink-smarthome-simulator/commit/8d24aabd41fc0473dba4748f59109e789348e7a9))


* target minimum node v10 ([40f7056](https://github.com/plasticrake/tplink-smarthome-simulator/commit/40f70567beb89b222954b00c063c96c3f9e340c8))

<a name="1.10.0"></a>
# [1.10.0](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v1.9.0...v1.10.0) (2019-02-02)


### Features

* retry on EADDRINUSE ([7d48729](https://github.com/plasticrake/tplink-smarthome-simulator/commit/7d48729))



<a name="1.9.0"></a>
# [1.9.0](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v1.8.2...v1.9.0) (2019-01-31)


### Features

* babel support for node v6.5 ([b45077c](https://github.com/plasticrake/tplink-smarthome-simulator/commit/b45077c))



<a name="1.8.2"></a>
## [1.8.2](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v1.8.1...v1.8.2) (2019-01-31)


### Bug Fixes

* don't send FIN for bulbs ([d254c67](https://github.com/plasticrake/tplink-smarthome-simulator/commit/d254c67))



<a name="1.8.1"></a>
## [1.8.1](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v1.8.0...v1.8.1) (2019-01-29)


### Bug Fixes

* send end with tcp response ([da074b5](https://github.com/plasticrake/tplink-smarthome-simulator/commit/da074b5))
