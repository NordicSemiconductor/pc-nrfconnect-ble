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


import Component from 'react-pure-render/component';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';


class GatewayNodeContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            pageView, 
        } = this.props;

        
        return (
            <h1> Dette er GatewayNodeContainer </h1>
        );
    }
}

function mapStateToProps(state) {
    const {
        meshPageSelector
    } = state;

    const pageView= meshPageSelector.get('selectedPage');
    return {
        pageView:pageView,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
        {},
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GatewayNodeContainer);

GatewayNodeContainer.propTypes = {

};
