/*
 * Event models
 * Developed by Andy
 * 2015/10/9
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema ({
    app_key: {type: String},
    unique_id: { type: String},
    event_name: {type: String},
    event_revenue: {type: String},
    network_code: {type: String},
    network_offer_id: {type: Number},
    is_install: {type: Boolean}
});

var Event = mongoose.model('Event',eventSchema);
module.exports = Event;

