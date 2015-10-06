import _ from 'underscore';
import HexOnlyEditableField from './HexOnlyEditableField.jsx';
import ConfirmationDialog from './ConfirmationDialog.jsx';

var CharacteristicEditor = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState() {
        return {
            broadcast: false,
            read: false,
            writeWithoutResponse: false,
            write: false,
            notify: false,
            indicate: false,
            authenticatedSignedWrites: false,
            reliableWrite: false,  //probably not mapped right
            writeAuxiliary: false, //probably not mapped right
            uuid: "",
            name: "",
            value: "",
            maxLengthActive: false,//probably not mapped right
            maxLength: null,        //probably not mapped right
            security: null,
            readAuthorization: false,
            writeAuthorization: false,
            showConfirmDialog: false
        }
    },
    componentWillMount() {
        this._setStateFromCharacteristic(this.props.characteristic);
    },
    componentWillReceiveProps(nextProps) {
        if (this.props.characteristic.handle !== nextProps.characteristic.handle) {
            this._setStateFromCharacteristic(nextProps.characteristic);
        }
    },
    _setStateFromCharacteristic(characteristic) {
        var state = _.pick(characteristic, "uuid", "name", "value", "maxLengthActive", "maxLength");
        _.extend(state, _.pick(characteristic.properties, "authenticatedSignedWrites", "broadcast", "reliableWrite", "writeAuxiliary", "indicate", "notify", "read", "write", "writeWithoutResponse"));
        this.setState(state);
    },
    _valueChanged(value) {
        this.setState({ value: value });
    },
    _showDeleteConfirmation() {
        this.setState({showConfirmDialog: true});
    },
    _onDeleteOk() {
        this.setState({showConfirmDialog: false});
        this.props.characteristic.removeFromParent();
        this.props.onAttributeDeleted();
    },
    _onDeleteCancel() {
        this.setState({showConfirmDialog: false});
    },
    render() { 
        return (
        <form className="form-horizontal">

          <div className="form-group">
            <label htmlFor="service-name" className="col-md-3 control-label">Service name</label>
            <div className="col-md-9">
              <input type="text" className="form-control" name="service-name" valueLink={this.linkState('name')}/>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="uuid" className="col-md-3 control-label">UUID</label>
            <div className="col-md-9">
              <input type="text" className="form-control" name="uuid" valueLink={this.linkState('uuid')}/>
            </div>
          </div>
          
          <div className="form-group">
            <label className="col-md-3 control-label">Properties</label>
            <div className="col-md-9">
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('broadcast')}/> Broadcast </label></div>
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('read')}/> Read </label></div>
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('writeWithoutResponse')}/> Write without response</label></div>
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('write')}/> Write </label></div>
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('notify')}/> Notify </label></div>
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('indicate')}/> Indicate </label></div>
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('authenticatedSignedWrites')}/> Authenticated signed write </label></div>
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-3 control-label">Extended properties</label>
            <div className="col-md-9">
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('reliableWrite')}/> Reliable write </label></div>
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('writeAuxiliary')}/> Write auxiliary </label></div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="initial-value" className="col-md-3 control-label">Initial value</label>
            <div className="col-md-9">
              <HexOnlyEditableField plain={true} className="form-control" name="initial-value" value={this.state.value} onChange={this._valueChanged}/>
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-3 control-label">Max length</label>
            <div className="col-md-9">
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('maxLengthActive')} />Activate</label></div>
            </div>

            <div className="col-md-offset-3 col-md-9">
              <input type="number" min="0" disabled={!this.state.maxLengthActive} className="form-control" name="max-length" valueLink={this.linkState('maxLength')}/>
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-3 control-label">Security</label>
            <div className="col-md-9">
              <select className="form-control" valueLink={this.linkState('security')}>
                <option value="open">No security required</option>
                <option value="enc_no_mitm">Encryption required, no MITM</option>
                <option value="enc_with_mitm">Encryption and MITM required</option>
                <option value="signed_no_mitm">Signing or encryption required, no MITM</option>
                <option value="signed_with_mitm">Signing or encryption with MITM required</option>
                <option value="no_access">No access rights specified (undefined)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-3 control-label">Authorization</label>
            <div className="col-md-9">
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('readAuthorization')}/> Read authorization required </label></div>
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('writeAuthorization')}/> Write authorization required </label></div>
            </div>
          </div>

          <div className="form-group">
            <div className="col-md-offset-3 col-md-9 padded-row">
              <button type="button" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-primary" onClick={this._showDeleteConfirmation}>Delete</button>
              <ConfirmationDialog show={this.state.showConfirmDialog} onOk={this._onDeleteOk} onCancel={this._onDeleteCancel} text="Do you want to delete?"/>
            </div>
          </div>
        </form>
        );
    }
});
module.exports = CharacteristicEditor;