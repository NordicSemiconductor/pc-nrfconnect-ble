/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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

import React, {PropTypes} from 'react';
import {List, Record} from 'immutable';

import MeshMultipleDeviceInitForm from '../../../components/mesh/rightSideTabs/MeshMultipleDeviceInitForm';
import * as AdapterActions from '../../../actions/mesh/meshAdapterActions';


import Component from 'react-pure-render/component';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';


class MultiInitContainer extends Component {
    constructor(props) {

        super(props);
    }

    render() {
        const {
            pageView,
            adapter, 
            initMultipleDevices,
            resetMultipleDevices,
        } = this.props;

        
        return (
            <div>
                <h4> Initialize multiple devices</h4>
                <MeshMultipleDeviceInitForm
                                    initMultipleDevices={(selectedDevices, adr, min, channel) => { initMultipleDevices(selectedDevices, adr, min, channel); } }
                                    resetMultipleDevices={(selectedDevices) => { resetMultipleDevices(selectedDevices) } }
                                    devices={adapter.api.adapters} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {
        meshPageSelector,
        adapter
    } = state;

    const pageView= meshPageSelector.get('selectedPage');
    return {
        adapter,
        pageView:pageView,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
        {},
        bindActionCreators(AdapterActions, dispatch),
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MultiInitContainer);

MultiInitContainer.propTypes = {

};
