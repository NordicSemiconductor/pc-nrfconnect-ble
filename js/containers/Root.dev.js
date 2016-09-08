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

import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
// import DevTools from './DevTools';
import App from './App';

// NOTE: Add <DevTools /> as sibling to <App /> to timetravel.

export default class Root extends React.PureComponent {
    render() {
        const { store } = this.props;
        return (
            <Provider store={store}>
                <div>
                    <App />
                </div>
            </Provider>
        );
    }
}

Root.propTypes = {
    store: PropTypes.object.isRequired,
};
