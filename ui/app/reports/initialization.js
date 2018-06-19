'use strict';

angular.module('bahmni.reports').factory('initialization',
    ['authenticator', 'appService', 'spinner', 'configurations','$rootScope',
        function (authenticator, appService, spinner, configurations, $rootScope) {
            return function (appName) {
                var loadConfigPromise = function () {
                    return configurations.load([]);
                };
                var initApp = function () {
                    return appService.initApp(appName || 'reports', {'app': true, 'extension': true }, null, ["reports"]);
                };

                return spinner.forPromise(authenticator.authenticateUser()
                    .then(initApp)
                    .then(loadConfigPromise));
            };
        }
    ]
);
