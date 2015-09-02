'use strict';

// require('babel/register');
require("babel/register");

// process.env.NODE_ENV = 'production';

var React = require('react');

var view = require('./js/view.jsx');
var injectTapEventPlugin = require("react-tap-event-plugin");
var compileLess = require("./js/utils/compileLess.js");

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

jsPlumb.bind("ready", function(){
    jsPlumb.importDefaults({
        PaintStyle : {
            lineWidth:3,
            strokeStyle: 'rgba(10,10,10,0.5)'
        }
    });
});


compileLess("css/styles.less", "css/styles.css"); 

React.render(React.createElement(view), document.getElementById('app'));
