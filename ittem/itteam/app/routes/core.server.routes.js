'use strict';
var cfg = require('../../config/config'),
	multipart = require('connect-multiparty');

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core.server.controller'),
		mpart = multipart({
			uploadDir: cfg.tmpDir
		});
	app.route('/').get(core.index);
	app.route('/api/upload').post(mpart, core.upload);
	app.route('/api/search').get(core.search);
};
