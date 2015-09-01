import changeCase from 'change-case';

import bleDriver from 'pc-ble-driver-js';
import logger from './logging';

class Textual {
    constructor(event) {
        this.event = event;
        this.stack = [];
        this.current_stack = this.stack;
    }

    toString() {
        if(this.event === undefined || this.event.id === undefined) {
            logger.info("Unknown event received.");
            return;
        }

        this.current_stack = this.stack;
        this.eventToTextual();
        this.rssiToTextual();
        this.addressToTextual();
        this.connHandleToTextual();
        this.gapToTextual();
        this.rawToTextual();

        switch(this.event.id) {
            case bleDriver.BLE_GAP_EVT_CONNECTED:
                break;
            case bleDriver.BLE_GAP_EVT_DISCONNECTED:
                break;
            case bleDriver.BLE_GAP_EVT_TIMEOUT:
                break;
            case bleDriver.BLE_GAP_EVT_CONN_PARAM_UPDATE:
                break;
            case bleDriver.BLE_GAP_EVT_ADV_REPORT:
                break;
            case bleDriver.BLE_GAP_EVT_CONN_PARAM_UPDATE:
                break;
            case bleDriver.BLE_GAP_EVT_RSSI_CHANGED:
                break;
            case bleDriver.BLE_GAP_EVT_ADV_REPORT:
                break;
            case bleDriver.BLE_GAP_EVT_SCAN_REQ_REPORT:
                break;
            case bleDriver.BLE_GAP_EVT_SEC_PARAMS_REQUEST:
                break;
            case bleDriver.BLE_GAP_EVT_SEC_INFO_REQUEST:
                break;
            case bleDriver.BLE_GAP_EVT_CONN_SEC_UPDATE:
                break;
            case bleDriver.BLE_GAP_EVT_AUTH_KEY_REQUEST:
                break;
            case bleDriver.BLE_GAP_EVT_SEC_REQUEST:
                break;
            case bleDriver.BLE_GAP_EVT_PASSKEY_DISPLAY:
                break;
            case bleDriver.BLE_GAP_EVT_CONN_PARAM_UPDATE_REQUEST:
                break;
            case bleDriver.BLE_GAP_EVT_AUTH_STATUS:
                break;
            case bleDriver.BLE_GATTC_EVT_READ_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_WRITE_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_TIMEOUT:
                break;
            case bleDriver.BLE_GATTC_EVT_HVX:
                break;
            case bleDriver.BLE_GATTC_EVT_READ_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_PRIM_SRVC_DISC_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_CHAR_DISC_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_DESC_DISC_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_CHAR_VALS_READ_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_PRIM_SRVC_DISC_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_REL_DISC_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_CHAR_DISC_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_DESC_DISC_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_CHAR_VAL_BY_UUID_READ_RSP:
                break;
            case bleDriver.BLE_GATTC_EVT_CHAR_VALS_READ_RSP:
                break;
            case bleDriver.BLE_GATTS_EVT_TIMEOUT:
                break;
            case bleDriver.BLE_GATTS_EVT_WRITE:
                break;
            case bleDriver.BLE_GATTS_EVT_RW_AUTHORIZE_REQUEST:
                break;
            case bleDriver.BLE_GATTS_EVT_SYS_ATTR_MISSING:
                break;
            case bleDriver.BLE_GATTS_EVT_HVC:
                break;
            case bleDriver.BLE_GATTS_EVT_SC_CONFIRM:
                break;
            case bleDriver.BLE_EVT_TX_COMPLETE:
                break;
            case bleDriver.BLE_EVT_TX_COMPLETE:
                break;
            case bleDriver.BLE_EVT_USER_MEM_REQUEST:
                break;
            case bleDriver.BLE_EVT_USER_MEM_RELEASE:
                break;
            default:

                break;
        }

        return this.stack.join(' ');
    }

    eventToTextual() {
        var evt = this.event.name.split('BLE_')[1];

        if(this.event.adv_type !== undefined) {
            var advEvt = this.event.adv_type.split('BLE_GAP_ADV_TYPE_')[1];
            this.current_stack.push(`${evt}/${advEvt}`);
        } else {
            this.current_stack.push(evt);
        }
    }

    addressToTextual() {
        if(this.event.peer_addr === undefined) return;

        var address = this.event.peer_addr;
        var type = address.type.split('BLE_GAP_ADDR_TYPE_')[1];
        this.current_stack.push(`addr:${type}/${address.address}`);
    }

    rssiToTextual() {
        if(this.event.rssi === undefined) return;
        this.current_stack.push(`rssi:${this.event.rssi}`);
    }

    connHandleToTextual() {
        if(this.event.conn_handle === undefined || this.event.conn_handle == 65535) return;
        this.current_stack.push(`connHandle:${this.event.conn_handle}`);
    }

    gapGeneric() {
        var event = this.event;

        if(event === undefined) return;

        var keys = Object.keys(event.data);

        for(var key in keys) {
            var key = keys[key];

            if(key.search("BLE_GAP_AD_TYPE_") != -1) {
                // We process BLE_GAP_AD_TYPES_FLAGS somewhere else
                if(key.search("BLE_GAP_AD_TYPE_FLAGS") != -1) continue;

                var value = eval(`event.data.${key}`);
                var name = key.split("BLE_GAP_AD_TYPE_")[1];
                name = changeCase.camelCase(name);
                this.current_stack.push(`${name}:${value}`);
            }
        }
    }

    gapToTextual() {
        var event = this.event;

        if(event === undefined) return;
        if(event.data === undefined) return;

        var gap = [];
        var old_stack = this.current_stack;
        this.current_stack = gap;

        // Process flags if they are present
        if(event.data.BLE_GAP_AD_TYPE_FLAGS !== undefined) {
            var re = /BLE_GAP_ADV_FLAGS?_(.*)/;
            var flags = [];

            event.data.BLE_GAP_AD_TYPE_FLAGS.forEach(flag => {
                flags.push(changeCase.camelCase(re.exec(flag)[1]));
            });

            flags = flags.join(',');
            gap.push(`adTypeFlags:[${flags}]`);
        }

        // Add scan response if that is present
        if(event.scan_rsp !== undefined && event.scan_rsp == true) gap.push("scanRsp");

        // Add GAP information that can be processed in a generic way
        this.gapGeneric();

        // Join all GAP information and add to stack
        var text = gap.join(' ');

        this.current_stack = old_stack;
        this.current_stack.push(`GAP:[${text}]`);
    }

    rawToTextual() {
        var event = this.event;

        if(event == undefined) return;
        if(event.data == undefined) return;
        if(event.data.raw == undefined) return;

        var raw = event.data.raw.toString('hex');
        this.current_stack.push(`raw:[${raw}]`);
    }
};

module.exports = Textual;