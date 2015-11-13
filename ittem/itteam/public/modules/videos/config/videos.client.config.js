'use strict';

// Configuring the Articles module
angular.module('videos')

	.run(['editableOptions',
		function (editableOptions) {
			editableOptions.theme = 'bs3';
		}])

	//.run(['Menus',
		//function(Menus) {
		//	// Set top bar menu items
		//	Menus.addMenuItem('topbar', 'Videos', 'videos', 'dropdown', '/videos(/create)?', false, ['editor']);
		//	Menus.addSubMenuItem('topbar', 'videos', 'List Videos', 'videos');
		//	Menus.addSubMenuItem('topbar', 'videos', 'New Video', 'videos/create');
		//}])
	;
