'use strict';

module.exports = function (app) {
	var blog = require('../../app/controllers/blog.server.controller');
	var ft = require('../../app/controllers/featured.server.controller');
	// Blog routes
	app.route('/api/blog')
		.get(blog.list)
		.post(blog.create, ft.update);
	app.route('/api/blog/:postId')
		.get(blog.canAccessPost, blog.read)
		.put(blog.canModifyPost, blog.update, ft.update)
		.delete(blog.delete);

	// Bind Blog middleware
	app.param('postId', blog.postByID);
};
