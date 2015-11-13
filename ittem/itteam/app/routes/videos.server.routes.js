'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var videos = require('../../app/controllers/videos.server.controller');
	var ft = require('../../app/controllers/featured.server.controller');
	// Videos Routes
	app.route('/api/videos')
		.get(videos.list)
		.post(videos.create, ft.update);

	app.route('/api/videos/categories')
		.get(videos.categories);

	app.route('/api/videos/:videoId')
		.get(videos.canAccessVideo, videos.read)
		.put(videos.canModifyVideo, videos.update, ft.update)
		.delete(videos.delete);

	// Finish by binding the Video middleware
	app.param('videoId', videos.videoByID);
};
