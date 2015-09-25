import { ServiceItem } from '../deviceDetails.jsx';
import AddNewItem from './AddNewItem.jsx';
import ServiceEditor from './ServiceEditor.jsx';
import CharacteristicEditor from './CharacteristicEditor.jsx';
import DescriptorEditor from './DescriptorEditor.jsx';
import KeyNavigation from '../common/TreeViewKeyNavigationMixin.jsx';
import hotkey from 'react-hotkey';




var services = [{"handle":1,"uuid":"0x2800","name":"Generic Access","characteristics":[{"handle":2,"uuid":"0x2803","name":"Device Name","descriptors":[],"properties":{"broadcast":0,"read":2,"writeWithoutResponse":0,"write":8,"notify":0,"indicate":0,"authenticatedSignedWrites":0,"extendedProperties":0},"valueHandle":3,"characteristicUuid":"0x2A00","value":"4E-6F-72-64-69-63-5F-48-52-4D"},{"handle":4,"uuid":"0x2803","name":"Appearance","descriptors":[],"properties":{"broadcast":0,"read":2,"writeWithoutResponse":0,"write":0,"notify":0,"indicate":0,"authenticatedSignedWrites":0,"extendedProperties":0},"valueHandle":5,"characteristicUuid":"0x2A01","value":"41-03"},{"handle":6,"uuid":"0x2803","name":"Peripheral Preferred Connection Parameters","descriptors":[],"properties":{"broadcast":0,"read":2,"writeWithoutResponse":0,"write":0,"notify":0,"indicate":0,"authenticatedSignedWrites":0,"extendedProperties":0},"valueHandle":7,"characteristicUuid":"0x2A04","value":"40-01-08-02-00-00-90-01"}],"serviceUuid":"0x1800"},{"handle":8,"uuid":"0x2800","name":"Generic Attribute","characteristics":[{"handle":9,"uuid":"0x2803","name":"Service Changed","descriptors":[{"handle":11,"uuid":"0x2902","name":"Client Characteristic Configuration","value":"00-00"}],"properties":{"broadcast":0,"read":0,"writeWithoutResponse":0,"write":0,"notify":0,"indicate":32,"authenticatedSignedWrites":0,"extendedProperties":0},"valueHandle":10,"characteristicUuid":"0x2A05","value":""}],"serviceUuid":"0x1801"},{"handle":12,"uuid":"0x2800","name":"Heart Rate","characteristics":[{"handle":13,"uuid":"0x2803","name":"Heart Rate Measurement","descriptors":[{"handle":15,"uuid":"0x2902","name":"Client Characteristic Configuration","value":"00-00"}],"properties":{"broadcast":0,"read":0,"writeWithoutResponse":0,"write":0,"notify":16,"indicate":0,"authenticatedSignedWrites":0,"extendedProperties":0},"valueHandle":14,"characteristicUuid":"0x2A37","value":""},{"handle":16,"uuid":"0x2803","name":"Body Sensor Location","descriptors":[],"properties":{"broadcast":0,"read":2,"writeWithoutResponse":0,"write":0,"notify":0,"indicate":0,"authenticatedSignedWrites":0,"extendedProperties":0},"valueHandle":17,"characteristicUuid":"0x2A38","value":"03"}],"serviceUuid":"0x180D"},{"handle":18,"uuid":"0x2800","name":"Battery Service","characteristics":[{"handle":19,"uuid":"0x2803","name":"Battery Level","descriptors":[{"handle":21,"uuid":"0x2902","name":"Client Characteristic Configuration","value":"00-00"}],"properties":{"broadcast":0,"read":2,"writeWithoutResponse":0,"write":0,"notify":16,"indicate":0,"authenticatedSignedWrites":0,"extendedProperties":0},"valueHandle":20,"characteristicUuid":"0x2A19","value":"59"}],"serviceUuid":"0x180F"},{"handle":22,"uuid":"0x2800","name":"Device Information","characteristics":[{"handle":23,"uuid":"0x2803","name":"Manufacturer Name String","descriptors":[],"properties":{"broadcast":0,"read":2,"writeWithoutResponse":0,"write":0,"notify":0,"indicate":0,"authenticatedSignedWrites":0,"extendedProperties":0},"valueHandle":24,"characteristicUuid":"0x2A29","value":"4E-6F-72-64-69-63-53-65-6D-69-63-6F-6E-64-75-63-74-6F-72"}],"serviceUuid":"0x180A"}]

var ServerSetup = React.createClass({
    mixins: [KeyNavigation.mixin('services')],
    getDefaultProps() {
        return { services: services }
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
    render() {
        var selected = this.state.selected;
        var editor = 
            !selected ? <div className="nothing-selected" /> 
            : selected.characteristics ? <ServiceEditor service={selected} />
            : selected.descriptors ? <CharacteristicEditor characteristic={selected} />
            : <DescriptorEditor descriptor={selected} />
        return (
            <div className="server-setup" style={this.props.style}>
                <div className="device-details-view">
                    <div className="service-items-wrap">
                        {this.services.map((service, i) =>
                            <ServiceItem name={service.name} key={i} characteristics={service.characteristics} addNew={true} 
                                item={service} selected={this.state.selected} onSelected={this._onSelected} selectOnClick={true}/>
                        )}
                        <AddNewItem text="New service" bars={1} />
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