'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	node_acl = require('acl'),
	util = require('util'),
	_ = require('lodash'),
	ROLES,
	PERMISSIONS,
	ANONYMOUS_USER,
	acl,
	Actionlog,
	actionLogger,
	getUserAclId;

// key - role name, value - parent role
ROLES = {
	'public': null,
	'author': 'public',
	'editor': 'author',
	'reviewer': 'editor',
	'admin': 'reviewer'
};

PERMISSIONS = [
	{
		roles: ['admin'],
		allows: [
			{
				resources: [
					'/api/users',
					'/api/users/password',
					'/api/users/:param1',
					'/api/videos/:param1',
					'/api/books/:param1',
					'/api/about/:param1',
					'/api/blog/:param1',
					'/api/featured'
				],
				permissions: '*'
			}
		]
	},
	//{
	//	roles: ['reviewer'],
	//	allows: [
	//		{
	//			resources: [
	//				'/api/videos/:param1',
	//				'/api/books/:param1',
	//				'/api/blog/:param1'
	//			],
	//			permissions: ['delete']
	//		}
	//	]
	//},
	{
		roles: ['editor', 'reviewer'],
		allows: [
			{
				resources: [
					'/api/videos',
					'/api/videos/:param1',
					'/api/books',
					'/api/books/:param1',
					'/api/about',
					'/api/about/:param1',
					'/api/blog',
					'/api/blog/:param1'
				],
				permissions: ['post', 'put']
			}
		]
	},
	{
		roles: ['author'],
		allows: [
			{
				resources: [
					'/api/blog/:param1',
					'/api/about/:param1',
					'/api/books/:param1',
					'/api/videos/:param1'
				],
				permissions: ['put']
			}
		]
	},
	{
		roles: ['public'],
		allows: [
			{
				resources: [
					'/',
					'/api/auth/signout',
					'/api/auth/reset/:param1',
					'/api/users',
					'/api/users/me',
					'/api/videos',
					'/api/videos/:param1',
					'/api/books',
					'/api/books/:param1',
					'/api/authors',
					'/api/about',
					'/api/getAbout',
					'/api/about/:param1',
					'/api/blog',
					'/api/blog/:param1',
					'/api/videos/categories',
					'/api/search',
					'/api/featured',
					'/auth/facebook',
					'/auth/twitter',
					'/auth/google',
					'/auth/facebook/callback',
					'/auth/twitter/callback',
					'/auth/google/callback',
					'/newTwitterUser',
					'/m/core/favicon.ico'
				],
				permissions: ['get']
			},
			{
				resources: [
					'/api/auth/signin',
					'/api/auth/signup',
					'/auth/twitter/confirm'
				],
				permissions: ['get', 'post']
			},
			{
				resources: [
					'/api/users',
					'/api/users/:param1'
				],
				permissions: ['put']
			},
			{
				resources: [
					'/api/users/password',
					'/api/auth/forgot',
					'/api/auth/reset/:param1',
					'/api/upload'
				],
				permissions: ['post']
			}
		]
	}
];

getUserAclId = function getUserAclId(request) {
	// This gets the ID from currently logged in user
	// Since numbers are not supported by node_acl in this case, convert
	// them to strings, so we can use IDs nonetheless.
	//console.log(request.user);
	return request.user ? request.user.username.toString() : ANONYMOUS_USER;
};

ANONYMOUS_USER = '__anon__';

actionLogger = function (username, resource, action, next) {
	var logEntry = new Actionlog();

	logEntry.user = username;
	logEntry.resource = resource;
	logEntry.action = action;

	logEntry.save(function (err) {
		if (err) return next(err);
		return next();
	});
};

exports.init = function (app, db) {
	var mongoBackend,
		mongoIdRegex,
		parameterizePath,
		log;

	Actionlog = mongoose.model('Actionlog');

	log = function log(msg) {
		if (acl.logger) {
			acl.logger.debug(msg);
		}
	};

	mongoIdRegex = new RegExp('^[0-9a-fA-F]{24}$');

	parameterizePath = function (path) {
		var i = 0;
		return _.map(path.split('/'), function (part) {
			if (mongoIdRegex.test(part)) {
				i++;
				return ':param' + i;
			}
			return part;
		}).join('/');
	};

	mongoBackend = new node_acl.mongodbBackend(db.connection.db, 'acl_');
	acl = new node_acl(mongoBackend, {
		debug: function (msg) {
			console.log('-DEBUG-', msg);
		}
	});

	acl.allow(PERMISSIONS);
	acl.addRoleParents('author', 'public');
	acl.addRoleParents('editor', 'author');
	acl.addRoleParents('reviewer', 'editor');
	acl.addRoleParents('admin', 'reviewer');
	acl.addUserRoles(ANONYMOUS_USER, 'public');

	app.use(function (req, res, next) {
		var _userId = getUserAclId(req, res),
			resource,
			action;
		resource = parameterizePath(req.path);
		action = req.method.toLowerCase();

		// log('Requesting '+action+' on '+resource+' by user '+_userId);

		acl.isAllowed(_userId, resource, action, function (err, allowed) {
			if (err) {
				next(new Error('Error checking permissions to access resource'));
			}
			else if (allowed === false) {
				// log('Not allowed '+action+' on '+resource+' by user '+_userId);
				// acl.allowedPermissions(_userId, resource, function(err, obj){
				//		log('Allowed permissions: ' + util.inspect(obj));
				// });
				// acl.userRoles(_userId, function (err, roles) {
				// 	log(util.inspect(roles));
				// });

				res.sendStatus(401).end();
			}
			else {
				if (_userId !== ANONYMOUS_USER) {
					// Don't log actions by anon. user.
					actionLogger(_userId, req.path, action, next);
				} else {
					// log('Allowed '+action+' on '+resource+' by user '+_userId);
					next();
				}
			}
		});
	});

	return acl;
};

exports.ActionLogger = actionLogger;

exports.acl = function () {
	return acl;
};

// Checks hierarchically
exports.hasAtLeastRole = function (req, role, next) {
	var isSuperrole, userId;

	userId = _.isString(req) ? req : getUserAclId(req);

	isSuperrole = function (roleName) {
		if (roleName === role) return true;
		else if (ROLES[roleName] === null) return false;
		else return isSuperrole(ROLES[roleName]);
	};

	acl.userRoles(userId, function (err, userRoles) {
		if (err) return next(err, false);
		else {
			if (_.indexOf(userRoles, role) !== -1) return next(null, true);
			else return next(null, _.some(userRoles, isSuperrole));
		}
	});
};

exports.getUserAclId = getUserAclId;
exports.ROLES = ROLES;
exports.ANONYMOUS_USER = ANONYMOUS_USER;
