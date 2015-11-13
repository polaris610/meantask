/*
 * FunnelControler
 * Developed by Andy
 * 2015/10/09
 */
var mongoose = require('mongoose'),
    Funnel = require('../models/Funnel'),
    Device = require('../models/Device'),
    ObjectID=require('mongodb').ObjectID;

/**
 * Create a Funnel
 */
exports.create = function(req, res) {

    var countries = req.param('country');
    var appKey = req.param('appKey');
    var step = req.param('funnelStep');
    var isEmpty = req.param('isEmpty');
    var zipFileUrl = req.param('zipFileUrl');
    var frequency = req.param('frequency');
    var attempts = req.param('attempts');
    var androidPackage = req.param('androidPackage');
    var yesPlaceholder = req.param('yesPlaceholder');
    var noPlaceholder = req.param('noPlaceholder');
    var linkUrl = req.param('linkUrl');
    var offerId = req.param('offerId');
    var country = countries.split(",");
    var flag = [];
    var status = '';
    var i;

    if(appKey!=="5d83fs9e52d3fsd9e6d3f2hjk3u"){
        status = "Invalid App Key";
        flag = 1;
    }

    for (i = 0; i < country.length; i ++) {
        flag[country[i]] = 1;
    }


    Funnel.find({step:step}, function(err, funnels) {
        if (err) {
            status = '500';
            res.jsonp({status: status});
        } else {
            if (funnels.length == 0) {
                addFunnel();
            }else {
                console.log(funnels[0].country);
                console.log(flag[funnels[0].country]);
                for (i = 0; i < funnels.length; i ++) {
                    if (flag[funnels[i].country] == 1) {
                        break;
                    }
                }

                if (i == funnels.length) {
                    addFunnel();
                }else {
                    status = "Funnel Step already exists for "+ funnels[i].country+" country";
                    res.jsonp({status: status});
                }
            }
        }
    });


    function addFunnel() {
        for (i = 0; i < country.length; i++) {
            var funnel = new Funnel({
                country:country[i],
                step: step,
                isEmpty: isEmpty,
                zip_File_Url: zipFileUrl,
                frequency: frequency,
                attempts: attempts,
                android_Package: androidPackage,
                yes_Placeholder: yesPlaceholder,
                no_Placeholder: noPlaceholder,
                linkUrl: linkUrl,
                offerId: offerId

            });
            funnel.save(function(err, funnels){
                if(err) {
                    status = '500';
                }
            });
        }

        status = 'OK';
        res.jsonp({status: status});
    }
};
/**
 * Get a Funnel
 */
exports.get = function(req, res) {

    var country = req.param('country');
    var appKey = req.param('appKey');
    var status = '';

    if(appKey!=="5d83fs9e52d3fsd9e6d3f2hjk3u"){
        res.jsonp({status: "App Key is Invalid"});
    }
    Funnel.find({country:country}, function(err, funnels) {
        if(err) {
            console.log("Internal Error = ",err);
            status = '500';
        } else {
            if(funnels.length>0){
                res.jsonp({status: "Complete Funnel Step Data in Json, order by step number",data: funnels});
            }
            else{
                res.jsonp({status: "No Funnel Steps for given country"});
            }

        }

    });
}
/**
 * Remove a Funnel
 */
exports.remove = function(req, res) {

    var country = req.param('country');
    var appKey = req.param('appKey');
    var step = req.param('funnelStep');
    var i = 0;
    if(appKey!=="5d83fs9e52d3fsd9e6d3f2hjk3u"){
        res.jsonp({status: "App Key is Invalid"});
    }
    Funnel.findOneAndRemove({country:country,step:step}, function(err, funnels) {

        if(err) {
            console.log("Internal Error = ",err);
            status = '500';
        } else {
            console.log("get here ok");
            if(funnels){
                console.log('Funnel successfully deleted!');
                res.jsonp({status: "OK"});
            }
            else{
                res.jsonp({status: "Country Does Not Have This Funnel step"});
            }
        }
    });
}
/**
 * Update a Funnel
 */
exports.update = function(req, res) {

    var country = req.param('country');
    var appKey = req.param('appKey');
    var step = req.param('funnelStep');
    var isEmpty = req.param('isEmpty');
    var zipFileUrl = req.param('zipFileUrl');
    var frequency = req.param('frequency');
    var attempts = req.param('attempts');
    var androidPackage = req.param('androidPackage');
    var yesPlaceholder = req.param('yesPlaceholder');
    var noPlaceholder = req.param('noPlaceholder');
    var linkUrl = req.param('linkUrl');
    var offerId = req.param('offerId');

    if(appKey!=="5d83fs9e52d3fsd9e6d3f2hjk3u"){
        res.jsonp({status: "App Key is Invalid"});
    }
    Funnel.findOneAndUpdate({ country:country,step:step }, {
        isEmpty: isEmpty,
        zip_File_Url:zipFileUrl,
        frequency:frequency,
        attempts:attempts,
        android_Package:androidPackage,
        yes_Placeholder:yesPlaceholder,
        no_Placeholder:noPlaceholder,
        linkUrl:linkUrl
    }, function(err, funnels) {
        if(err) {
            console.log("Internal Error = ",err);

        } else {
            if(funnels){
                console.log('Funnel successfully Updated!');
                res.jsonp({status: "OK"});
            }
            else{
                res.jsonp({status: "Missing required information (app key, funnel step, Country)"});
            }
        }
    });
}

exports.getnextstep = function(req, res) {

    var uniqueId = req.param('uniqueId');
    var appKey = req.param('appKey');

    var o_id = new ObjectID(uniqueId);
    console.log(o_id);
    if(appKey!=="5d83fs9e52d3fsd9e6d3f2hjk3u"){
        res.jsonp({status: "App Key is Invalid"});
    }
    Device.find({ _id: o_id }, function(err, devices) {
        if(err) {
            console.log("Internal Error = ",err);
        } else {
            if(devices.length > 0) {
                var country = devices[0].country;
                console.log(country);

                Funnel.find({ country:country }, function(err, funnels) {
                    if(err) {
                        console.log("Internal Error = ",err);

                    } else {

                        if(funnels.length>0){
                            console.log(funnels[0].step);
                            var step = funnels[0].step;
                            step = parseInt(step) + 1;
                            console.log(step);
                            funnels[0].step = step;
                            funnels[0].save(function(err, funnels){
                                if(err) {
                                    console.log("Internal Error = ",err);
                                }
                                else{
                                    console.log('Funnel successfully Updated!');
                                    res.jsonp({status: "OK",Funnel:funnels});
                                }
                            });
                        } else{

                            var funnel = new Funnel({
                                country:country,
                                step: 0,
                                isEmpty: "TRUE",
                                zip_File_Url: "",
                                frequency: "",
                                attempts: "",
                                android_Package: "",
                                yes_Placeholder: "",
                                no_Placeholder: "",
                                linkUrl: "",
                                offerId: ""
                            });

                            funnel.save(function(err, funnels){
                                if(err) {
                                    console.log("Internal Error = ",err);
                                }else{
                                    res.jsonp({status: "OK",Funnel:funnels});
                                }
                            });

                        }

                    }
                });
            } else {
                res.jsonp({status: "Unique Id is Invalid"});
            }
        }
    });
}
