# Troubleshooting

When troubleshooting, to view more detailed information than shown in the Log panel, use **Open log file** to open the current log file in a text editor.

## Firmware Programming

If you receive the error **Could not connect to debug probe**, verify that J-Link software is properly installed on the system.

If the device has been programmed with memory protection, the nRF Connect Bluetooth® Low Energy app cannot program the firmware. To erase the device, download nRF Command Line Tools from Nordic Semiconductor and issue the following command from the command line:

```
nrfjprog -e -f <nrf51 or nrf52>
```

In Windows: If you receive the error **Could not load nrfjprog DLL**, verify that nRF Command Line Tools are installed.

## OS X J-Link Issue

In OS X: An issue with the SEGGER J-Link OB firmware leads to the corruption of long packets over UART. See [www.nordicsemi.com/nRFConnectOSXfix](www.nordicsemi.com/nRFConnectOSXfix) for more information.

## Serial Port Access Permissions on Ubuntu Linux

If you receive errors when trying to open the serial port in the nRF Connect Bluetooth Low Energy app on Ubuntu Linux, you may need to grant serial port access permissions to your user. To do this, run the following command:

```
sudo usermod -a -G dialout <username>
```

## nRF52840 USB Problems

If you receive errors related to the nRF52840 Dongle USB connection on Windows, see [GitHub](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/master/doc/win32-usb-troubleshoot.md).
