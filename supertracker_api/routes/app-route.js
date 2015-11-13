var db = require('../controllers/db');
var collectionName = 'Apps';

exports.getApp = function (req, res) {
  var queryType = req.route.path.replace('/','').split("/")[2];
  db.getOneAndReturn(req.params.id, queryType, function (err, result) {
    if (err) {
      res.send(500, 'API Error: ' + err.toString());
    }
    else {
      res.send(200, result);
    }
  });
};

exports.addApp = function (req, res) {
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

exports.activeApp = function (req, res) {
  if (req.body) {
    if (req.headers['content-type'].indexOf('application/json') === -1) {
      res.send(400, 'API Error: We only accept requests with MIME type application/json');
    }
    else {
      var queryType = req.route.path.replace('/','').split("/")[2];
      db.postAndReturn(req.body, queryType, function (err, newEntry) {
        if (err) {
          res.send(500, 'API Error: ' + err.toString());
        }
        else {
          res.send(201, newEntry);
        }
      });
    }
  }
  else {
    res.send(400, 'API Error: No request.');
  }
};

exports.getAllApps = function (req, res) {
  if (req.query.q) {
		
    var queryType = req.route.path.replace('/','').split("/")[2];
		queryType = 'Apps';
    db.getSelection(req.query.q, queryType, function (err, result) {
      if (err) {
        res.send(500, 'API Error: ' + err.toString());
      }
      else {
        res.send(200, result);
      }
    });
  }
  else {
    res.send(400, 'API Error: We need a query string with the number of results you want back, e.g. /jobs/?q=5');
  }
};

exports.updateApp = function (req, res) {
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
