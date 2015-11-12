/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

require("babel/register");

process.env.NODE_ENV = 'development';

var ReactDOM = require('react-dom');
var React = require('react');

var app = require('./js/containers/App.js');

const target = document.getElementById('app');

ReactDOM.render(React.createElement(app), target);
