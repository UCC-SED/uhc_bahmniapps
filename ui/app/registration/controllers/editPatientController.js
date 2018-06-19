'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', 'patientService', 'encounterService', '$stateParams', 'openmrsPatientMapper', '$window', '$q', 'spinner', 'appService', 'messagingService', '$rootScope','providerConfig', 'ngDialog','locationConfig',
        function ($scope, patientService, encounterService, $stateParams, openmrsPatientMapper, $window, $q, spinner, appService, messagingService, $rootScope,providerConfig, ngDialog, locationConfig) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var uuid = $stateParams.patientUuid;
            $scope.patient = {};
            $scope.actions = {};
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.disablePhotoCapture = appService.getAppDescriptor().getConfigValue("disablePhotoCapture");
            $scope.patientAttendanceMode = appService.getAppDescriptor().getConfigValue("patientAttendanceMode");
            $scope.providerConfig = providerConfig;
            $scope.locationConfig = locationConfig;
            $scope.today = dateUtil.getDateWithoutTime(dateUtil.now());
            $scope.emergencyRegistration=false;

               $scope.copyNHIFDetails = function ()
                        {
                          $scope.patient.birthdate = angular.copy(new Date( $scope.verificationResults.DateOfBirth));
                          $scope.patient.givenName = angular.copy( $scope.verificationResults.FirstName);
                          $scope.patient.middleName = angular.copy($scope.verificationResults.MiddleName);
                          $scope.patient.familyName = angular.copy($scope.verificationResults.LastName);
                          $scope.patient.gender = angular.copy(($scope.verificationResults.Gender).charAt(0));
                     };

                        $scope.validateNHIF = function ()
                        {
                        console.log($scope.patient.insuranceIdentification);
                        spinner.forPromise(patientService.validateInsuranceCard
                        ($scope.patient.insuranceIdentification, Bahmni.Common.Constants.normalNHIFVisit, "" ).then(function (response) {
                          console.log(response );
                          console.log(response.data.AuthorizationStatus );
                          console.log(response.data );
                           $scope.verificationResults = response.data;

                           ngDialog.open({
                                template: 'views/insuranceStatusModal.html',
                                scope: $scope
                                });
                                 return;

                         }
                        ))};


            var setReadOnlyFields = function () {
                $scope.readOnlyFields = {};
                var readOnlyFields = appService.getAppDescriptor().getConfigValue("readOnlyFields");
                angular.forEach(readOnlyFields, function (readOnlyField) {
                    if ($scope.patient[readOnlyField]) {
                        $scope.readOnlyFields[readOnlyField] = true;
                    }
                });
            };

            var successCallBack = function (openmrsPatient) {
                $scope.openMRSPatient = openmrsPatient["patient"];
                $scope.patient = openmrsPatientMapper.map(openmrsPatient);
                setReadOnlyFields();
                expandDataFilledSections();
                $scope.patientLoaded = true;
            };

            var expandDataFilledSections = function () {
                angular.forEach($rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections(), function (section) {
                    var notNullAttribute = _.find(section && section.attributes, function (attribute) {
                        return $scope.patient[attribute.name] !== undefined;
                    });
                    section.expand = section.expanded || (notNullAttribute ? true : false);
                });
            };

            (function () {
                var getPatientPromise = patientService.get(uuid).then(successCallBack);

                var isDigitized = encounterService.getDigitized(uuid);
                isDigitized.then(function (data) {
                    var encountersWithObservations = data.data.results.filter(function (encounter) {
                        return encounter.obs.length > 0;
                    });
                    $scope.isDigitized = encountersWithObservations.length > 0;
                });

                spinner.forPromise($q.all([getPatientPromise, isDigitized]));
            })();

            $scope.update = function () {
                addNewRelationships();
                var errorMessages = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
                if (errorMessages.length > 0) {
                    errorMessages.forEach(function (errorMessage) {
                        messagingService.showMessage('error', errorMessage);
                    });
                    return $q.when({});
                }

                return spinner.forPromise(patientService.update($scope.patient, $scope.openMRSPatient).then(function (result) {
                    var patientProfileData = result.data;
                    if (!patientProfileData.error) {
                        successCallBack(patientProfileData);
                        $scope.actions.followUpAction(patientProfileData);
                    }
                }));
            };

            var addNewRelationships = function () {
                var newRelationships = _.filter($scope.patient.newlyAddedRelationships, function (relationship) {
                    return relationship.relationshipType && relationship.relationshipType.uuid;
                });
                newRelationships = _.each(newRelationships, function (relationship) {
                    delete relationship.patientIdentifier;
                    delete relationship.content;
                    delete relationship.providerName;
                });
                $scope.patient.relationships = _.concat(newRelationships, $scope.patient.deletedRelationships);
            };

            $scope.isReadOnly = function (field) {
                return $scope.readOnlyFields ? ($scope.readOnlyFields[field] ? true : false) : undefined;
            };

            $scope.afterSave = function () {
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
            };
        }]);
