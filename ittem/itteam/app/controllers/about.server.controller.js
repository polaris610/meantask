'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	About = mongoose.model('About'),
	User = mongoose.model('User'),
	policy = require('../../config/policy'),
	acl = policy.acl(),
	_ = require('lodash'),
	_Promise = require('promise');

/**
 * Create about
 */
exports.create = function(req, res) {
	var about = new About(req.body);
	about.user = req.user;

	User.isAuthor(about.author, function (is) {
		if (!is) {
			return res.status(400).send({
				message: 'Author must be specified.'
			});
		}

		about.save(function (err) {
			if (err) {
				console.log(err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			else {
				return res.jsonp(about);
			}
		});
	});
};

/**
 * Show the current About
 */
exports.read = function(req, res) {
	About.update({_id: req.about._id}, {$inc: {views: 1}}).exec(function (err) {
		if (err) res.status(500).send('Error updating view count.');
		else {
			var a = req.about.toObject();
			a.user = req.about.populated('user');
			if (typeof req.about.populated('author') !== 'undefined') {
				a.author = {
					value: req.about.populated('author'),
					label: a.author.displayName
				};
			}
			a.views += 1;
			res.jsonp(a);
		}
	});
};

/**
 * Update a About
 */
exports.update = function(req, res) {
	var about = req.about;

	about = _.extend(about , req.body);

	User.isAuthor(about.author, function (is) {
		if (!is) {
			return res.status(400).send({
				message: 'Author must be specified.'
			});
		}
		about.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(about);
			}
		});
	});
};

/**
 * Delete a About
 */
exports.delete = function(req, res) {
	var about = req.about;

	about.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(about);
		}
	});
};

/**
 * List of About
 *
 * Filtering results:
 *     - q=foo: query param for text search
 *
 * Sorting results:
 *     - sortBy=param: parameter to sort against,
 *     - sortDir=asc: asc/desc sorting.
 *
 * Limiting number of results:
 *     - limit=10: max number of results to return.
 */
exports.search = function(req) {
	var promise,
		query,
		querySetup;

	querySetup = function (hasSufficientRole) {
		var conditions = [],
			limit = 500,
			sorts = {},
			projection = null,
			cond,
			tmpcond,
			query;

		if (!hasSufficientRole) {
			tmpcond = { status: 'open' };
			if (req.user) {
				tmpcond = {$or: [{ user: req.user.id }, { author: req.user.id }, tmpcond]};
			}
			conditions.push(tmpcond);
		}

		if ('q' in req.query) {
			conditions.push({$text: {$search: req.query.q, $language: 'en'}});
			projection = {score: {$meta: 'textScore'}};
			sorts.score = {$meta: 'textScore'};
		}
		if ('limit' in req.query) {
			limit = parseInt(req.query.limit);
		}
		if ('sortBy' in req.query) {
			sorts[req.query.sortBy] = req.query.sortDir || 'desc';
		}

		sorts.created = 'desc';
		cond = conditions.length > 0 ? {$and: conditions} : {};
		query = About.find(cond, projection).sort(sorts).limit(limit);

		query.populate('user', 'displayName');
		return query;
	};

	// Setup filters.
	promise = new _Promise(function (resolve, reject) {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (err) return reject({errors: [{message: 'Insufficient role.'}]});
			query = querySetup(has);
			query.exec(function (err, about) {
				if (err) return reject(err);
				return resolve(about);
			});
		});
	});

	return promise;
};

exports.list = function (req, res) {
	var error = function (errObj) {
		res.status(400).send({
			message: errorHandler.getErrorMessage(errObj)
		});
	};

	return exports.search(req).then(
		function (about) {
			return res.jsonp(about);
		},
		function (err) {
			return error(err);
		}
	);
};

/**
 * About middleware
 */
exports.aboutByID = function(req, res, next, id) {
	About.findById(id)
		.populate([
			{path: 'user', select: 'displayName'},
			{path: 'author', select: 'displayName'}
		])
		.exec(function(err, about) {
			if (err) return next(err);
			if (!about) return next(new Error('Failed to load About ' + id));
			req.about = about;
			next();
		});
};

/**
 * Only reviewer or higher role can see non-opened About.
 */
exports.canAccessAbout = function (req, res, next) {
	/*jshint ignore:start*/
	if (
		req.about.status === 'open' ||
		req.user && (
			req.about.populated('user') == req.user.id ||
			req.about.populated('author') == req.user.id
	))
	{
		return next();
	}
	else {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (has) return next();
			else return res.status(403).send('Forbidden.');
		});
	}
	/*jshint ignore:end*/
};

exports.canModifyAbout = function (req, res, next) {
	/*jshint ignore:start*/
	if (
		req.user && (
		req.about.populated('user') == req.user.id ||
		req.about.populated('author') == req.user.id
	))
	{
		next();
	}
	else {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (has) next();
			else res.status(403).send('Forbidden');
		});
	}
	/*jshint ignore:end*/
};

/**
 * About authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.about.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.getFirst = function (req, res, next) {
	About.find({}).sort({_id: 1}).exec(function (err, data) {
		if (err) {res.status(500).send('Internal server error');}
		res.send(data[0]);
	});
};
