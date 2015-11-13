/*
 * Funnel models
 * Developed by Andy
 * 2015/10/12
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var funnelSchema = new Schema ({
    country: {type: String},
    step: {type: String},
    isEmpty: {type: String},
    zip_File_Url: {type: String},
    frequency: {type: String},
    attempts: {type: String},
    android_Package: {type: String},
    yes_Placeholder: {type: String},
    no_Placeholder: {type: String},
    linkUrl: {type: String},
    offerId: {type: String}
});

var Funnel = mongoose.model('Funnel',funnelSchema);
module.exports = Funnel;

