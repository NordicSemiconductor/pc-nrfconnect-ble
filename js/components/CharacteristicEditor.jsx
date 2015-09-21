var CharacteristicEditor = React.createClass({
	render() { 
		return (
		<form className="form-horizontal">

		  <div className="form-group">
		    <label for="service-name" className="col-md-3 control-label">Service name</label>
		    <div className="col-md-9">
		      <input type="text" className="form-control" name="service-name" />
		    </div>
		  </div>

		  <div className="form-group">
		    <label for="uuid" className="col-md-3 control-label">UUID</label>
		    <div className="col-md-9">
		      <input type="text" className="form-control" name="uuid" />
		    </div>
		  </div>
		  
		  <div className="form-group">
		    <label className="col-md-3 control-label">Properties</label>
		    <div className="col-md-9">
		      <div className="checkbox"><label><input type="checkbox" /> Broadcast </label></div>
		      <div className="checkbox"><label><input type="checkbox" /> Read </label></div>
		      <div className="checkbox"><label><input type="checkbox" /> Write without response</label></div>
		      <div className="checkbox"><label><input type="checkbox" /> Write </label></div>
		      <div className="checkbox"><label><input type="checkbox" /> Notify </label></div>
		      <div className="checkbox"><label><input type="checkbox" /> Indicate </label></div>
		      <div className="checkbox"><label><input type="checkbox" /> Authenticated signed write </label></div>
		    </div>
		  </div>

		  <div className="form-group">
		    <label className="col-md-3 control-label">Extended properties</label>
		    <div className="col-md-9">
		      <div className="checkbox"><label><input type="checkbox" /> Reliable write </label></div>
		      <div className="checkbox"><label><input type="checkbox" /> Write auxiliary </label></div>
		    </div>
		  </div>

		  <div className="form-group">
		    <label for="initial-value" className="col-md-3 control-label">Initial value</label>
		    <div className="col-md-9">
		      <input type="text" className="form-control" name="initial-value" />
		    </div>
		  </div>

		  <div className="form-group">
		    <label className="col-md-3 control-label">Max length</label>
		    <div className="col-md-9">
		      <div className="checkbox"><label><input type="checkbox" />Activate</label></div>
		    </div>

		    <div className="col-md-offset-3 col-md-9">
		      <input type="number" min="0" className="form-control" name="max-length" />
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