var db = require('../controllers/db');
var collectionName = 'TrafficSources';

exports.addSource = function (req, res) {
  if (req.body) {
		strParam = req.params.param;
		var re = new RegExp('=', 'g');
		strParam = strParam.replace(re, '":');
		re = new RegExp('&', 'g');
		strParam = strParam.replace(re, ',"');
		strParam = '{"' + strParam + '}';
		value = JSON.parse(strParam);

		db.postAndReturn(value, collectionName, function (err, newEntry) {
			if (err) {
				res.send(500, 'API Error: ' + err.toString());
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


exports.updateSource = function (req, res) {
  if (req.body) {
		var strParam = req.params.param;		
		var strValues = strParam.split('&');
		var condition;
		
		strParam = '{';
		for (var nI = 0; nI < strValues.length; nI++) {
			var key = strValues[nI].split('=')[0];
			var value = strValues[nI].split('=')[1];
			if (key == 'sourceKey') {
				var strtemp = '{"' + key + '":' + value + '}';
				condition = JSON.parse(strtemp);
			}
			strParam = strParam + '"' + key + '":' + 	value + ',';
		}
		strParam = strParam.substr(0, strParam.length - 1);
		strParam = strParam + '}';
		var param = JSON.parse(strParam);
		
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
