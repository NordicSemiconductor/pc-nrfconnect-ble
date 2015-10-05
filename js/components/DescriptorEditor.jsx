import _ from 'underscore';
import HexOnlyEditableField from './HexOnlyEditableField.jsx';

var DescriptorEditor = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState() {
        return {
            uuid: "",
            name: "",
            value: "",
            maxLengthActive: false,
            maxLength: null
        }
    },

    componentWillMount() {
        this._setStateFromDescriptor(this.props.descriptor);
    },
    componentWillReceiveProps(nextProps) {
        if (this.props.descriptor.handle !== nextProps.descriptor.handle) {
            this._setStateFromDescriptor(nextProps.descriptor);
        }
    },
    _setStateFromDescriptor(descriptor) {
        this.setState(_.pick(descriptor, "uuid", "name", "value", "maxLengthActive", "maxLength"));
    },
    _valueChanged(value) {
        this.setState({ value: value });
    },
    render() { 
        return (
        <form className="form-horizontal">

          <div className="form-group">
            <label htmlFor="service-name" className="col-md-3 control-label">Service name</label>
            <div className="col-md-9">
              <input type="text" className="form-control" name="service-name" valueLink={this.linkState('name')} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="uuid" className="col-md-3 control-label">UUID</label>
            <div className="col-md-9">
              <input type="text" className="form-control" name="uuid" valueLink={this.linkState('uuid')} />
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
              <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('maxLengthActive')}/> Activate</label></div>
            </div>

            <div className="col-md-offset-3 col-md-9">
              <input type="number" min="0" disabled={!this.state.maxLengthActive} className="form-control" name="max-length" valueLink={this.linkState('maxLength')} />
            </div>
          </div>

          <div className="form-group">
            <div className="col-md-offset-3 col-md-9 padded-row">
              <button type="button" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-primary" onClick={() => {this.props.onDelete(this.props.descriptor)}}>Delete</button>
            </div>
          </div>

        </form>
        );
    }
});
module.exports = DescriptorEditor;