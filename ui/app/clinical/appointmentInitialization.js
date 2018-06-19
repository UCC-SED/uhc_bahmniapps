'use strict';

angular.module('bahmni.clinical').factory('appointmentInitialization',
    [ 'appointmentsService', 'appService', 'spinner','$q',
        function (appointmentsService, appService, spinner, $q) {
            return function () {
                var init = function () {
                    var promises = [];
                    var config = {};
                    promises.push( getAllAppointmentService());
                    return spinner.forPromise($q.all(promises).then(function (results) {
                      config.services = results[0].data;
                      console.log(results[0].data[0].name);
                         return results[0].data[0].name;
                        }));
                };

                var getAllAppointmentService = function () {
                    return appointmentsService.getAllServicesWithServiceTypes()
                };

                return init();
            };
        }]
);
