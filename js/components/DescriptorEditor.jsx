var DescriptorEditor = React.createClass({
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
		    <label for="initial-value" className="col-md-3 control-label">Initial value</label>
		    <div className="col-md-9">
		      <input type="text" className="form-control" name="initial-value" />
		    </div>
		  </div>

		  <div className="form-group">
		    <label className="col-md-3 control-label">Max length</label>
		    <div className="col-md-9">
		      <div className="checkbox"><label><input type="checkbox" /> Activate</label></div>
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
module.exports = DescriptorEditor;