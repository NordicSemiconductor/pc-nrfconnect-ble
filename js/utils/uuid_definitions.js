/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

 'use strict';

export const uuid16bitGattDefinitions = {
    '2800': 'Primary Service',
    '2801': 'Secondary Service',
    '2802': 'Include',
    '2803': 'Characteristic',
};

export const uuid16bitServiceDefinitions = {
    '1800': 'Generic Access',
    '1801': 'Generic Attribute',
    '1802': 'Immediate Alert',
    '1803': 'Link Loss',
    '1804': 'Tx Power',
    '1805': 'Current Time Service',
    '1806': 'Reference Time Update Service',
    '1807': 'Next DST Change Service',
    '1808': 'Glucose',
    '1809': 'Health Thermometer',
    '180A': 'Device Information',
    '180D': 'Heart Rate',
    '180E': 'Phone Alert Status Service',
    '180F': 'Battery Service',
    '1810': 'Blood Pressure',
    '1811': 'Alert Notification Service',
    '1812': 'Human Interface Device',
    '1813': 'Scan Parameters',
    '1814': 'Running Speed and Cadence',
    '1815': 'Automation IO',
    '1816': 'Cycling Speed and Cadence',
    '1818': 'Cycling Power',
    '1819': 'Location and Navigation',
    '181A': 'Environmental Sensing',
    '181B': 'Body Composition',
    '181C': 'User Data',
    '181D': 'Weight Scale',
    '181E': 'Bond Management',
    '181F': 'Continuous Glucose Monitoring',
    '1820': 'Internet Protocol Support',
    '1821': 'Indoor Positioning',
    '1822': 'Pulse Oximeter',
};

export const uuid16bitCharacteristicDefinitions = {
    '2A00': 'Device Name',
    '2A01': 'Appearance',
    '2A02': 'Peripheral Privacy Flag',
    '2A03': 'Reconnection Address',
    '2A04': 'Peripheral Preferred Connection Parameters',
    '2A05': 'Service Changed',
    '2A06': 'Alert Level',
    '2A07': 'Tx Power Level',
    '2A08': 'Date Time',
    '2A09': 'Day of Week',
    '2A0A': 'Day Date Time',
    '2A0C': 'Exact Time 256',
    '2A0D': 'DST Offset',
    '2A0E': 'Time Zone',
    '2A0F': 'Local Time Information',
    '2A11': 'Time with DST',
    '2A12': 'Time Accuracy',
    '2A13': 'Time Source',
    '2A14': 'Reference Time Information',
    '2A16': 'Time Update Control Point',
    '2A17': 'Time Update State',
    '2A18': 'Glucose Measurement',
    '2A19': 'Battery Level',
    '2A1C': 'Temperature Measurement',
    '2A1D': 'Temperature Type',
    '2A1E': 'Intermediate Temperature',
    '2A21': 'Measurement Interval',
    '2A22': 'Boot Keyboard Input Report',
    '2A23': 'System ID',
    '2A24': 'Model Number String',
    '2A25': 'Serial Number String',
    '2A26': 'Firmware Revision String',
    '2A27': 'Hardware Revision String',
    '2A28': 'Software Revision String',
    '2A29': 'Manufacturer Name String',
    '2A2A': 'IEEE 11073-20601 Regulatory Certification Data List',
    '2A2B': 'Current Time',
    '2A2C': 'Magnetic Declination',
    '2A31': 'Scan Refresh',
    '2A32': 'Boot Keyboard Output Report',
    '2A33': 'Boot Mouse Input Report',
    '2A34': 'Glucose Measurement Context',
    '2A35': 'Blood Pressure Measurement',
    '2A36': 'Intermediate Cuff Pressure',
    '2A37': 'Heart Rate Measurement',
    '2A38': 'Body Sensor Location',
    '2A39': 'Heart Rate Control Point',
    '2A3F': 'Alert Status',
    '2A40': 'Ringer Control Point',
    '2A41': 'Ringer Setting',
    '2A42': 'Alert Category ID Bit Mask',
    '2A43': 'Alert Category ID',
    '2A44': 'Alert Notification Control Point',
    '2A45': 'Unread Alert Status',
    '2A46': 'New Alert',
    '2A47': 'Supported New Alert Category',
    '2A48': 'Supported Unread Alert Category',
    '2A49': 'Blood Pressure Feature',
    '2A4A': 'HID Information',
    '2A4B': 'Report Map',
    '2A4C': 'HID Control Point',
    '2A4D': 'Report',
    '2A4E': 'Protocol Mode',
    '2A4F': 'Scan Interval Window',
    '2A50': 'PnP ID',
    '2A51': 'Glucose Feature',
    '2A52': 'Record Access Control Point',
    '2A53': 'RSC Measurement',
    '2A54': 'RSC Feature',
    '2A55': 'SC Control Point',
    '2A56': 'Digital',
    '2A58': 'Analog',
    '2A5A': 'Aggregate',
    '2A5B': 'CSC Measurement',
    '2A5C': 'CSC Feature',
    '2A5D': 'Sensor Location',
    '2A5E': 'PLX Spot-Check Measurement',
    '2A5F': 'PLX Continuous Measurement',
    '2A60': 'PLX Features',
    '2A63': 'Cycling Power Measurement',
    '2A64': 'Cycling Power Vector',
    '2A65': 'Cycling Power Feature',
    '2A66': 'Cycling Power Control Point',
    '2A67': 'Location and Speed',
    '2A68': 'Navigation',
    '2A69': 'Position Quality',
    '2A6A': 'LN Feature',
    '2A6B': 'LN Control Point',
    '2A6C': 'Elevation',
    '2A6D': 'Pressure',
    '2A6E': 'Temperature',
    '2A6F': 'Humidity',
    '2A70': 'True Wind Speed',
    '2A71': 'True Wind Direction',
    '2A72': 'Apparent Wind Speed',
    '2A73': 'Apparent Wind Direction ',
    '2A74': 'Gust Factor',
    '2A75': 'Pollen Concentration',
    '2A76': 'UV Index',
    '2A77': 'Irradiance',
    '2A78': 'Rainfall',
    '2A79': 'Wind Chill',
    '2A7A': 'Heat Index',
    '2A7B': 'Dew Point',
    '2A7D': 'Descriptor Value Changed',
    '2A7E': 'Aerobic Heart Rate Lower Limit',
    '2A7F': 'Aerobic Threshold',
    '2A80': 'Age',
    '2A81': 'Anaerobic Heart Rate Lower Limit',
    '2A82': 'Anaerobic Heart Rate Upper Limit',
    '2A83': 'Anaerobic Threshold',
    '2A84': 'Aerobic Heart Rate Upper Limit',
    '2A85': 'Date of Birth',
    '2A86': 'Date of Threshold Assessment',
    '2A87': 'Email Address',
    '2A88': 'Fat Burn Heart Rate Lower Limit',
    '2A89': 'Fat Burn Heart Rate Upper Limit',
    '2A8A': 'First Name',
    '2A8B': 'Five Zone Heart Rate Limits',
    '2A8C': 'Gender',
    '2A8D': 'Heart Rate Max',
    '2A8E': 'Height',
    '2A8F': 'Hip Circumference',
    '2A90': 'Last Name',
    '2A91': 'Maximum Recommended Heart Rate',
    '2A92': 'Resting Heart Rate',
    '2A93': 'Sport Type for Aerobic and Anaerobic Thresholds',
    '2A94': 'Three Zone Heart Rate Limits',
    '2A95': 'Two Zone Heart Rate Limit',
    '2A96': 'VO2 Max',
    '2A97': 'Waist Circumference',
    '2A98': 'Weight',
    '2A99': 'Database Change Increment',
    '2A9A': 'User Index',
    '2A9B': 'Body Composition Feature',
    '2A9C': 'Body Composition Measurement',
    '2A9D': 'Weight Measurement',
    '2A9E': 'Weight Scale Feature',
    '2A9F': 'User Control Point',
    '2AA0': 'Magnetic Flux Density - 2D',
    '2AA1': 'Magnetic Flux Density - 3D',
    '2AA2': 'Language',
    '2AA3': 'Barometric Pressure Trend',
    '2AA4': 'Bond Management Control Point',
    '2AA5': 'Bond Management Feature',
    '2AA6': 'Central Address Resolution',
    '2AA7': 'CGM Measurement',
    '2AA8': 'CGM Feature',
    '2AA9': 'CGM Status',
    '2AAA': 'CGM Session Start Time',
    '2AAB': 'CGM Session Run Time',
    '2AAC': 'CGM Specific Ops Control Point',
    '2AAD': 'Indoor Positioning Configuration',
    '2AAE': 'Latitude',
    '2AAF': 'Longitude',
    '2AB0': 'Local North Coordinate',
    '2AB1': 'Local East Coordinate',
    '2AB2': 'Floor Number',
    '2AB3': 'Altitude',
    '2AB4': 'Uncertainty',
    '2AB5': 'Location Name',
};

export const uuid16bitDescriptorDefinitions = {
    '2900': 'Characteristic Extended Properties',
    '2901': 'Characteristic User Description',
    '2902': 'Client Characteristic Configuration',
    '2903': 'Server Characteristic Configuration',
    '2904': 'Characteristic Presentation Format',
    '2905': 'Characteristic Aggregate Format',
    '2906': 'Valid Range',
    '2907': 'External Report Reference',
    '2908': 'Report Reference',
    '290A': 'Value Trigger Setting',
    '290B': 'Environmental Sensing Configuration',
    '290C': 'Environmental Sensing Measurement',
    '290D': 'Environmental Sensing Trigger Setting',
};

export const uuid16bitDefinitions = Object.assign({},
    uuid16bitServiceDefinitions,
    uuid16bitCharacteristicDefinitions,
    uuid16bitDescriptorDefinitions,
    uuid16bitGattDefinitions);

export const uuid128bitServiceDefinitions = {
    '000015301212EFDE1523785FEABCD123': 'DFU',
    '6E400001B5A3F393E0A9E50E24DCCA9E': 'UART over BLE',
    '7905F431B5CE4E99A40F4B1E122D00D0': 'ANCS',
    'A3C875008ED34BDF8A39A01BEBEDE295': 'Eddystone Configuration Service',
};

export const uuid128bitCharacteristicDefinitions = {
    '000015311212EFDE1523785FEABCD123': 'DFU Control Point',
    '000015321212EFDE1523785FEABCD123': 'DFU Packet',
    '6E400002B5A3F393E0A9E50E24DCCA9E': 'UART RX',
    '6E400003B5A3F393E0A9E50E24DCCA9E': 'UART TX',
    '9FBF120D630142D98C5825E699A21DBD': 'ANCS Notification Source',
    '69D1D8F345E149A898219BBDFDAAD9D9': 'ANCS Control Point',
    '22EAC6E924D64BB5BE44B36ACE7C7BFB': 'ANCS Data Source',
    //Eddystone UUIDs, https://github.com/google/eddystone/tree/master/configuration-service
    'A3C875018ED34BDF8A39A01BEBEDE295': 'Capabilities',
    'A3C875028ED34BDF8A39A01BEBEDE295': 'Active Slot',
    'A3C875038ED34BDF8A39A01BEBEDE295': 'Advertising Interval',
    'A3C875048ED34BDF8A39A01BEBEDE295': 'Radio TX Power',
    'A3C875058ED34BDF8A39A01BEBEDE295': 'Advertised TX Power',
    'A3C875068ED34BDF8A39A01BEBEDE295': 'Lock State',
    'A3C875078ED34BDF8A39A01BEBEDE295': 'Unlock',
    'A3C875088ED34BDF8A39A01BEBEDE295': 'Public ECDH Key',
    'A3C875098ED34BDF8A39A01BEBEDE295': 'EID Identity Key',
    'A3C8750A8ED34BDF8A39A01BEBEDE295': 'ADV Slot Data',
    'A3C8750B8ED34BDF8A39A01BEBEDE295': 'Factory Reset',
    'A3C8750C8ED34BDF8A39A01BEBEDE295': 'Remain Connectable',
};

export const uuid128bitDescriptorDefinitions = {
};

export const uuid128bitDefinitions = Object.assign({},
    uuid128bitServiceDefinitions,
    uuid128bitCharacteristicDefinitions,
    uuid128bitDescriptorDefinitions);

export const uuidServiceDefinitions = Object.assign({},
    uuid16bitServiceDefinitions,
    uuid128bitServiceDefinitions);

export const uuidCharacteristicDefinitions = Object.assign({},
    uuid16bitCharacteristicDefinitions,
    uuid128bitCharacteristicDefinitions);

export const uuidDescriptorDefinitions = Object.assign({},
    uuid16bitDescriptorDefinitions,
    uuid128bitDescriptorDefinitions);

export const uuidDefinitions = Object.assign({},
    uuid16bitDefinitions,
    uuid128bitDefinitions);

// TODO: look into using a database for storing the services UUID's. Also look into importing them from the Bluetooth pages.
// TODO: Also look into reusing code from the Android MCP project:
// TODO: http://projecttools.nordicsemi.no/stash/projects/APPS-ANDROID/repos/nrf-master-control-panel/browse/app/src/main/java/no/nordicsemi/android/mcp/database/init
// TODO: http://projecttools.nordicsemi.no/stash/projects/APPS-ANDROID/repos/nrf-master-control-panel/browse/app/src/main/java/no/nordicsemi/android/mcp/database/DatabaseHelper.java
export function getUuidName(uuid) {
    let lookupUuid = uuid.toUpperCase();
    if (lookupUuid[1] === 'X') {
        lookupUuid = lookupUuid.slice(2);
    }

    return uuidDefinitions[lookupUuid] || uuid;
}

export function getUuidByName(name) {
    for (let uuid in uuidDefinitions) {
        if (uuidDefinitions.hasOwnProperty(uuid)) {
            if (uuidDefinitions[uuid] === name) {
                return uuid;
            }
        }
    }
}

export function getPrettyUuid(uuid) {
    const insertHyphen = (string, index) => {
        return string.substr(0, index) + '-' + string.substr(index);
    };

    if (uuid.length === 4) {
        return uuid.toUpperCase();
    }

    uuid = insertHyphen(uuid, 20);
    uuid = insertHyphen(uuid, 16);
    uuid = insertHyphen(uuid, 12);
    uuid = insertHyphen(uuid, 8);

    return uuid.toUpperCase();
}
