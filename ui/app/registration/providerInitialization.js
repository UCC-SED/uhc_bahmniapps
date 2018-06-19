'use strict';

angular.module('bahmni.registration').factory('providerInitialization',
    [ 'providerService', 'appService', 'spinner', '$q',
        function (providerService, appService, spinner, $q) {
            return function () {
                var init = function () {
                    var promises = [];
                    var config = {};
                    promises.push( getAllProviders());

                    return spinner.forPromise($q.all(promises).then(function (results) {
                        config.providers = results[0];
                        return config;
                    }));
                };


                var getAllProviders = function () {
                    var params = {v: "custom:(display,person,uuid)"};
                    return providerService.list(params).then(function (response) {
                        return _.uniqBy(response.data.results, function (result) {
                            return result.person && result.person.display;
                        });
                    });
                };


                return init();
            };
        }]
);
