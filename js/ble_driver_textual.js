import changeCase from 'change-case';

import bleDriver from 'pc-ble-driver-js';
import logger from './logging';

var rewriter = function(value) {
    var rewrite_rules = [
            { expr:/BLE_GAP_ADV_FLAGS?_(.*)/, on_match: function(matches) { return changeCase.camelCase(matches[1]) }},
            { expr:/BLE_GAP_AD_TYPE_(.*)/, on_match: function(matches) { return changeCase.camelCase(matches[1]) }},
            { expr:/BLE_GAP_ADDR_TYPE_(.*)/, on_match: function(matches) { return changeCase.camelCase(matches[1]) }},
            { expr: /BLE_GAP_ADV_TYPE_(.*)/, on_match: function(matches) { return changeCase.camelCase(matches[1]) }},
            { expr: /([0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2})/,
                    on_match: function(matches) { return matches[1] }},
            { expr: /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d+)Z/,
                    on_match: function(matches) { return matches.input }},
            { expr: /BLE_GAP_ROLE_(.*)/, on_match: function(matches) { return changeCase.camelCase(matches[1]) }},
            { expr: /BLE_HCI_(.*)/, on_match: function(matches) { return changeCase.camelCase(matches[1]) }}
    ];

    try {
        for(var rewrite_rule in rewrite_rules) {
            var rule = rewrite_rules[rewrite_rule];

            if(rule.expr.test(value)) {
                return rule.on_match(rule.expr.exec(value));
            }
        }
    } catch(err) {
        console.log(err);
    }

    // We did not find any rules to rewrite the value, return original value
    return changeCase.camelCase(value);
}


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
        this.genericToTextual();
        this.gapToTextual();
        this.dataToTextual();

        switch(this.event.id) {
            case bleDriver.BLE_GAP_EVT_ADV_REPORT:
            case bleDriver.BLE_GAP_EVT_CONNECTED:
            case bleDriver.BLE_GAP_EVT_CONN_PARAM_UPDATE_REQUEST:
            case bleDriver.BLE_GAP_EVT_TIMEOUT:
            case bleDriver.BLE_GAP_EVT_DISCONNECTED:
            case bleDriver.BLE_GATTC_EVT_DESC_DISC_RSP:
            case bleDriver.BLE_GATTC_EVT_READ_RSP:
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

    genericToTextual() {
        var evt = this.event;
        this.current_stack.push(this._extractValues(evt).join(' '));
    }

    _extractValues(obj) {
        var old_stack = this.current_stack;
        var new_stack = []
        this.current_stack = new_stack;

        var keys = Object.keys(obj);

        for(var key in keys) {
            var key = keys[key];

            if(key == 'id') continue;
            if(key == 'data') continue;
            if(key == 'name') continue;

            var value = eval(`obj.${key}`);

            key = rewriter(key);

            if(value.constructor === Array) {
                var array_stack = [];

                for(var entry in value) {
                    var entry_data = this._extractValues(value[entry]);
                    array_stack.push(`[${entry_data}]`);
                }

                var data = array_stack.join(',');
                this.current_stack.push(`${key}:[${data}]`);
            } else if(typeof value === 'object') {
                var data = this._extractValues(value);
                data = data.join(' ');
                this.current_stack.push(`${key}:[${data}]`);
            } else {
                value = rewriter(value);
                this.current_stack.push(`${key}:${value}`);
            }
        }

        this.current_stack = old_stack;
        return new_stack;
    }

    rssiToTextual() {
        if(this.event.rssi === undefined) return;
        this.current_stack.push(`rssi:${this.event.rssi}`);
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
                var name = rewriter(key);
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
            var flags = [];

            event.data.BLE_GAP_AD_TYPE_FLAGS.forEach(flag => {
                flags.push(rewriter(flag));
            });

            flags = flags.join(',');
            gap.push(`adTypeFlags:[${flags}]`);
        }

        // Add GAP information that can be processed in a generic way
        this.gapGeneric();

        this.current_stack = old_stack;

        if(gap.length == 0) return;

        // Join all GAP information and add to stack
        var text = gap.join(' ');
        this.current_stack.push(`gap:[${text}]`);
    }

    dataToTextual() {
        var event = this.event;

        if(event == undefined) return;
        if(event.data == undefined) return;

        if(event.data.raw !== undefined) {
            var raw = event.data.raw.toString('hex').toUpperCase();
            this.current_stack.push(`raw:[${raw}]`);
        } else if(event.data.constructor === Buffer) {
            var data = event.data.toString('hex').toUpperCase();
            this.current_stack.push(`data:[${data}]`);
        }
    }
};

module.exports = Textual;