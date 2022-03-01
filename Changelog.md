## 3.0.1 - 2022-03-01
### Changed
- Made compatible with next version of nRF Connect for Desktop.

## 3.0.0 - 2021-11-01
### Added
- Documentation section to `About` pane
### Changed
- Establish compatibility with nRF Connect for Desktop 3.8.
- Use new nRF Connect for Desktop look & feel.
- Removed limitation for value edit in MTU and DLE update dialog.
### Fixed
- DFU zip package info was not displayed properly
- Opening UUID definitions file was not working.

## 2.5.3 - 2021-08-24
### Fixed
- TEXT format definitions were not applied for descriptors.

## 2.5.2 - 2021-08-02
### Fixed
- The image on the DFU button was not displayed anymore.

## 2.5.1 - 2021-03-10
### Fixed
- App crashed when toggling pairing parameters.

## 2.5.0 - 2021-03-01
### Added
- Functionality to set the interval and timeout for advertising.
- Toggling of active scan and timeout for scanning.
- Functionality to set connection parameters.
- Fetching of uuid definitions from bluetooth-numbers-database project on app startup.
- Saving and loading of advertising setup.
### Changed
- Several configurable parameters are now persisted between sessions.

## 2.4.2 - 2020-10-21
### Fixed
- 'bluetooth-uuid-database' not found issue.

## 2.4.1 - 2020-10-21
### Updated
- Use UUIDs from official Nordic bluetooth-numbers-database repository.
- Updated according to changes of Electron dialog API.
### Fixed
- Destructive scan filtering.

## 2.4.0 - 2020-06-08
### Added
- UI to control 2 Mb/s phy, data length and ATT MTU.

## 2.3.2 - 2019-11-14
### Added
- Support nRF52833.
### Fixed
- Partly shown dropdown.
- Scan results wrongly showed advertisement keys.
- Keypress notification display.

## 2.3.1 - 2019-08-16
### Fixed
- Window content height to avoid scrolling.

## 2.3.0 - 2019-07-03
### Updated
- Updated to React Bootstrap 4.

## 2.2.1 - 2019-04-15
### Updated
- Updated README.md specifying nRF52840 for kit and dongle.
### Added
- Filter for supported devices.
### Fixed
- ADV packet update by merging existing and new.
- Advertising shortcut.
- Unexpected line in connected view.
- Attribute throttling mechanism.

## 2.1.0 - 2018-02-05
### Changed
- Server setup can be applied multiple times with adapter reset.
- Log J-Link firmware string when selecting serial port.
### Fixed
- Keep connection open when performing DFU.
- Custom UUIDs interfered with normal behavior.
- UTF8 support.

## 2.0.1 - 2017-07-26
### Fixed
- Custom UUIDs interfered with normal behavior.

## 2.0.0 - 2017-06-28
The main change of this release is that the tool has been rewritten as an app for nRF Connect v2.0. It is no longer a standalone application, but should be installed and launched from nRF Connect.
### Added
- Thingy UUIDs.
- Buttonless DFU.
### Fixed
- Increase device name max length in advertising data.
- Better error message when connection lost during service discovery.

## 1.1.1 - 2017-02-20
### Fixed
- Blank screen if VC++ redistributable is not installed.
- Issue at startup when settings.json is invalid.
