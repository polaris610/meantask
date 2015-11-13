/*
* DeviceControler
* Developed by Andy
* 2015/10/08
*/

var mongoose = require('mongoose'),
    Device = require('../models/Device')


/**
 * Create a Device
 */
exports.create = function(req, res) {
    var androidId = req.param('androidId');
    var language = req.param('language');
    var latitude = req.param('latitude');
    var longitude = req.param('longitude');
    var country = req.param('country');
    var os = req.param('os');
    var model = req.param('model');
    var manufacturer = req.param('manufacturer');
    var macAddress = req.param('macAddress');
    var serial = req.param('serial');
    var carrier = req.param('carrier');
    var appKey = req.param('appKey');
    var currentDate = new Date();

    var device = new Device({
        app_key: appKey,
        android_id: androidId,
        language: language,
        latitude: latitude,
        longitude: longitude,
        country: country,
        os: os,
        model: model,
        manufacturer: manufacturer,
        mac_address: macAddress,
        serial: serial,
        carrrier: carrier,
        install_date: currentDate
    });

    Device.find({ android_id: androidId }, function(err, devices) {
        if(err) {
            res.send(500);
        } else {
            // check appkey is vaild or not
            if(appKey!=="5d83fs9e52d3fsd9e6d3f2hjk3u"){
                res.jsonp({status: "Invalid App Key"});
            }
            else{
		        //console.log(devices._id);
                //check device is already exist or not
                if(devices.length > 0) {
                    res.jsonp({status: "Device Already Installed", uniqueId: devices[0]._id});
                } else {
                    //save device if the device is new
                    device.save(function(err, device){
                        if(err) {
                            console.log("Internal Error = ",err);
                            res.send(500);
                        } else {
                            res.jsonp({status: "OK",uniqueId: device._id});
                        }
                    });
                }
            }

        }
    });

};
