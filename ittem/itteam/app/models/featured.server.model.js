'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Featured = new Schema({
    video: {type: Schema.ObjectId, ref: 'Video'},
    book: {type: Schema.ObjectId, ref: 'Book'},
    post: {type: Schema.ObjectId, ref: 'Post'}
});

mongoose.model('Featured', Featured);
