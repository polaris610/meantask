'use strict';

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
 * Chapter schema
 */
var ChapterSchema = new Schema({});
ChapterSchema.add({
	title: {
		type: Object,
		properties: {
			en: {type: 'string', title: 'English', trim: true, default: ''},
			ur: {type: 'string', title: 'Urdu', trim: true, default: ''}
		},
		required: 'Please fill in chapter title',
		validate: multilangValidator
	},
	content: {
		type: Object,
		properties: {
			en: {type: 'string', title: 'English', trim: true, default: ''},
			ur: {type: 'string', title: 'Urdu', trim: true, default: ''}
		},
		required: 'Please fill in chapter content',
		validate: multilangValidator
	},
	subchapters: [ChapterSchema]
});

mongoose.model('Chapter', ChapterSchema);

/**
 * Book schema
 */
var BookSchema = new Schema({
	booklanguage: {
		type: Array,
		enum: ['English', 'Urdu']
	},
	title: {
		type: Object,
		default: '',
		properties: {
			en: {type: 'string', title: 'English', trim: true},
			ur: {type: 'string', title: 'Urdu', trim: true}
		},
		required: 'Please fill in book title',
		validate: multilangValidator
	},
	description: {
		type: Object,
		default: '',
		properties: {
			en: {type: 'string', title: 'English', trim: true},
			ur: {type: 'string', title: 'Urdu', trim: true}
		},
		required: 'Please fill in book description',
		validate: multilangValidator
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
	thumbnail: {
		type: 'String',
		title: 'Thumbnail'
	},
	chapters: [ChapterSchema],
	views: {
		type: Number,
		default: 0
	}
});

var BookModel = mongoose.model('Book', BookSchema);

// Full-text search compound index.
BookModel.collection.ensureIndex(
	{
		'title.en': 'text',
		'title.ur': 'text',
		'description.en': 'text',
		'description.ur': 'text',
		'chapters.title.en': 'text',
		'chapters.title.ur': 'text',
		'chapters.content.en': 'text',
		'chapters.content.ur': 'text',
		'chapters.subchapters.title.en': 'text',
		'chapters.subchapters.title.ur': 'text',
		'chapters.subchapters.content.en': 'text',
		'chapters.subchapters.content.ur': 'text'
	},
	{
		name: 'text_idx'
	},
	function (err) {
		if (err) console.log(err);
	}
);
