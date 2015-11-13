'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	server = require('../../server'),
	policy = require('../../config/policy'),
	_promise = require('promise'),
	request = require('supertest'),
	_ = require('lodash'),
	mockVideos = require('../../var/mock_data/videos'),
	User,
	Video;

/**
 * Globals
 */
var publicUser,
	editorUser,
	reviewerUser,
	adminUser,
	authorUser,
	acl,
	app,
	agent,
	article,
	ids;

ids = {
	user: {}
};

describe('Functional test for ACL:', function () {
	before(function (done) {
		server.onReady(function () {
			User = mongoose.model('User');
			Video = mongoose.model('Video');
			app = server.getApp();
			agent = request.agent(app);
			done();
		});
	});

	before(function(done) {
		publicUser = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'public_user',
			password: 'password',
			provider: 'local',
			roles: ['public']
		});
		editorUser = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'editor_user',
			password: 'password',
			provider: 'local',
			roles: ['editor']
		});
		reviewerUser = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'reviewer_user',
			password: 'password',
			provider: 'local',
			roles: ['reviewer']
		});
		adminUser = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'admin_user',
			password: 'password',
			provider: 'local',
			roles: ['admin']
		});
		authorUser = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'author@test.com',
			username: 'author_user',
			password: 'password',
			provider: 'local',
			roles: ['author']
		});
		acl = policy.acl();
		article = {
			title: 'Article Title',
			content: 'Article Content'
		};
		User.remove().exec(done);
	});

	after(function (done) {
		User.remove().exec();
		done();
	});

	describe('Creating a user', function () {
		it('should assign user an ACL role', function (done) {
			var publicUserPromise = new _promise(function (resolve, reject) {
				publicUser.save(function (err, usr) {
					should.not.exist(err);
					ids.user.public = usr._id;
					acl.userRoles(usr.username.toString(), function (err, roles) {
						should.not.exist(err);
						roles.should.eql(['public']);
						resolve();
					});
				});
			});
			var editorUserPromise = new _promise(function (resolve, reject) {
				editorUser.save(function (err, usr) {
					should.not.exist(err);
					ids.user.editor = usr._id;
					acl.userRoles(usr.username.toString(), function (err, roles) {
						should.not.exist(err);
						roles.should.eql(['editor']);
						resolve();
					});
				});
			});
			var reviewerUserPromise = new _promise(function (resolve, reject) {
				reviewerUser.save(function (err, usr) {
					should.not.exist(err);
					ids.user.reviewer = usr._id;
					acl.userRoles(usr.username.toString(), function (err, roles) {
						should.not.exist(err);
						roles.should.eql(['reviewer']);
						resolve();
					});
				});
			});
			var adminUserPromise = new _promise(function (resolve, reject) {
				adminUser.save(function (err, usr) {
					ids.user.admin = usr._id;
					should.not.exist(err);
					acl.userRoles(usr.username.toString(), function (err, roles) {
						should.not.exist(err);
						roles.should.eql(['admin']);
						resolve();
					});
				});
			});
			var authorUserPromise = new _promise(function(resolve, reject) {
				authorUser.save(function (err, usr) {
					ids.user.author = usr._id;
					should.not.exist(err);
					acl.userRoles(usr.username.toString(), function (err, roles) {
						should.not.exist(err);
						roles.should.eql(['author']);
						mockVideos[0].author = usr._id;
						mockVideos[1].author = usr._id;
						resolve();
					});
				});
			});

			_promise.all([
				publicUserPromise,
				editorUserPromise,
				reviewerUserPromise,
				adminUserPromise,
				authorUserPromise
			])
				.then(function () {
					done();
				});
		});
	});

	describe('In role hierarchy ...', function () {
		var testRoles = function (user, roles, done) {
			var adminPartial = _.partial(policy.hasAtLeastRole, user.username.toString());
			var promises = _.map(roles, function (role) {
				return new _promise(function (resolve, reject) {
					adminPartial(role, function (err, has) {
						if (err) done(err);
						else {
							has.should.eql(true);
							resolve();
						}
					});
				});
			});

			_promise.all(promises)
				.then(function () {
					done();
				});
		};
		it('author should be public user too', function (done) {
			setTimeout(function () {
				testRoles(authorUser, ['author', 'public'], done);
			}, 200);
		});
		it('editor should be public user too', function (done) {
			setTimeout(function () {
				testRoles(editorUser, ['editor', 'public'], done);
			}, 200);
		});
		it('reviewer should be editor and public user too', function (done) {
			setTimeout(function () {
				testRoles(reviewerUser, ['reviewer', 'editor', 'public'], done);
			}, 200);
		});
		it('admin should be reviewer, editor and public user too', function (done) {
			setTimeout(function () {
				testRoles(adminUser, ['admin', 'reviewer', 'editor', 'public'], done);
			}, 200);
		});
	});

	describe('Public user', function () {
		it('should be able to login', function (done) {
			agent.post('/api/auth/signin')
				.send({ username: 'public_user', password: 'password' })
				.expect(200)
				.end(function (signinErr) {
					if (signinErr) done(signinErr);
					done();
				});
		});

		it('should be able to list videos', function (done) {
			agent.get('/api/videos')
				.end(function (videosErr, videosRes) {
					if (videosErr) done(videosErr);
					videosRes.body.should.be.instanceof(Array);
					done();
				});
		});

		it('should NOT be able to create video', function (done) {
			agent.post('/api/videos')
				.send(mockVideos[0])
				.expect(401)
				.end(function (videoSaveErr) {
					if (videoSaveErr) done(videoSaveErr);
					else done();
				});
		});

		it('should be able to logout', function (done) {
			agent.get('/api/auth/signout')
				.end(function (signoutErr) {
					if (signoutErr) done(signoutErr);
					done();
				});
		});
	});

	describe('Author user', function () {
		it('should be able to login', function (done) {
			agent.post('/api/auth/signin')
				.send({ username: 'author_user', password: 'password' })
				.expect(200)
				.end(function (signinErr) {
					if (signinErr) done(signinErr);
					done();
				});
		});

		it('should not be able to create video', function (done) {
			agent.post('/api/videos')
				.send(mockVideos[0])
				.expect(401)
				.end(function (videoSaveErr, videoSaveRes) {
					if (videoSaveErr) return done(videoSaveErr);
					else return done();
				});
		});

		it('should not be able to edit arbitrary video', function (done) {
			var vid = new Video(mockVideos[2]);
			vid.save(function (err) {
				if (err) done(err);
				else {
					var v = {title: {en: 'foobar', ur: 'other lang title'}};
					agent.put('/api/videos/' + vid._id)
						.send(v)
						.expect(403)
						.end(function (putErr) {
							if (putErr) done(putErr);
							else done();
						});
				}
			});
		});

		it('should be able to edit video he is author of', function (done) {
			var vid = new Video(mockVideos[0]);
			vid.author = authorUser._id;
			vid.save(function (err) {
				if (err) done(err);
				else {
					var v = {title: {en: 'foobar', ur: 'other lang title'}};
					agent.put('/api/videos/' + vid._id)
						.send(v)
						.expect(200)
						.end(function (putErr, putRes) {
							if (putErr) done(putErr);
							else {
								(putRes.body.title.en).should.match('foobar');
								(putRes.body.title.ur).should.match('other lang title');
								done();
							}
						});
				}
			});
		});

		it('should be able to logout', function (done) {
			agent.get('/api/auth/signout')
				.end(function (signoutErr) {
					if (signoutErr) done(signoutErr);
					done();
				});
		});
	});

	describe('Editor user', function () {
		var savedVideo;

		it('should be able to login', function (done) {
			agent.post('/api/auth/signin')
				.send({ username: 'editor_user', password: 'password' })
				.expect(200)
				.end(function (signinErr) {
					if (signinErr) done(signinErr);
					else done();
				});
		});

		it('should be able to create video', function (done) {
			agent.post('/api/videos')
				.send(mockVideos[0])
				.expect(200)
				.end(function (videoSaveErr, videoSaveRes) {
					if (videoSaveErr) done(videoSaveErr);
					else {
						savedVideo = videoSaveRes.body._id;
						done();
					}
				});
		});

		it('should be able to edit video', function (done) {
			var v = {title: {en: 'foobar', ur: 'other lang title'}};
			agent.put('/api/videos/' + savedVideo)
				.send(v)
				.expect(200)
				.end(function (putErr) {
					if (putErr) done(putErr);
					else done();
				});
		});

		it('should NOT be able to edit another user\'s article', function (done) {
			var v = new Video(mockVideos[1]);
			v.status = 'closed';
			v.save(function (err, v) {
				agent.put('/api/videos/' + v._id)
					.send({title: 'foo'})
					.expect(403)
					.end(function (err) {
						if (err) done(err);
						else done();
					});
			});
		});

		it('should NOT be able to delete video', function (done) {
			agent.delete('/api/videos/' + savedVideo)
				.expect(401)
				.end(function (putErr) {
					if (putErr) done(putErr);
					else done();
				});
		});

		it('should be able to see his profile', function (done) {
			agent.get('/api/users/me')
				.expect(200)
				.end(function (getErr) {
					if (getErr) done(getErr);
					else done();
				});
		});

		it('should be able to update his profile', function (done) {
			agent.put('/api/users')
				.send({username: 'editor_user', firstName: 'Foo'})
				.expect(200)
				.end(function (getErr) {
					if (getErr) done(getErr);
					else done();
				});
		});

		it('should be able to logout', function (done) {
			agent.get('/api/auth/signout')
				.end(function (signoutErr) {
					if (signoutErr) done(signoutErr);
					done();
				});
		});
	});

	describe('Reviewer user', function () {
		var savedVideo;

		it('should be able to login', function (done) {
			agent.post('/api/auth/signin')
				.send({ username: 'reviewer_user', password: 'password' })
				.expect(200)
				.end(function (signinErr) {
					if (signinErr) done(signinErr);
					else done();
				});
		});

		it('should be able to create article', function (done) {
			agent.post('/api/videos')
				.send(mockVideos[1])
				.expect(200)
				.end(function (videoSaveErr, videoSaveRes) {
					if (videoSaveErr) done(videoSaveErr);
					else {
						savedVideo = videoSaveRes.body._id;
						done();
					}
				});
		});

		it('should be able to edit video', function (done) {
			var v = {title: {en: 'foo bar', ur: 'foo bar2'}};
			agent.put('/api/videos/' + savedVideo)
				.send(v)
				.expect(200)
				.end(function (putErr) {
					if (putErr) done(putErr);
					else done();
				});
		});

		it('should not be able to delete video', function (done) {
			agent.delete('/api/videos/' + savedVideo)
				.send(article)
				.expect(401)
				.end(function (putErr) {
					if (putErr) done(putErr);
					else done();
				});
		});

		it('should be able to see his profile', function (done) {
			agent.get('/api/users/me')
				.expect(200)
				.end(function (getErr) {
					if (getErr) done(getErr);
					else done();
				});
		});

		it('should be able to update his profile', function (done) {
			agent.put('/api/users')
				.send({username: 'reviewer_user', firstName: 'Foo'})
				.expect(200)
				.end(function (getErr, getRes) {
					if (getErr) done(getErr);
					else {
						getRes.body.firstName.should.match('Foo');
						done();
					}
				});
		});

		it('should not be able to update his roles', function (done) {
			agent.put('/api/users')
				.send({username: 'reviewer_user', roles: ['admin']})
				.expect(200)
				.end(function (updateErr, updateRes) {
					if (updateErr) done(updateErr);
					else {
						updateRes.body.roles.should.be.an.instanceOf(Array).and.have.lengthOf(1);
						updateRes.body.roles.should.containEql('reviewer');
						done();
					}
				});
		});

		it('should be able to logout', function (done) {
			agent.get('/api/auth/signout')
				.end(function (signoutErr, signoutRes) {
					if (signoutErr) done(signoutErr);
					done();
				});
		});
	});

	describe('Admin user', function () {
		var savedVideo;

		it('should be able to login', function (done) {
			agent.post('/api/auth/signin')
				.send({ username: 'admin_user', password: 'password' })
				.expect(200)
				.end(function (signinErr) {
					if (signinErr) done(signinErr);
					else done();
				});
		});

		it('should be able to create article', function (done) {
			agent.post('/api/videos')
				.send(mockVideos[1])
				.expect(200)
				.end(function (videoSaveErr, videoSaveRes) {
					if (videoSaveErr) done(videoSaveErr);
					else {
						savedVideo = videoSaveRes.body._id;
						done();
					}
				});
		});

		it('should be able to update another user\'s roles', function (done) {
			agent.put('/api/users/'+ids.user.reviewer)
				.send({ username: 'reviewer_user', roles: ['editor']})
				.expect(200)
				.end(function (updateErr, updateRes) {
					if (updateErr) done(updateErr);
					else {
						updateRes.body.roles.should.be.instanceOf(Array).and.have.lengthOf(1);
						updateRes.body.roles.should.containEql('editor');

						acl.userRoles('reviewer_user', function (err, roles) {
							should.not.exist(err);
							roles.should.be.instanceOf(Array).with.lengthOf(1);
							roles.should.eql(['editor']);
							done();
						});
					}
				});
		});

		it('should be able to delete video', function (done) {
			agent.delete('/api/videos/' + savedVideo)
				.expect(200)
				.end(function (putErr) {
					if (putErr) done(putErr);
					else done();
				});
		});

		it('should be able to logout', function (done) {
			agent.get('/api/auth/signout')
				.end(function (signoutErr, signoutRes) {
					if (signoutErr) done(signoutErr);
					done();
				});
		});
	});
});
