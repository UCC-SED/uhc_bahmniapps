'use strict';

angular.module('bahmni.nurse')
    .factory('nurseObservationConfig', ['conceptSetService',
        function (conceptSetService) {
            return function (formName) {
                return conceptSetService.getConcept({
                    name: formName,
                    v: Bahmni.Common.Constants.conceptSetRepresentationForOrderFulfillmentConfig
                }).then(function (response) {
                    var config = {};
                    var formMembers = response.data.results[0].setMembers;
                    return formMembers;
                    config.conceptNames = _.map(formMembers, function (concept) {
                        return concept.name.name;
                    });
                    config.isObservation = true;
                    config.showDetailsButton = true;
                    config.hideIfEmpty = false;
                    config.showHeader = false;
                    config.scope = "latest";
                    return config;
                });
            };
        }
    ]
);
