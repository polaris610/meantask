var db = require('../controllers/db');
var	collectionName="Campaigns";
exports.addCampaign = function (req, res) {
  if (req.body) {
		var strParam = req.params.param;		
		var strValues = strParam.split('&');
		var condition;
		strParam = '{';
		for (var nI = 0; nI < strValues.length; nI++) {
			var key = strValues[nI].split('=')[0];
			var value = strValues[nI].split('=')[1];
			strParam = strParam + '"' + key + '":' + 	value + ',';
		}
		strParam = strParam.substr(0, strParam.length - 1);
		strParam = strParam + '}';
		var param = JSON.parse(strParam);
		
		db.postAndReturn(param, collectionName, function (err, newEntry) {
			if (err) {
				res.send(501, 'API Error: ' + err.toString());
			}
			else {
				res.send(201, newEntry);
			}
		});
  }
  else {
    res.send(400, 'API Error: No request.');
  }
};

exports.updateCampaign = function (req, res) {
  if (req.body) {
		var strParam = req.params.param;		
		var strValues = strParam.split('&');
		var condition;
		
		strParam = '{';
		for (var nI = 0; nI < strValues.length; nI++) {
			var key = strValues[nI].split('=')[0];
			var value = strValues[nI].split('=')[1];
			if (key == 'appKey') {
				var strtemp = '{"' + key + '":' + value + '}';
				condition = JSON.parse(strtemp);
			}
			strParam = strParam + '"' + key + '":' + 	value + ',';
		}
		
		strParam = strParam.substr(0, strParam.length - 1);
		strParam = strParam + '}';
		param = JSON.parse(strParam);
				
		db.updateAndReturn(condition, param, collectionName, function (err, result) {
			if (err) {
				res.send(500, 'API Error: ' + err.toString());
			}
			else if (result === 0) {
				res.send(500, 'API Error: No data was updated.');
			}
			else {
				res.send(200,'Updated');
			}
		});
  }
  else {
    res.send(400, 'API Error: No request.');
  }
};
