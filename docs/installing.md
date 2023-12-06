# Installing the Bluetooth Low Energy app

Bluetooth Low Energy is installed as an app for nRF Connect for Desktop. Before you can install the app, you must download and install [nRF Connect for Desktop](https://www.nordicsemi.com/Software-and-Tools/Development-Tools/nRF-Connect-for-desktop) (version 3.2.0 or later).

To install the Bluetooth Low Energy app:

1. Open nRF Connect for Desktop.
1. Find Bluetooth Low Energy in the list of apps and click **Install**.
1. A proxy app is installed, and the Bluetooth Low Energy button changes to **Open**.
1. To complete the installation, you must press Open.
1. You will be prompted to **Download and install**, do this to complete installation of the app.

Once the app is installed, you can launch it by clicking **Open**. If a new version of the app becomes available, an **Update** button is displayed next to the **Open** button. Click this button to install the latest version.

To uninstall the app, follow the steps appropriate for your operating system:

- **Windows:** Open **Control Panel** and navigate to **Uninstall a program**. Find nRF Connect for Desktop Bluetooth Low Energy 4.0.0 and proceed to uninstall the application.

- **Ubuntu:** Delete the folder `~/opt/nrfconnect-bluetooth-low-energy`. You may also delete additional config files from `~/.config/nrfconnect-bluetooth-low-energy`.

- **macOS:**   Move the nRF Connect for Desktop Bluetooth Low Energy 4.0.0 application to bin, from where it is located, normally placed inside the Applications folder.

!!! note "Note"
      From version 4.0.0, the Bluetooth Low Energy app is installed as a standalone application, for reasons of driver compatibility. The application functionality remains the same, and a proxy app is used from nRF Connect for Desktop. A desktop shortcut is also created automatically, during the install process.

      To receive information on updated versions, you are recommended to use nRF Connect for Desktop to install, open and update the application. However, **Uninstall** removes only the proxy app and **Create shortcut** is no longer necessary.
