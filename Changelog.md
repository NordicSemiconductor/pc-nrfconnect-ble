## Unreleased
### Bugfixes
- The image on the DFU button was not displayed anymore

## 2.5.1 - 2021-03-10
### Bugfixes
- Fixed app crashing when toggling pairing parameters

## 2.5.0 - 2021-03-01
### Features
- Added functionality to set the interval and timeout for advertising
- Added toggling of active scan and timeout for scanning
- Added functionality to set connection parameters
- Added fetching of uuid definitions from bluetooth-numbers-database project on app startup
- Added saving and loading of advertising setup
- Several configurable parameters are now persisted between sessions

## 2.4.2 - 2020-10-21
### Bugfixes
- Fixed 'bluetooth-uuid-database' not found issue

## 2.4.1 - 2020-10-21
### Updates
- Use UUIDs from official Nordic bluetooth-numbers-database repository
- Updated according to changes of Electron dialog API
### Bugfixes
- Fixed destructive scan filtering

## 2.4.0 - 2020-06-08
### Features
- Added UI to control 2 Mb/s phy, data length and ATT MTU

## 2.3.2 - 2019-11-14
### Features
- Support nRF52833
### Bugfixes
- Fixed partly shown dropdown
- Scan results wrongly showed advertisement keys
- Fixed keypress notification display

## 2.3.1 - 2019-08-16
### Bugfixes
- Fixed window content height to avoid scrolling

## 2.3.0 - 2019-07-03
### Updates
- Updated to React Bootstrap 4

## 2.2.1 - 2019-04-15
### Updates
- Updated README.md specifying nRF52840 for kit and dongle
- Added filter for supported devices
### Bugfixes
- Fixed ADV packet update by merging existing and new
- Fixed advertising shortcut
- Fixed unexpected line in connected view
- Fixed attribute throttling mechanism

## 2.1.0 - 2018-02-05
### Features
- Server setup can be applied multiple times with adapter reset
- Log J-Link firmware string when selecting serial port
### Bugfixes
- Keep connection open when performing DFU
- Fix issue with custom UUIDs interfering with normal behavior
- UTF8 support

## 2.0.1 - 2017-07-26
### Bugfixes
- Fix issue with custom UUIDs interfering with normal behavior

## 2.0.0 - 2017-06-28
The main change of this release is that the tool has been rewritten as an app for nRF Connect v2.0. It is no longer a standalone application, but should be installed and launched from nRF Connect.
### Features
- Add Thingy UUIDs
- Buttonless DFU
### Bugfixes
- Increase device name max length in advertising data
- Better error message when connection lost during service discovery

## 1.1.1 - 2017-02-20
- Issue with blank screen if VC++ redistributable is not installed
- Issue at startup when settings.json is invalid
