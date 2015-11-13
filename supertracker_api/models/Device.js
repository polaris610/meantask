/*
 * Device models
 * Developed by Andy
 * 2015/10/9
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deviceSchema = new Schema ({
    app_key: {type: String},
    android_id: {type: String},
    install_date: {type: Date},
    language: {type: String},
    latitude: {type: String},
    longitude: {type: String},
    country: {type: String},
    os: {type: String},
    model: {type: String},
    manufacturer: {type: String},
    mac_address: {type: String},
    serial: {type: String},
    carrrier: {type: String}
});

var Device = mongoose.model('Device',deviceSchema);
module.exports = Device;

