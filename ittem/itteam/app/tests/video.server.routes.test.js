'use strict';

var should = require('should'),
	request = require('supertest'),
	server = require('../../server'),
	mongoose = require('mongoose'),
	_promise = require('promise'),
	_ = require('lodash'),
	User,
	Video,
	app,
	agent;

/**
 * Globals
 */
var users = {},  
	videos = {};

var headers = {authorization: 'test'};

/**
 * Video routes tests
 */
describe('Video CRUD tests', function() {

	function bulkInsert () {
		var videos = [
			{
				title: {en: 'Cats video', ur: 'Cats'},
				description: {en: 'Some cat jumping around video compilation.', ur: 'Description'},
				categories: ['cat', 'cats', 'bar'],
				status: 'open'
			},
			{
				title: {en: 'Cats playing around compilation.', ur: 'Cats'},
				description: {en: 'For more compilations see blahbla.', ur: 'Desc'},
				categories: ['nyan', 'cat'],
				status: 'open'
			},
			{
				title: {en: 'Animals fight', ur: 'Animals'},
				description: {en: 'A cat and a dog fighting', ur: 'Description'},
				categories: ['animals', 'fight'],
				status: 'open'
			},
			{
				title: {en: 'LIVE video: cat being rescued by police', ur: 'LIVE'},
				description: {en: 'Cat being stuck in a tree.', ur: 'Description'},
				categories: ['cat', 'live'],
				status: 'closed'
			},
			{
				title: {en: 'Video compilation of cats', ur: 'Video'},
				description: {en: 'Funny videos of cats.', ur: 'Description'},
				categories: ['cat', 'cats', 'funny'],
				status: 'open'
			},
			{
				title: {en: 'U2 O2 Arena Euro road 2012', ur: 'U2'},
				description: {en: 'A live concert of U2 tour.', ur: 'Description'},
				categories: ['live', 'music'],
				status: 'open'
			},
			{
				title: {en: 'Radiohead tour Europe', ur: 'Radiohead'},
				description: {en: 'First tour since 2008.', ur: 'Description'},
				categories: ['music', 'tour'],
				status: 'open'
			}
		],
		promises = _promise.all(_.map(videos, function (v) {
			return new _promise(function (resolve, reject) {
				(new Video(v)).save(function (err, v) {
					if (err) {
						reject();
					}
					else resolve();
				});
			});
		}));

		return promises;
	}

	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			Video = mongoose.model('Video');
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

		videos.opened = {
			title: {en: 'Opened name', ur: 'Other name'},
			description: {en: 'test video', ur: 'other video'},
			categories: ['test', 'video', 'new'],
			status: 'open'
		};
		videos.closed = {
			title: {en: 'Closed video', ur: 'Closed video 2'},
			description: {en: 'test video', ur: 'test video'},
			categories: ['test', 'video'],
			status: 'closed'
		};
		videos.test = {
			title: {en: 'Foo video', ur: 'Foo video 2'},
			description: {en: 'foo bar', ur: 'foo bar 2'},
			categories: ['bar', 'foo'],
			status: 'open'
		};

		User.remove().exec();
		promises = _.map(users, function (usr) {
			return new _promise(function (resolve, reject) {
				usr.save(function (err) {
					if (usr.roles.indexOf('author') !== -1) {
						videos.opened.author = usr._id;
						videos.closed.author = usr._id;
						videos.test.author = usr._id;
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

	it('should be able to save Video instance if logged in as editor', function (done) {
		agent.post('/api/auth/signin')
			.send({username: 'editor_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);
				
				agent.post('/api/videos')
					.send(videos.opened)
					.expect(200)
					.end(function (videoSaveErr, videoSaveRes) {
						if (videoSaveErr) return done(videoSaveErr);

						agent.get('/api/videos')
							.expect(200)
							.end(function (videosGetErr, videosGetRes) {
								if (videosGetErr) done(videosGetErr);
								var videosList = videosGetRes.body;
								(videosList[0].title.en).should.match(videos.opened.title.en);
								(videosList[0].title.ur).should.match(videos.opened.title.ur);
								(videosList[0].status).should.eql('open');
								done();
							});
					});
			});
	});

	it('should not be able to list Video instance if it is not open and user doesn\'t have a sufficient role', function (done) {
		agent.post('/api/auth/signin')
			.send({username: 'editor_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);
				
				agent.post('/api/videos')
					.send(videos.closed)
					.expect(200)
					.end(function (videoSaveErr, videoSaveRes) {
						var vid;
						if (videoSaveErr) return done(videoSaveErr);

						vid = videoSaveRes.body._id;

						agent.get('/api/auth/signout')
							.expect(302)
							.end(function (signoutErr, signoutRes) {
								if (signoutErr) done(signoutErr);

								agent.get('/api/videos')
									.set(headers)
									.expect(200)
									.end(function (videosGetErr, videosGetRes) {
										if (videosGetErr) return done(videosGetErr);
										else return done();
										videosGetRes.body.length.should.eql(0);
										done();
									});
							});
					});
			});
	});

	it('should not be able to show non-opened Video instance to user with insufficient role', function (done) {
		agent.post('/api/auth/signin')
			.send({username: 'editor_user', password: 'password'})
			.expect(200)
			.end(function (err) {
				if (err) done(err);

				agent.post('/api/videos')
					.send(videos.closed)
					.expect(200)
					.end(function (err, res) {
						if (err) done(err);

						var vid = res.body._id;
						agent.get('/api/auth/signout')
							.expect(302)
							.end(function (err) {
								if (err) done(err);

								agent.get('/api/videos/' + vid)
									.set(headers)
									.expect(403)
									.end(function (err, res) {
										res.error.status.should.be.eql(403);
										done();
									});
							});
					});
			});
	});

	it('should not be able to save Video instance if not logged in', function(done) {
		agent.post('/api/videos')
			.send(videos.opened)
			.expect(401)
			.end(function(videoSaveErr, videoSaveRes) {
				done(videoSaveErr);
			});
	});

	it('should be able to update Video instance if logged in as reviewer or higher role', function (done) {
		var video = videos.closed;

		agent.post('/api/auth/signin')
			.send({username: 'reviewer_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/videos')
					.send(video)
					.expect(200)
					.end(function(videoSaveErr, videoSaveRes) {
						if (videoSaveErr) done(videoSaveErr);

						video.title = {en: 'WHY YOU GOTTA BE SO MEAN?', ur: 'MEAN!'};

						agent.put('/api/videos/' + videoSaveRes.body._id)
							.send(video)
							.expect(200)
							.end(function (videoUpdateErr, videoUpdateRes) {
								if (videoUpdateErr) done(videoUpdateErr);

								(videoUpdateRes.body._id).should.equal(videoSaveRes.body._id);
								(videoUpdateRes.body.title.en).should.match('WHY YOU GOTTA BE SO MEAN?');
								(videoUpdateRes.body.title.ur).should.match('MEAN!');

								done();
							});
					});
			});
	});

	it('should be able to get a list of opened Videos if not signed in', function(done) {
		var videoPromises = _promise.all(_.map(videos, function (video) {
			return new _promise(function (resolve, reject) {
				(new Video(video)).save(function (err, v) {
					if (err) reject();
					else resolve();
				});
			});
		}));

		videoPromises.then(function () {
			agent.get('/api/videos')
				.set(headers)
				.expect(200)
				.end(function (err, res) {
					if (err) done(err);
					res.body.should.be.an.Array.with.lengthOf(2);
					done();
				});
		}, function () {
			done(false);
		});
	});

	it('should be able to delete Video instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send({username: 'reviewer_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/videos')
					.send(videos.closed)
					.expect(200)
					.end(function(videoSaveErr, videoSaveRes) {
						if (videoSaveErr) done(videoSaveErr);

						agent.delete('/api/videos/' + videoSaveRes.body._id)
							.expect(401)
							.end(function(videoDeleteErr, videoDeleteRes) {
								if (videoDeleteErr) done(videoDeleteErr);
								done();
							});
					});
			});
	});

	it('should not be able to delete Video instance without sufficient role', function(done) {
		var v = new Video(videos.opened);
		v.save(function (err, v) {
			agent.delete('/api/videos/' + v._id)
				.set(headers)
				.expect(401)
				.end(function(videoDeleteErr, videoDeleteRes) {
					videoDeleteRes.error.status.should.eql(401);
					done(videoDeleteErr);
				});
		});
	});

	it('should be able to delete Video instance if signed in as admin', function(done) {
		agent.post('/api/auth/signin')
			.send({username: 'admin_user', password: 'password'})
			.expect(200)
			.end(function (signinErr, signinRes) {
				if (signinErr) done(signinErr);

				agent.post('/api/videos')
					.send(videos.closed)
					.expect(200)
					.end(function(videoSaveErr, videoSaveRes) {
						if (videoSaveErr) done(videoSaveErr);

						agent.delete('/api/videos/' + videoSaveRes.body._id)
							.expect(200)
							.end(function(videoDeleteErr, videoDeleteRes) {
								if (videoDeleteErr) done(videoDeleteErr);
								(videoDeleteRes.body._id).should.equal(videoSaveRes.body._id);
								done();
							});
					});
			});
	});

	it('should increment views count on every GET request', function (done) {
		var vid = new Video(videos.opened);
		vid.save(function (err, v) {
			agent.get('/api/videos/' + v._id)
				.set(headers)
				.expect(200)
				.end(function (err, res) {
					agent.get('/api/videos/' + v._id)
						.set(headers)
						.expect(200)
						.end(function (err, res) {
							Video.findOne({_id : v._id}, function (err, video) {
								video.views.should.eql(2);
								done();
							});
						});
				});
		});
	});

	it('should be able to get a list of opened Videos filtered by search query', function (done) {
		var promises = _.map(videos, function (vid) {
			return new _promise(function (resolve, reject) {
				(new Video(vid)).save(function (err, v) {
					if (err) reject();
					else resolve();
				});
			});
		});

		_promise.all(promises).then(function () {
			agent.get('/api/videos')
				.set(headers)
				.query({q: 'opened'})
				.expect(200)
				.end(function (getErr, getRes) {
					if (getErr) done(getErr);
					getRes.body.should.be.an.Array.with.lengthOf(1);
					done();
				});
		});
	});

	it('should be able to get a list of opened Videos filtered by category', function (done) {
		var promises = _.map(videos, function (vid) {
			return new _promise(function (resolve, reject) {
				(new Video(vid)).save(function (err, v) {
					if (err) reject();
					else resolve();
				});
			});
		});

		_promise.all(promises).then(function () {
			agent.get('/api/videos')
				.set(headers)
				.query({category: 'video'})
				.expect(200)
				.end(function (getErr, getRes) {
					if (getErr) done(getErr);
					getRes.body.should.be.an.Array.with.lengthOf(1);
					done();
				});
		});
	});

	it('should be able to get a list of all videos in a category if user has sufficient role', function (done) {
		var promises = _.map(videos, function (vid) {
			return new _promise(function (resolve, reject) {
				(new Video(vid)).save(function (err, v) {
					if (err) reject();
					else resolve();
				});
			});
		});

		_promise.all(promises).then(function () {
			agent.post('/api/auth/signin')
				.send({username: 'admin_user', password: 'password'})
				.expect(200)
				.end(function (err, res) {
					if (err) done(err);
					agent.get('/api/videos')
						.query({category: 'video'})
						.expect(200)
						.end(function (getErr, getRes) {
							if (getErr) done(getErr);
							getRes.body.should.be.an.Array.with.lengthOf(2);
							done();
						});
				});
		});
	});

	it('should be able to get a list of videos containing a word \'cat\' sorted by relevance', function (done) {
		bulkInsert().then(function () {
			agent.get('/api/videos')
				.set(headers)
				.query({q: 'cat'})
				.expect(200)
				.end(function (err, res) {
					if (err) done(err);
					res.body.should.be.an.Array.with.lengthOf(4);
					(res.body[0].title.en).should.match('Cats video');
					done();
				});
		});
	});

	it('should be able to get a limited list of videos containing a word \'cat\'', function (done) {
		bulkInsert().then(function () {
			agent.get('/api/videos')
				.set(headers)
				.query({q: 'cat', limit: 2})
				.expect(200)
				.end(function (err, res) {
					if (err) done(err);
					res.body.should.be.an.Array.with.lengthOf(2);
					done();
				});
		});
	});

	it('should be able to get a list of customly sorted videos', function (done) {
		bulkInsert().then(function () {
			agent.get('/api/videos')
				.set(headers)
				.query({category: 'music', sortBy: 'title', sortDir: 'asc'})
				.expect(200)
				.end(function (err, res) {
					if (err) done(err);
					res.body.should.be.an.Array.with.lengthOf(2);
					(res.body[0].title.en).should.match('Radiohead tour Europe');
					done();
				});
		});
	});

	it('should be able to get a list of videos in a category that match some query', 
		function (done) {
			bulkInsert().then(function () {
				agent.get('/api/videos')
					.set(headers)
					.query({category: 'music', q: 'radiohead'})
					.expect(200)
					.end(function (err, res) {
						if (err) done(err);
						res.body.should.be.an.Array.with.lengthOf(1);
						done();
					});
			});
	});

	/*jshint multistr: true */
	it('should be able to get a limited list of videos in a category \
		that match some query and  are sorted by custom parameter', 
		function (done) {
			bulkInsert().then(function () {
				agent.get('/api/videos')
					.set(headers)
					.query({category: 'cat', q: 'compilation', limit: 2, sortBy: 'title', sortDir: 'desc'})
					.expect(200)
					.end(function (err, res) {
						if (err) done(err);
						res.body.should.be.an.Array.with.lengthOf(2);
						(res.body[0].title.en).should.match('Cats playing around compilation.');
						(res.body[1].title.en).should.match('Video compilation of cats');
						done();
					});
			});
		});

	it('should be able to get a list of videos whose category name matches a query',
		function (done) {
			bulkInsert().then(function () {
				agent.get('/api/videos')
					.set(headers)
					.query({q: 'nyan'})
					.expect(200)
					.end(function (err, res) {
						if (err) done(err);
						res.body.should.be.an.Array.with.lengthOf(1);
						(res.body[0].title.en).should.match('Cats playing around compilation.');
						done();
					});
			});
		});

	afterEach(function(done) {
		Video.remove().exec();
		User.remove().exec();
		done();
	});
});
