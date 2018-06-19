'use strict';

angular.module('bahmni.reports').factory('newreportinitialization',
    ['authenticator', 'appService', 'spinner', 'configurations','$rootScope',
        function (authenticator, appService, spinner, configurations, $rootScope) {
            return function (dept) {
                var initApp = function () {
                    $rootScope.dept=dept;
                };

                return spinner.forPromise(authenticator.authenticateUser()
                    .then(initApp));
            };
        }
    ]
);
