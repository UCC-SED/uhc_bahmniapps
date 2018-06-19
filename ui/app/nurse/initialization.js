'use strict';

angular.module('bahmni.nurse')
.factory('initialization', ['$rootScope', '$q', 'appService', 'spinner', 'configurations', 'orderTypeService', 'locationService','mergeService', 'offlineService',
    function ($rootScope, $q, appService, spinner, configurations, orderTypeService, locationService, mergeService, offlineService) {
        var getConfigs = function () {
            var config = $q.defer();
            var configNames = ['encounterConfig', 'patientConfig', 'genderMap', 'relationshipTypeMap'];
            configurations.load(configNames).then(function () {
                var conceptConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI");
                var customLocationTags = _.get(conceptConfig, 'facilityLocationTags');
                var hasCustomLocationTags = !_.isEmpty(customLocationTags);
                if (hasCustomLocationTags) {
                    getLocationUuidsFromLocationTags(customLocationTags);
                }
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                $rootScope.patientConfig = configurations.patientConfig();
                $rootScope.genderMap = configurations.genderMap();
                $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                config.resolve();
            });
            return config.promise;
        };

    var mergeFormConditions = function () {
                var formConditions = Bahmni.ConceptSet.FormConditions;
                console.log(formConditions);
                if (formConditions) {
                    formConditions.rules = mergeService.merge(formConditions.rules, formConditions.rulesOverride);
                }
            };

        var getLocationUuidsFromLocationTags = function (tags) {
            $rootScope.facilityLocationUuids = [];
            return locationService.getAllByTag(tags, "ANY").then(function (response) {
                $rootScope.facilityLocationUuids = _.map(response.data.results, function (location) {
                    return location.uuid;
                });
            });
        };

        var initApp = function () {
            return appService.initApp('nurse', {'app': true, 'extension': true });
        };



        return spinner.forPromise(initApp()
        .then(getConfigs())
        .then(orderTypeService.loadAll())
        .then(mergeFormConditions()));
    }
]);
