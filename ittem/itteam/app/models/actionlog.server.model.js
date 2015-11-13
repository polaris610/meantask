'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Actionlog Schema
 */
var ActionlogSchema = new Schema({
	user: {
		type: String,
		trim: true
	},
	resource: {
		type: String,
		trim: true
	},
	action: {
		type: String,
		trim: true
	}
});

mongoose.model('Actionlog', ActionlogSchema);