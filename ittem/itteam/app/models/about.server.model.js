'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	_ = require('lodash'),
	Schema = mongoose.Schema;

var multilangValidator = function (val) {
	if (!_.isObject(val)) return false;
	if (!('en' in val) && !('ur' in val)) return false;
	if ('en' in val && val.en === '' && 'ur' in val && val.ur === '') return false;
	return true;
};

/**
 * About Schema
 */
var AboutSchema = new Schema({
	title: {
		type: Object,
		properties: {
			en: {type: 'string', title: 'English', trim: true, default: ''},
			ur: {type: 'string', title: 'Urdu', trim: true, default: ''}
		},
		required: 'Please fill About title',
		validate: multilangValidator
	},
	body: {
		type: Object,
		properties: {
			en: {type: 'string', title: 'English', trim: true, default: ''},
			ur: {type: 'string', title: 'Urdu', trim: true, default: ''}
		},
		required: 'Please fill in About body.',
		validate: multilangValidator
	},
	about_language: {
		type: String,
		default: 'en'
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	author: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	status: {
		type: String,
		enum: ['draft', 'open', 'closed'],
		default: 'draft'
	},
	views: {
		type: Number,
		default: 0
	}
});

// Full-text search compound index.
AboutSchema.index({
	'title.en': 'text',
	'title.ur': 'text',
	'body.en': 'text',
	'body.ur': 'text'
});

mongoose.model('About', AboutSchema);
