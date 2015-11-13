'use strict';

 var passport = require('passport'),
 	 User = require('mongoose').model('User'),
	 TokenStrategy = require('passport-token-auth').Strategy,
	 du = require('date-utils'),
	 cfg = require('../config');

 module.exports = function () {
 	passport.use(new TokenStrategy({},
 		function (token, done) {
 			process.nextTick(function () {
				if (token === cfg.public_key) return done(null, {}, {has_token: true});

 				User.findOne({ token: token },
 					function (err, user) {
 						if (err) return done(err);
 						if (!user) return done(null, false);

 						if (!user.token || (new Date()).isAfter(user.token_expires)) {
 							return done(null, false);
 						}

 						return done(null, user);
 					});
 			});
 		}
 	));
 };
