'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('observationFormService', ['$q', function ($q) {
        var getFormList = function (encounterUuid) {
            return $q.when([]);
        };

        var getFormDetail = function (formUuid, params) {
            return $q.when([]);
        };

        return {
            getFormList: getFormList,
            getFormDetail: getFormDetail
        };
    }]);

'use strict';

angular.module('bahmni.common.patient')
    .service('patientService', ['$q', 'androidDbService', function ($q, androidDbService) {
        this.getPatient = function (uuid) {
            return androidDbService.getPatientByUuid(uuid).then(function (response) {
                response.patient.person.preferredName = response.patient.person.names[0];
                response.patient.person.preferredAddress = response.patient.person.addresses[0];
                return {"data": response.patient};
            });
        };

        this.getRelationships = function (patientUuid) {
            return $q.when({data: {}});
        };

        this.findPatients = function (params) {
            return $q.when({data: []});
        };

        this.search = function (query, offset, identifier) {
            var params = {
                q: query,
                identifier: identifier,
                startIndex: offset || 0,
                addressFieldName: Bahmni.Common.Offline.AddressFields.CITY_VILLAGE
            };
            return $q.when(JSON.parse(AndroidOfflineService.search(JSON.stringify(params))));
        };

        this.getPatientContext = function (uuid) {
            var deferrable = $q.defer();
            var patientContextMapper = new Bahmni.PatientContextMapper();
            androidDbService.getPatientByUuid(uuid).then(function (response) {
                var patientContext = patientContextMapper.map(response.patient);
                deferrable.resolve({"data": patientContext});
            });
            return deferrable.promise;
        };

        this.getRecentPatients = function (duration) {
            var params = {
                q: '',
                startIndex: 0,
                addressFieldName: Bahmni.Common.Offline.AddressFields.CITY_VILLAGE,
                duration: duration || 14
            };
            return $q.when(JSON.parse(AndroidOfflineService.search(JSON.stringify(params))));
        };
    }]);

'use strict';

angular.module('bahmni.common.orders')
    .service('orderTypeService', ['androidDbService',
        function (androidDbService) {
            var self = this;
            self.orderTypes = [];
            self.loadAll = function () {
                return androidDbService.getReferenceData('OrderType').then(function (orderType) {
                    self.orderTypes = orderType.data;
                    return orderType;
                });
            };

            self.getOrderTypeUuid = function (orderTypeName) {
                return _.result(_.find(self.orderTypes, {display: orderTypeName}), 'uuid');
            };
        }]);

'use strict';

angular.module('bahmni.common.appFramework')
    .service('loadConfigService', ['androidDbService',
        function (androidDbService) {
            this.loadConfig = function (url, contextPath) {
                var configFile = url.substring(url.lastIndexOf("/") + 1);
                return androidDbService.getConfig(contextPath).then(function (config) {
                    if (config) {
                        return {"data": config.value[configFile]};
                    }
                    return {"data": {}};
                });
            };
        }]);

'use strict';

angular.module('bahmni.clinical')
    .service('diseaseTemplateService', ['$q', function ($q) {
        this.getLatestDiseaseTemplates = function (patientUuid, diseaseTemplates, startDate, endDate) {
            return $q.when({"data": {}});
        };

        this.getAllDiseaseTemplateObs = function (patientUuid, diseaseName, startDate, endDate) {
            return $q.when({"data": {}});
        };

        var mapDiseaseTemplates = function (diseaseTemplates, allConceptsConfig) {
            var mappedDiseaseTemplates = [];
            diseaseTemplates.forEach(function (diseaseTemplate) {
                mappedDiseaseTemplates.push(new Bahmni.Clinical.DiseaseTemplateMapper(diseaseTemplate, allConceptsConfig));
            });
            return mappedDiseaseTemplates;
        };
    }]);

'use strict';

angular.module('bahmni.clinical')
    .service('labOrderResultService', ['offlineLabOrderResultsService', '$q', 'configurationService', function (offlineLabOrderResultsService, $q, configurationService) {
        var labOrderResultsService = offlineLabOrderResultsService;
        var allTestsAndPanelsConcept = {};
        configurationService.getConfigurations(['allTestsAndPanelsConcept']).then(function (configurations) {
            allTestsAndPanelsConcept = configurations.allTestsAndPanelsConcept.results[0];
        });
        var sanitizeData = function (labOrderResults) {
            labOrderResults.forEach(function (result) {
                result.accessionDateTime = Bahmni.Common.Util.DateUtil.parse(result.accessionDateTime);
                result.hasRange = result.minNormal && result.maxNormal;
            });
        };

        var groupByPanel = function (accessions) {
            var grouped = [];
            accessions.forEach(function (labOrders) {
                var panels = {};
                var accessionGroup = [];
                labOrders.forEach(function (labOrder) {
                    if (!labOrder.panelName) {
                        labOrder.isPanel = false;
                        labOrder.orderName = labOrder.testName;
                        accessionGroup.push(labOrder);
                    } else {
                        panels[labOrder.panelName] = panels[labOrder.panelName] || {
                            accessionDateTime: labOrder.accessionDateTime,
                            orderName: labOrder.panelName,
                            tests: [],
                            isPanel: true
                        };
                        panels[labOrder.panelName].tests.push(labOrder);
                    }
                });
                _.values(panels).forEach(function (val) {
                    accessionGroup.push(val);
                });
                grouped.push(accessionGroup);
            });
            return grouped;
        };

        var flattened = function (accessions) {
            return accessions.map(
                function (results) {
                    var flattenedResults = _(results).map(
                        function (result) {
                            return result.isPanel === true ? [result, result.tests] : result;
                        }).flattenDeep().value();
                    return flattenedResults;
                }
            );
        };

        var transformGroupSort = function (results, initialAccessionCount, latestAccessionCount) {
            var labOrderResults = results.results;
            sanitizeData(labOrderResults);

            var accessionConfig = {
                initialAccessionCount: initialAccessionCount,
                latestAccessionCount: latestAccessionCount
            };

            var tabularResult = new Bahmni.Clinical.TabularLabOrderResults(results.tabularResult, accessionConfig);
            var accessions = _.groupBy(labOrderResults, function (labOrderResult) {
                return labOrderResult.accessionUuid;
            });
            accessions = _.sortBy(accessions, function (accession) {
                return accession[0].accessionDateTime;
            });

            if (accessionConfig.initialAccessionCount || accessionConfig.latestAccessionCount) {
                var initial = _.take(accessions, accessionConfig.initialAccessionCount || 0);
                var latest = _.takeRight(accessions, accessionConfig.latestAccessionCount || 0);

                accessions = _.union(initial, latest);
            }
            accessions.reverse();
            return {
                accessions: groupByPanel(accessions),
                tabularResult: tabularResult
            };
        };
        var getAllForPatient = function (params) {
            var deferred = $q.defer();
            if (!params.patientUuid) {
                deferred.reject('patient uuid is mandatory');
            }
            labOrderResultsService.getLabOrderResultsForPatient(params).then(function (response) {
                var results = transformGroupSort(response.data, params.initialAccessionCount, params.latestAccessionCount);
                var sortedConceptSet = new Bahmni.Clinical.ConceptWeightBasedSorter(allTestsAndPanelsConcept);
                var resultObject = {
                    labAccessions: flattened(results.accessions.map(sortedConceptSet.sortTestResults)),
                    tabular: results.tabularResult
                };
                resultObject.tabular.tabularResult.orders = sortedConceptSet.sortTestResults(resultObject.tabular.tabularResult.orders);
                deferred.resolve(resultObject);
            });
            return deferred.promise;
        };

        return {
            getAllForPatient: getAllForPatient
        };
    }]);

'use strict';

angular.module('bahmni.clinical')
    .service('offlineLabOrderResultsService', ['$q', 'androidDbService',
        function ($q, androidDbService) {
            this.getLabOrderResultsForPatient = function (params) {
                return androidDbService.getLabOrderResultsForPatient(params.patientUuid).then(function (results) {
                    results = results === null ? {
                        results: {
                            "results": [],
                            "tabularResult": {"dates": [], "orders": [], "values": []}
                        }
                    } : results;

                    return {"data": results.results};
                });
            };
        }]);

'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('conceptSetService', ['$http', '$q', '$bahmniTranslate', 'offlineDbService', 'androidDbService', 'offlineService', function ($http, $q, $bahmniTranslate, offlineDbService, androidDbService, offlineService) {
        if (offlineService.isAndroidApp()) {
            offlineDbService = androidDbService;
        }
        var getConcept = function (params) {
            params['locale'] = params['locale'] || $bahmniTranslate.use();
            return offlineDbService.getConceptByName(params.name);
        };

        return {
            getConcept: getConcept
        };
    }]);

'use strict';

Bahmni.Common.Util.DateTimeFormatter = {

    getDateWithoutTime: function (date) {
        return date ? moment(date).format("MM-DD-YYYY") : null;
    }
};

'use strict';

angular.module('bahmni.common.logging')
    .service('offlineLoggingService', ['$http', 'androidDbService', function ($http, androidDbService) {
        var log = function (errorUuid, failedRequest, responseStatus, stackTrace, requestPayload) {
            return androidDbService.insertLog(errorUuid, failedRequest, responseStatus, stackTrace, requestPayload);
        };

        return {
            log: log
        };
    }]);

'use strict';

angular.module('bahmni.clinical')
    .factory('treatmentService', ['$q', 'appService', 'offlineDbService', 'offlineService', 'androidDbService',
        function ($q, appService, offlineDbService, offlineService, androidDbService) {
            if (offlineService.isAndroidApp()) {
                offlineDbService = androidDbService;
            }

            var createDrugOrder = function (drugOrder) {
                return Bahmni.Clinical.DrugOrder.create(drugOrder);
            };

            var getPrescribedAndActiveDrugOrders = function (patientUuid, numberOfVisits, getOtherActive,
                                                         visitUuids, startDate, endDate, getEffectiveOrdersOnly) {
                var params = {
                    patientUuid: patientUuid,
                    numberOfVisits: numberOfVisits,
                    getOtherActive: getOtherActive,
                    visitUuids: visitUuids,
                    startDate: startDate,
                    endDate: endDate,
                    getEffectiveOrdersOnly: getEffectiveOrdersOnly
                };
                var deferred = $q.defer();
                var visitDrugOrders = [];
                offlineDbService.getVisitsByPatientUuid(patientUuid, numberOfVisits).then(function (visits) {
                    var mappedVisitUuids = _.map(visits, function (visit) {
                        return visit.uuid;
                    });
                    if (mappedVisitUuids && mappedVisitUuids.length === 0) {
                        deferred.resolve({"data": {}});
                    }
                    params.visitUuids = mappedVisitUuids || [];
                    offlineDbService.getPrescribedAndActiveDrugOrders(params).then(function (results) {
                        _.each(results, function (result) {
                            var drugOrders = result.encounter.drugOrders ? result.encounter.drugOrders : [];
                            _.each(visits, function (visit) {
                                if (result.encounter.visitUuid === visit.uuid) {
                                    result.encounter.visit = {startDateTime: visit.startDatetime};
                                }
                            });
                            _.each(drugOrders, function (drugOrder) {
                                drugOrder.provider = result.encounter.providers[0];
                                drugOrder.creatorName = result.encounter.providers[0].name;
                                drugOrder.visit = result.encounter.visit;
                            });
                            visitDrugOrders = visitDrugOrders.concat(drugOrders);
                        });
                        var uuids = [];
                        _.each(visitDrugOrders, function (visitDrugOrder) {
                            if (visitDrugOrder.previousOrderUuid) {
                                uuids.push(visitDrugOrder.previousOrderUuid);
                            }
                        });

                        for (var index = 0; index < visitDrugOrders.length; index++) {
                            for (var indx = 0; indx < uuids.length; indx++) {
                                if (uuids[indx] === visitDrugOrders[index].uuid) {
                                    visitDrugOrders.splice(index, 1);
                                }
                            }
                        }

                        var response = {visitDrugOrders: visitDrugOrders};
                        for (var key in response) {
                            response[key] = response[key].map(createDrugOrder);
                        }
                        deferred.resolve({"data": response});
                    });
                });
                return deferred.promise;
            };

            var getConfig = function () {
                return offlineDbService.getReferenceData('DrugOrderConfig');
            };

            var getProgramConfig = function () {
                var programConfig = appService.getAppDescriptor() ? appService.getAppDescriptor().getConfigValue("program") || {} : {};
                return programConfig;
            };

            var getActiveDrugOrders = function () {
                return $q.when({"data": {}});
            };

            var getPrescribedDrugOrders = function () {
                return $q.when({"data": {}});
            };

            var getNonCodedDrugConcept = function () {
                var deferred = $q.defer();
                offlineDbService.getReferenceData('NonCodedDrugConcept').then(function (response) {
                    deferred.resolve(response.data);
                });
                return deferred.promise;
            };

            var getAllDrugOrdersFor = function () {
                return $q.when({"data": {}});
            };

            var voidDrugOrder = function (drugOrder) {
                return $q.when({"data": {}});
            };

            return {
                getActiveDrugOrders: getActiveDrugOrders,
                getConfig: getConfig,
                getPrescribedDrugOrders: getPrescribedDrugOrders,
                getPrescribedAndActiveDrugOrders: getPrescribedAndActiveDrugOrders,
                getNonCodedDrugConcept: getNonCodedDrugConcept,
                getAllDrugOrdersFor: getAllDrugOrdersFor,
                voidDrugOrder: voidDrugOrder
            };
        }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('appInfoStrategy', function () {
        var getVersion = function () {
            return AppUpdateService.getVersion();
        };
        return {
            getVersion: getVersion
        };
    });
