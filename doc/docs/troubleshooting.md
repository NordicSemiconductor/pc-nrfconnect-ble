# Troubleshooting

When troubleshooting, to view more detailed information than shown in the Log panel, use **Open log file** to open the current log file in a text editor.

## Firmware Programming

If you receive the error **Could not connect to debug probe**, verify that J-Link software is properly installed on the system.

If the device has been programmed with memory protection, the {{app_name}} cannot program the firmware. To erase the device, download [nRF Command Line Tools](https://www.nordicsemi.com/Products/Development-tools/nrf-command-line-tools/download#infotabs) from Nordic Semiconductor and issue the following command from the command line:

```
nrfjprog -e -f <nrf51 or nrf52>
```

On Windows: If you receive the error **Could not load nrfjprog DLL**, verify that [nRF Command Line Tools](https://www.nordicsemi.com/Products/Development-tools/nrf-command-line-tools/download#infotabs) are installed.

!!! info "Note"
      nRF Command Line Tools are officially deprecated and are being replaced by nRF Util. Use nRF Util for all related tasks going forward.

## macOS J-Link Issue

In macOS: An issue with the SEGGER J-Link OB firmware leads to the corruption of long packets over UART. See [www.nordicsemi.com/nRFConnectOSXfix](https://devzone.nordicsemi.com/nordic/nordic-blog/b/blog/posts/nrf-connect-v10-release#osxissue) for more information.

## Serial Port Access Permissions on Ubuntu Linux

If you receive errors when trying to open the serial port in the {{app_name}} on Ubuntu Linux, you may need to grant serial port access permissions to your user. To do this, run the following command:

```
sudo usermod -a -G dialout <username>
```

## Programming with J-Link does not work

If you select a device that uses the nRF5340 SoC as the interface MCU and attempt to program it, you might get the following entries or similar in the log:

```
Uploading image through JLink: 0%
Device programming completed.
Device setup completed
Getting information from J-Link debugger...
Found device type: unknown. J-Link firmware: J-Link OB-nRF5340-NordicSemi compiled Nov 7 2022 16:22:01.
```

This issue is related to readback protection of the nRF5340 MCU.
To solve the issue, complete the following steps:

1. Make sure you have nrfjprog installed (part of the [nRF Command Line Tools](https://www.nordicsemi.com/Products/Development-tools/nrf-command-line-tools/download#infotabs)).
1. Open a command line terminal.
1. Connect the DK to the serial port.
1. Run the following command:

    ```
    nrfjprog --recover
    ```

1. Disconnect and connect the DK to the serial port again.
1. [Select the device](./overview_and_ui.md#select-device).
1. When prompted about programming, select **Yes**.

The app will program the DK and the connection will successfully open with a related log entry.
