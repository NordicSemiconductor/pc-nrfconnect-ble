# Get started

The Bluetooth® Low Energy app in nRF Connect for Desktop helps you learn how to configure and test Bluetooth Low Energy devices. It allows you to set up a local device, connect it to advertising devices, and discover their services. You can maintain the connection parameters, pair devices, update firmware OTA, and change local device server setup. It also offers a detailed log for troubleshooting purposes.

## Installing the Bluetooth Low Energy app

For installation instructions, see [Installing nRF Connect for Desktop apps](https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/installing_apps.html).

!!! note "Note"
      From version 4.0.0, the Bluetooth Low Energy app is installed as a standalone application, for reasons of driver compatibility. The application functionality remains the same, and a proxy app is used from nRF Connect for Desktop. A desktop shortcut is also created automatically during the install process.

      To receive information on updated versions, you are recommended to use nRF Connect for Desktop to install, open and update the application. However, nRF Connect for Desktop's [**Uninstall**](https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/overview_cfd.html#post-installation-options) removes only the proxy app and [**Create shortcut**](https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/overview_cfd.html#post-installation-options) is no longer necessary, as a shortcut is automatically created.

      To uninstall the app, follow the steps appropriate for your operating system:

      - **Windows:** Open **Control Panel** and navigate to **Uninstall a program**. Find nRF Connect for Desktop Bluetooth Low Energy app v4.0.0 and proceed to uninstall the application.

      - **Ubuntu:** Delete the folder `~/opt/nrfconnect-bluetooth-low-energy`. You may also delete additional config files from `~/.config/nrfconnect-bluetooth-low-energy`.

      - **macOS:** Move the nRF Connect for Desktop Bluetooth Low Energy app v4.0.0 application to bin, from where it is located, normally placed inside the Applications folder.

## Supported devices

- nRF52840 Development Kit (PCA10056)
- nRF52840 Dongle (PCA10059)
- nRF52 Development Kit (PCA10040)
- nRF51 Development Kit (PCA10028)
- nRF51 Dongle (PCA10031)

## Application source code

The code of the application is open source and [available on GitHub](https://github.com/NordicSemiconductor/pc-nrfconnect-ble).
Feel free to fork the repository and clone it for secondary development or feature contributions.
