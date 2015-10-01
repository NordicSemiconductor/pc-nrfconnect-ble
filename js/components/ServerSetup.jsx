/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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


import AddNewItem from './AddNewItem.jsx';
import ServiceItem from './ServiceItem';
import ServiceEditor from './ServiceEditor.jsx';
import CharacteristicEditor from './CharacteristicEditor.jsx';
import DescriptorEditor from './DescriptorEditor.jsx';
import KeyNavigation from '../common/TreeViewKeyNavigationMixin.jsx';
import hotkey from 'react-hotkey';

import GattDatabases from '../gattDatabases';

var readProperties = new GattDatabases.Properties(0x02);
var notifyProperties = new GattDatabases.Properties(0x10);
var indicateProperties = new GattDatabases.Properties(0x20);

var readWriteProperties = new GattDatabases.Properties(0x0A);
var readNotifyProperties = new GattDatabases.Properties(0x12);

var services = [{"handle":1,"uuid":"0x2800","name":"Generic Access","characteristics":[{"handle":2,"uuid":"0x2803","name":"Device Name","descriptors":[],"properties":readWriteProperties,"valueHandle":3,"characteristicUuid":"0x2A00","value":"4E-6F-72-64-69-63-5F-48-52-4D"},{"handle":4,"uuid":"0x2803","name":"Appearance","descriptors":[],"properties":readProperties,"valueHandle":5,"characteristicUuid":"0x2A01","value":"41-03"},{"handle":6,"uuid":"0x2803","name":"Peripheral Preferred Connection Parameters","descriptors":[],"properties":readProperties, "valueHandle":7,"characteristicUuid":"0x2A04","value":"40-01-08-02-00-00-90-01"}],"serviceUuid":"0x1800"},{"handle":8,"uuid":"0x2800","name":"Generic Attribute","characteristics":[{"handle":9,"uuid":"0x2803","name":"Service Changed","descriptors":[{"handle":11,"uuid":"0x2902","name":"Client Characteristic Configuration","value":"00-00"}],"properties":indicateProperties,"valueHandle":10,"characteristicUuid":"0x2A05","value":""}],"serviceUuid":"0x1801"},{"handle":12,"uuid":"0x2800","name":"Heart Rate","characteristics":[{"handle":13,"uuid":"0x2803","name":"Heart Rate Measurement","descriptors":[{"handle":15,"uuid":"0x2902","name":"Client Characteristic Configuration","value":"00-00"}],"properties":notifyProperties,"valueHandle":14,"characteristicUuid":"0x2A37","value":""},{"handle":16,"uuid":"0x2803","name":"Body Sensor Location","descriptors":[],"properties":readProperties,"valueHandle":17,"characteristicUuid":"0x2A38","value":"03"}],"serviceUuid":"0x180D"},{"handle":18,"uuid":"0x2800","name":"Battery Service","characteristics":[{"handle":19,"uuid":"0x2803","name":"Battery Level","descriptors":[{"handle":21,"uuid":"0x2902","name":"Client Characteristic Configuration","value":"00-00"}],"properties":readNotifyProperties,"valueHandle":20,"characteristicUuid":"0x2A19","value":"59"}],"serviceUuid":"0x180F"},{"handle":22,"uuid":"0x2800","name":"Device Information","characteristics":[{"handle":23,"uuid":"0x2803","name":"Manufacturer Name String","descriptors":[],"properties":readProperties,"valueHandle":24,"characteristicUuid":"0x2A29","value":"4E-6F-72-64-69-63-53-65-6D-69-63-6F-6E-64-75-63-74-6F-72"}],"serviceUuid":"0x180A"}];

services.forEach(service => {
    service.characteristics.forEach(characteristic => {
        characteristic.parent = service;
        characteristic.descriptors.forEach(descriptor => {
            descriptor.parent = characteristic;
        });
    });
});

var ServerSetup = React.createClass({
    mixins: [KeyNavigation.mixin('services', true)],
    getDefaultProps() {
        return { services: services };
    },
    getInitialState() {
        return { selected: null };
    },
    _onSelected(selected) {
        this.setState({ selected: selected });
    },
    componentWillMount() {
        this.services = services;
    },
    _addService() {
        var handle = Math.random(); //just need a unique value until a real handle is assigned by the driver
        var service = { "handle": handle, "uuid": "", "name": "New service", "characteristics": [], "serviceUuid": "" };
        this.props.services.push(service);
        this._onSelected(service);
        this._assignIdsAndParents();
    },
    render() {
        var selected = this.state.selected;
        var editor =
            !selected ? <div className="nothing-selected" />
            : selected.characteristics ? <ServiceEditor service={selected} />
            : selected.descriptors ? <CharacteristicEditor characteristic={selected} />
            : selected._addBtnId ? <form />
            : <DescriptorEditor descriptor={selected} />
        return (
            <div className="server-setup" style={this.props.style}>
                <div className="device-details-view">
                    <div className="service-items-wrap">
                        {this.services.map((service, i) =>
                            <ServiceItem name={service.name} key={i} characteristics={service.characteristics} addNew={true}
                                item={service} selected={this.state.selected} onSelected={this._onSelected} selectOnClick={true}/>
                        )}
                        <AddNewItem text="New service" id="add-btn-root" bars={1} selected={this.state.selected} onClick={this._addService} />
                    </div>
                    <div className="item-editor">
                        {editor}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ServerSetup;
