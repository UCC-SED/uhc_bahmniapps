'use strict';

angular.module('bahmni.common.conceptSet')
    .service('resultMapService', ['$q', '$http', function ($q, $http) {
        var getResultData = function (patientUuid, conceptName) {
                    var params = {
                        patientUuid: patientUuid,
                        concept: conceptName,
                        revision: "latest"
                    };
                    return $http.get(Bahmni.Common.Constants.observationsUrl, {params: params});
                };

                 return {
                            getResultData: getResultData,

                        };
    }]);
