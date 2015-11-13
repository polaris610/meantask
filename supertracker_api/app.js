var http = require('http'),
    path = require('path');

var express = require('express'),
    app = express(),
    server = require('http').createServer(app);


// Here's how I like to structure app.js...

var controllers = {
  db: require('./controllers/db')
};

var routes = {
  index: require('./routes/index'), // I put routes to Jade templates in here...
  customer: require('./routes/customer-route'), // ...and each API endpoint gets a seperate route.js
  app: require('./routes/app-route'), // ...and each API endpoint gets a seperate route.js
  source: require('./routes/source-route'), // ...and each API endpoint gets a seperate route.js
  campaign: require('./routes/campaign-route'), // ...and each API endpoint gets a seperate route.js
  event: require('./routes/event-route'), // ...and each API endpoint gets a seperate route.js
  traffic: require('./routes/traffic-route') // ...and each API endpoint gets a seperate route.js
};

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  //app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

var mongoose = require('mongoose');
mongoose.connect('mongodb://dev.db.supertracker.mobi:27017/supertracker');

/*device route define*/
require('./routes/device-route')(app);
require('./routes/event-route')(app);
require('./routes/funnel-route')(app);


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.configure('development', function () {
  app.use(express.errorHandler());
});

// Again, these are Jade templates/HTML/whatnot

app.get('/', routes.index.home);
app.get('/morecontent', routes.index.moreContent);

// API endpoints!

app.get('/api/v1/addCustomer', 		routes.customer.addCustomer);
app.get('/api/v1/updateCustomer/:param', routes.customer.updateCustomer);
app.get('/api/v1/getCustomer/:customerKey', 	routes.customer.getCustomer);
app.get('/api/v1/getAllCustomers', 	routes.customer.getAllCustomers);

app.get('/api/v1/addApp/:param',						routes.app.addApp);
app.get('/api/v1/activeApp', 				routes.app.activeApp);
app.get('/api/v1/updateApp/:param', 				routes.app.updateApp);
app.get('/api/v1/getApp/:appKey', 	routes.app.getApp);
app.get('/api/v1/getAllApps', 			routes.app.getAllApps);

app.get('/api/v1/addSource', 		routes.source.addSource);
app.get('/api/v1/updateSource', routes.source.updateSource);


app.get('/api/v1/addCampaign', 		routes.campaign.addCampaign);
app.get('/api/v1/updateCampaign', routes.campaign.updateCampaign);

/*app.get('/api/v1/addDevice', 			routes.device.addDevice);

 app.get('/api/v1/addEvent', 			routes.event.addEvent);*/

server.listen(app.get('port'));

console.log("Server started on port",app.get('port'));