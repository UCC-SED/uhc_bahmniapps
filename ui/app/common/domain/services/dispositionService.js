'use strict';

angular.module('bahmni.common.domain')
    .factory('dispositionService', ['$http', function ($http) {
        var getDispositionActions = function () {
            return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl +
                "&name=" + Bahmni.Common.Constants.dispositionConcept +
                "&v=custom:(uuid,name,answers:(uuid,name,mappings))", {cache: true});
        };

        var getproposedWards = function () {
            return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl +
                "&name=" + Bahmni.Common.Constants.proposedWardsConcept +
                "&v=custom:(uuid,name,answers:(uuid,name,mappings))", {cache: true});
        };

		var getward_saveConcept = function () {
            return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl +
                "&name=" + Bahmni.Common.Constants.ward_saveConcept +
                "&v=custom:(uuid,name:(name))", {cache: true});
        };
        var postWard = function (params){
			
		return $http.post(Bahmni.Common.Constants.openmrsObsUrl, params, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
					});	
			
		};
        
        var getDispositionNoteConcept = function () {
            return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl +
                "&name=" + Bahmni.Common.Constants.dispositionNoteConcept +
                "&v=custom:(uuid,name:(name))", {cache: true});
        };

        var getDispositionByVisit = function (visitUuid) {
            return $http.get(Bahmni.Common.Constants.bahmniDispositionByVisitUrl, {
                params: {visitUuid: visitUuid}
            });
        };
        var getWardData = function (patientUuid, conceptName) {
            var params = {
                patient: patientUuid,
                concept: conceptName,
                v: "custom:(uuid,value)"
            };
            return $http.get(Bahmni.Common.Constants.openmrsObsUrl, {params: params});
        };

        var getDispositionByPatient = function (patientUuid, numberOfVisits) {
            return $http.get(Bahmni.Common.Constants.bahmniDispositionByPatientUrl, {
                params: {
                    patientUuid: patientUuid,
                    numberOfVisits: numberOfVisits
                }
            });
        };

        return {
            getDispositionActions: getDispositionActions,
            getproposedWards:getproposedWards,
            getDispositionNoteConcept: getDispositionNoteConcept,
            getward_saveConcept:getward_saveConcept,
            getDispositionByVisit: getDispositionByVisit,
            postWard: postWard,
            getWardData :getWardData,
            getDispositionByPatient: getDispositionByPatient
        };
    }]);
