module.exports = function(app) {
	//event Routes
	var event = require('../controllers/EventController');
	app.get('/api/v1/addEvent', event.create);
};

