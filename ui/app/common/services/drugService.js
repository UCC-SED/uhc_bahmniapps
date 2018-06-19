'use strict';
angular.module('bahmni.common.services')
    .factory('drugService', ['$http', function ($http) {
        var v = 'custom:(uuid,strength,name,dosageForm,concept:(uuid,name,names:(name)))';
        var search = function (drugName, conceptUuid) {
            var params = {
                v: v,
                q: drugName,
                conceptUuid: conceptUuid,
                s: "ordered"
            };
            return $http.get(Bahmni.Common.Constants.drugUrl, {
                method: "GET",
                params: params,
                withCredentials: true
            }).then(function (response) {
                return response.data.results;
            });
        };

        var getDrugStockStatus = function (drugName, drugUuid, gothomisIntegrationStatus, currentProviderUuid) {
            if (gothomisIntegrationStatus) {
                var url = Bahmni.Common.Constants.gothomisDrugStockUrl;
                return $http.get(url, {
                    params: {
                        drugUuid: drugUuid,
                        providerUuid: currentProviderUuid
                    }
                });
            } else {
                var url = Bahmni.Common.Constants.localDrugStockUrl;
                return $http.get(url, {
                    params: {
                        drugName: drugName
                    }
                });
            }
        };


         var updateDeliveryOrder = function (drugName, patientUuid) {
                        var url = Bahmni.Common.Constants.updateDeliveryOrder;
                        return $http.get(url, {
                            params: {
                                drugName: drugName,
                                patientIdentifier: patientUuid
                            }
                        });

                };

        var getSetMembersOfConcept = function (conceptSetFullySpecifiedName, searchTerm) {
            return $http.get(Bahmni.Common.Constants.drugUrl, {
                method: "GET",
                params: {
                    v: v,
                    q: conceptSetFullySpecifiedName,
                    s: "byConceptSet",
                    searchTerm: searchTerm
                },
                withCredentials: true
            }).then(function (response) {
                return response.data.results;
            });
        };

        var getRegimen = function (patientUuid, patientProgramUuid, drugs) {
            var params = {
                patientUuid: patientUuid,
                patientProgramUuid: patientProgramUuid,
                drugs: drugs
            };

            return $http.get(Bahmni.Common.Constants.bahmniRESTBaseURL + "/drugOGram/regimen", {
                params: params,
                withCredentials: true
            });
        };

        return {
            search: search,
            getRegimen: getRegimen,
            getSetMembersOfConcept: getSetMembersOfConcept,
            getDrugStockStatus: getDrugStockStatus,
            updateDeliveryOrder: updateDeliveryOrder
        };
    }]);
