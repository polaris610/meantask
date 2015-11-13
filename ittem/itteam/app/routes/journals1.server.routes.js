'use strict';

module.exports = function (app) {
	var journals1 = require('../../app/controllers/journals1.server.controller');
	var ft = require('../../app/controllers/featured.server.controller');
	// Journal1 routes
	app.route('/api/journals1')
		.get(journals1.list)
		.post(journals1.create, ft.update);
	app.route('/api/journals1/:journal1Id')
		.get(journals1.canAccessJournal1, journals1.read)
		.post(journals1.canModifyJournal1, journals1.addContent)
		.put(journals1.canModifyJournal1, journals1.update, ft.update)
		.delete(journals1.delete);
	// Bind Journal1 middleware
	app.param('journal1Id', journals1.journal1ByID);

	app.route('/api/authors')
		.get(journals1.authors);
};
