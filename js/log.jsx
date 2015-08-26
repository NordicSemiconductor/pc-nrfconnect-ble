'use strict';

var React = require('react');
var DataGrid = require('react-datagrid');
var Reflux = require('reflux');
var logStore = require('./stores/logStore.js');
var LogActions = require('./actions/logActions');
var moment = require('moment');

var View = React.View;

var mui = require('material-ui');

var Checkbox = mui.Checkbox;

var logViewPeerAddress = {}

var time_render = function(column, row) {
    if(column === undefined) return '';

    var time = new Date(column);
    return moment(time).format('HH:mm:ss.SSSS');
}

var logger_render = function(column, row) {
    if(column === undefined) return "";
    return column;
}

var data_render = function(column, row) {
    if(column === undefined) return "";

    var data = JSON.parse(column);

    if(row.logger == 'ble_driver.event') {
        var short_local_name = 'n/a';
        var peer_address = null;
        var pairing_status = 'NOT BONDED';
        var flags = [];
        var rssi = null;

        if(data.peer_addr !== undefined) {
            peer_address = data.peer_addr.address.toUpperCase();
        }

        if(data.rssi !== undefined) {
            rssi = data.rssi;
        }

        if(data.data !== undefined) {
            if(data.data.BLE_GAP_AD_TYPE_SHORT_LOCAL_NAME !== undefined) {
                short_local_name = data.data.BLE_GAP_AD_TYPE_SHORT_LOCAL_NAME;
            }
        }

        if(data.processed !== undefined) {
            if(data.processed.flags !== undefined) {
                flags = data.processed.flags;
            }
        }

        return <div id="log-entry">
                <device-info>
                    <div>{short_local_name}</div>
                    <div>{peer_address}</div>
                </device-info>
                <device-status>
                    <div>{pairing_status}</div>
                    <div><i className="fa fa-wifi" style={{color: 'black', float: 'center', margin: '10px 5px 10px 15px'}}></i>{rssi}</div>
                </device-status>
                <service-info>
                    <service-flags>
                    Flags:
                        { flags.map(function(flag) { return <service-flag>{flag}</service-flag> }
                        )
                        }
                    </service-flags>
                </service-info>
            </div>
    } else {
        return <div id="log-entry">{data.text}</div>;
    }
}

var row_factory = function(row) {
    if(row.data !== undefined) {
        if(row.data.logger !== undefined) {
            if(row.data.logger === 'ble_driver.event') {
                row.rowHeight = undefined;
            }
        }
    }
}

var level_render = function(entry) {
    if(entry === undefined) return "";

    switch(entry) {
        case 0:
            return 'TRACE';
            break;
        case 1:
            return 'DEBUG';
            break;
        case 2:
            return 'INFO';
            break;
        case 3:
            return 'WARNING';
            break;
        case 4:
            return 'ERROR';
            break;
        case 5:
            return 'FATAL';
            break;
        default:
            return "UNKNOWN";
            break;
    }
}

var row_style_render = function(data, props) {
    var style = {}

    switch(data.level) {
        case 0:
        case 1:
            style.background = '#FFFFFF';
            break;
        case 2:
            style.background = '#FFFFFF';
            break;
        case 3:
        case 4:
        case 5:
            style.background = '#FF0000';
            break;
        default:
            style.background = '#0000FF';
            break;
    }

    return style;
}

// TODO: Have to ask @torleifs how to get HTML5/CSS to automatically format column width based on content
var columns = [
    { 'name': 'id', visible: false },
    { 'name': 'time', render: time_render, width: 210 },
    { 'name': 'level', render: level_render, width: 50, visible: false },
    { 'name': 'logger', render: logger_render, visible: false },
    { 'name': 'data', render: data_render, width: '100%' }
];

var LogContainer = React.createClass({
    mixins: [Reflux.connect(logStore)],
    _onFollow: function(event, follow) {
        LogActions.follow(follow);
    },
    componentDidUpdate: function() {
        if(this.state !== undefined
            && this.state.follow_state !== undefined
            && this.state.follow_state == true) {
            var log_entries = this.refs['log_entries'];

            if(log_entries !== undefined) {
                // TODO: add automatic scrolling here, I think...
            }
        }
    },
    render: function() {
        return (
            <div>
                <DataGrid
                    ref="log_entries"
                    idProperty="id"
                    dataSource={this.state.logEntries}
                    columns={columns}
                    pagination={false}
                    emptyText={'No log entries'}
                    withColumnMenu={false}
                    rowStyle={row_style_render}
                    showCellBorders={true}
                    rowFactory={row_factory}
                    style={{height: 700}}
                />

                <Checkbox name="followLogCheckBox" label="Follow" onCheck={this._onFollow} />
            </div>);
    }
});

module.exports = LogContainer;
