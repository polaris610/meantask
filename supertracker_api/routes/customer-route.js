var db = require('../controllers/db');
var collectionName = 'Customers';

exports.getCustomer = function (req, res) {
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

exports.addCustomer = function (req, res) {
  if (req.body) {
		queryType="customers";
		strParam = req.params.param;
		var re = new RegExp('=', 'g');
		strParam = strParam.replace(re, '":');
		re = new RegExp('&', 'g');
		strParam = strParam.replace(re, ',"');
		strParam = '{"' + strParam + '}';
		value = JSON.parse(strParam);
		
		db.postAndReturn(value, queryType, function (err, newEntry) {
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

exports.getAllCustomers = function (req, res) {
  if (req.query.q) {
		
    var queryType = req.route.path.replace('/','').split("/")[2];
		queryType = 'customers';
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

exports.updateCustomer = function (req, res) {
  if (req.body) {
 		var strParam = req.params.param;
		var strValues = strParam.split('&');
		var condition;
		
		for (var nI = 0; nI < strValues.length; nI++) {
			var key = strValues[nI].split('=')[0];
			var value = strValues[nI].split('=')[1];
			if (key == 'customerKey') {
				var strtemp = '{"' + key + '":' + value + '}';
				condition = JSON.parse(strtemp);
			}
		}

		var re = new RegExp('=', 'g');
		strParam = strParam.replace(re, '":');
		re = new RegExp('&', 'g');
		strParam = strParam.replace(re, ',"');
		strParam = '{"' + strParam + '}';
		value = JSON.parse(strParam);		
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
