module.exports = function(app) {
    //Funnel Routes
    var funnel = require('../controllers/FunnelController');
    app.get('/api/v1/addFunnelStep', funnel.create);
    app.get('/api/v1/listFunnelStep', funnel.get);
    app.get('/api/v1/removeCountryFunnelStep', funnel.remove);
    app.get('/api/v1/updateFunnelStep', funnel.update);
    app.get('/api/v1/GetNextFunnelStep', funnel.getnextstep);
};
