'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Book = mongoose.model('Book'),
	User = mongoose.model('User'),
	Chapter = mongoose.model('Chapter'),
	policy = require('../../config/policy'),
	acl = policy.acl(),
	_ = require('lodash'),
	_Promise = require('promise');

/**
 * Create a Book
 */
exports.create = function(req, res, next) {
	var book = new Book(req.body);
	book.user = req.user;
	book.chapters = [
		{
			'title' : {
				'ur' : 'New chapter',
				'en' : 'New chapter'
			},
			'content' : {
				'ur' : 'Urdu content.',
				'en' : 'Eng content.'
			},
			'subchapters' : []
		}];
	User.isAuthor(book.author, function (is) {
		if (!is) {
			return res.status(400).send({
				message: 'Author not specified.'
			});
		}
		book.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.book = book;
				return req.body.featured ? next(): res.jsonp(book);
			}
		});
	});
};
/**
 * Retrieve the Table of Contents
 */
function getInfo (book) {
	return _.map(book.chapters, function (ch) {
		var chapter = {};
		if (ch.subchapters && ch.subchapters !== 0) {
			chapter.subchapters = _.map(ch.subchapters, function (sch) {
				return sch.title;
			});
			chapter.title = ch.title;
			return chapter;
		}
	});
}
/**
 * Show the current Book
 */
exports.read = function(req, res) {
	var chNo = req.query.chapterNo,
		schNo = req.query.subChapterNo,
		info = req.query.info;
	Book.update({_id: req.book._id}, {$inc: {views: 1}}).exec(function (err) {
		if (err) res.status(500).send('Error updating view count.');
		else {
			var b = req.book.toObject();
			b.user = req.book.populated('user');
			if (typeof req.book.populated('author') !== 'undefined') {
				b.author = {
					value: req.book.populated('author'),
					label: b.author.displayName
				};
			}
			b.views += 1;
			b.tableOfContents = getInfo(b);
			if (info) {
				b.chaptersCount = _.range(0,b.chapters.length);
			}
			if (schNo || schNo === '0') {
				b.content = b.chapters[chNo].subchapters[schNo];
			} else {
				b.content = b.chapters[chNo||0];
			}
			delete b.content.subchapters;
			delete b.chapters;
			return res.jsonp(b);
		}
	});
};

/**
 * Update a Book
 */
exports.update = function(req, res, next) {
	var book = req.book,
		content = req.body.content,
		chapter = req.query.chapterNo,
		subChapter = req.query.subChapterNo;
	if (subChapter || subChapter === 0) {
		book.chapters[chapter].subchapters.set(subChapter, content);
	} else {
		_.extend(book._doc.chapters[chapter]._doc, content);
		book.markModified('chapters');
	}
	book = _.extend(book , req.body);
	User.isAuthor(book.author, function (is) {
		if (!is) {
			return res.status(400).send({
				message: 'Author not specified.'
			});
		}
		book.save(function(err) {
			if (err) {				
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.book = book;
				return req.book.featured ? next(): res.jsonp(book);
			}
		});
	});
};

/**
 * Delete a Book
 */
exports.delete = function(req, res) {
	var book = req.book;

	book.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(book);
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
exports.search = function(req, res) {
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
		if ('book' in req.query) {
			var authors = _.isArray(req.query.book)?
				{$in: _.map(req.query.book, function (authorId) {
					return mongoose.Types.ObjectId(authorId);
				})}
				: mongoose.Types.ObjectId(req.query.book);
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
		query = Book.find(cond, projection).sort(sorts).limit(limit);

		query.populate('author', 'displayName');
		return query;
	};

	// Setup filters.
	promise = new _Promise(function (resolve, reject) {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (err) return reject({errors: [{message: 'Insufficient role.'}]});
			query = querySetup(has);
			query.exec(function (err, books) {
				if (err) {
					console.log(err);
					return reject(err);
				}
				_.each(books, function (b) {
					if(b._doc.chapters) delete b._doc.chapters;
				});
				return resolve(books);
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
exports.bookByID = function(req, res, next, id) {
	Book.findById(id)
		.populate([
			{path: 'user', select: 'displayName'},
			{path: 'author', select: 'displayName'}
		])
		.exec(function(err, book) {
			if (err) return next(err);
			if (!book) return next(new Error('Failed to load Book ' + id));
			req.book = book;
			next();
		});
};

/**
 * Only reviewer or higher role can see non-opened books.
 */
exports.canAccessBook = function (req, res, next) {
	/*jshint ignore:start*/
	if (req.book.status === 'open' || req.user && (req.book.populated('user') == req.user.id || req.book.populated('author') == req.user.id)) {
		return next();
	} else {
		policy.hasAtLeastRole(req, 'reviewer', function (err, has) {
			if (has) return next();
			else return res.status(403).send('Forbidden.');
		});
	}
	/*jshint ignore:end*/
};

exports.canModifyBook = function (req, res, next) {
	/*jshint ignore:start*/
	if (req.user && (req.book.populated('user') == req.user.id || req.book.populated('author') == req.user.id)) {
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
 * Book authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.book.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.authors = function (req, res) {
	//Book.distinct('author',
	//	function (err, result) {
	//		if (err) {
	//			res.status(500).send(err);
	//		}
	//		else {
	//			var authors = [];
	//			_.forEach(result, function (item) {
	//				authors.push({author: mongoose.Types.ObjectId(item)});
	//			});
	//			User.populate(authors, {path: 'author', select: '_id displayName'}, function (er, authors) {
	//				res.jsonp(authors);
	//			});
	//		}
	//	});
	User.find({roles: 'author'})
		.select('displayName _id')
		.exec(function (err, authors) {
		res.send(authors);
	});
};
exports.addContent = function (req, res) {
	var content = req.body.add,
		book = req.book;
	if (content.mode === 'chapter') {
		content.subchapters = [];
		book.update({$push: {chapters: content}}).exec();
	} else {
		book._doc.chapters[content.chapter]._doc.subchapters.push(content);
	book.markModified('chapters');
	book.save(function (err, result) {
		console.log(err, result);
		});
	}
	res.send(book);
};
