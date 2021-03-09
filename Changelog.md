## Version 2.5.1
### Bugfixes
- Fixed app crashing when toggling pairing parameters

## Version 2.5.0
### Features
- Added functionality to set the interval and timeout for advertising
- Added toggling of active scan and timeout for scanning
- Added functionality to set connection parameters
- Added fetching of uuid definitions from bluetooth-numbers-database project on app startup
- Added saving and loading of advertising setup
- Several configurable parameters are now persisted between sessions

## Version 2.4.2
### Bugfixes
- Fixed 'bluetooth-uuid-database' not found issue

## Version 2.4.1
### Updates
- Use UUIDs from official Nordic bluetooth-numbers-database repository
- Updated according to changes of Electron dialog API
### Bugfixes
- Fixed destructive scan filtering

## Version 2.4.0
### Features
- Added UI to control 2 Mb/s phy, data length and ATT MTU #152

## Version 2.3.2
### Features
- Support nRF52833 #137
### Bugfixes
- Fixed partly shown dropdown #132
- Scan results wrongly showed advertisement keys #143
- Fixed keypress notification display

## Version 2.3.1
### Bugfixes
- Fixed window content height to avoid scrolling

## Version 2.3.0
### Updates
- Updated to React Bootstrap 4

## Version 2.2.1
### Updates
- Updated README.md specifying nRF52840 for kit and dongle #94
- Added filter for supported devices #100
### Bugfixes
- Fixed ADV packet update by merging existing and new #97
- Fixed advertising shortcut #99
- Fixed unexpected line in connected view #102
- Fixed attribute throttling mechanism #98 #101

## Version 2.1.0
### Features
- Server setup can be applied multiple times with adapter reset (#65, #82)
- Log J-Link firmware string when selecting serial port (#81)
### Bugfixes
- Keep connection open when performing DFU (#77)
- Fix issue with custom UUIDs interfering with normal behavior (#54)
- UTF8 support (#60)

## Version 2.0.1
### Bugfixes
- Fix issue with custom UUIDs interfering with normal behavior (#54)

## Version 2.0.0
The main change of this release is that the tool has been rewritten as an app for nRF Connect v2.0. It is no longer a standalone application, but should be installed and launched from nRF Connect.
### Features
- Add Thingy UUIDs (#37)
- Buttonless DFU (#47)
### Bugfixes
- Increase device name max length in advertising data (#20)
- Better error message when connection lost during service discovery (#39)

## Version 1.1.1
- #16 Issue with blank screen if VC++ redistributable is not installed
- #18 Issue at startup when settings.json is invalid
