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

import 'nrfconnect-core/css/styles.less';

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as AppActions from '../actions/appActions';
import SimpleCounter from '../components/SimpleCounter';

class AppContainer extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="container">
                <h1>Sample Application</h1>
                <SimpleCounter
                    value={this.props.countValue}
                    onIncrement={this.props.incrementCounter}
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { app } = state;
    return {
        countValue: app.countValue
    };
}

function mapDispatchToProps(dispatch) {
    return {
        incrementCounter: () => dispatch(AppActions.incrementCounterAction())
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppContainer);
