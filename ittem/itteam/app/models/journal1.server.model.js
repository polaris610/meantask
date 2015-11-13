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
 * Category schema
 */
var CategorySchema = new Schema({});
CategorySchema.add({
	title: {
		type: Object,
		properties: {
			en: {type: 'string', title: 'English', trim: true, default: ''},
			ur: {type: 'string', title: 'Urdu', trim: true, default: ''}
		},
		required: 'Please fill in category title',
		validate: multilangValidator
	},
	content: {
		type: Object,
		properties: {
			en: {type: 'string', title: 'English', trim: true, default: ''},
			ur: {type: 'string', title: 'Urdu', trim: true, default: ''}
		},
		required: 'Please fill in category content',
		validate: multilangValidator
	},
	subcategories: [CategorySchema]
});

mongoose.model('Category', CategorySchema);

/**
 * Journal1 schema
 */
var Journal1Schema = new Schema({
	month: {
		type: Number,
		default: 1
	},
	year: {
		type: Number,
		default: 2015
	},
	journal_status: {
		type: String,
		enum: ['draft', 'open', 'closed'],
		default: 'draft'
	},
	language: {
		type: Array,
		enum: ['English', 'Urdu']
	},
	author: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	article_title: {
		type: Object,
		default: '',
		properties: {
			en: {type: 'string', title: 'English', trim: true},
			ur: {type: 'string', title: 'Urdu', trim: true}
		},
		required: 'Please fill in article title',
		validate: multilangValidator
	},
	article_body: {
		type: Object,
		default: '',
		properties: {
			en: {type: 'string', title: 'English', trim: true},
			ur: {type: 'string', title: 'Urdu', trim: true}
		},
		required: 'Please fill in article description',
		validate: multilangValidator
	},
	categories: [CategorySchema],
	keywords: {
		type: String,
		default: ''
	},
	article_status: {
		type: String,
		enum: ['draft', 'open', 'closed'],
		default: 'draft'
	}
});

var Journal1Model = mongoose.model('Journal1', Journal1Schema);

// Full-text search compound index.
Journal1Model.collection.ensureIndex(
	{
		'article_title.en': 'text',
		'article_title.ur': 'text',
		'article_body.en': 'text',
		'article_body.ur': 'text',
		'categories.title.en': 'text',
		'categories.title.ur': 'text',
		'categories.content.en': 'text',
		'categories.content.ur': 'text',
		'categories.subcategories.title.en': 'text',
		'categories.subcategories.title.ur': 'text',
		'categories.subcategories.content.en': 'text',
		'categories.subcategories.content.ur': 'text'
	},
	{
		name: 'text_idx'
	},
	function (err) {
		if (err) console.log(err);
	}
);
