'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    errorHandler = require('./../errors.server.controller'),
    User = mongoose.model('User');

exports.list = function (req, res) {
    //var limit = 50;
    //if ('limit' in req.query) limit = parseInt(req.query.limit);
    var error = function (errObj) {
        res.status(400).send({
            message: errorHandler.getErrorMessage(errObj)
        });
    };
    var querySetup = function () {
        var conditions = [],
            limit = 500,
            sorts = {},
            projection = null,
            cond,
            query;

        if ('q' in req.query) {
            conditions.push({$text: {$search: req.query.q, $language: 'en'}});
            projection = {score: {$meta: 'textScore'}};
            sorts.score = {$meta: 'textScore'};
        }
        if ('role' in req.query) {
            conditions.push({roles: req.query.role});
        }
        if ('limit' in req.query) {
            limit = parseInt(req.query.limit);
        }

        cond = conditions.length > 0 ? {$and: conditions} : {};
        query = User.find(cond, projection).sort(sorts).limit(limit);
        return query;
    };

    querySetup().exec(function (err, users) {
        if (err) return error(err);
        var usrs = _.map(users, function (u) {
            if ('ac' in req.query) {
                return { value: u._id, label: u.displayName};
            } else {
                delete u.salt;
                delete u.password;
                delete u.token;
                delete u.token_expires;
                return u;
            }
        });
        res.jsonp(usrs);
    });
};

exports.view = function (req, res) {
    var profile = req.profile;

    delete profile.password;
    delete profile.salt;
    delete profile.token;

    res.jsonp(profile);
};
