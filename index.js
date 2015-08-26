var app = require('app')
var Menu = require('menu')
var MenuItem = require('menu-item')
var BrowserWindow = require('browser-window')
require('crash-reporter').start();

var mainWindow = null;

app.on('window-all-closed', function() {
	if (process.platform !== 'darwin') app.quit();
});

app.on('ready', function() {
	mainWindow = new BrowserWindow({
		width: 1024,
		height: 800,
		'min-width': 480,
		'min-height': 280,
		frame: true
	});
	mainWindow.loadUrl('file://' + __dirname + '/index.html');
	mainWindow.on('closed', function() {
		console.log("windows closed");
		mainWindow = null;
	});
});
