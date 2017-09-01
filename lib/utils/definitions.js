/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* These exports exist to indicate formating of the content in a characteristic.
 * Example:
 *    '2A00': { name: 'Device Name', format: TEXT },
 *    will format the data in the characteristic with UUID 2A00 as text.
 *
 * The default is NO_FORMAT which will present the data raw.
 */
export const TEXT = 'TEXT';
export const NO_FORMAT = 'NO_FORMAT';

export const GENERIC_ACCESS_UUID = '1800';
export const DEVICE_NAME_UUID = '2A00';
export const SECURE_DFU_UUID = 'FE59';

/* eslint quote-props: ["error", "as-needed", { "numbers": true, "unnecessary": false }] */

export const uuid16bitGattDefinitions = {
    '2800': { name: 'Primary Service' },
    '2801': { name: 'Secondary Service' },
    '2802': { name: 'Include' },
    '2803': { name: 'Characteristic' },
};

export const uuid16bitServiceDefinitions = {
    [GENERIC_ACCESS_UUID]: { name: 'Generic Access' },
    '1801': { name: 'Generic Attribute' },
    '1802': { name: 'Immediate Alert' },
    '1803': { name: 'Link Loss' },
    '1804': { name: 'Tx Power' },
    '1805': { name: 'Current Time Service' },
    '1806': { name: 'Reference Time Update Service' },
    '1807': { name: 'Next DST Change Service' },
    '1808': { name: 'Glucose' },
    '1809': { name: 'Health Thermometer' },
    '180A': { name: 'Device Information' },
    '180D': { name: 'Heart Rate' },
    '180E': { name: 'Phone Alert Status Service' },
    '180F': { name: 'Battery Service' },
    '1810': { name: 'Blood Pressure' },
    '1811': { name: 'Alert Notification Service' },
    '1812': { name: 'Human Interface Device' },
    '1813': { name: 'Scan Parameters' },
    '1814': { name: 'Running Speed and Cadence' },
    '1815': { name: 'Automation IO' },
    '1816': { name: 'Cycling Speed and Cadence' },
    '1818': { name: 'Cycling Power' },
    '1819': { name: 'Location and Navigation' },
    '181A': { name: 'Environmental Sensing' },
    '181B': { name: 'Body Composition' },
    '181C': { name: 'User Data' },
    '181D': { name: 'Weight Scale' },
    '181E': { name: 'Bond Management' },
    '181F': { name: 'Continuous Glucose Monitoring' },
    '1820': { name: 'Internet Protocol Support' },
    '1821': { name: 'Indoor Positioning' },
    '1822': { name: 'Pulse Oximeter' },
    [SECURE_DFU_UUID]: { name: 'Secure DFU' },
};

export const uuid16bitCharacteristicDefinitions = {
    [DEVICE_NAME_UUID]: { name: 'Device Name', format: TEXT },
    '2A01': { name: 'Appearance' },
    '2A02': { name: 'Peripheral Privacy Flag' },
    '2A03': { name: 'Reconnection Address' },
    '2A04': { name: 'Peripheral Preferred Connection Parameters' },
    '2A05': { name: 'Service Changed' },
    '2A06': { name: 'Alert Level' },
    '2A07': { name: 'Tx Power Level' },
    '2A08': { name: 'Date Time' },
    '2A09': { name: 'Day of Week' },
    '2A0A': { name: 'Day Date Time' },
    '2A0C': { name: 'Exact Time 256' },
    '2A0D': { name: 'DST Offset' },
    '2A0E': { name: 'Time Zone' },
    '2A0F': { name: 'Local Time Information' },
    '2A11': { name: 'Time with DST' },
    '2A12': { name: 'Time Accuracy' },
    '2A13': { name: 'Time Source' },
    '2A14': { name: 'Reference Time Information' },
    '2A16': { name: 'Time Update Control Point' },
    '2A17': { name: 'Time Update State' },
    '2A18': { name: 'Glucose Measurement' },
    '2A19': { name: 'Battery Level' },
    '2A1C': { name: 'Temperature Measurement' },
    '2A1D': { name: 'Temperature Type' },
    '2A1E': { name: 'Intermediate Temperature' },
    '2A21': { name: 'Measurement Interval' },
    '2A22': { name: 'Boot Keyboard Input Report' },
    '2A23': { name: 'System ID' },
    '2A24': { name: 'Model Number String', format: TEXT },
    '2A25': { name: 'Serial Number String', fornat: TEXT },
    '2A26': { name: 'Firmware Revision String', format: TEXT },
    '2A27': { name: 'Hardware Revision String', format: TEXT },
    '2A28': { name: 'Software Revision String', format: TEXT },
    '2A29': { name: 'Manufacturer Name String', format: TEXT },
    '2A2A': { name: 'IEEE 11073-20601 Regulatory Certification Data List' },
    '2A2B': { name: 'Current Time' },
    '2A2C': { name: 'Magnetic Declination' },
    '2A31': { name: 'Scan Refresh' },
    '2A32': { name: 'Boot Keyboard Output Report' },
    '2A33': { name: 'Boot Mouse Input Report' },
    '2A34': { name: 'Glucose Measurement Context' },
    '2A35': { name: 'Blood Pressure Measurement' },
    '2A36': { name: 'Intermediate Cuff Pressure' },
    '2A37': { name: 'Heart Rate Measurement' },
    '2A38': { name: 'Body Sensor Location' },
    '2A39': { name: 'Heart Rate Control Point' },
    '2A3F': { name: 'Alert Status' },
    '2A40': { name: 'Ringer Control Point' },
    '2A41': { name: 'Ringer Setting' },
    '2A42': { name: 'Alert Category ID Bit Mask' },
    '2A43': { name: 'Alert Category ID' },
    '2A44': { name: 'Alert Notification Control Point' },
    '2A45': { name: 'Unread Alert Status' },
    '2A46': { name: 'New Alert' },
    '2A47': { name: 'Supported New Alert Category' },
    '2A48': { name: 'Supported Unread Alert Category' },
    '2A49': { name: 'Blood Pressure Feature' },
    '2A4A': { name: 'HID Information' },
    '2A4B': { name: 'Report Map' },
    '2A4C': { name: 'HID Control Point' },
    '2A4D': { name: 'Report' },
    '2A4E': { name: 'Protocol Mode' },
    '2A4F': { name: 'Scan Interval Window' },
    '2A50': { name: 'PnP ID' },
    '2A51': { name: 'Glucose Feature' },
    '2A52': { name: 'Record Access Control Point' },
    '2A53': { name: 'RSC Measurement' },
    '2A54': { name: 'RSC Feature' },
    '2A55': { name: 'SC Control Point' },
    '2A56': { name: 'Digital' },
    '2A58': { name: 'Analog' },
    '2A5A': { name: 'Aggregate' },
    '2A5B': { name: 'CSC Measurement' },
    '2A5C': { name: 'CSC Feature' },
    '2A5D': { name: 'Sensor Location' },
    '2A5E': { name: 'PLX Spot-Check Measurement' },
    '2A5F': { name: 'PLX Continuous Measurement' },
    '2A60': { name: 'PLX Features' },
    '2A63': { name: 'Cycling Power Measurement' },
    '2A64': { name: 'Cycling Power Vector' },
    '2A65': { name: 'Cycling Power Feature' },
    '2A66': { name: 'Cycling Power Control Point' },
    '2A67': { name: 'Location and Speed' },
    '2A68': { name: 'Navigation' },
    '2A69': { name: 'Position Quality' },
    '2A6A': { name: 'LN Feature' },
    '2A6B': { name: 'LN Control Point' },
    '2A6C': { name: 'Elevation' },
    '2A6D': { name: 'Pressure' },
    '2A6E': { name: 'Temperature' },
    '2A6F': { name: 'Humidity' },
    '2A70': { name: 'True Wind Speed' },
    '2A71': { name: 'True Wind Direction' },
    '2A72': { name: 'Apparent Wind Speed' },
    '2A73': { name: 'Apparent Wind Direction ' },
    '2A74': { name: 'Gust Factor' },
    '2A75': { name: 'Pollen Concentration' },
    '2A76': { name: 'UV Index' },
    '2A77': { name: 'Irradiance' },
    '2A78': { name: 'Rainfall' },
    '2A79': { name: 'Wind Chill' },
    '2A7A': { name: 'Heat Index' },
    '2A7B': { name: 'Dew Point' },
    '2A7D': { name: 'Descriptor Value Changed' },
    '2A7E': { name: 'Aerobic Heart Rate Lower Limit' },
    '2A7F': { name: 'Aerobic Threshold' },
    '2A80': { name: 'Age' },
    '2A81': { name: 'Anaerobic Heart Rate Lower Limit' },
    '2A82': { name: 'Anaerobic Heart Rate Upper Limit' },
    '2A83': { name: 'Anaerobic Threshold' },
    '2A84': { name: 'Aerobic Heart Rate Upper Limit' },
    '2A85': { name: 'Date of Birth' },
    '2A86': { name: 'Date of Threshold Assessment' },
    '2A87': { name: 'Email Address', format: TEXT },
    '2A88': { name: 'Fat Burn Heart Rate Lower Limit' },
    '2A89': { name: 'Fat Burn Heart Rate Upper Limit' },
    '2A8A': { name: 'First Name', format: TEXT },
    '2A8B': { name: 'Five Zone Heart Rate Limits' },
    '2A8C': { name: 'Gender' },
    '2A8D': { name: 'Heart Rate Max' },
    '2A8E': { name: 'Height' },
    '2A8F': { name: 'Hip Circumference' },
    '2A90': { name: 'Last Name', format: TEXT },
    '2A91': { name: 'Maximum Recommended Heart Rate' },
    '2A92': { name: 'Resting Heart Rate' },
    '2A93': { name: 'Sport Type for Aerobic and Anaerobic Thresholds' },
    '2A94': { name: 'Three Zone Heart Rate Limits' },
    '2A95': { name: 'Two Zone Heart Rate Limit' },
    '2A96': { name: 'VO2 Max' },
    '2A97': { name: 'Waist Circumference' },
    '2A98': { name: 'Weight' },
    '2A99': { name: 'Database Change Increment' },
    '2A9A': { name: 'User Index' },
    '2A9B': { name: 'Body Composition Feature' },
    '2A9C': { name: 'Body Composition Measurement' },
    '2A9D': { name: 'Weight Measurement' },
    '2A9E': { name: 'Weight Scale Feature' },
    '2A9F': { name: 'User Control Point' },
    '2AA0': { name: 'Magnetic Flux Density - 2D' },
    '2AA1': { name: 'Magnetic Flux Density - 3D' },
    '2AA2': { name: 'Language' },
    '2AA3': { name: 'Barometric Pressure Trend' },
    '2AA4': { name: 'Bond Management Control Point' },
    '2AA5': { name: 'Bond Management Feature' },
    '2AA6': { name: 'Central Address Resolution' },
    '2AA7': { name: 'CGM Measurement' },
    '2AA8': { name: 'CGM Feature' },
    '2AA9': { name: 'CGM Status' },
    '2AAA': { name: 'CGM Session Start Time' },
    '2AAB': { name: 'CGM Session Run Time' },
    '2AAC': { name: 'CGM Specific Ops Control Point' },
    '2AAD': { name: 'Indoor Positioning Configuration' },
    '2AAE': { name: 'Latitude' },
    '2AAF': { name: 'Longitude' },
    '2AB0': { name: 'Local North Coordinate' },
    '2AB1': { name: 'Local East Coordinate' },
    '2AB2': { name: 'Floor Number' },
    '2AB3': { name: 'Altitude' },
    '2AB4': { name: 'Uncertainty' },
    '2AB5': { name: 'Location Name', format: TEXT },
};

export const uuid16bitDescriptorDefinitions = {
    '2900': { name: 'Characteristic Extended Properties' },
    '2901': { name: 'Characteristic User Description' },
    '2902': { name: 'Client Characteristic Configuration' },
    '2903': { name: 'Server Characteristic Configuration' },
    '2904': { name: 'Characteristic Presentation Format' },
    '2905': { name: 'Characteristic Aggregate Format' },
    '2906': { name: 'Valid Range' },
    '2907': { name: 'External Report Reference' },
    '2908': { name: 'Report Reference' },
    '290A': { name: 'Value Trigger Setting' },
    '290B': { name: 'Environmental Sensing Configuration' },
    '290C': { name: 'Environmental Sensing Measurement' },
    '290D': { name: 'Environmental Sensing Trigger Setting' },
};

export const uuid128bitServiceDefinitions = {
    '000015301212EFDE1523785FEABCD123': { name: 'Legacy DFU' },
    '6E400001B5A3F393E0A9E50E24DCCA9E': { name: 'UART over BLE' },
    '7905F431B5CE4E99A40F4B1E122D00D0': { name: 'ANCS' },
    'A3C875008ED34BDF8A39A01BEBEDE295': { name: 'Eddystone Configuration Service' },
    'EF6801009B3549339B1052FFA9740042': { name: 'Thingy Configuration' },
    'EF6802009B3549339B1052FFA9740042': { name: 'Thingy Weather Station' },
    'EF6803009B3549339B1052FFA9740042': { name: 'Thingy User Interface' },
    'EF6804009B3549339B1052FFA9740042': { name: 'Thingy Motion' },
    'EF6805009B3549339B1052FFA9740042': { name: 'Thingy Sound' },
};

export const uuid128bitCharacteristicDefinitions = {
    '8EC90001F3154F609FB8838830DAEA50': { name: 'Secure DFU Control Point' },
    '8EC90002F3154F609FB8838830DAEA50': { name: 'Secure DFU Packet' },
    '8EC90003F3154F609FB8838830DAEA50': { name: 'Buttonless Secure DFU without bonds' },
    '8EC90004F3154F609FB8838830DAEA50': { name: 'Buttonless Secure DFU with bonds' },
    '000015311212EFDE1523785FEABCD123': { name: 'Legacy DFU Control Point' },
    '000015321212EFDE1523785FEABCD123': { name: 'Legacy DFU Packet' },
    '6E400002B5A3F393E0A9E50E24DCCA9E': { name: 'UART RX' },
    '6E400003B5A3F393E0A9E50E24DCCA9E': { name: 'UART TX' },
    '9FBF120D630142D98C5825E699A21DBD': { name: 'ANCS Notification Source' },
    '69D1D8F345E149A898219BBDFDAAD9D9': { name: 'ANCS Control Point' },
    '22EAC6E924D64BB5BE44B36ACE7C7BFB': { name: 'ANCS Data Source' },
    // Eddystone UUIDs, https://github.com/google/eddystone/tree/master/configuration-service
    'A3C875018ED34BDF8A39A01BEBEDE295': { name: 'Capabilities' },
    'A3C875028ED34BDF8A39A01BEBEDE295': { name: 'Active Slot' },
    'A3C875038ED34BDF8A39A01BEBEDE295': { name: 'Advertising Interval' },
    'A3C875048ED34BDF8A39A01BEBEDE295': { name: 'Radio TX Power' },
    'A3C875058ED34BDF8A39A01BEBEDE295': { name: 'Advertised TX Power' },
    'A3C875068ED34BDF8A39A01BEBEDE295': { name: 'Lock State' },
    'A3C875078ED34BDF8A39A01BEBEDE295': { name: 'Unlock' },
    'A3C875088ED34BDF8A39A01BEBEDE295': { name: 'Public ECDH Key' },
    'A3C875098ED34BDF8A39A01BEBEDE295': { name: 'EID Identity Key' },
    'A3C8750A8ED34BDF8A39A01BEBEDE295': { name: 'ADV Slot Data' },
    'A3C8750B8ED34BDF8A39A01BEBEDE295': { name: 'Factory Reset' },
    'A3C8750C8ED34BDF8A39A01BEBEDE295': { name: 'Remain Connectable' },

    // thingy configuration service UUIDs:
    'EF6801019B3549339B1052FFA9740042': { name: 'Device Name', format: TEXT },
    'EF6801029B3549339B1052FFA9740042': { name: 'Advertising Parameters' },
    'EF6801049B3549339B1052FFA9740042': { name: 'Connection Parameters' },
    'EF6801059B3549339B1052FFA9740042': { name: 'Eddystone URL' },
    'EF6801069B3549339B1052FFA9740042': { name: 'Cloud Token', format: TEXT },
    'EF6801079B3549339B1052FFA9740042': { name: 'FW Version' },
    'EF6801089B3549339B1052FFA9740042': { name: 'MTU Request' },
    // thingy weather service UUIDs:
    'EF6802019B3549339B1052FFA9740042': { name: 'Temperature' },
    'EF6802029B3549339B1052FFA9740042': { name: 'Pressure' },
    'EF6802039B3549339B1052FFA9740042': { name: 'Humidity' },
    'EF6802049B3549339B1052FFA9740042': { name: 'Gas (Air Quality)' },
    'EF6802059B3549339B1052FFA9740042': { name: 'Color' },
    'EF6802069B3549339B1052FFA9740042': { name: 'Configuration' },
    // thingy user interface UUIDs:
    'EF6803019B3549339B1052FFA9740042': { name: 'LED' },
    'EF6803029B3549339B1052FFA9740042': { name: 'Button' },
    'EF6803039B3549339B1052FFA9740042': { name: 'EXT Pin' },
    // thingy motion service UUIDs:
    'EF6804019B3549339B1052FFA9740042': { name: 'Motion Configuration' },
    'EF6804029B3549339B1052FFA9740042': { name: 'Tap' },
    'EF6804039B3549339B1052FFA9740042': { name: 'Orientation' },
    'EF6804049B3549339B1052FFA9740042': { name: 'Quaternion' },
    'EF6804059B3549339B1052FFA9740042': { name: 'Pedometer' },
    'EF6804069B3549339B1052FFA9740042': { name: 'Raw Data' },
    'EF6804079B3549339B1052FFA9740042': { name: 'Euler' },
    'EF6804089B3549339B1052FFA9740042': { name: 'Rotation Matrix' },
    'EF6804099B3549339B1052FFA9740042': { name: 'Heading' },
    'EF68040A9B3549339B1052FFA9740042': { name: 'Gravity Vector' },
    // thingy sound service UUIDs:
    'EF6805019B3549339B1052FFA9740042': { name: 'Configuration' },
    'EF6805029B3549339B1052FFA9740042': { name: 'Speaker Data' },
    'EF6805039B3549339B1052FFA9740042': { name: 'Speaker Status' },
    'EF6805049B3549339B1052FFA9740042': { name: 'Microphone' },
};
