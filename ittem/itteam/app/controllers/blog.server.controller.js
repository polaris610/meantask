'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Post = mongoose.model('Post'),
	User = mongoose.model('User'),
	policy = require('../../config/policy'),
	acl = policy.acl(),
	_ = require('lodash'),
	_Promise = require('promise');

/**
 * Create a Post
 */
exports.create = function(req, res, next) {
	var post = new Post(req.body);
	post.user = req.user;

	User.isAuthor(post.author, function (is) {
		if (!is) {
			return res.status(400).send({
				message: 'Author must be specified.'
			});
		}

		post.save(function (err) {
			if (err) {
				console.log(err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			else {
				req.post = post;
				return req.body.featured ? next(): res.jsonp(post);
			}
		});
	});
};

/**
 * Show the current Post
 */
exports.read = function(req, res) {
	Post.update({_id: req.post._id}, {$inc: {views: 1}}).exec(function (err) {
		if (err) res.status(500).send('Error updating view count.');
		else {
			var p = req.post.toObject();
			p.user = req.post.populated('user');
			if (typeof req.post.populated('author') !== 'undefined') {
				p.author = {
					value: req.post.populated('author'),
					label: p.author.displayName
				};
			}
			p.views += 1;
			res.jsonp(p);
		}
	});
};

/**
 * Update a Post
 */
exports.update = function(req, res, next) {
	var post = req.post;

	post = _.extend(post , req.body);

	User.isAuthor(post.author, function (is) {
		if (!is) {
			return res.status(400).send({
				message: 'Author must be specified.'
			});
		}
		post.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.post = post;
				return req.post.featured ? next(): res.jsonp(post);
			}
		});
	});
};

/**
 * Delete a Post
 */
exports.delete = function(req, res) {
	var post = req.post;

	post.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(post);
		}
	});
};

/**
 * List of Posts
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
		if ('blog' in req.query) {
			var authors = _.isArray(req.query.blog)?
			{$in: _.map(req.query.blog, function (authorId) {
				return mongoose.Types.ObjectId(authorId);
			})}
				: mongoose.Types.ObjectId(req.query.blog);
			conditions.push({ author: authors });
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
		query = Post.find(cond, projection).sort(sorts).limit(limit);

		query.populate('author', 'displayName');
		return query;
	};

	// Setup filters.
	promise = new _Promise(function (resolve, reject) {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (err) return reject({errors: [{message: 'Insufficient role.'}]});
			query = querySetup(has);
			query.exec(function (err, posts) {
				if (err) return reject(err);
				return resolve(posts);
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
		function (posts) {
			return res.jsonp(posts);
		},
		function (err) {
			return error(err);
		}
	);
};

/**
 * Posts middleware
 */
exports.postByID = function(req, res, next, id) {
	Post.findById(id)
		.populate([
			{path: 'user', select: 'displayName'},
			{path: 'author', select: 'displayName'}
		])
		.exec(function(err, post) {
			if (err) return next(err);
			if (!post) return next(new Error('Failed to load Post ' + id));
			req.post = post;
			next();
		});
};

/**
 * Only reviewer or higher role can see non-opened posts.
 */
exports.canAccessPost = function (req, res, next) {
	/*jshint ignore:start*/
	if (
		req.post.status === 'open' ||
		req.user && (
			req.post.populated('user') == req.user.id ||
			req.post.populated('author') == req.user.id
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

exports.canModifyPost = function (req, res, next) {
	/*jshint ignore:start*/
	if (
		req.user && (
		req.post.populated('user') == req.user.id ||
		req.post.populated('author') == req.user.id
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
 * Post authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.post.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
