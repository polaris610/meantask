'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
	path = require('path'),
	events = require('events'),
	util = require('util'),
	application;

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
function Application() {
	this._rdy = false;
	events.EventEmitter.call(this);
}
util.inherits(Application, events.EventEmitter);

Application.prototype.setApp = function (app) {
	this.app = app;
};

Application.prototype.setDb = function (db) {
	this.db = db;
};

Application.prototype.getApp = function () {
	return this.app;
};

Application.prototype.getDb = function () {
	return this.db;
};

Application.prototype.rdy = function () {
	this._rdy = true;
	this.emit('ready');
};

Application.prototype.isReady = function () {
	return this._rdy;
};

Application.prototype.onReady = function (cb) {
	if (this.isReady()) {
		cb();
	} else {
		this.on('ready', cb);
	}
};

application = new Application();

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	} else {
		// Globbing model files.
		config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
			require(path.resolve(modelPath));
		});

		// Bootstrap passport config
		require('./config/passport')();

		// Init the express application
		var app = require('./config/express')(db);

		// Start the app by listening on <port>
		app.listen(config.port);

		// Logging initialization
		console.log('Video application started on port ' + config.port);
		application.setApp(app);
		application.setDb(db);
		application.rdy();
	}
});

// Expose app
exports = module.exports = application;