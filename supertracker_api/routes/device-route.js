module.exports = function(app) {
	//User Routes
	var device = require('../controllers/DeviceController');
	app.get('/api/v1/addDevice', device.create);
};
