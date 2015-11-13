'use strict';

var should = require('should'),
	request = require('supertest'),
	server = require('../../server'),
	mongoose = require('mongoose'),
	_promise = require('promise'),
	_ = require('lodash'),
	User,
	About,
	app,
	agent;

var users = {},
	abouts = {};

var headers = {authorization: 'test'};

describe('About CRUD tests', function () {

	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			About = mongoose.model('About');
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

		abouts.opened = {
			title: {en: 'Book', ur: ''},
			body: {en: 'Description of book', ur: ''},
			about_language: 'en',
			status: 'open'
		};
		abouts.closed = {
			title: {en: '', ur: 'Book...'},
			body: {en: '', ur: 'Book desc.'},
			about_language: 'ur',
			status: 'closed'
		};

		User.remove().exec();
		promises = _.map(users, function (usr) {
			return new _promise(function (resolve, reject) {
				usr.save(function (err) {
					if (usr.roles.indexOf('author') !== -1) {
						abouts.opened.author = usr._id;
						abouts.closed.author = usr._id;
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

	it('should be able to save About instance if logged in as editor', function (done) {
		agent.post('/api/auth/signin')
			.send({username: 'editor_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/about')
					.send(abouts.opened)
					.expect(200)
					.end(function (aboutSaveErr, aboutSaveRes) {
						if (aboutSaveErr) return done(aboutSaveErr);

						agent.get('/api/about')
							.expect(200)
							.end(function (aboutGetErr, aboutGetRes) {
								if (aboutGetErr) done(aboutGetErr);
								var aboutsList = aboutGetRes.body;
								(aboutsList[0].title.en).should.match(abouts.opened.title.en);
								(aboutsList[0].body.en).should.match(abouts.opened.body.en);
								(aboutsList[0].about_language).should.match('en');
								(aboutsList[0].status).should.eql('open');

								done();
							});
					});
			});
	});

	it('should not be able to save About instance if not logged in', function(done) {
		agent.post('/api/about')
			.send(abouts.opened)
			.expect(401)
			.end(function(aboutSaveErr, aboutSaveRes) {
				done(aboutSaveErr);
			});
	});

	it('should be able to update About instance if logged in as reviewer or higher role', function (done) {
		var about = abouts.closed;

		agent.post('/api/auth/signin')
			.send({username: 'reviewer_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/about')
					.send(about)
					.expect(200)
					.end(function(aboutSaveErr, aboutSaveRes) {
						if (aboutSaveErr) done(aboutSaveErr);

						about.title = {en: 'WHY YOU GOTTA BE SO MEAN?', ur: 'MEAN!'};

						agent.put('/api/about/' + aboutSaveRes.body._id)
							.send(about)
							.expect(200)
							.end(function (aboutUpdateErr, aboutUpdateRes) {
								if (aboutUpdateErr) done(aboutUpdateErr);
								(aboutUpdateRes.body._id).should.equal(aboutSaveRes.body._id);
								(aboutUpdateRes.body.title.en).should.match('WHY YOU GOTTA BE SO MEAN?');
								(aboutUpdateRes.body.title.ur).should.match('MEAN!');

								done();
							});
					});
			});
	});

	it('should be able to get a list of opened Abouts if not signed in', function(done) {
		var bookPromises = _promise.all(_.map(abouts, function (about) {
			return new _promise(function (resolve, reject) {
				(new About(about)).save(function (err, v) {
					if (err) reject();
					else resolve();
				});
			});
		}));

		bookPromises.then(function () {
			agent.get('/api/about')
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

	it('should NOT be able to delete About instance if signed in as reviewer user', function(done) {
		agent.post('/api/auth/signin')
			.send({username: 'reviewer_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/about')
					.send(abouts.closed)
					.expect(200)
					.end(function(aboutSaveErr, aboutSaveRes) {
						if (aboutSaveErr) done(aboutSaveErr);

						agent.delete('/api/about/' + aboutSaveRes.body._id)
							.expect(401)
							.end(function(aboutDeleteErr, aboutDeleteRes) {
								done();
							});
					});
			});
	});

	it('should not be able to delete About instance without sufficient role', function(done) {
		var p = new About(abouts.opened);
		p.save(function (err, b) {
			agent.delete('/api/about/' + p._id)
				.set(headers)
				.expect(401)
				.end(function(aboutDeleteErr, aboutDeleteRes) {
					aboutDeleteRes.error.status.should.eql(401);
					done(aboutDeleteErr);
				});
		});
	});

	it('should be able to delete About instance if signed in as admin user', function(done) {
		agent.post('/api/auth/signin')
			.send({username: 'admin_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/about')
					.send(abouts.closed)
					.expect(200)
					.end(function(aboutSaveErr, aboutSaveRes) {
						if (aboutSaveErr) done(aboutSaveErr);

						agent.delete('/api/about/' + aboutSaveRes.body._id)
							.expect(200)
							.end(function(aboutDeleteErr, aboutDeleteRes) {
								if (aboutDeleteErr) done(aboutDeleteErr);
								(aboutDeleteRes.body._id).should.equal(aboutSaveRes.body._id);
								done();
							});
					});
			});
	});

	it('should increment views count on every GET request', function (done) {
		var pid = new About(abouts.opened);
		pid.save(function (err, p) {
			if (err) done(err);
			agent.get('/api/about/' + p._id)
				.set(headers)
				.expect(200)
				.end(function (err, res) {
					if (err) done(err);
					agent.get('/api/about/' + p._id)
						.set(headers)
						.expect(200)
						.end(function (err, res) {
							if (err) done(err);
							About.findOne({_id : p._id}, function (err, about) {
								about.views.should.eql(2);
								done();
							});
						});
				});
		});
	});

	afterEach(function(done) {
		About.remove().exec();
		User.remove().exec();
		done();
	});
});
