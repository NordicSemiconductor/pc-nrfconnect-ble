# Updating firmware over the air

If the connected device has Nordic Device Firmware Update (DFU) Service, you can update the firmware on the device.

For more information on the DFU process, see [Device Firmware Update process](https://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v12.2.0/lib_bootloader_dfu_process.html). For DFU bootloader examples, see [DFU bootloader examples](https://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v12.2.0/examples_bootloader.html).

For a device that has DFU Service, Secure DFU appears in the device's list of discovered services, and the **Start Secure DFU** button appears in the list header.

![Secure DFU in the list of discovered services](./screenshots/nRF_connect_secure_dfu.png "Secure DFU in the list of discovered services")

To update the firmware, complete the following steps:

1. To open the DFU dialog, click the **Start Secure DFU** button ![Start Secure DFU button](./screenshots/Secure_DFU_button.png).
2. Browse and select a DFU zip package file on your computer.

    !!! tip "Important"
         To create the DFU zip package file, use the nrfutil tool. See the [nrfutil documentation](https://infocenter.nordicsemi.com/topic/ug_nrfutil/UG/nrfutil/nrfutil_intro.html) for more information.
    Information on the content of the DFU zip package is displayed in the **Package info** field.

    ![DFU dialog](./screenshots/nRF_connect_dfu_start.png "DFU dialog")

3. To start the transfer of the DFU package to the connected peer device, click **Start DFU**.</br>
   The progress bar shows the progress of the transfer.

    ![DFU progress](./screenshots/nRF_connect_dfu_progress.png "DFU progress")

4. When the progress bar has reached 100%, click **Close**.

    ![DFU completed](./screenshots/nRF_connect_dfu_completed.png "DFU completed")

To stop the transfer, click **Stop DFU**. The transfer continues from where it was stopped when you click **Start DFU** again.

If you click **Close** before the DFU transfer has completed, a confirmation dialog appears. If you click **OK** in the confirmation dialog, the transfer is canceled.