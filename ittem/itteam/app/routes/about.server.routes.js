'use strict';

module.exports = function (app) {
	var about = require('../../app/controllers/about.server.controller');

	// About routes
	app.route('/api/about')
		.get(about.list)
		.post(about.create);
	app.route('/api/about/:aboutId')
		.get(about.canAccessAbout, about.read)
		.put(about.canModifyAbout, about.update)
		.delete(about.delete);

	// Bind About middleware
	app.param('aboutId', about.aboutByID);

	app.route('/api/getAbout')
		.get(about.getFirst);
};
