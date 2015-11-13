'use strict';

angular.module('core')
    .service('MetaInformation', MetaInformation);

MetaInformation.$inject = ['$location'];
/*jshint latedef: nofunc */
function MetaInformation ($location) {
    var metaDescription = 'The Greatest Worldwide portal';
    var metaKeywords = '';
    return {
        metaDescription: function () {
            return metaDescription;
        },
        metaKeywords: function () {
            return metaKeywords;
        },
        getUrl: function () {
            return $location.absUrl();
        },
        reset: function () {
            metaDescription = '';
            metaKeywords = '';
        },
        setMetaDescription: function (newMetaDescription) {
            metaDescription = newMetaDescription;
        },
        appendMetaKeywords: function (newKeywords) {
            for (var key in newKeywords) {
                if (metaKeywords === '') {
                    metaKeywords += newKeywords[key].name;
                } else {
                    metaKeywords += ', ' + newKeywords[key].name;
                }
            }
        }
    };
}
