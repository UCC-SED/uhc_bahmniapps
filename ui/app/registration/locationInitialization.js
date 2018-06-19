'use strict';

angular.module('bahmni.registration').factory('locationInitialization',
    [ 'locationService', 'appService', 'spinner', '$q',
        function (locationService, appService, spinner, $q) {
            return function () {
                var init = function () {
                    var promises = [];
                    var config = {};
                    promises.push( getAllDoctorRooms());

                    return spinner.forPromise($q.all(promises).then(function (results) {
                        config.locations = results[0];
                        return config;
                    }));
                };


                var getAllDoctorRooms = function () {
                    return locationService.getAllByTag("Doctors Room") .then(function (response) {
                        return _.uniqBy(response.data.results, function (result) {
                            return result;
                        });
                    });
                };


                return init();
            };
        }]
);
