'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	policy = require('../../../config/policy'),
	updateUser;

updateUser = function (req, res, user, login) {
	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function (err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else if (login) {
				req.login(user, function (err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			} else {
				res.json(user);
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Update user details
 */
exports.update = function (req, res) {
	var user = req.user;
	if (user.username === req.body.username) {
		// For security measurement we remove the roles from the req.body object
		delete req.body.roles;
		updateUser(req, res, user, true);
	} else {
		policy.hasAtLeastRole(req, 'admin', function (err, has) {
			if (err) res.status(500).send(err);
			else if (!has) res.status(401).send('Unauthorized');
			else updateUser(req, res, user, true);
		});
	}
};

/**
 * Updates user with given ID.
 */
exports.updateUser = function (req, res) {
	updateUser(req, res, req.profile, false);
};

/**
 * Send User
 */
exports.me = function (req, res) {
	res.json(req.user || null);
};
