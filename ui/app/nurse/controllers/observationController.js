"use strict";

angular.module('bahmni.nurse').controller('ObservationController', ['$scope', '$rootScope', '$stateParams', '$state', '$q', 'patientContext', 'orderService', 'observationService',
    'orderTypeService', 'sessionService', 'encounterService', 'spinner', 'messagingService', 'appService', '$anchorScroll', 'nurseObservationConfig', 'contextChangeHandler', '$bahmniCookieStore', 'offlineService',
    function($scope, $rootScope, $stateParams, $state, $q, patientContext, orderService, observationService,
        orderTypeService, sessionService, encounterService, spinner, messagingService, appService, $anchorScroll, nurseObservationConfig, contextChangeHandler, $bahmniCookieStore, offlineService) {
        $scope.patient = patientContext.patient;
        // $scope.formName = $stateParams.orderType + Bahmni.Common.Constants.fulfillmentFormSuffix;
        $scope.nurseObservationConfig = nurseObservationConfig;
        $scope.orderType = $stateParams.orderType;
        $scope.openStatus = true;
        $scope.nextPageLoading = false;
        var configs = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
        var allConceptSections = [];
        var selectedProvider = $rootScope.currentProvider;
        $scope.orders = [];
        var regEncounterTypeUuid = $rootScope.encounterConfig.encounterTypes[Bahmni.Common.Constants.consultationEncounterType];
        var locationUuid = sessionService.getLoginLocationUuid();

        var getActiveEncounter = function() {
            var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
            return encounterService.find({
                patientUuid: $scope.patient.uuid,
                providerUuids: !_.isEmpty(currentProviderUuid) ? [currentProviderUuid] : null,
                includeAll: Bahmni.Common.Constants.includeAllObservations,
                locationUuid: sessionService.getLoginLocationUuid(),
                encounterTypeUuids: [regEncounterTypeUuid]
            }).then(function(encounterTransactionResponse) {
                $scope.encounter = encounterTransactionResponse.data;
                $scope.observations = encounterTransactionResponse.data.observations;
                return $scope.encounter;
            });
        };

        $scope.getOrders = function() {
            var patientUuid = patientContext.patient.uuid;
            $scope.orderTypeUuid = orderTypeService.getOrderTypeUuid($stateParams.orderType);
            var includeObs = false;
            var params = {
                patientUuid: patientUuid,
                orderTypeUuid: $scope.orderTypeUuid,
                conceptNames: $scope.config.conceptNames,
                includeObs: includeObs,
                numberOfVisits: $scope.config.numberOfVisits,
                obsIgnoreList: $scope.config.obsIgnoreList,
                visitUuid: $scope.visitUuid,
                orderUuid: $scope.orderUuid,
                locationUuids: $rootScope.facilityLocationUuids
            };
            return orderService.getOrders(params).then(function(response) {
                var data = response.data;
                $scope.orders.push.apply($scope.orders, data);
                $scope.orders.forEach(function(order) {
                    order.bahmniObservations = _.filter($scope.encounter.observations, function(observation) {
                        return observation.orderUuid === order.orderUuid;
                    });
                    if (order.bahmniObservations.length > 0) {
                        order.showForm = true;
                    }
                });
            });
        };
        $scope.toggleShowOrderForm = function(obs) {
            obs.showForm = !obs.showForm;
        };

        var getObservationsForTemplate = function(template) {
            return _.filter($scope.consultation.observations, function(observation) {
                return !observation.formFieldPath && observation.concept.uuid === template.uuid;
            });
        };

        var init = function() {
            $scope.nurseObservationConfig.forEach(function(nurseObservationConfig) {
                nurseObservationConfig.showForm = false;
            });
            return getActiveEncounter().then($scope.getOrders);

        };

        $scope.$on("event:saveObservations", function() {
            return save().then(afterSave);
        });


        spinner.forPromise(init());
        $scope.config = $scope.fulfillmentConfig || {};
        $anchorScroll();

        $scope.isFormValid = function() {
            var contxChange = contextChangeHandler.execute();
            var shouldAllow = contxChange["allow"];
            if (!shouldAllow) {
                var errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"] : "{{'ORDERS_FORM_ERRORS_MESSAGE_KEY' | translate }}";
                messagingService.showMessage('error', errorMessage);
            }
            return shouldAllow;
        };




        var afterSave = function() {
            var forwardUrl = appService.getAppDescriptor().getConfigValue("afterVisitSaveForwardUrl");
            if (forwardUrl != null) {
                $window.location.href = appService.getAppDescriptor().formatUrl(forwardUrl, {
                    'patientUuid': patientUuid
                });
            } else {
                $state.transitionTo($state.current, $state.params, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            }
            messagingService.showMessage('info', 'CONSULTATION_LABEL_SAVED');
        };


        var save = function() {

            $scope.encounter = {
                patientUuid: $scope.patient.uuid,
                locationUuid: locationUuid,
                encounterTypeUuid: regEncounterTypeUuid,
                orders: [],
                drugOrders: [],
                extensions: {}
            };

            $bahmniCookieStore.put(Bahmni.Common.Constants.grantProviderAccessDataCookieName, selectedProvider, {
                path: '/',
                expires: 1
            });

            $scope.encounter.observations = $scope.observations;

            $scope.encounter.observations = new Bahmni.Common.Domain.ObservationFilter().filter($scope.encounter.observations);

            var createPromise = offlineService.isOfflineApp() ? encounterPromise() : encounterService.create($scope.encounter);
            spinner.forPromise(createPromise);
            return createPromise;
        };


    }
]);