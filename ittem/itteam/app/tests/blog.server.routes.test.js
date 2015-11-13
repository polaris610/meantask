'use strict';

var should = require('should'),
	request = require('supertest'),
	server = require('../../server'),
	mongoose = require('mongoose'),
	_promise = require('promise'),
	_ = require('lodash'),
	User,
	Post,
	app,
	agent;

var users = {},
	posts = {};

var headers = {authorization: 'test'};

describe('Blog CRUD tests', function () {

	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			Post = mongoose.model('Post');
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

		posts.opened = {
			title: {en: 'Book', ur: ''},
			body: {en: 'Description of book', ur: ''},
			post_language: 'en',
			status: 'open'
		};
		posts.closed = {
			title: {en: '', ur: 'Book...'},
			body: {en: '', ur: 'Book desc.'},
			post_language: 'ur',
			status: 'closed'
		};

		User.remove().exec();
		promises = _.map(users, function (usr) {
			return new _promise(function (resolve, reject) {
				usr.save(function (err) {
					if (usr.roles.indexOf('author') !== -1) {
						posts.opened.author = usr._id;
						posts.closed.author = usr._id;
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

	it('should be able to save Post instance if logged in as editor', function (done) {
		agent.post('/api/auth/signin')
			.send({username: 'editor_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/blog')
					.send(posts.opened)
					.expect(200)
					.end(function (postSaveErr, postSaveRes) {
						if (postSaveErr) return done(postSaveErr);

						agent.get('/api/blog')
							.expect(200)
							.end(function (postGetErr, postGetRes) {
								if (postGetErr) done(postGetErr);
								var postsList = postGetRes.body;
								(postsList[0].title.en).should.match(posts.opened.title.en);
								(postsList[0].body.en).should.match(posts.opened.body.en);
								(postsList[0].post_language).should.match('en');
								(postsList[0].status).should.eql('open');

								done();
							});
					});
			});
	});

	it('should not be able to save Post instance if not logged in', function(done) {
		agent.post('/api/blog')
			.send(posts.opened)
			.expect(401)
			.end(function(postSaveErr, postSaveRes) {
				done(postSaveErr);
			});
	});

	it('should be able to update Post instance if logged in as reviewer or higher role', function (done) {
		var post = posts.closed;

		agent.post('/api/auth/signin')
			.send({username: 'reviewer_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/blog')
					.send(post)
					.expect(200)
					.end(function(postSaveErr, postSaveRes) {
						if (postSaveErr) done(postSaveErr);

						post.title = {en: 'WHY YOU GOTTA BE SO MEAN?', ur: 'MEAN!'};

						agent.put('/api/blog/' + postSaveRes.body._id)
							.send(post)
							.expect(200)
							.end(function (postUpdateErr, postUpdateRes) {
								if (postUpdateErr) done(postUpdateErr);
								(postUpdateRes.body._id).should.equal(postSaveRes.body._id);
								(postUpdateRes.body.title.en).should.match('WHY YOU GOTTA BE SO MEAN?');
								(postUpdateRes.body.title.ur).should.match('MEAN!');

								done();
							});
					});
			});
	});

	it('should be able to get a list of opened Posts if not signed in', function(done) {
		var bookPromises = _promise.all(_.map(posts, function (post) {
			return new _promise(function (resolve, reject) {
				(new Post(post)).save(function (err, v) {
					if (err) reject();
					else resolve();
				});
			});
		}));

		bookPromises.then(function () {
			agent.get('/api/blog')
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

	it('should NOT be able to delete Post instance if signed in as reviewer user', function(done) {
		agent.post('/api/auth/signin')
			.send({username: 'reviewer_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/blog')
					.send(posts.closed)
					.expect(200)
					.end(function(postSaveErr, postSaveRes) {
						if (postSaveErr) done(postSaveErr);

						agent.delete('/api/blog/' + postSaveRes.body._id)
							.expect(401)
							.end(function(postDeleteErr, postDeleteRes) {
								done();
							});
					});
			});
	});

	it('should not be able to delete Post instance without sufficient role', function(done) {
		var p = new Post(posts.opened);
		p.save(function (err, b) {
			agent.delete('/api/blog/' + p._id)
				.set(headers)
				.expect(401)
				.end(function(postDeleteErr, postDeleteRes) {
					postDeleteRes.error.status.should.eql(401);
					done(postDeleteErr);
				});
		});
	});

	it('should be able to delete Post instance if signed in as admin user', function(done) {
		agent.post('/api/auth/signin')
			.send({username: 'admin_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/blog')
					.send(posts.closed)
					.expect(200)
					.end(function(postSaveErr, postSaveRes) {
						if (postSaveErr) done(postSaveErr);

						agent.delete('/api/blog/' + postSaveRes.body._id)
							.expect(200)
							.end(function(postDeleteErr, postDeleteRes) {
								if (postDeleteErr) done(postDeleteErr);
								(postDeleteRes.body._id).should.equal(postSaveRes.body._id);
								done();
							});
					});
			});
	});

	it('should increment views count on every GET request', function (done) {
		var pid = new Post(posts.opened);
		pid.save(function (err, p) {
			if (err) done(err);
			agent.get('/api/blog/' + p._id)
				.set(headers)
				.expect(200)
				.end(function (err, res) {
					if (err) done(err);
					agent.get('/api/blog/' + p._id)
						.set(headers)
						.expect(200)
						.end(function (err, res) {
							if (err) done(err);
							Post.findOne({_id : p._id}, function (err, post) {
								post.views.should.eql(2);
								done();
							});
						});
				});
		});
	});

	afterEach(function(done) {
		Post.remove().exec();
		User.remove().exec();
		done();
	});
});
