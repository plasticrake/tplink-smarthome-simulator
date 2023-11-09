# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [5.0.1](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v5.0.0...v5.0.1) (2023-11-09)


### Bug Fixes

* move typed-emitter to dependencies ([f823865](https://github.com/plasticrake/tplink-smarthome-simulator/commit/f823865973a5a54dbbf47d2c9af816285b968ec6))

## [5.0.0](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v4.0.0...v5.0.0) (2023-11-09)


### ⚠ BREAKING CHANGES

* **UdpServer:** Changed from an object to a class instance that may
break consuming code in some edge cases.
* Requires minimum node version v16

### Features

* Drop support for node < v16 ([#39](https://github.com/plasticrake/tplink-smarthome-simulator/issues/39)) ([c1f1bd9](https://github.com/plasticrake/tplink-smarthome-simulator/commit/c1f1bd93dedb36eb36a0ac220b5239a487620a78))
* improve debug output ([69920e0](https://github.com/plasticrake/tplink-smarthome-simulator/commit/69920e050b36ebb318b46a759ec4801029496716))
* **UdpServer:** UdpServer export was changed to a class instance ([#40](https://github.com/plasticrake/tplink-smarthome-simulator/issues/40)) ([ecc96d0](https://github.com/plasticrake/tplink-smarthome-simulator/commit/ecc96d02d9ae03e8a0b5762e2e5bc169c8045f61))

## [4.0.0](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v3.1.0...v4.0.0) (2022-07-11)


### ⚠ BREAKING CHANGES

* Minimum supported node version v14

* drop support for node < v14 ([0f3d81b](https://github.com/plasticrake/tplink-smarthome-simulator/commit/0f3d81ba44102df4eb520646db916540af8be4b3))

## [3.1.0](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v3.0.0...v3.1.0) (2022-02-01)


### Features

* add basic support for KL430 Light Strip ([#34](https://github.com/plasticrake/tplink-smarthome-simulator/issues/34)) ([385a5be](https://github.com/plasticrake/tplink-smarthome-simulator/commit/385a5be23fdb0d69f5b8df46b43ddfd1e3451ec2))

## [3.0.0](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v2.0.1...v3.0.0) (2022-01-31)


### ⚠ BREAKING CHANGES

* Requires minimum node v12.20.0
* requires minimum node v12.20.0

* remove babel, add typescript support ([#33](https://github.com/plasticrake/tplink-smarthome-simulator/issues/33)) ([f460255](https://github.com/plasticrake/tplink-smarthome-simulator/commit/f4602554567058364728ffc2216fc5d6134e606e))
* use typescript ([220daf3](https://github.com/plasticrake/tplink-smarthome-simulator/commit/220daf328c6b5ff980ed0d6a1373acf9f2966309))

### [2.0.1](https://github.com/plasticrake/tplink-smarthome-simulator/compare/v2.0.0...v2.0.1) (2022-01-30)


### Bug Fixes

* set_gentle_*_time takes duration param ([b1a87a9](https://github.com/plasticrake/tplink-smarthome-simulator/commit/b1a87a983c38b1a8aeccb2b4584acf2a0ab597f3))

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
