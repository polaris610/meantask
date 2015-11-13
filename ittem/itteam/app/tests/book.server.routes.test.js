'use strict';

var should = require('should'),
	request = require('supertest'),
	server = require('../../server'),
	mongoose = require('mongoose'),
	_promise = require('promise'),
	_ = require('lodash'),
	User,
	Book,
	Chapter,
	app,
	agent;

var users = {},
	books = {};

var headers = {authorization: 'test'};

describe('Book CRUD tests', function () {
	//function bulkInsert () {
	//
	//}

	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			Book = mongoose.model('Book');
			Chapter = mongoose.model('Chapter');
			app = server.getApp();
			agent = request.agent(app);
			done();
		});
	});

	beforeEach(function(done) {
		var promises;

		users.public = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'public@test.com',
			username: 'public_user',
			password: 'password',
			provider: 'local',
			roles: ['public']
		});
		users.editor = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'editor@test.com',
			username: 'editor_user',
			password: 'password',
			provider: 'local',
			roles: ['editor']
		});
		users.reviewer = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'reviewer@test.com',
			username: 'reviewer_user',
			password: 'password',
			provider: 'local',
			roles: ['reviewer']
		});
		users.admin = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'admin@test.com',
			username: 'admin_user',
			password: 'password',
			provider: 'local',
			roles: ['admin']
		});
		users.author = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'author@test.com',
			username: 'author_user',
			password: 'password',
			provider: 'local',
			roles: ['author']
		});

		var subchapters = [
			{
				title: {en: 'Subchapter 1', ur: 'Subchapter'},
				content: {en: 'this is subchapter 1', ur: 'descr'}
			},
			{
				title: {en: 'Subchapter 2', ur: 'Subchapter'},
				content: {en: 'this is subchapter 2', ur: 'descr'}
			},
			{
				title: {en: 'Subchapter 3', ur: 'Subchapter'},
				content: {en: 'this is subchapter 3', ur: 'descr'}
			},
			{
				title: {en: 'Subchapter 4', ur: 'Subchapter'},
				content: {en: 'this is subchapter 4', ur: 'descr'}
			}
		];
		var chapters = [
			{
				title: {en: 'Chapter 1', ur: 'chapter'},
				content: {en: 'this is chapter 3', ur: 'descr'},
				subchapters: [subchapters[0], subchapters[1]]
			},
			{
				title: {en: 'Chapter 2', ur: 'chapter'},
				content: {en: 'chapter 2!', ur: 'descr'}
			},
			{
				title: {en: 'Chapter 3', ur: 'chapter'},
				content: {en: 'chapter 3!', ur: 'descr'},
				subchapters: [subchapters[2]]
			},
			{
				title: {en: 'Chapter 4', ur: 'chapter'},
				content: {en: 'chapter 4!', ur: 'descr'},
				subchapters: [subchapters[3]]
			}
		];
		books.opened = {
			title: {en: 'Book', ur: 'Book..'},
			description: {en: 'Description of book', ur: 'descr'},
			chapters: [chapters[0], chapters[1], chapters[2], chapters[3]],
			status: 'open'
		};
		books.closed = {
			title: {en: 'Book closed', ur: 'Book...'},
			description: {en: 'Description of book 2', ur: 'Book desc.'},
			chapters: [chapters[0], chapters[1]],
			status: 'closed'
		};

		User.remove().exec();
		promises = _.map(users, function (usr) {
			return new _promise(function (resolve, reject) {
				usr.save(function (err) {
					if (usr.roles.indexOf('author') !== -1) {
						books.opened.author = usr._id;
						books.closed.author = usr._id;
					}
					if (!err) resolve();
					else reject();
				});
			});
		});

		_promise.all(promises).then(function () {
			done();
		});
	});

	it('should be able to save Book instance if logged in as editor', function (done) {
		agent.post('/api/auth/signin')
			.send({username: 'editor_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/books')
					.send(books.opened)
					.expect(200)
					.end(function (bookSaveErr, bookSaveRes) {
						if (bookSaveErr) return done(bookSaveErr);

						agent.get('/api/books')
							.expect(200)
							.end(function (bookGetErr, bookGetRes) {
								if (bookGetErr) done(bookGetErr);
								var booksList = bookGetRes.body;
								(booksList[0].title.en).should.match(books.opened.title.en);
								(booksList[0].title.ur).should.match(books.opened.title.ur);
								(booksList[0].status).should.eql('open');
								(booksList[0].chapters[0].title.en).should.match(books.opened.chapters[0].title.en);
								(booksList[0].chapters[0].title.ur).should.match(books.opened.chapters[0].title.ur);
								(booksList[0].chapters[0].subchapters[0].title.en).should.match(books.opened.chapters[0].subchapters[0].title.en);
								(booksList[0].chapters[0].subchapters[0].title.ur).should.match(books.opened.chapters[0].subchapters[0].title.ur);
								(booksList[0].chapters[0].subchapters[1].title.en).should.match(books.opened.chapters[0].subchapters[1].title.en);
								(booksList[0].chapters[0].subchapters[1].title.ur).should.match(books.opened.chapters[0].subchapters[1].title.ur);
								(booksList[0].chapters[1].title.en).should.match(books.opened.chapters[1].title.en);
								(booksList[0].chapters[1].title.ur).should.match(books.opened.chapters[1].title.ur);
								(booksList[0].chapters[2].title.en).should.match(books.opened.chapters[2].title.en);
								(booksList[0].chapters[2].title.ur).should.match(books.opened.chapters[2].title.ur);
								(booksList[0].chapters[2].subchapters[0].title.en).should.match(books.opened.chapters[2].subchapters[0].title.en);
								(booksList[0].chapters[2].subchapters[0].title.ur).should.match(books.opened.chapters[2].subchapters[0].title.ur);
								(booksList[0].chapters[3].title.en).should.match(books.opened.chapters[3].title.en);
								(booksList[0].chapters[3].title.ur).should.match(books.opened.chapters[3].title.ur);
								(booksList[0].chapters[3].subchapters[0].title.en).should.match(books.opened.chapters[3].subchapters[0].title.en);
								(booksList[0].chapters[3].subchapters[0].title.ur).should.match(books.opened.chapters[3].subchapters[0].title.ur);

								done();
							});
					});
			});
	});

	it('should not be able to save Book instance if not logged in', function(done) {
		agent.post('/api/books')
			.send(books.opened)
			.expect(401)
			.end(function(bookSaveErr, bookSaveRes) {
				done(bookSaveErr);
			});
	});

	it('should be able to update Book instance if logged in as reviewer or higher role', function (done) {
		var book = books.closed;

		agent.post('/api/auth/signin')
			.send({username: 'reviewer_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/books')
					.send(book)
					.expect(200)
					.end(function(bookSaveErr, bookSaveRes) {
						if (bookSaveErr) done(bookSaveErr);

						book.title = {en: 'WHY YOU GOTTA BE SO MEAN?', ur: 'MEAN!'};

						agent.put('/api/books/' + bookSaveRes.body._id)
							.send(book)
							.expect(200)
							.end(function (bookUpdateErr, bookUpdateRes) {
								if (bookUpdateErr) done(bookUpdateErr);
								//console.log(bookUpdateRes);
								(bookUpdateRes.body._id).should.equal(bookSaveRes.body._id);
								(bookUpdateRes.body.title.en).should.match('WHY YOU GOTTA BE SO MEAN?');
								(bookUpdateRes.body.title.ur).should.match('MEAN!');

								done();
							});
					});
			});
	});

	it('should be able to get a list of opened Books if not signed in', function(done) {
		var bookPromises = _promise.all(_.map(books, function (book) {
			return new _promise(function (resolve, reject) {
				(new Book(book)).save(function (err, v) {
					if (err) reject();
					else resolve();
				});
			});
		}));

		bookPromises.then(function () {
			agent.get('/api/books')
				.set(headers)
				.expect(200)
				.end(function (err, res) {
					if (err) done(err);
					res.body.should.be.an.Array.with.lengthOf(1);
					done();
				});
		}, function () {
			done(false);
		});
	});

	it('should NOT be able to delete Book instance if signed in as reviewer user', function(done) {
		agent.post('/api/auth/signin')
			.send({username: 'reviewer_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/books')
					.send(books.closed)
					.expect(200)
					.end(function(bookSaveErr, bookSaveRes) {
						if (bookSaveErr) done(bookSaveErr);

						agent.delete('/api/books/' + bookSaveRes.body._id)
							.expect(401)
							.end(function(bookDeleteErr, bookDeleteRes) {
								if (bookDeleteErr) done(bookDeleteErr);
								done();
							});
					});
			});
	});

	it('should not be able to delete Book instance without sufficient role', function(done) {
		var b = new Book(books.opened);
		b.save(function (err, b) {
			agent.delete('/api/books/' + b._id)
				.set(headers)
				.expect(401)
				.end(function(bookDeleteErr, bookDeleteRes) {
					bookDeleteRes.error.status.should.eql(401);
					done(bookDeleteErr);
				});
		});
	});

	it('should be able to delete Book instance if signed in as admin', function(done) {
		agent.post('/api/auth/signin')
			.send({username: 'admin_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/books')
					.send(books.closed)
					.expect(200)
					.end(function(bookSaveErr, bookSaveRes) {
						if (bookSaveErr) done(bookSaveErr);

						agent.delete('/api/books/' + bookSaveRes.body._id)
							.expect(200)
							.end(function(bookDeleteErr, bookDeleteRes) {
								if (bookDeleteErr) done(bookDeleteErr);
								(bookDeleteRes.body._id).should.equal(bookSaveRes.body._id);
								done();
							});
					});
			});
	});

	it('should increment views count on every GET request', function (done) {
		var bid = new Book(books.opened);
		bid.save(function (err, b) {
			if (err) done(err);
			agent.get('/api/books/' + b._id)
				.set(headers)
				.expect(200)
				.end(function (err, res) {
					if (err) done(err);
					agent.get('/api/books/' + b._id)
						.set(headers)
						.expect(200)
						.end(function (err, res) {
							if (err) done(err);
							Book.findOne({_id : b._id}, function (err, book) {
								book.views.should.eql(2);
								done();
							});
						});
				});
		});
	});

	afterEach(function(done) {
		Book.remove().exec();
		Chapter.remove().exec();
		User.remove().exec();
		done();
	});
});
