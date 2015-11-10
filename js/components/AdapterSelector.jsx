import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { DropdownButton, MenuItem } from 'react-bootstrap';

import * as AdapterActions from '../actions/adapterActions';

class AdapterSelector extends Component {
    constructor(props) {
        super(props);
        props.currentPort = 'None';
    }

    focusOnComPorts() {
        var dropDown = React.findDOMNode(this.refs.comPortDropdown);
        dropDown.firstChild.click();
    }

    render() {
        const {
            adapters,
            adapterStatus,
            adapterIndicator
        } = this.props.adapter;

        const {
            openAdapter
        } = this.props;

        const menuItems = adapters.map((adapter, i) => {
            return <MenuItem className='btn-primary' eventKey={adapter.instanceId} onSelect={() => openAdapter(adapter.instanceId)} key={i}>{adapter.instanceId}</MenuItem>;
        }, this);

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

    return {
        adapter,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(AdapterActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(AdapterSelector);

AdapterSelector.propTypes = {
    adapter: PropTypes.object.isRequired,
    openAdapter: PropTypes.func.isRequired,
    selectedAdapter: PropTypes.object
};
