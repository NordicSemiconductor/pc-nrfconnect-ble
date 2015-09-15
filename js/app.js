'use strict';

// require('babel/register');
require("babel/register");

// process.env.NODE_ENV = 'production';

var React = require('react');

var view = require('./js/view.jsx');

React.render(React.createElement(view), document.getElementById('app')); 

