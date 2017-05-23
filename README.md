# nRF Connect Bluetooth <sup>&reg;</sup> low energy

[![License](https://img.shields.io/badge/license-Modified%20BSD%20License-blue.svg)](LICENSE)

*nRF Connect Bluetooth <sup>&reg;</sup> low energy* is a cross-platform tool that enables testing and development with Bluetooth <sup>&reg;</sup> low energy (previously called Bluetooth Smart). It allows easy setup of connections with other devices and use these connections for reading and writing to the external nodes.

*nRF Connect Bluetooth <sup>&reg;</sup> low energy* is implemented as an app for [nRF Connect](https://github.com/NordicSemiconductor/pc-nrfconnect-core#creating-apps).

The app is designed to be used together with the nRF52 DK, nRF51 DK, or the nRF51 Dongle, running a specific connectivity application.

# Installation

To install the application you can download binaries from the [nRF Connect product page](https://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF-Connect-for-desktop) on Nordic Semiconductor web pages.

nRF Connect currently supports the following operating systems:

* Windows
* Ubuntu Linux 64-bit
* macOS

After *nRF Connect* is installed, you can find *Bluetooth <sup>&reg;</sup> low energy* in the app list by selecting *Add/remove apps*.

# Usage documentation

A [User guide](http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.tools/dita/tools/nRF_Connect/nRF_Connect_intro.html?cp=4_2) is available on the *nRF Connect Bluetooth <sup>&reg;</sup> low energy* product pages.

# Contributing

We are currently working on a Contributor License Agreement (CLA), which will allow third party contributions to this project. We do not accept pull requests for the time being, but feel free to file code related issues on [GitHub Issues](https://github.com/NordicSemiconductor/pc-yggdrasil/issues).

# Compiling from source

Since *nRF Connect* expects local apps in `$HOME/.nrfconnect-apps/local` (Linux/macOS) or `%USERPROFILE%/.nrfconnect-apps/local` directory, make sure your repository is cloned or linked there.

## Dependencies

To build this project you will need to install the following tools:

* Node.js (>=6.9)
* npm (>=3.7.0)

## Compiling

When *nRF Connect* have been installed, you are ready to start the compilation. Run the following command from the command line, standing in the root folder of the repository:

    npm install

When the procedure has completed successfully you can run the application by running:

    npm run dev

The built app can be loaded by *nRF Connect* launcher.

## Testing

Unit testing of all packages can be performed by running:

    npm test

# License

See the [license file](LICENSE) for details.

# Feedback

* Ask questions on [DevZone Questions](https://devzone.nordicsemi.com)
* File code related issues on [GitHub Issues](https://github.com/NordicSemiconductor/pc-nrfconnect-ble/issues)
