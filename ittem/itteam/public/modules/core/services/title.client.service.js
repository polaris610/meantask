'use strict';
angular.module('core')
    .service('PageTitle', function() {
        var title = '';
        return {
            title: function() { return title; },
            setTitle: function(newTitle) {
                title = newTitle;
            }
        };
    });

