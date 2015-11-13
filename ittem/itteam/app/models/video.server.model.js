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
 * Video Schema
 */
var VideoSchema = new Schema({
	title: {
		type: Object,
		properties: {
			en: {type: 'string', title: 'English', trim: true, default: ''},
			ur: {type: 'string', title: 'Urdu', trim: true, default: ''}
		},
		required: 'Please fill Video title',
		validate: multilangValidator
	},
	description: {
		type: Object,
		default: '',
		properties: {
			en: {type: 'string', title: 'English', trim: true, default: ''},
			ur: {type: 'string', title: 'Urdu', trim: true, default: ''}
		},
		required: 'Please fill Video description',
		validate: multilangValidator
	},
	keywords: [String],
	video_language: {
	  type: String,
		enum: ['English', 'Urdu'],
		default: 'Urdu'
	},
	seq: {
		type: Number,
		default: 0
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
	},
	embed: {
		type: Object,
		default: '',
		properties: {
			video: {type: 'string', title: 'Video' },
			thumb: {type: 'string', title: 'Thumbnail' },
			audio: {type: 'string', title: 'Audio' }
		},
		required: 'Please fill in embed details.',
		trim: true
	},
	categories: [String]
});

// Full-text search compound index.
VideoSchema.index({
	'title.en': 'text',
	'title.ur': 'text',
	'description.en': 'text',
	'description.ur': 'text',
	categories: 'text'
});

mongoose.model('Video', VideoSchema);
