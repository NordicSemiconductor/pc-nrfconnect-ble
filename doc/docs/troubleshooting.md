# Troubleshooting

When troubleshooting, to view more detailed information than shown in the Log panel, use **Open log file** to open the current log file in a text editor.

## Firmware Programming

If you receive an error about debug probe connection issues, verify that J-Link software is properly installed on the system.

If the device has been programmed with memory protection, the {{app_name}} cannot program the firmware. To erase the device:

1. Download [nRF Util](https://docs.nordicsemi.com/bundle/nrfutil/page/README.html) from Nordic Semiconductor.
2. [Install the `nrfutil device` command](https://docs.nordicsemi.com/bundle/nrfutil/page/guides/installing_commands.html).
1. Open a command line terminal.
1. Run the following command:

    ```
    nrfutil device erase --x-family <nrf51 or nrf52>
    ```

## macOS J-Link Issue

In macOS: An issue with the SEGGER J-Link OB firmware leads to the corruption of long packets over UART. See [www.nordicsemi.com/nRFConnectOSXfix](https://devzone.nordicsemi.com/nordic/nordic-blog/b/blog/posts/nrf-connect-v10-release#osxissue) for more information.

## Serial Port Access Permissions on Ubuntu Linux

If you receive errors when trying to open the serial port in the {{app_name}} on Ubuntu Linux, you may need to grant serial port access permissions to your user. To do this, run the following command:

```
sudo usermod -a -G dialout <username>
```

## Programming with J-Link does not work

If you select a device that uses the nRF5340 SoC as the interface MCU and attempt to program it, you might get an issue related to device type being unknown.

This issue is related to readback protection of the nRF5340 MCU.
To solve the issue, complete the following steps:

1. Download [nRF Util](https://docs.nordicsemi.com/bundle/nrfutil/page/README.html) from Nordic Semiconductor.
1. [Install the `nrfutil device` command](https://docs.nordicsemi.com/bundle/nrfutil/page/guides/installing_commands.html).
1. Connect the DK to the serial port.
1. Open a command line terminal.
1. Run the following command:

    ```
    nrfutil device recover
    ```

1. Disconnect and connect the DK to the serial port again.
1. [Select the device](./overview_and_ui.md#select-device).
1. When prompted about programming, select **Yes**.

The app will program the DK and the connection will successfully open with a related log entry.
