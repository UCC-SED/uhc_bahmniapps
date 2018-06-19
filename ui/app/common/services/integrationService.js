'use strict';
angular.module('bahmni.common.services')
    .factory('integrationService', ['$http', function ($http) {
        var v = 'custom:(uuid,strength,name,dosageForm,concept:(uuid,name,names:(name)))';

        var submitLabOrder = function (providerUuid, conceptUuid, patientUuid, locationUuid) {
            var url = Bahmni.Common.Constants.submitLabOrder;
            return $http.get(url, {
                params: {
                    conceptUuid: conceptUuid,
                    providerUuid: providerUuid,
                    patientUuid: patientUuid,
                    locationUuid: locationUuid
                }
            });
        };

        var submitDrugOrder = function (providerUuid, drugOrder, patientUuid, locationUuid) {
            return $http({
                method: 'POST',
                url: Bahmni.Common.Constants.submitDrugOrder,
                data: {
                    "providerUuid": providerUuid,
                    "drugOrder": drugOrder,
                    "patientUuid": patientUuid,
                    "locationUuid": locationUuid
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };

        var submitDisposition = function (providerUuid, patientUuid, dispositionNotes) {
            return $http({
                method: 'POST',
                url: Bahmni.Common.Constants.submitDisposition,
                data: {
                    "providerUuid": providerUuid,
                    "patientUuid": patientUuid,
                    "dispositionNotes": dispositionNotes
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };

        var submitDrug = function (providerUuid, conceptUuid) {
            var url = Bahmni.Common.Constants.submitLabOrder;
            return $http.get(url, {
                params: {
                    conceptUuid: conceptUuid,
                    providerUuid: providerUuid
                }
            });
        };

         var getGothomisUserID = function (username) {
         var url = Bahmni.Common.Constants.gothomisUserId;
                    var params = {
                        username: username
                    };

                    return $http.get(url, {
                        params: params,
                        withCredentials: true
                    });
                };

        return {
            submitLabOrder: submitLabOrder,
            submitDrug: submitDrug,
            submitDrugOrder: submitDrugOrder,
            submitDisposition: submitDisposition,
            getGothomisUserID :getGothomisUserID
        };
    }]);
