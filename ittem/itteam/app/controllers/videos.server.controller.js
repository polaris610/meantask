'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Video = mongoose.model('Video'),
	User = mongoose.model('User'),
	policy = require('../../config/policy'),
	acl = policy.acl(),
	_ = require('lodash'),
	_Promise = require('promise');

/**
 * Create a Video
 */
exports.create = function(req, res, next) {
	var video = new Video(req.body);
	video.user = req.user;

	User.isAuthor(video.author, function (is) {
		if (!is) {
			return res.status(400).send({
				message: 'Author should be specified.'
			});
		}
		video.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.video = video;
				return req.body.featured ? next(): res.jsonp(video);
			}
		});
	});
};

/**
 * Show the current Video
 */
exports.read = function(req, res) {
	Video.update({_id: req.video._id}, {$inc: {views: 1}}).exec(function (err) {
		if (err) res.status(500).send('Error updating view count.');
		else {
			var v = req.video.toObject();
			Video
				.find({categories: v.categories})
				.where('seq').in([v.seq-1, v.seq+1])
				.exec(function (err, videos) {
					if (videos.length !== 0){
						if (videos[0].seq !== v.seq-1) {
							v.next = videos[0];
							v.previous = videos[1];
						} else {
							v.previous = videos[0];
							v.next = videos[1];
						}
					}
					v.user = req.video.populated('user');
					if (typeof req.video.populated('author') !== 'undefined') {
						v.author = {
							value: req.video.populated('author'),
							label: v.author.displayName
						};
					}
					v.views += 1;
					res.jsonp(v);
				});
		}
	});
};

/**
 * Update a Video
 */
exports.update = function(req, res, next) {
	var video = req.video;
	video = _.extend(video , req.body);

	User.isAuthor(video.author, function (is) {
		if (!is) {
			return res.status(400).send({
				message: 'Author is not specified.'
			});
		}
		video.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.video = video;
				return req.video.featured ? next(): res.jsonp(video);
			}
		});
	});
};

/**
 * Delete an Video
 */
exports.delete = function(req, res) {
	var video = req.video ;

	video.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(video);
		}
	});
};

/**
 * List of Videos
 *
 * Filtering results:
 *     - q=foo: query param for text search,
 *     - category=bar: filter by category.
 *
 * Sorting results:
 *     - sortBy=param: parameter to sort against,
 *     - sortDir=asc: asc/desc sorting.
 *
 * Limiting number of results:
 *     - limit=10: max number of results to return.
 */
exports.search = function(req, res) {
	var query,
		querySetup,
		promise,
		limit = 25,
		skip = 0;

	querySetup = function (hasSufficientRole) {
		var conditions = [],
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
		if ('category' in req.query) {
			var categories = _.isArray(req.query.category) ?
				{$in : req.query.category}
				: req.query.category;
			conditions.push({ categories: categories });
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
		if('skip' in req.query) {
			skip = parseInt(req.query.skip);
		}

		sorts.created = 'desc';
		cond = conditions.length > 0 ? {$and: conditions} : {};
		query = Video.find(cond, projection).sort(sorts);

		query.populate('user', 'displayName');
		query.populate('author', 'displayName');
		return query;
	};

	// Setup filters.
	promise = new _Promise(function (resolve, reject) {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (err) reject({errors: [{message: 'Insufficient role.'}]});
			query = querySetup(has);
			query.exec(function (err, videos) {
				if (err) reject(err);
				else {
					var data = _.slice(videos, limit*skip, limit*(skip+1));
					resolve({
						data: data,
						allCount: videos.length
					});
					//resolve(videos)
				}
			});
		});
	});
	return promise;
};

exports.list = function (req, res) {
	var error;

	error = function (errObj) {
		res.status(400).send({
			message: errorHandler.getErrorMessage(errObj)
		});
	};

	exports.search(req, res).then(
		function (data) {
			res.jsonp(data);
		},
		function (err) {
			error(err);
		}
	);
};

exports.categories = function (req, res) {
	var limit = 16;

	Video.aggregate(
		{ $unwind: '$categories' },
		{ $group: { _id: '$_id', cat: { $addToSet: '$categories'} } },
		{ $unwind: '$cat' },
		{ $group: { _id: '$cat', count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
		{ $limit: limit },
		function (err, categories) {
			if (err) {
				res.status(500).send(err);
			}
			else {
				res.jsonp(categories);
			}
		});
};

/**
 * Video middleware
 */
exports.videoByID = function(req, res, next, id) {
	Video.findById(id)
		.populate([
			{path: 'user', select: 'displayName'},
			{path: 'author', select: 'displayName'}
		])
		.exec(function(err, video) {
		if (err) return next(err);
		if (! video) return next(new Error('Failed to load Video ' + id));
		req.video = video;
		next();
	});
};

/**
 * Only reviewer or higher role can see non-opened videos.
 */
exports.canAccessVideo = function (req, res, next) {
	/*jshint ignore:start*/
	if (req.video.status === 'open' || req.user && (req.video.populated('user') == req.user.id || req.video.populated('author') == req.user.id)) {
		return next();
	} else {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (has) return next();
			else return res.status(403).send('Forbidden.');
		});
	}
	/*jshint ignore:end*/
};

exports.canModifyVideo = function (req, res, next) {
	/*jshint ignore:start*/
	if (req.user && (req.video.populated('user') == req.user.id || req.video.populated('author') == req.user.id)) {
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
 * Video authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.video.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
