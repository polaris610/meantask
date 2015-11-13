'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
		errorHandler = require('./errors.server.controller'),
		Journal1 = mongoose.model('Journal1'),
		User = mongoose.model('User'),
		Category = mongoose.model('Category'),
		policy = require('../../config/policy'),
		acl = policy.acl(),
		_ = require('lodash'),
		_Promise = require('promise');

/**
 * Create a Journal1
 */
exports.create = function (req, res, next) {
	var journal1 = new Journal1(req.body);
	journal1.categories = [
		{
			'title': {
				'ur': 'New category',
				'en': 'New category'
			},
			'content': {
				'ur': 'Urdu content.',
				'en': 'Eng content.'
			},
			'subcategories': []
		}];
	User.isAuthor(journal1.author, function (is) {
		if (!is) {
			return res.status(400).send({
				message: 'Author not specified.'
			});
		}
		journal1.save(function (err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.journal1 = journal1;
				return req.body.featured ? next() : res.jsonp(journal1);
			}
		});
	});
};
/**
 * Retrieve the Table of Contents
 */
function getInfo(journal1) {
	return _.map(journal1.categories, function (ch) {
		var category = {};
		if (ch.subcategories && ch.subcategories !== 0) {
			category.subcategories = _.map(ch.subcategories, function(sch) {
				return sch.title;
			});
			category.title = ch.title;
			return category;
		}
	});
}
/**
 * Show the current Journal1
 */
exports.read = function (req, res) {
	var chNo = req.query.categoryNo,
			schNo = req.query.subCategoryNo,
			info = req.query.info;
	Journal1.update({_id: req.journal1._id}, {$inc: {views: 1}}).exec(function (err) {
		if (err)
			res.status(500).send('Error updating view count.');
		else {
			var b = req.journal1.toObject();
			//b.user = req.journal1.populated('user');
			if (typeof req.journal1.populated('author') !== 'undefined') {
				b.author = {
					value: req.journal1.populated('author'),
					label: b.author.displayName
				};
			}
			b.views += 1;
			b.tableOfContents = getInfo(b);
			if (info) {
				b.categoriesCount = _.range(0, b.categories.length);
			}
			if (schNo || schNo === '0') {
				b.content = b.categories[chNo].subcategories[schNo];
			} else {
				b.content = b.categories[chNo || 0];
			}
			delete b.content.subcategories;
			delete b.categories;
			return res.jsonp(b);
		}
	});
};

/**
 * Update a Journal1
 */
exports.update = function (req, res, next) {
	var journal1 = req.journal1,
			content = req.body.content,
			category = req.query.categoryNo,
			subCategory = req.query.subCategoryNo;
	if (subCategory || subCategory === 0) {
		journal1.categories[category].subcategories.set(subCategory, content);
	} else {
		_.extend(journal1._doc.categories[category]._doc, content);
		journal1.markModified('categories');
	}
	journal1 = _.extend(journal1, req.body);
	User.isAuthor(journal1.author, function (is) {
		if (!is) {
			return res.status(400).send({
				message: 'Author not specified.'
			});
		}
		journal1.save(function (err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.journal1 = journal1;
				return req.journal1.featured ? next() : res.jsonp(journal1);
			}
		});
	});
};

/**
 * Delete a Book
 */
exports.delete = function (req, res) {
	var journal1 = req.journal1;

	journal1.remove(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(journal1);
		}
	});
};

/**
 * List of Books
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
exports.search = function (req, res) {
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
			tmpcond = {status: 'open'};
			if (req.user) {
				tmpcond = {$or: [{author: req.user.id}, tmpcond]};
			}
			conditions.push(tmpcond);
		}
		if ('journal1' in req.query) {
			var authors = _.isArray(req.query.journal1) ?
					{$in: _.map(req.query.journal1, function (authorId) {
							return mongoose.Types.ObjectId(authorId);
						})}
			: mongoose.Types.ObjectId(req.query.journal1);
			conditions.push({author: authors});
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
		query = Journal1.find(cond, projection).sort(sorts).limit(limit);

		query.populate('author', 'displayName');
		return query;
	};

	// Setup filters.
	promise = new _Promise(function (resolve, reject) {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (err)
				return reject({errors: [{message: 'Insufficient role.'}]});
			query = querySetup(has);
			query.exec(function (err, journal1s) {
				if (err) {
					console.log(err);
					return reject(err);
				}
				_.each(journal1s, function (b) {
					if (b._doc.categories)
						delete b._doc.categories;
				});
				return resolve(journal1s);
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

	exports.search(req, res).then(
			function (data) {
				return res.jsonp(data);
			},
			function (err) {
				return error(err);
			}
	);
};

/**
 * Book middleware
 */
exports.journal1ByID = function (req, res, next, id) {
	Journal1.findById(id)
		.populate([
			{path:'author', select:'displayName'}
		])
		.exec(function (err, journal1) {
			if (err)
				return next(err);
			if (!journal1)
				return next(new Error('Failed to load Journal ' + id));
			req.journal1 = journal1;
			next();
		});
};

/**
 * Only reviewer or higher role can see non-opened books.
 */
exports.canAccessBook = function (req, res, next) {
	/*jshint ignore:start*/
	if (req.journal1.status === 'open' || req.user && (req.journal1.populated('author') == req.user.id)) {
		return next();
	} else {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (has)
				return next();
			else
				return res.status(403).send('Forbidden.');
		});
	}
	/*jshint ignore:end*/
};

exports.canModifyBook = function (req, res, next) {
	/*jshint ignore:start*/
	if (req.user && (req.journal1.populated('author') == req.user.id)) {
		next();
	}
	else {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (has)
				next();
			else
				res.status(403).send('Forbidden');
		});
	}
	/*jshint ignore:end*/
};

/**
 * Book authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
	if (req.journal1.author.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.authors = function (req, res) {
	User.find({roles: 'author'})
			.select('displayName _id')
			.exec(function (err, authors) {
				res.send(authors);
			});
};
exports.addContent = function (req, res) {
	var content = req.body.add,
		journal1 = req.journal1;
	if (content.mode === 'category') {
		content.subcategories = [];
		journal1.update({$push: {categories: content}}).exec();
	} else {
		journal1._doc.categories[content.category]._doc.subcategories.push(content);
		journal1.markModified('categories');
		journal1.save(function (err, result) {
			console.log(err, result);
		});
	}
	res.send(journal1);
};
