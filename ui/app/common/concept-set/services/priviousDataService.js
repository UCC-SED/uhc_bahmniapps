'use strict';

angular.module('bahmni.common.conceptSet')
    .service('priviousDataService', ['$q', '$http', function ($q, $http) {
        var getPriviousData = function (patientUuid, conceptName) {
                    var params = {
                        patientUuid: patientUuid,
                        concept: conceptName
                    };
                    return $http.get(Bahmni.Common.Constants.observationsUrl, {params: params});
                };

                 return {
                            getPriviousData: getPriviousData,

                        };
    }]);
