REM This file currently needs to be copied to GitHub\nRF51-ble-broadcast-mesh-private\nRF51\examples\BLE_Gateway before exec.
echo off
setlocal

echo Build the device page (for nRF51).
%~dp0/../../bootloader/pc-util/device_page.exe %~dp0/../../bootloader/pc-util/example
REM SET mypath=%~dp0

echo Merge the SoftDevice, pre-compiled nRF Open Mesh serial boot-loader (nRF51), and the device page we generated.
mergehex -m ./../softdevices/s110_nrf51_8.0.0/s110_nrf51_8.0.0_softdevice.hex ./bin/bootloader_serial_xxAC.hex ./pc-util/example.hex -o temp.hex

echo Now merge the pre-built serial BLE gateway example `rbc_gateway_example_serial_nRF51422_xxAC.hex`.
mergehex -m temp.hex ./../examples/BLE_Gateway/bin/rbc_gateway_example_serial_nRF51422_xxAC.hex -o nrf-connect-mesh-official-serial-gateway-fw_nRF51.hex

rm temp.hex

echo `nrf-connect-mesh-official-serial-gateway-fw_nRF51.hex` will be located in the same directory as this script.


echo Build the device page (for nRF52).

echo Merge the SoftDevice, pre-compiled nRF Open Mesh serial boot-loader (nRF52), and the device page we generated.
mergehex -m ./../softdevices/s132_nrf52_3.0.0/s132_nrf52_3.0.0_softdevice.hex ./bin/bootloader_serial_nrf52_xxAA.hex ./pc-util/example52.hex -o temp.hex

echo Now merge the pre-built serial BLE gateway example `rbc_gateway_example_serial_nRF51422_xxAC.hex`.
mergehex -m temp.hex ./../examples/BLE_Gateway/bin/rbc_gateway_example_serial_nRF52832_xxAA.hex -o nrf-connect-mesh-official-serial-gateway-fw_nRF52.hex

rm temp.hex

echo `nrf-connect-mesh-official-serial-gateway-fw_nRF52.hex` will be located in the same directory as this script.
