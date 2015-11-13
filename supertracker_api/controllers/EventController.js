/*
 * EventControler
 * Developed by Andy
 * 2015/10/09
 */
var mongoose = require('mongoose'),
    Event = require('../models/Event'),
    Device = require('../models/Device'),
    ObjectID=require('mongodb').ObjectID;


/**
 * Create a Event
 */
exports.create = function(req, res) {
    var appKey = req.param('appKey');
    var uniqueId = req.param('uniqueId');
    var eventName = req.param('eventName');
    var eventRevenue = req.param('eventRevenue');
    var networkCode = req.param('networkCode');
    var networkOfferId = req.param('networkOfferId');
    var isInstall = req.param('isInstall');


    var event = new Event({
        app_key: appKey,
        unique_id: uniqueId,
        event_name: eventName,
        event_revenue: eventRevenue,
        network_code: networkCode,
        network_offer_id: networkOfferId,
        is_install: isInstall

    });

    var o_id = new ObjectID(uniqueId);

    Device.find({ _id: o_id }, function(err, devices) {
        if(err) {
            res.jsonp({status: "Unique Id is Invalid"});
        } else {
            // check appkey is vaild or not
            if(appKey!=="5d83fs9e52d3fsd9e6d3f2hjk3u"){
                res.jsonp({status: "App Key is Invalid"});
            }
            else{
                //console.log(devices);
                //check unique is invaild or not
                if(devices.length == 0) {
                    res.jsonp({status: "Unique Id is Invalid"});
                } else {
                    //save device if the device is new
                    //console.log(event);
                    event.save(function(err, event){
                        if(err) {
                            console.log("Internal Error = ",err);
                            res.send(500);
                        } else {
                            res.jsonp({status: "OK", uniqueId: event.unique_id});
                        }
                    });
                }
            }

        }
    });

};
