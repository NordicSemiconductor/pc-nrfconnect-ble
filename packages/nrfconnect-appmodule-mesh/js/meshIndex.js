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

// 'use strict';

// require('babel/register');

// var settings = require('./js/settings');

// if (settings.production) {
//     process.env.NODE_ENV = 'production';
// } else {
//     process.env.NODE_ENV = 'development';
// }

// var ReactDOM = require('react-dom');
// var React = require('react');

// var root = require('./js/containers/mesh/MeshRoot');

// var configureStore = require('./js/store/meshConfigureStore');
// var initialState = window.__INITIAL_STATE__ || {};
// var store = configureStore(initialState);

// const target = document.getElementById('app');

// ReactDOM.render(React.createElement(root, { store: store }), target);

// require('babel-polyfill');

// var React = require('react');
// var renderReact = require('react-dom').render;
// var Root = require('./containers/Root');

// var configureStore = require('nrfconnect-core').configureStore;
// var rootReducer = require('./reducers/mesh/meshIndex');
// var initialState = window.__INITIAL_STATE__ || {};
// var store = configureStore(initialState, rootReducer);

// let App = require('./containers/Root');
// const render = (Component) => {
//     renderReact(<Component store={store} />, document.getElementById('app'));
// };
// render(App);

// // Webpack hot module replacement (HMR)
// if (module.hot) {
//     module.hot.accept('./reducers/mesh/meshIndex', () =>
//         store.replaceReducer(require('./reducers/mesh/meshIndex'))
//     );
//     module.hot.accept('./containers/Root', function() {
//         render(require('./containers/Root'));
//     });
// }
