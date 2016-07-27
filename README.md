# nRF Connect
[![License](https://img.shields.io/badge/license-Modified%20BSD%20License-blue.svg)](https://github.com/NordicSemiconductor/pc-yggdrasil/blob/master/LICENSE)

nRF Connect is a cross-platform tool that enables testing and development with Bluetooth low energy (previously called Bluetooth Smart). It allows easy setup of connections with other devices and use these connections for reading and writing to the external nodes.

The application is designed to be used together with the nRF52 DK, nRF51 DK, or the nRF51 Dongle, running a specific connectivity application.

![nRF Connect screenshot](http://developer.nordicsemi.com/.pc-tools/nrf-connect/1.0.0/screenshot.png)
<center>*nRF Connect screenshot*</center>

# Installation
To install the application you can download binaries from the [nRF Connect product page](http://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF-Connect-for-desktop) on Nordic Semiconductor web pages.

nRF Connect currently supports the following operating systems:

* Windows
* Ubuntu Linux 64-bit
* macOS

# Usage documentation
A [Getting started guide](http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.tools/dita/tools/nRF_Connect/nRF_Connect_intro.html?cp=4_2) is available on the nRF Connect product pages. 

# Contributing
If you would like to help fixing issues or otherwise contribute to the code base, please see the [Contribution guidelines (TODO: create doc and insert link)]() document.

# Compiling from source

## Dependencies
To build this project you will need to install the following tools:

* Node.js (>=4.4.7)
* npm (>=3.7.0)
* CMake (>=2.8.12)
* A C/C++ toolchain (see [Building Boost](#building-boost) for description of toolchain requirements)

Since building nRF Connect also involves building *pc-ble-driver-js*, please refer to the described requirements in

* [pc-ble-driver-js README](https://github.com/NordicSemiconductor/pc-ble-driver-js) for procedures and description of required tools.

## Building Boost
Before building nRF Connect you will need to have Boost installed and some of its libraries statically compiled. To install and compile Boost, please follow the instructions here:

[Building Boost](https://github.com/NordicSemiconductor/pc-ble-driver/tree/master#building-boost)

Note: Make sure you have built the Boost libraries for the architecture (32 or 64-bit) required by your Node installation.

## Compiling
When all required tools and environment variables have been installed and set, you are ready to start the compilation. Run the following command from the command line, standing in the root folder of the repository:

    `npm install`

When the procedure has completed successfully you can run the application by running:

    `npm start`

## Creating release packages
Scripts have been included in the reop to create release packages. Different artifacts will be created depending on the type of operating system:

* Windows: an nsis installer will be created
* macOS: an app bundle will be created and added in a tar.gz archive
* Ubuntu Linux: the application files will be added in a tar.gz archive

From the command line, run  

* `setup.bat` on Windows
* `sudo ./setup.sh` on macOS and Ubuntu Linux

The build scripts will set the required environment variables, build nRF Connect and put the created artifacts to a folder next to the repo: `../nrfconnect-deploy/`.  

Since the build scripts delete the cache folder *node_modules* and reinstalls in production mode it can be a good idea to run the scripts from a separate repository clone folder.

## Color definitions
The main colors used in nRF Connect are defined in the file css/brand.less. The colors defined in the source code base have been modified from the colors used in the official release builds of nRF Connect. This has been done to differentiate the Nordic releases from other source code builds. Please feel free to modify the color definitions to your own liking.

# Related projects
nRF Connect builds on top of other sub components that live in their own GitHub repositories:

* [pc-ble-driver-js](https://github.com/NordicSemiconductor/pc-ble-driver-js)
* [pc-ble-driver](https://github.com/NordicSemiconductor/pc-ble-driver)

# License
See the [license file](https://github.com/NordicSemiconductor/pc-yggdrasil) for details.

# Feedback
* Ask questions on [DevZone Questions](devzone.nordicsemi.com)
* File code related issues on [GitHub Issues](https://github.com/NordicSemiconductor/pc-yggdrasil/issues)
