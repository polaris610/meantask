'use strict';

angular.module('core')
    .service('GetterFromServer', GetterFromServer);

GetterFromServer.$inject = ['$http'];
/*jshint latedef: nofunc */
function GetterFromServer ($http) {
    return {
        about: getAbout,
        featured: getFeatured
    };

    function getAbout () {
        return $http.get('/api/getAbout')
            .success(function (data) {
                return data;
            })
            .error(function (err) {
                console.log(err);
            });
    }

    function getFeatured (content) {
        return $http.get('/api/featured?content=' + content)
            .success(function (data) {
                return data;
            })
            .error(function (err) {
                console.log(err);
            });
    }
}
