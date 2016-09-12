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

require('babel-polyfill');

var settings = require('./settings.json');

if (!settings || settings.production === undefined || settings.production === null || settings.production === true) {
    process.env.NODE_ENV = 'production';
} else {
    process.env.NODE_ENV = 'development';
}

var React = require('react');
var renderReact = require('react-dom').render;

var configureStore = require('./store/configureStore');
var initialState = window.__INITIAL_STATE__ || {};
var store = configureStore(initialState);

let App = require('./containers/Root');
const render = (Component) => {
    renderReact(<Component store={store} />, document.getElementById('app'));
};
render(App);

if (module.hot) {
    module.hot.accept('./containers/Root', function() {
        let newApp = require('./containers/Root');
        render(newApp);
    });
}
