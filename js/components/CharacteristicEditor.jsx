var CharacteristicEditor = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getInitialState() {
		return {
			maxLengthActive: false,
			broadcast: false,
			read: false,
			writeWithoutResponse: false,
			write: false,
			notify: false,
			indicate: false,
			authenticatedSignedWrite: false,
			reliableWrite: false,
			writeAuxiliary: false,
			uuid: "",
			serviceName: "",
			initialValue: "",
			maxLength: null
		}
	},
	render() { 
		return (
		<form className="form-horizontal">

		  <div className="form-group">
		    <label for="service-name" className="col-md-3 control-label">Service name</label>
		    <div className="col-md-9">
		      <input type="text" className="form-control" name="service-name" valueLink={this.linkState('serviceName')}/>
		    </div>
		  </div>

		  <div className="form-group">
		    <label for="uuid" className="col-md-3 control-label">UUID</label>
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
		      <div className="checkbox"><label><input type="checkbox" checkedLink={this.linkState('authenticatedSignedWrite')}/> Authenticated signed write </label></div>
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
		    <label for="initial-value" className="col-md-3 control-label">Initial value</label>
		    <div className="col-md-9">
		      <input type="text" className="form-control" name="initial-value" valueLink={this.linkState('initialValue')}/>
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
		    <div className="col-md-offset-3 col-md-9">
		      <button type="submit" className="btn btn-primary">Save</button>
		    </div>
		  </div>

		</form>
		);
	}
});
module.exports = CharacteristicEditor;