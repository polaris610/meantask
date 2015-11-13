'use strict';

module.exports = function (app) {
    var ft = require('../../app/controllers/featured.server.controller');

    // Blog routes
    app.route('/api/featured')
        .get(ft.get);
};
