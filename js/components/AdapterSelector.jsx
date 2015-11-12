import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { DropdownButton, MenuItem } from 'react-bootstrap';

import * as AdapterActions from '../actions/adapterActions';

class AdapterSelector extends Component {
    constructor(props) {
        super(props);
    }

    focusOnComPorts() {
        var dropDown = React.findDOMNode(this.refs.comPortDropdown);
        dropDown.firstChild.click();
    }

    render() {
        const {
            adapters,
            adapterStatus,
            adapterIndicator,
        } = this.props.adapter;

        const {
            openAdapter,
        } = this.props;

        const menuItems = adapters.map((adapter, i) => {
            return <MenuItem className='btn-primary' eventKey={adapter.port} onSelect={() => openAdapter(adapter.port)} key={i}>{adapter.port}</MenuItem>;
        }, this);

        //console.log(JSON.stringify(menuItems));

        return (
            <span title='Select com port (Alt+P)'>
                <div className="padded-row">
                    <DropdownButton id='navbar-dropdown' className='btn-primary btn-nordic' title={adapterStatus} ref='comPortDropdown'>
                        {menuItems}
                    </DropdownButton>
                    <div className={"indicator " + adapterIndicator}></div>
                </div>
            </span>
        );
    }
}

function mapStateToProps(state) {
    const { adapter } = state;
    return { adapter: adapter, adapterStatus: adapter.adapterStatus, adapterIndicator: adapter.adapterIndicator, adapters: adapter.adapters };

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(AdapterActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(AdapterSelector);

AdapterSelector.propTypes = {
    adapters: PropTypes.array.isRequired,
    adapterStatus: PropTypes.string.isRequired,
    openAdapter: PropTypes.func.isRequired,
};
