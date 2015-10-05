var ServiceEditor = React.createClass({ 
    mixins: [React.addons.LinkedStateMixin],
    getInitialState() {
        return {
            uuid: "",
            name: ""
        };
    },
    componentWillMount() {
        this._setStateFromService(this.props.service);
    },
    componentWillReceiveProps(nextProps) {
        if (this.props.service.handle !== nextProps.service.handle) {
            this._setStateFromService(nextProps.service);
        }
    },
    _setStateFromService(service) {
        this.setState({
            uuid: service.uuid,
            name: service.name
        });
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
            <div className="col-md-offset-3 col-md-9 padded-row">
              <button type="button" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-primary" onClick={() => {this.props.onDelete(this.props.service)}}>Delete</button>
            </div>
          </div>
        </form>
        ); 
    }
});
module.exports = ServiceEditor;