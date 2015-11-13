'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');

	// Setting up the users profile api
	app.route('/api/users/me').get(users.me);
	app.route('/api/users').get(users.list);
	app.route('/api/users').put(users.update);
	//app.route('/api/users/accounts').delete(users.removeOAuthProvider);
	app.route('/api/users/:userId').put(users.updateUser);
	app.route('/api/users/:userId').get(users.view);

	// Setting up the users password api
	app.route('/api/users/password').post(users.changePassword);
	app.route('/api/auth/forgot').post(users.forgot);
	app.route('/api/auth/reset/:token').get(users.validateResetToken);
	app.route('/api/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/api/auth/signup').post(users.signup);
	app.route('/api/auth/signin').post(users.signin);
	app.route('/api/auth/signout').get(users.signout);

	// Setting the facebook oauth routes
	app.route('/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['email']
	}));
	app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	// Setting the twitter oauth routes
	app.route('/auth/twitter').get(passport.authenticate('twitter'));
	app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));
	app.route('/auth/twitter/confirm').post(users.confirmTwitter);

	// Setting the google oauth routes
	app.route('/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/auth/google/callback').get(users.oauthCallback('google'));

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
