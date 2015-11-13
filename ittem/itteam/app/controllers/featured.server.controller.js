'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _  = require('lodash'),
    errorHandler = require('./errors.server.controller'),
    User = mongoose.model('User'),
    Featured = mongoose.model('Featured');

function checkRule (prop, user) {
    if (typeof prop !== 'undefined' && prop !== null) {
        return prop.equals(user._id);
    }
    return false;
}

function handler(err, res, content) {
    if (err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    } else {
        return res.jsonp(content._doc);
    }
}

function changeIt (res, options, content, cb) {
    Featured.findOne({}, function (err, data) {
        if (!data) {
            Featured.create(options, function (err, data) {
                cb(err, res, content);
            });
        } else {
            data.update(options, function (err, data) {
                cb(err, res, content);
            });
        }
    });
}

function get(req, res) {
    var content = req.query.content;
    Featured.findOne({})
        .populate('video book post')
        .exec(function (err, data) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else if (!data) {
                return res.jsonp({});
            } else {
                if (data._doc.book !== undefined) {delete data._doc.book._doc.chapters;}
                return content !== 'undefined'? res.jsonp(data[content]): res.jsonp(data);
            }
    });
}

function update(req, res) {
    var content = req.video || req.book || req.post,
        options = req.video ? {video: req.video._id}: {};
        options = req.book ? {book: req.book._id}: options;
        options = req.post ? {post: req.post._id}: options;
    User.findById(req.user._id, function (err, user) {
        if (user.roles.indexOf('admin') === -1 && user.roles.indexOf('reviewer')=== -1){
            if (
                user.roles.indexOf('editor') !== -1 && checkRule(content.user, user) ||
                user.roles.indexOf('author') !== -1 && checkRule(content.author, user)
                ) {
                changeIt(res, options, content, handler);
            } else {
                handler(err, res, content);
            }
        } else {
            changeIt(res, options, content, handler);
        }
    });

}
module.exports = {
    get: get,
    update: update
};



