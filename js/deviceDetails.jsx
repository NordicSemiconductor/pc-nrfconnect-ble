'use strict';

var react = require('react');
var reflux = require('reflux');
var connectionStore = require('./stores/connectionStore');
var deviceStore = require('./stores/deviceStore');


var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;
var ListItem = mui.ListItem;
var List = mui.List;

var dummyData = [
    {
        "handle": 1,
        "uuid": "0x1809",
        "name": "Health Thermometer",
        "characteristics": [
        {
            "name": "Temperature",
            "uuid": "0x2A1D",
            "value": "37,5C",
            "descriptors": []
        },
        {
            "name": "Measurement Interval",
            "uuid": "0x2A1D",
            "value": "300 sec",
            "descriptors": [
            {
                "name": "Client Characteristic Configuration",
                "uuid": "0x0028",
                "value": "300 sec"
            }]
        }]
  }
];

var deviceDetailsStyle = {
    boxShadow: "0px 0px 4px 0px #777A89",
    width: '300px',
    position: 'absolute',
    left: '40px',
    top: '20px'
};

var listItemStyle = {
    border: "grey solid thin",
    paddingLeft: "0px"
};

var DeviceDetailsNode = React.createClass({

    render: function() {
        var services = dummyData.map(function(service){
            return (
                <ListItem>
                    {service.name}
                    {service.characteristics.map(function(characteristic){
                        return (
                            <ListItem primaryText={characteristic.name} secondaryText={characteristic.value} insetChildren={false}>
                                {characteristic.descriptors.map(function(descriptor){
                                    return <ListItem primaryText={descriptor.name} secondaryText={descriptor.value}/>
                                })}
                            </ListItem>);
                    })}
                </ListItem>
            );
        });
        return (
            <div style={deviceDetailsStyle}>
                <List subheader="Services">
                    {services}

                </List>
            </div>
        );
    }
});


var DeviceDetailsView = React.createClass({
    mixins: [reflux.connect(deviceStore)],
    
    render: function() {
        return (
            <DeviceDetailsNode deviceData={this.state.devices[0]}/>
           
          );
    }
});
module.exports = DeviceDetailsView;