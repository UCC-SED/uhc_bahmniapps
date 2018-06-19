'use strict';

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};

(function () {
    var hostUrl = localStorage.getItem('host') ? ("https://" + localStorage.getItem('host')) : "";
    var offlineRootDir = localStorage.getItem('offlineRootDir') || "";
    var RESTWS = hostUrl + "/openmrs/ws/rest";
    var RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";
    var BAHMNI_CORE = RESTWS_V1 + "/bahmnicore";
    var EMRAPI = RESTWS + "/emrapi";
    var BACTERIOLOGY = RESTWS_V1;
    var BASE_URL = hostUrl + "/bahmni_config/openmrs/apps/";
    var CUSTOM_URL = hostUrl + "/implementation_config/openmrs/apps/";
    var CUSTOM_LOCALE_URL = hostUrl + "/bahmni_config/openmrs/i18n/";
    var syncButtonConfiguration = {
        delay: 1000,
        repeat: 1
    };

    var serverErrorMessages = [
        {
            serverMessage: "Cannot have more than one active order for the same orderable and care setting at same time",
            clientMessage: "One or more drugs you are trying to order are already active. Please change the start date of the conflicting drug or remove them from the new prescription."
        },
        {
            serverMessage: "[Order.cannot.have.more.than.one]",
            clientMessage: "One or more drugs you are trying to order are already active. Please change the start date of the conflicting drug or remove them from the new prescription."
        }
    ];

    var offlineErrorMessages = {
        networkError: "The network connectivity is bad and not able to connect to the server. Please ensure minimum network condition to sync the device",
        openmrsServerError: "OpenMRS is down and the device not able to communicate to the server. Please make sure the server is up before Syncing the device",
        openmrsServerDownError: "OpenMRS is down and the device not able to communicate to the server. Please ensure the server is up for the first time login and setup.",
        networkErrorForFirstTimeLogin: "The device is not connected to the internet. Please ensure minimal connectivity for the first time login and setup."
    };

    var syncStatusMessages = {
        syncFailed: "Sync Failed, Press sync button to try again",
        syncSuccess: "Data Synced Successfully",
        syncPending: "Sync Pending, Press Sync button to Sync"
    };

    var representation = "custom:(uuid,name,names,conceptClass," +
        "setMembers:(uuid,name,names,conceptClass," +
        "setMembers:(uuid,name,names,conceptClass," +
        "setMembers:(uuid,name,names,conceptClass))))";

    var unAuthenticatedReferenceDataMap = {
        "/openmrs/ws/rest/v1/location?tags=Login+Location&s=byTags&v=default": "LoginLocations",
        "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=locale.allowed.list": "LocaleList"
    };

    var authenticatedReferenceDataMap = {
        "/openmrs/ws/rest/v1/idgen/identifiertype": "IdentifierTypes",
        "/openmrs/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form": "AddressHierarchyLevels",
        "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=mrs.genders": "Genders",
        "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=bahmni.encountersession.duration": "encounterSessionDuration",
        "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=bahmni.relationshipTypeMap": "RelationshipTypeMap",
        "/openmrs/ws/rest/v1/bahmnicore/config/bahmniencounter?callerContext=REGISTRATION_CONCEPTS": "RegistrationConcepts",
        "/openmrs/ws/rest/v1/relationshiptype?v=custom:(aIsToB,bIsToA,uuid)": "RelationshipType",
        "/openmrs/ws/rest/v1/personattributetype?v=custom:(uuid,name,sortWeight,description,format,concept)": "PersonAttributeType",
        "/openmrs/ws/rest/v1/entitymapping?mappingType=loginlocation_visittype&s=byEntityAndMappingType": "LoginLocationToVisitTypeMapping",
        "/openmrs/ws/rest/v1/bahmnicore/config/patient": "PatientConfig",
        "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Consultation+Note&v=custom:(uuid,name,answers)": "ConsultationNote",
        "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Lab+Order+Notes&v=custom:(uuid,name)": "LabOrderNotes",
        "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Impression&v=custom:(uuid,name)": "RadiologyImpressionConfig",
        "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=All_Tests_and_Panels&v=custom:(uuid,name:(uuid,name),setMembers:(uuid,name:(uuid,name)))": "AllTestsAndPanelsConcept",
        "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Dosage+Frequency&v=custom:(uuid,name,answers)": "DosageFrequencyConfig",
        "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Dosage+Instructions&v=custom:(uuid,name,answers)": "DosageInstructionConfig",
        "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=bahmni.encounterType.default": "DefaultEncounterType",
        "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Stopped+Order+Reason&v=custom:(uuid,name,answers)": "StoppedOrderReasonConfig",
        "/openmrs/ws/rest/v1/ordertype": "OrderType",
        "/openmrs/ws/rest/v1/bahmnicore/config/drugOrders": "DrugOrderConfig",
        "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=drugOrder.drugOther": "NonCodedDrugConcept"
    };

    authenticatedReferenceDataMap["/openmrs/ws/rest/v1/entitymapping?mappingType=location_encountertype&s=byEntityAndMappingType&entityUuid=" + (localStorage.getItem("LoginInformation") ? JSON.parse(localStorage.getItem("LoginInformation")).currentLocation.uuid : "")] = "LoginLocationToEncounterTypeMapping";

    Bahmni.Common.Constants = {
        hostURL: hostUrl,
        dateFormat: "dd/mm/yyyy",
        dateDisplayFormat: "DD-MMM-YYYY",
        timeDisplayFormat: "hh:mm",
        emrapiDiagnosisUrl: EMRAPI + "/diagnosis",
        bahmniDiagnosisUrl: BAHMNI_CORE + "/diagnosis/search",
        bahmniDeleteDiagnosisUrl: BAHMNI_CORE + "/diagnosis/delete",
        diseaseTemplateUrl: BAHMNI_CORE + "/diseaseTemplates",
        AllDiseaseTemplateUrl: BAHMNI_CORE + "/diseaseTemplate",
        emrapiConceptUrl: EMRAPI + "/concept",
        encounterConfigurationUrl: BAHMNI_CORE + "/config/bahmniencounter",
        patientConfigurationUrl: BAHMNI_CORE + "/config/patient",
        drugOrderConfigurationUrl: BAHMNI_CORE + "/config/drugOrders",
        emrEncounterUrl: EMRAPI + "/encounter",
        encounterUrl: RESTWS_V1 + "/encounter",
        locationUrl: RESTWS_V1 + "/location",
        bahmniVisitLocationUrl: BAHMNI_CORE + "/visitLocation",
        bahmniOrderUrl: BAHMNI_CORE + "/orders",
        bahmniDrugOrderUrl: BAHMNI_CORE + "/drugOrders",
        bahmniDispositionByVisitUrl: BAHMNI_CORE + "/disposition/visit",
        bahmniDispositionByPatientUrl: BAHMNI_CORE + "/disposition/patient",
        bahmniSearchUrl: BAHMNI_CORE + "/search",
        bahmniLabOrderResultsUrl: BAHMNI_CORE + "/labOrderResults",
        bahmniEncounterUrl: BAHMNI_CORE + "/bahmniencounter",
        conceptUrl: RESTWS_V1 + "/concept",
        bahmniConceptAnswerUrl: RESTWS_V1 + "/bahmniconceptanswer",
        conceptSearchByFullNameUrl: RESTWS_V1 + "/concept?s=byFullySpecifiedName",
        visitUrl: RESTWS_V1 + "/visit",
        endVisitUrl: BAHMNI_CORE + "/visit/endVisit",
        endVisitAndCreateEncounterUrl: BAHMNI_CORE + "/visit/endVisitAndCreateEncounter",
        visitTypeUrl: RESTWS_V1 + "/visittype",
        patientImageUrlByPatientUuid: RESTWS_V1 + "/patientImage?patientUuid=",
        labResultUploadedFileNameUrl: "/uploaded_results/",
        visitSummaryUrl: BAHMNI_CORE + "/visit/summary",
        encounterModifierUrl: BAHMNI_CORE + "/bahmniencountermodifier",
        openmrsUrl: hostUrl + "/openmrs",
        loggingUrl: hostUrl + "/log/",
        idgenConfigurationURL: RESTWS_V1 + "/idgen/identifiertype",
        bahmniRESTBaseURL: BAHMNI_CORE + "",
        observationsUrl: BAHMNI_CORE + "/observations",
        obsRelationshipUrl: BAHMNI_CORE + "/obsrelationships",
        encounterImportUrl: BAHMNI_CORE + "/admin/upload/encounter",
        programImportUrl: BAHMNI_CORE + "/admin/upload/program",
        conceptImportUrl: BAHMNI_CORE + "/admin/upload/concept",
        conceptSetImportUrl: BAHMNI_CORE + "/admin/upload/conceptset",
        drugImportUrl: BAHMNI_CORE + "/admin/upload/drug",
        labResultsImportUrl: BAHMNI_CORE + "/admin/upload/labResults",
        referenceTermsImportUrl: BAHMNI_CORE + "/admin/upload/referenceterms",
        relationshipImportUrl: BAHMNI_CORE + "/admin/upload/relationship",
        conceptSetExportUrl: BAHMNI_CORE + "/admin/export/conceptset?conceptName=:conceptName",
        patientImportUrl: BAHMNI_CORE + "/admin/upload/patient",
        adminImportStatusUrl: BAHMNI_CORE + "/admin/upload/status",
        programUrl: RESTWS_V1 + "/program",
        programEnrollPatientUrl: RESTWS_V1 + "/bahmniprogramenrollment",
        programStateDeletionUrl: RESTWS_V1 + "/programenrollment",
        programEnrollmentDefaultInformation: "default",
        programEnrollmentFullInformation: "full",
        programAttributeTypes: RESTWS_V1 + "/programattributetype",
        relationshipTypesUrl: RESTWS_V1 + "/relationshiptype",
        personAttributeTypeUrl: RESTWS_V1 + "/personattributetype",
        diseaseSummaryPivotUrl: BAHMNI_CORE + "/diseaseSummaryData",
        allTestsAndPanelsConceptName: 'All_Tests_and_Panels',
        dosageFrequencyConceptName: 'Dosage Frequency',
        dosageInstructionConceptName: 'Dosage Instructions',
        stoppedOrderReasonConceptName: 'Stopped Order Reason',
        consultationNoteConceptName: 'Consultation Note',
        diagnosisConceptSet: 'Diagnosis Concept Set',
        radiologyOrderType: 'Radiology Order',
        radiologyResultConceptName: "Radiology Result",
        investigationEncounterType: "INVESTIGATION",
        validationNotesEncounterType: "VALIDATION NOTES",
        labOrderNotesConcept: "Lab Order Notes",
        impressionConcept: "Impression",
        qualifiedByRelationshipType: "qualified-by",
        dispositionConcept: "Disposition",
        dispositionGroupConcept: "Disposition Set",
        dispositionNoteConcept: "Disposition Note",
        ruledOutDiagnosisConceptName: 'Ruled Out Diagnosis',
        emrapiConceptMappingSource: "org.openmrs.module.emrapi",
        abbreviationConceptMappingSource: "Abbreviation",
        includeAllObservations: false,
        openmrsObsUrl: RESTWS_V1 + "/obs",
        openmrsObsRepresentation: "custom:(uuid,obsDatetime,value:(uuid,name:(uuid,name)))",
        admissionCode: 'ADMIT',
        dischargeCode: 'DISCHARGE',
        transferCode: 'TRANSFER',
        undoDischargeCode: 'UNDO_DISCHARGE',
        vitalsConceptName: "Vitals",
        heightConceptName: "HEIGHT",
        weightConceptName: "WEIGHT",
        bmiConceptName: "BMI", // TODO : shruthi : revove this when this logic moved to server side
        bmiStatusConceptName: "BMI STATUS", // TODO : shruthi : revove this when this logic moved to server side
        abnormalObservationConceptName: "IS_ABNORMAL",
        documentsPath: '/document_images',
        documentsConceptName: 'Document',
        miscConceptClassName: 'Misc',
        abnormalConceptClassName: 'Abnormal',
        unknownConceptClassName: 'Unknown',
        durationConceptClassName: 'Duration',
        conceptDetailsClassName: 'Concept Details',
        admissionEncounterTypeName: 'ADMISSION',
        dischargeEncounterTypeName: 'DISCHARGE',
        imageClassName: 'Image',
        videoClassName: 'Video',
        locationCookieName: 'bahmni.user.location',
        retrospectiveEntryEncounterDateCookieName: 'bahmni.clinical.retrospectiveEncounterDate',
        JSESSIONID: "JSESSIONID",
        rootScopeRetrospectiveEntry: 'retrospectiveEntry.encounterDate',
        patientFileConceptName: 'Patient file',
        serverErrorMessages: serverErrorMessages,
        currentUser: 'bahmni.user',
        retrospectivePrivilege: 'app:clinical:retrospective',
        locationPickerPrivilege: 'app:clinical:locationpicker',
        onBehalfOfPrivilege: 'app:clinical:onbehalf',
        nutritionalConceptName: 'Nutritional Values',
        messageForNoObservation: "No observations captured for this visit.",
        messageForNoDisposition: "NO_DISPOSTIONS_AVAILABLE_MESSAGE_KEY",
        messageForNoFulfillment: "No observations captured for this order.",
        reportsUrl: "/bahmnireports",
        uploadReportTemplateUrl: "/bahmnireports/upload",
        ruledOutdiagnosisStatus: "Ruled Out Diagnosis",
        registartionConsultationPrivilege: 'app:common:registration_consultation_link',
        manageIdentifierSequencePrivilege: "Manage Identifier Sequence",
        closeVisitPrivilege: 'app:common:closeVisit',
        deleteDiagnosisPrivilege: 'app:clinical:deleteDiagnosis',
        viewPatientsPrivilege: 'View Patients',
        editPatientsPrivilege: 'Edit Patients',
        addVisitsPrivilege: 'Add Visits',
        deleteVisitsPrivilege: 'Delete Visits',
        grantProviderAccess: "app:clinical:grantProviderAccess",
        grantProviderAccessDataCookieName: "app:clinical:grantProviderAccessData",
        globalPropertyUrl: BAHMNI_CORE + "/sql/globalproperty",
        passwordPolicyUrl: BAHMNI_CORE + "/globalProperty/passwordPolicyProperties",
        fulfillmentConfiguration: "fulfillment",
        fulfillmentFormSuffix: " Fulfillment Form",
        noNavigationLinksMessage: "No navigation links available.",
        conceptSetRepresentationForOrderFulfillmentConfig: representation,
        entityMappingUrl: RESTWS_V1 + "/entitymapping",
        encounterTypeUrl: RESTWS_V1 + "/encountertype",
        defaultExtensionName: "default",
        orderSetMemberAttributeTypeUrl: RESTWS_V1 + "/ordersetmemberattributetype",
        orderSetUrl: RESTWS_V1 + "/bahmniorderset",
        primaryOrderSetMemberAttributeTypeName: "Primary",
        bahmniBacteriologyResultsUrl: BACTERIOLOGY + "/specimen",
        bedFromVisit: RESTWS_V1 + "/beds",
        ordersUrl: RESTWS_V1 + "/order",
        formDataUrl: RESTWS_V1 + "/obs",
        providerUrl: RESTWS_V1 + "/provider",
        drugUrl: RESTWS_V1 + "/drug",
        localDrugStockUrl: RESTWS_V1 + "/emr/getDrugStatus",
        gothomisDrugStockUrl: RESTWS_V1 + "/emr/getDrugStockStatus",
        submitLabOrder: RESTWS_V1 + "/emr/submitLabOrder",
        submitDrugOrder: RESTWS_V1 + "/emr/submitDrugOrder",
        submitDisposition: RESTWS_V1 + "/emr/submitDisposition",
        orderTypeUrl: RESTWS_V1 + "/ordertype",
        userUrl: RESTWS_V1 + "/user",
        passwordUrl: RESTWS_V1 + "/password",
        formUrl: RESTWS_V1 + "/form",
        latestPublishedForms: RESTWS_V1 + "/bahmniie/form/latestPublishedForms",
        sqlUrl: BAHMNI_CORE + "/sql",
        patientAttributeDateFieldFormat: "org.openmrs.util.AttributableDate",
        platform: "user.platform",
        RESTWS_V1: RESTWS_V1,
        baseUrl: BASE_URL,
        customUrl: CUSTOM_URL,
        customLocaleUrl: CUSTOM_LOCALE_URL,
        addressEventLogServiceUrl: hostUrl + "/event-log-service/rest/eventlog/getAddressHierarchyEvents",
        eventLogServiceUrl: hostUrl + "/event-log-service/rest/eventlog/events",
        eventLogServiceConceptUrl: hostUrl + "/event-log-service/rest/eventlog/concepts",
        offlineMetadataUrl: hostUrl + "/offlineMetadata.json",
        faviconUrl: hostUrl + "/bahmni/favicon.ico",
        platformType: {
            chrome: 'other',
            android: 'other',
            chromeApp: 'other',
            other: 'other'
        },
        numericDataType: "Numeric",
        encryptionType: {
            SHA3: 'SHA3'
        },
        LoginInformation: 'LoginInformation',
        // orderSetSpecialUnits:["mg/kg","mg/m2"],
        ServerDateTimeFormat: 'YYYY-MM-DDTHH:mm:ssZZ',
        calculateDose: BAHMNI_CORE + "/calculateDose",
        unAuthenticatedReferenceDataMap: unAuthenticatedReferenceDataMap,
        authenticatedReferenceDataMap: authenticatedReferenceDataMap,
        offlineRootDir: offlineRootDir,
        dischargeUrl: BAHMNI_CORE + "/discharge",
        newOfflineVisitUuid: "newOfflineVisitUuid",
        offlineErrorMessages: offlineErrorMessages,
        syncButtonConfiguration: syncButtonConfiguration,
        syncStatusMessages: syncStatusMessages,
        uuidRegex: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
        offlineBahmniEncounterUrl: "/openmrs/ws/rest/v1/bahmnicore/bahmniencounter/",
        eventlogFilterUrl: hostUrl + "/openmrs/ws/rest/v1/eventlog/filter",
        bahmniConnectMetaDataDb: "metaData",
        serverDateTimeUrl: "/cgi-bin/systemdate",
        loginText: "/bahmni_config/openmrs/apps/home/whiteLabel.json",
        auditLogUrl: BAHMNI_CORE + "/auditlog",
        conditionUrl: EMRAPI + '/condition',
        conditionHistoryUrl: EMRAPI + '/conditionhistory',
        followUpConditionConcept: 'Follow-up Condition',
        localeLangs: "/bahmni_config/openmrs/apps/home/locale_languages.json",
        appointmentServiceUrl: RESTWS_V1 + "/appointmentService"
    };
})();


'use strict';

angular.module('bahmni.common.routeErrorHandler', ['ui.router'])
    .run(['$rootScope', function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event) {
            event.preventDefault();
        });
    }]);

'use strict';

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Util = Bahmni.Common.Util || {};

angular.module('bahmni.common.util', [])
    .provider('$bahmniCookieStore', [function () {
        var self = this;
        self.defaultOptions = {};

        self.setDefaultOptions = function (options) {
            self.defaultOptions = options;
        };

        self.$get = function () {
            return {
                get: function (name) {
                    var jsonCookie = $.cookie(name);
                    if (jsonCookie) {
                        return angular.fromJson(jsonCookie);
                    }
                },
                put: function (name, value, options) {
                    options = $.extend({}, self.defaultOptions, options);
                    $.cookie(name, angular.toJson(value), options);
                },
                remove: function (name, options) {
                    options = $.extend({}, self.defaultOptions, options);
                    $.removeCookie(name, options);
                }
            };
        };
    }])
;

'use strict';

angular.module('httpErrorInterceptor', [])
    .config(['$httpProvider', function ($httpProvider) {
        var interceptor = ['$rootScope', '$q', function ($rootScope, $q) {
            var serverErrorMessages = Bahmni.Common.Constants.serverErrorMessages;

            var showError = function (errorMessage) {
                var result = _.find(serverErrorMessages, function (listItem) {
                    return listItem.serverMessage === errorMessage;
                });
                if (_.isEmpty(result)) {
                    $rootScope.$broadcast('event:serverError', errorMessage);
                }
            };

            function stringAfter (value, searchString) {
                var indexOfFirstColon = value.indexOf(searchString);
                return value.substr(indexOfFirstColon + 1).trim();
            }

            function getServerError (message) {
                return stringAfter(message, ':');
            }

            function success (response) {
                return response;
            }

            function shouldRedirectToLogin (response) {
                var errorMessage = response.data.error ? response.data.error.message : response.data;
                if (errorMessage.search("HTTP Status 403 - Session timed out") > 0) {
                    return true;
                }
            }

            function error (response) {
                var data = response.data;
                var unexpectedError = "There was an unexpected issue on the server. Please try again";
                if (response.status === 500) {
                    var errorMessage = data.error && data.error.message ? getServerError(data.error.message) : unexpectedError;
                    showError(errorMessage);
                } else if (response.status === 409) {
                    var errorMessage = data.error && data.error.message ? getServerError(data.error.message) : "Duplicate entry error";
                    showError(errorMessage);
                } else if (response.status === 0) {
                    showError("Could not connect to the server. Please check your connection and try again");
                } else if (response.status === 405) {
                    showError(unexpectedError);
                } else if (response.status === 400) {
                    var errorMessage = data.error && data.error.message ? data.error.message : (data.localizedMessage || "Could not connect to the server. Please check your connection and try again");
                    showError(errorMessage);
                } else if (response.status === 403) {
                    var errorMessage = data.error && data.error.message ? data.error.message : unexpectedError;
                    if (shouldRedirectToLogin(response)) {
                        $rootScope.$broadcast('event:auth-loginRequired');
                    } else {
                        showError(errorMessage);
                    }
                } else if (response.status === 404) {
                    if (!_.includes(response.config.url, "implementation_config") && !_.includes(response.config.url, "locale_")
                        && !_.includes(response.config.url, "offlineMetadata")) {
                        showError("The requested information does not exist");
                    }
                }
                return $q.reject(response);
            }

            return {
                response: success,
                responseError: error
            };
        }];
        $httpProvider.interceptors.push(interceptor);
    }]);

'use strict';

Bahmni.Common.Util.ArrayUtil = {
    chunk: function (array, chunkSize) {
        var chunks = [];
        for (var i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    },

    groupByPreservingOrder: function (records, groupingFunction, keyName, valueName) {
        var groups = [];
        records.forEach(function (record) {
            var recordKey = groupingFunction(record);
            var existingGroup = _.find(groups, function (group) { return group[keyName] === recordKey; });
            if (existingGroup) {
                existingGroup[valueName].push(record);
            } else {
                var newGroup = {};
                newGroup[keyName] = recordKey;
                newGroup[valueName] = [record];
                groups.push(newGroup);
            }
        });
        return groups;
    }
};

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Auth = Bahmni.Auth || {};

angular.module('authentication', ['ui.router']);

'use strict';

Bahmni.Auth.User = function (user) {
    angular.extend(this, user);

    this.userProperties = user.userProperties || {};
    this.favouriteObsTemplates = this.userProperties.favouriteObsTemplates ? this.userProperties.favouriteObsTemplates.split("###") : [];
    this.favouriteWards = this.userProperties.favouriteWards ? this.userProperties.favouriteWards.split("###") : [];
    this.recentlyViewedPatients = this.userProperties.recentlyViewedPatients ? JSON.parse(this.userProperties.recentlyViewedPatients) : [];

    this.toContract = function () {
        var user = angular.copy(this);
        user.userProperties.favouriteObsTemplates = this.favouriteObsTemplates.join("###");
        user.userProperties.favouriteWards = this.favouriteWards.join("###");
        user.userProperties.recentlyViewedPatients = JSON.stringify(this.recentlyViewedPatients);
        delete user.favouriteObsTemplates;
        delete user.favouriteWards;
        delete user.recentlyViewedPatients;
        return user;
    };

    this.addDefaultLocale = function (locale) {
        this.userProperties['defaultLocale'] = locale;
    };

    this.addToRecentlyViewed = function (patient, maxPatients) {
        if (!_.some(this.recentlyViewedPatients, {'uuid': patient.uuid})) {
            this.recentlyViewedPatients.unshift({
                uuid: patient.uuid,
                name: patient.name,
                identifier: patient.identifier
            });
            if (_.size(this.recentlyViewedPatients) >= maxPatients) {
                this.recentlyViewedPatients = _.take(this.recentlyViewedPatients, maxPatients);
            }
        }
    };

    this.isFavouriteObsTemplate = function (conceptName) {
        return _.includes(this.favouriteObsTemplates, conceptName);
    };

    this.toggleFavoriteObsTemplate = function (conceptName) {
        if (this.isFavouriteObsTemplate(conceptName)) {
            this.favouriteObsTemplates = _.without(this.favouriteObsTemplates, conceptName);
        } else {
            this.favouriteObsTemplates.push(conceptName);
        }
    };

    this.isFavouriteWard = function (wardName) {
        return _.includes(this.favouriteWards, wardName);
    };

    this.toggleFavoriteWard = function (wardName) {
        if (this.isFavouriteWard(wardName)) {
            this.favouriteWards = _.without(this.favouriteWards, wardName);
        } else {
            this.favouriteWards.push(wardName);
        }
    };
};


'use strict';

angular.module('authentication')
    .service('userService', ['$rootScope', '$http', '$q', function ($rootScope, $http, $q) {
        var getUserFromServer = function (userName) {
            return $http.get(Bahmni.Common.Constants.userUrl, {
                method: "GET",
                params: {
                    username: userName,
                    v: "custom:(username,uuid,person:(uuid,),privileges:(name,retired),userProperties)"
                },
                cache: false
            });
        };

        this.getUser = function (userName) {
            var deferrable = $q.defer();
            getUserFromServer(userName).success(function (data) {
                deferrable.resolve(data);
            }).error(function () {
                deferrable.reject('Unable to get user data');
            });

            return deferrable.promise;
        };

        this.savePreferences = function () {
            var deferrable = $q.defer();
            var user = $rootScope.currentUser.toContract();
            $http.post(Bahmni.Common.Constants.userUrl + "/" + user.uuid, {"uuid": user.uuid, "userProperties": user.userProperties}, {
                withCredentials: true
            }).then(function (response) {
                $rootScope.currentUser.userProperties = response.data.userProperties;
                deferrable.resolve();
            });
            return deferrable.promise;
        };

        var getProviderFromServer = function (uuid) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: {
                    user: uuid
                },
                cache: false
            });
        };

        this.getProviderForUser = function (uuid) {
            var deferrable = $q.defer();

            getProviderFromServer(uuid).success(function (data) {
                if (data.results.length > 0) {
                    var providerName = data.results[0].display.split("-")[1];
                    data.results[0].name = providerName ? providerName.trim() : providerName;
                    deferrable.resolve(data);
                } else {
                    deferrable.reject("UNABLE_TO_GET_PROVIDER_DATA");
                }
            }).error(function () {
                deferrable.reject("UNABLE_TO_GET_PROVIDER_DATA");
            });

            return deferrable.promise;
        };

        this.getPasswordPolicies = function () {
            return $http.get(Bahmni.Common.Constants.passwordPolicyUrl, {
                method: "GET",
                withCredentials: true
            });
        };
    }]);

'use strict';

angular.module('authentication')
    .config(['$httpProvider', function ($httpProvider) {
        var interceptor = ['$rootScope', '$q', function ($rootScope, $q) {
            function success (response) {
                return response;
            }

            function error (response) {
                if (response.status === 401) {
                    $rootScope.$broadcast('event:auth-loginRequired');
                }
                return $q.reject(response);
            }

            return {
                response: success,
                responseError: error
            };
        }];
        $httpProvider.interceptors.push(interceptor);
    }]).run(['$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {
        $rootScope.$on('event:auth-loginRequired', function () {
            $timeout(function () {
                $window.location = "../home/index.html#/login";
            });
        });
    }]).service('sessionService', ['$rootScope', '$http', '$q', '$bahmniCookieStore', 'userService', function ($rootScope, $http, $q, $bahmniCookieStore, userService) {
        var sessionResourcePath = Bahmni.Common.Constants.RESTWS_V1 + '/session?v=custom:(uuid)';

        var getAuthFromServer = function (username, password, otp) {
            var btoa = otp ? username + ':' + password + ':' + otp : username + ':' + password;
            return $http.get(sessionResourcePath, {
                headers: {'Authorization': 'Basic ' + window.btoa(btoa)},
                cache: false
            });
        };

        this.resendOTP = function (username, password) {
            var btoa = username + ':' + password;
            return $http.get(sessionResourcePath + '&resendOTP=true', {
                headers: {'Authorization': 'Basic ' + window.btoa(btoa)},
                cache: false
            });
        };

        var createSession = function (username, password, otp) {
            var deferrable = $q.defer();

            destroySessionFromServer().success(function () {
                getAuthFromServer(username, password, otp).then(function (response) {
                    if (response.status == 204) {
                        deferrable.resolve({"firstFactAuthorization": true});
                    }
                    deferrable.resolve(response.data);
                }, function (response) {
                    if (response.status == 401) {
                        deferrable.reject('LOGIN_LABEL_WRONG_OTP_MESSAGE_KEY');
                    } else if (response.status == 410) {
                        deferrable.reject('LOGIN_LABEL_OTP_EXPIRED');
                    } else if (response.status == 429) { // Too many requests
                        deferrable.reject('LOGIN_LABEL_MAX_FAILED_ATTEMPTS');
                    }
                    deferrable.reject('LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY');
                });
            }).error(function () {
                deferrable.reject('LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY');
            });
            return deferrable.promise;
        };

        var hasAnyActiveProvider = function (providers) {
            return _.filter(providers, function (provider) {
                return (provider.retired == undefined || provider.retired == "false");
            }).length > 0;
        };

        var self = this;

        var destroySessionFromServer = function () {
            return $http.delete(sessionResourcePath);
        };

        var sessionCleanup = function () {
            delete $.cookie(Bahmni.Common.Constants.currentUser, null, {path: "/"});
            delete $.cookie(Bahmni.Common.Constants.currentUser, null, {path: "/"});
            delete $.cookie(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, null, {path: "/"});
            delete $.cookie(Bahmni.Common.Constants.grantProviderAccessDataCookieName, null, {path: "/"});
            $rootScope.currentUser = undefined;
        };

        this.destroy = function () {
            var deferrable = $q.defer();
            destroySessionFromServer().then(function () {
                sessionCleanup();
                deferrable.resolve();
            });
            return deferrable.promise;
        };

        this.loginUser = function (username, password, location, otp) {
            var deferrable = $q.defer();
            createSession(username, password, otp).then(function (data) {
                if (data.authenticated) {
                    $bahmniCookieStore.put(Bahmni.Common.Constants.currentUser, username, {path: '/', expires: 7});
                    if (location != undefined) {
                        $bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                        $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {name: location.display, uuid: location.uuid}, {path: '/', expires: 7});
                    }
                    deferrable.resolve(data);
                } else if (data.firstFactAuthorization) {
                    deferrable.resolve(data);
                } else {
                    deferrable.reject('LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY');
                }
            }, function (errorInfo) {
                deferrable.reject(errorInfo);
            });
            return deferrable.promise;
        };

        this.get = function () {
            return $http.get(sessionResourcePath, { cache: false });
        };

        this.loadCredentials = function () {
            var deferrable = $q.defer();
            var currentUser = $bahmniCookieStore.get(Bahmni.Common.Constants.currentUser);
            if (!currentUser) {
                this.destroy().finally(function () {
                    $rootScope.$broadcast('event:auth-loginRequired');
                    deferrable.reject("No User in session. Please login again.");
                });
                return deferrable.promise;
            }
            userService.getUser(currentUser).then(function (data) {
                userService.getProviderForUser(data.results[0].uuid).then(function (providers) {
                    if (!_.isEmpty(providers.results) && hasAnyActiveProvider(providers.results)) {
                        $rootScope.currentUser = new Bahmni.Auth.User(data.results[0]);
                        $rootScope.currentUser.currentLocation = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).name;
                        $rootScope.$broadcast('event:user-credentialsLoaded', data.results[0]);
                        deferrable.resolve(data.results[0]);
                    } else {
                        self.destroy();
                        deferrable.reject("YOU_HAVE_NOT_BEEN_SETUP_PROVIDER");
                    }
                },
               function () {
                   self.destroy();
                   deferrable.reject("COULD_NOT_GET_PROVIDER");
               });
            }, function () {
                self.destroy();
                deferrable.reject('Could not get roles for the current user.');
            });
            return deferrable.promise;
        };

        this.getLoginLocationUuid = function () {
            return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid : null;
        };

        this.changePassword = function (currentUserUuid, oldPassword, newPassword) {
            return $http({
                method: 'POST',
                url: Bahmni.Common.Constants.passwordUrl,
                data: {
                    "oldPassword": oldPassword,
                    "newPassword": newPassword
                },
                headers: {'Content-Type': 'application/json'}
            });
        };

        this.loadProviders = function (userInfo) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: {
                    user: userInfo.uuid
                },
                cache: false
            }).success(function (data) {
                var providerUuid = (data.results.length > 0) ? data.results[0].uuid : undefined;
                $rootScope.currentProvider = { uuid: providerUuid };
            });
        };
    }]).factory('authenticator', ['$rootScope', '$q', '$window', 'sessionService', function ($rootScope, $q, $window, sessionService) {
        var authenticateUser = function () {
            var defer = $q.defer();
            var sessionDetails = sessionService.get();
            sessionDetails.then(function (response) {
                if (response.data.authenticated) {
                    defer.resolve();
                } else {
                    defer.reject('User not authenticated');
                    $rootScope.$broadcast('event:auth-loginRequired');
                }
            });
            return defer.promise;
        };

        return {
            authenticateUser: authenticateUser
        };
    }]).directive('logOut', ['sessionService', '$window', 'configurationService', 'auditLogService', function (sessionService, $window, configurationService, auditLogService) {
        return {
            link: function (scope, element) {
                element.bind('click', function () {
                    scope.$apply(function () {
                        auditLogService.log(undefined, 'USER_LOGOUT_SUCCESS', undefined, 'MODULE_LABEL_LOGOUT_KEY').then(function () {
                            sessionService.destroy().then(
                                function () {
                                    $window.location = "../home/index.html#/login";
                                });
                        });
                    });
                });
            }
        };
    }])
    .directive('btnUserInfo', [function () {
        return {
            restrict: 'CA',
            link: function (scope, elem) {
                elem.bind('click', function (event) {
                    $(this).next().toggleClass('active');
                    event.stopPropagation();
                });
                $(document).find('body').bind('click', function () {
                    $(elem).next().removeClass('active');
                });
            }
        };
    }
    ]);

angular.module('bahmni.common.config', []);

'use strict';

angular.module('bahmni.common.config')
    .service('configurations', ['configurationService', function (configurationService) {
        this.configs = {};

        this.load = function (configNames) {
            var self = this;
            return configurationService.getConfigurations(_.difference(configNames, Object.keys(this.configs))).then(function (configurations) {
                angular.extend(self.configs, configurations);
            });
        };

        this.dosageInstructionConfig = function () {
            return this.configs.dosageInstructionConfig || [];
        };

        this.stoppedOrderReasonConfig = function () {
            return this.configs.stoppedOrderReasonConfig || [];
        };

        this.dosageFrequencyConfig = function () {
            return this.configs.dosageFrequencyConfig || [];
        };

        this.allTestsAndPanelsConcept = function () {
            return this.configs.allTestsAndPanelsConcept.results[0] || [];
        };

        this.impressionConcept = function () {
            return this.configs.radiologyImpressionConfig.results[0] || [];
        };

        this.labOrderNotesConcept = function () {
            return this.configs.labOrderNotesConfig.results[0] || [];
        };

        this.consultationNoteConcept = function () {
            return this.configs.consultationNoteConfig.results[0] || [];
        };

        this.patientConfig = function () {
            return this.configs.patientConfig || {};
        };

        this.encounterConfig = function () {
            return angular.extend(new EncounterConfig(), this.configs.encounterConfig || []);
        };

        this.patientAttributesConfig = function () {
            return this.configs.patientAttributesConfig.results;
        };

        this.identifierTypesConfig = function () {
            return this.configs.identifierTypesConfig;
        };

        this.genderMap = function () {
            return this.configs.genderMap;
        };

        this.addressLevels = function () {
            return this.configs.addressLevels;
        };

        this.relationshipTypes = function () {
            return this.configs.relationshipTypeConfig.results || [];
        };

        this.relationshipTypeMap = function () {
            return this.configs.relationshipTypeMap || {};
        };

        this.loginLocationToVisitTypeMapping = function () {
            return this.configs.loginLocationToVisitTypeMapping || {};
        };

        this.defaultEncounterType = function () {
            return this.configs.defaultEncounterType;
        };
    }]);

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Domain = Bahmni.Common.Domain || {};
Bahmni.Common.Domain.Helper = Bahmni.Common.Domain.Helper || {};

angular.module('bahmni.common.domain', []);

'use strict';

(function () {
    var nameFor = {
        "Date": function (obs) {
            return moment(obs.value).format('D-MMM-YYYY');
        },
        "Datetime": function (obs) {
            var date = Bahmni.Common.Util.DateUtil.parseDatetime(obs.value);
            return date != null ? Bahmni.Common.Util.DateUtil.formatDateWithTime(date) : "";
        },
        "Boolean": function (obs) {
            return obs.value === true ? "Yes" : obs.value === false ? "No" : obs.value;
        },
        "Coded": function (obs) {
            return obs.value.shortName || obs.value.name || obs.value;
        },
        "Object": function (obs) {
            return nameFor.Coded(obs);
        },
        "MultiSelect": function (obs) {
            return obs.getValues().join(", ");
        },
        "Default": function (obs) {
            return obs.value;
        }
    };

    Bahmni.Common.Domain.ObservationValueMapper = {
        getNameFor: nameFor,
        map: function (obs) {
            var type = (obs.concept && obs.concept.dataType) || obs.type;
            if (!(type in nameFor)) {
                type = (typeof obs.value === "object" && "Object") || (obs.isMultiSelect && "MultiSelect") || "Default";
            }
            return (nameFor[type])(obs);
        }
    };
})();


angular.module('bahmni.common.appFramework', ['authentication']);

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.AppFramework = Bahmni.Common.AppFramework || {};

'use strict';

Bahmni.Common.AppFramework.AppDescriptor = function (context, inheritContext, retrieveUserCallback, mergeService) {
    this.id = null;
    this.instanceOf = null;
    this.description = null;
    this.contextModel = null;

    this.baseExtensionPoints = [];
    this.customExtensionPoints = [];

    this.baseExtensions = {};
    this.customExtensions = {};

    this.customConfigs = {};
    this.baseConfigs = {};

    this.extensionPath = context;
    this.contextPath = inheritContext ? context.split("/")[0] : context;

    var self = this;

    var setExtensionPointsFromExtensions = function (currentExtensions, currentExtensionPoints) {
        _.values(currentExtensions).forEach(function (extn) {
            if (extn) {
                var existing = self[currentExtensionPoints].filter(function (ep) {
                    return ep.id === extn.extensionPointId;
                });
                if (existing.length === 0) {
                    self[currentExtensionPoints].push({
                        id: extn.extensionPointId,
                        description: extn.description
                    });
                }
            }
        });
    };

    this.setExtensions = function (baseExtensions, customExtensions) {
        if (customExtensions) {
            setExtensionPointsFromExtensions(customExtensions, "customExtensionPoints");
            self.customExtensions = customExtensions;
        }
        self.baseExtensions = baseExtensions;
        setExtensionPointsFromExtensions(baseExtensions, "baseExtensionPoints");
    };

    this.setTemplate = function (template) {
        self.instanceOf = template.id;
        self.description = self.description || template.description;
        self.contextModel = self.contextModel || template.contextModel;
        if (template.configOptions) {
            _.values(template.configOptions).forEach(function (opt) {
                var existing = self.configs.filter(function (cfg) {
                    return cfg.name === opt.name;
                });
                if (existing.length > 0) {
                    existing[0].description = opt.description;
                } else {
                    self.configs.push({
                        name: opt.name,
                        description: opt.description,
                        value: opt.defaultValue
                    });
                }
            });
        }
    };

    var setConfig = function (instance, currentConfig) {
        for (var configName in instance.config) {
            var existingConfig = getConfig(self[currentConfig], configName);
            if (existingConfig) {
                existingConfig.value = instance.config[configName];
            } else {
                self[currentConfig][configName] = { name: configName, value: instance.config[configName] };
            }
        }
    };

    var setDefinitionExtensionPoints = function (extensionPoints, currentExtensionPoints) {
        if (extensionPoints) {
            extensionPoints.forEach(function (iep) {
                if (iep) {
                    var existing = self[currentExtensionPoints].filter(function (ep) {
                        return ep.id === iep.id;
                    });
                    if (existing.length === 0) {
                        self[currentExtensionPoints].push(iep);
                    }
                }
            });
        }
    };

    this.setDefinition = function (baseInstance, customInstance) {
        self.instanceOf = (customInstance && customInstance.instanceOf) ? customInstance.instanceOf : baseInstance.instanceOf;
        self.id = (customInstance && customInstance.id) ? customInstance.id : baseInstance.id;
        self.description = (customInstance && customInstance.description) ? customInstance.description : baseInstance.description;
        self.contextModel = (customInstance && customInstance.contextModel) ? customInstance.contextModel : baseInstance.contextModel;

        setDefinitionExtensionPoints(baseInstance.extensionPoints, "baseExtensionPoints");
        setConfig(baseInstance, "baseConfigs");
        if (customInstance) {
            setDefinitionExtensionPoints(customInstance.extensionPoints, "customExtensionPoints");
            setConfig(customInstance, "customConfigs");
        }
    };

    var getExtensions = function (extPointId, type, extensions) {
        var currentUser = retrieveUserCallback();
        var currentExtensions = _.values(extensions);
        if (currentUser && currentExtensions) {
            var extnType = type || 'all';
            var userPrivileges = currentUser.privileges.map(function (priv) {
                return priv.retired ? "" : priv.name;
            });
            var appsExtns = currentExtensions.filter(function (extn) {
                return ((extnType === 'all') || (extn.type === extnType)) &&
                    (extn.extensionPointId === extPointId) && (!extn.requiredPrivilege ||
                    (userPrivileges.indexOf(extn.requiredPrivilege) >= 0));
            });
            appsExtns.sort(function (extn1, extn2) {
                return extn1.order - extn2.order;
            });
            return appsExtns;
        }
    };

    this.getExtensions = function (extPointId, type, shouldMerge) {
        if (shouldMerge || shouldMerge === undefined) {
            var mergedExtensions = mergeService.merge(self.baseExtensions, self.customExtensions);
            return getExtensions(extPointId, type, mergedExtensions);
        }
        return [getExtensions(extPointId, type, self.baseExtensions), getExtensions(extPointId, type, self.customExtensions)];
    };

    this.getExtensionById = function (id, shouldMerge) {
        if (shouldMerge || shouldMerge === undefined) {
            var mergedExtensions = _.values(mergeService.merge(self.baseExtensions, self.customExtensions));
            return mergedExtensions.filter(function (extn) {
                return extn.id === id;
            })[0];
        } else {
            return [self.baseExtensions.filter(function (extn) {
                return extn.id === id;
            })[0], self.customExtensions.filter(function (extn) {
                return extn.id === id;
            })[0]];
        }
    };

    var getConfig = function (config, configName) {
        var cfgList = _.values(config).filter(function (cfg) {
            return cfg.name === configName;
        });
        return (cfgList.length > 0) ? cfgList[0] : null;
    };

    this.getConfig = function (configName, shouldMerge) {
        if (shouldMerge || shouldMerge === undefined) {
            return getConfig(mergeService.merge(self.baseConfigs, self.customConfigs), configName);
        } else {
            return [getConfig(self.baseConfigs, configName), getConfig(self.customConfigs, configName)];
        }
    };

    this.getConfigValue = function (configName, shouldMerge) {
        var config = this.getConfig(configName, shouldMerge);

        if (shouldMerge || shouldMerge === undefined) {
            return config ? config.value : null;
        }
        return config;
    };

    this.formatUrl = function (url, options, useQueryParams) {
        var pattern = /{{([^}]*)}}/g,
            matches = url.match(pattern),
            replacedString = url,
            checkQueryParams = useQueryParams || false,
            queryParameters = this.parseQueryParams();
        if (matches) {
            matches.forEach(function (el) {
                var key = el.replace("{{", '').replace("}}", '');
                var value = options[key];
                if (!value && (checkQueryParams === true)) {
                    value = queryParameters[key] || null;
                }
                replacedString = replacedString.replace(el, value);
            });
        }
        return replacedString.trim();
    };

    this.parseQueryParams = function (locationSearchString) {
        var urlParams;
        var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            queryString = locationSearchString || window.location.search.substring(1);

        urlParams = {};
        while (match = search.exec(queryString)) {  // eslint-disable-line no-cond-assign
            urlParams[decode(match[1])] = decode(match[2]);
        }
        return urlParams;
    };

    this.addConfigForPage = function (pageName, baseConfig, customConfig) {
        self.basePageConfigs = self.basePageConfigs || {};
        self.basePageConfigs[pageName] = baseConfig;

        self.customPageConfigs = self.customPageConfigs || {};
        self.customPageConfigs[pageName] = customConfig;
    };

    this.getConfigForPage = function (pageName, shouldMerge) {
        if (shouldMerge || shouldMerge === undefined) {
            return mergeService.merge(self.basePageConfigs[pageName], self.customPageConfigs[pageName]);
        }
        return [_.values(self.basePageConfigs[pageName]), _.values(self.customPageConfigs[pageName])];
    };
};

'use strict';

angular.module('bahmni.common.appFramework')
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|file):/);
    }])
    .service('appService', ['$http', '$q', 'sessionService', '$rootScope', 'mergeService', 'loadConfigService', 'messagingService',
        function ($http, $q, sessionService, $rootScope, mergeService, loadConfigService, messagingService) {
            var currentUser = null;
            var baseUrl = Bahmni.Common.Constants.baseUrl;
            var customUrl = Bahmni.Common.Constants.customUrl;
            var appDescriptor = null;

            var loadConfig = function (url) {
                return loadConfigService.loadConfig(url, appDescriptor.contextPath);
            };

            var loadTemplate = function (appDescriptor) {
                var deferrable = $q.defer();
                loadConfig(baseUrl + appDescriptor.contextPath + "/appTemplate.json").then(
                function (result) {
                    if (_.keys(result.data).length > 0) {
                        appDescriptor.setTemplate(result.data);
                    }
                    deferrable.resolve(appDescriptor);
                },
                function (error) {
                    if (error.status !== 404) {
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                }
            );
                return deferrable.promise;
            };

            var setDefinition = function (baseResultData, customResultData) {
                if (customResultData && (_.keys(baseResultData).length > 0 || _.keys(customResultData.length > 0))) {
                    appDescriptor.setDefinition(baseResultData, customResultData);
                } else if (_.keys(baseResultData).length > 0) {
                    appDescriptor.setDefinition(baseResultData);
                }
            };

            var loadDefinition = function (appDescriptor) {
                var deferrable = $q.defer();
                loadConfig(baseUrl + appDescriptor.contextPath + "/app.json").then(
                function (baseResult) {
                    if (baseResult.data.shouldOverRideConfig) {
                        loadConfig(customUrl + appDescriptor.contextPath + "/app.json").then(function (customResult) {
                            setDefinition(baseResult.data, customResult.data);
                            deferrable.resolve(appDescriptor);
                        },
                            function () {
                                setDefinition(baseResult.data);
                                deferrable.resolve(appDescriptor);
                            });
                    } else {
                        setDefinition(baseResult.data);
                        deferrable.resolve(appDescriptor);
                    }
                }, function (error) {
                    if (error.status !== 404) {
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                });
                return deferrable.promise;
            };

            var setExtensions = function (baseResultData, customResultData) {
                if (customResultData) {
                    appDescriptor.setExtensions(baseResultData, customResultData);
                } else {
                    appDescriptor.setExtensions(baseResultData);
                }
            };
            var loadExtensions = function (appDescriptor, extensionFileName) {
                var deferrable = $q.defer();
                loadConfig(baseUrl + appDescriptor.extensionPath + extensionFileName).then(function (baseResult) {
                    if (baseResult.data.shouldOverRideConfig) {
                        loadConfig(customUrl + appDescriptor.extensionPath + extensionFileName).then(
                        function (customResult) {
                            setExtensions(baseResult.data, customResult.data);
                            deferrable.resolve(appDescriptor);
                        },
                        function () {
                            setExtensions(baseResult.data);
                            deferrable.resolve(appDescriptor);
                        });
                    } else {
                        setExtensions(baseResult.data);
                        deferrable.resolve(appDescriptor);
                    }
                }, function (error) {
                    if (error.status !== 404) {
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                });
                return deferrable.promise;
            };

            var setDefaultPageConfig = function (pageName, baseResultData, customResultData) {
                if (customResultData && (_.keys(customResultData).length > 0 || _.keys(baseResultData).length > 0)) {
                    appDescriptor.addConfigForPage(pageName, baseResultData, customResultData);
                } else if (_.keys(baseResultData).length > 0) {
                    appDescriptor.addConfigForPage(pageName, baseResultData);
                }
            };

            var loadPageConfig = function (pageName, appDescriptor) {
                var deferrable = $q.defer();
                loadConfig(baseUrl + appDescriptor.contextPath + "/" + pageName + ".json").then(
                function (baseResult) {
                    if (baseResult.data.shouldOverRideConfig) {
                        loadConfig(customUrl + appDescriptor.contextPath + "/" + pageName + ".json").then(
                            function (customResult) {
                                setDefaultPageConfig(pageName, baseResult.data, customResult.data);
                                deferrable.resolve(appDescriptor);
                            },
                            function () {
                                setDefaultPageConfig(pageName, baseResult.data);
                                deferrable.resolve(appDescriptor);
                            });
                    } else {
                        setDefaultPageConfig(pageName, baseResult.data);
                        deferrable.resolve(appDescriptor);
                    }
                }, function (error) {
                    if (error.status !== 404) {
                        messagingService.showMessage('error', "Incorrect Configuration:  " + error.message);
                        deferrable.reject(error);
                    } else {
                        deferrable.resolve(appDescriptor);
                    }
                });
                return deferrable.promise;
            };
            this.getAppDescriptor = function () {
                return appDescriptor;
            };

            this.configBaseUrl = function () {
                return baseUrl;
            };

            this.loadCsvFileFromConfig = function (name) {
                return loadConfig(baseUrl + appDescriptor.contextPath + "/" + name);
            };

            this.loadConfig = function (name, shouldMerge) {
                return loadConfig(baseUrl + appDescriptor.contextPath + "/" + name).then(
                function (baseResponse) {
                    if (baseResponse.data.shouldOverRideConfig) {
                        return loadConfig(customUrl + appDescriptor.contextPath + "/" + name).then(function (customResponse) {
                            if (shouldMerge || shouldMerge === undefined) {
                                return mergeService.merge(baseResponse.data, customResponse.data);
                            }
                            return [baseResponse.data, customResponse.data];
                        }, function () {
                            return baseResponse.data;
                        });
                    } else {
                        return baseResponse.data;
                    }
                }
            );
            };

            this.loadMandatoryConfig = function (path) {
                return $http.get(path);
            };

            this.getAppName = function () {
                return this.appName;
            };

            this.initApp = function (appName, options, extensionFileSuffix, configPages) {
                this.appName = appName;
                var appLoader = $q.defer();
                var extensionFileName = (extensionFileSuffix && extensionFileSuffix.toLowerCase() !== 'default') ? "/extension-" + extensionFileSuffix + ".json" : "/extension.json";
                var promises = [];
                var opts = options || {'app': true, 'extension': true};

                var inheritAppContext = (!opts.inherit) ? true : opts.inherit;

                appDescriptor = new Bahmni.Common.AppFramework.AppDescriptor(appName, inheritAppContext, function () {
                    return currentUser;
                }, mergeService);

                var loadCredentialsPromise = sessionService.loadCredentials();
                var loadProviderPromise = loadCredentialsPromise.then(sessionService.loadProviders);

                promises.push(loadCredentialsPromise);
                promises.push(loadProviderPromise);
                if (opts.extension) {
                    promises.push(loadExtensions(appDescriptor, extensionFileName));
                }
                if (opts.template) {
                    promises.push(loadTemplate(appDescriptor));
                }
                if (opts.app) {
                    promises.push(loadDefinition(appDescriptor));
                }
                if (!_.isEmpty(configPages)) {
                    configPages.forEach(function (configPage) {
                        promises.push(loadPageConfig(configPage, appDescriptor));
                    });
                }
                $q.all(promises).then(function (results) {
                    currentUser = results[0];
                    appLoader.resolve(appDescriptor);
                    $rootScope.$broadcast('event:appExtensions-loaded');
                }, function (errors) {
                    appLoader.reject(errors);
                });
                return appLoader.promise;
            };
        }]);

'use strict';

angular.module('bahmni.common.appFramework')
    .service('mergeService', [function () {
        this.merge = function (base, custom) {
            var mergeResult = $.extend(true, {}, base, custom);
            return deleteNullValuedKeys(mergeResult);
        };
        var deleteNullValuedKeys = function (currentObject) {
            _.forOwn(currentObject, function (value, key) {
                if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) ||
                    (_.isObject(value) && _.isNull(deleteNullValuedKeys(value)))) {
                    delete currentObject[key];
                }
            });
            return currentObject;
        };
    }]);

angular.module('bahmni.common.uiHelper', ['ngClipboard']);

'use strict';

angular.module('bahmni.common.uiHelper')
    .service('backlinkService', ['$window', function ($window) {
        var self = this;

        var urls = [];
        self.reset = function () {
            urls = [];
        };

        self.setUrls = function (backLinks) {
            self.reset();
            angular.forEach(backLinks, function (backLink) {
                self.addUrl(backLink);
            });
        };

        self.addUrl = function (backLink) {
            urls.push(backLink);
        };

        self.addBackUrl = function (label) {
            var backLabel = label || "Back";
            urls.push({label: backLabel, action: $window.history.back});
        };

        self.getUrlByLabel = function (label) {
            return urls.filter(function (url) {
                return url.label === label;
            });
        };

        self.getAllUrls = function () {
            return urls;
        };
    }]);

'use strict';

angular.module('bahmni.common.uiHelper')
.filter('days', function () {
    return function (startDate, endDate) {
        return Bahmni.Common.Util.DateUtil.diffInDays(startDate, endDate);
    };
}).filter('bahmniDateTime', function () {
    return function (date) {
        return Bahmni.Common.Util.DateUtil.formatDateWithTime(date);
    };
}).filter('bahmniDate', function () {
    return function (date) {
        return Bahmni.Common.Util.DateUtil.formatDateWithoutTime(date);
    };
}).filter('bahmniTime', function () {
    return function (date) {
        return Bahmni.Common.Util.DateUtil.formatTime(date);
    };
}).filter('bahmniDateInStrictMode', function () {
    return function (date) {
        return Bahmni.Common.Util.DateUtil.formatDateInStrictMode(date);
    };
});

'use strict';

angular.module('bahmni.common.uiHelper')
    .factory('spinner', ['messagingService', '$timeout', function (messagingService, $timeout) {
        var tokens = [];

        var topLevelDiv = function (element) {
            return $(element).find("div").eq(0);
        };

        var showSpinnerForElement = function (element) {
            if ($(element).find(".dashboard-section-loader").length === 0) {
                topLevelDiv(element)
                    .addClass('spinnable')
                    .append('<div class="dashboard-section-loader"></div>');
            }
            return {
                element: $(element).find(".dashboard-section-loader")
            };
        };

        var showSpinnerForOverlay = function () {
            var token = Math.random();
            tokens.push(token);

            if ($('#overlay').length === 0) {
                $('body').prepend('<div id="overlay"><div></div></div>');
            }

            var spinnerElement = $('#overlay');
            spinnerElement.stop().show();

            return {
                element: spinnerElement,
                token: token
            };
        };

        var show = function (element) {
            if (element !== undefined) {
                return showSpinnerForElement(element);
            }

            return showSpinnerForOverlay();
        };

        var hide = function (spinner, parentElement) {
            var spinnerElement = spinner.element;
            if (spinner.token) {
                _.pull(tokens, spinner.token);
                if (tokens.length === 0) {
                    spinnerElement.fadeOut(300);
                }
            } else {
                topLevelDiv(parentElement).removeClass('spinnable');
                spinnerElement && spinnerElement.remove();
            }
        };

        var forPromise = function (promise, element) {
            return $timeout(function () {
                // Added timeout to push a new event into event queue. So that its callback will be invoked once DOM is completely rendered
                var spinner = show(element);                      // Don't inline this element
                promise['finally'](function () {
                    hide(spinner, element);
                });
                return promise;
            });
        };

        var forAjaxPromise = function (promise, element) {
            var spinner = show(element);
            promise.always(function () {
                hide(spinner, element);
            });
            return promise;
        };

        return {
            forPromise: forPromise,
            forAjaxPromise: forAjaxPromise,
            show: show,
            hide: hide
        };
    }]);

'use strict';

angular.module('bahmni.common.uiHelper')
 .directive('bmBackLinks', function () {
     return {
         template: '<ul>' +
                        '<li ng-repeat="backLink in backLinks">' +
                            '<a class="back-btn" ng-if="backLink.action" accesskey="{{backLink.accessKey}}" ng-click="closeAllDialogs();backLink.action()" id="{{backLink.id}}"> <span ng-bind-html="backLink.label"></span> </a>' +
                            '<a class="back-btn" ng-class="{\'dashboard-link\':backLink.image}" ng-if="backLink.url" accesskey="{{backLink.accessKey}}" ng-href="{{backLink.url}}" ng-click="closeAllDialogs()" id="{{backLink.id}}"  title="{{backLink.title}}"> ' +
                                '<img ng-if="backLink.image" ng-src="{{backLink.image}}" onerror="this.onerror=null; this.src=\'../images/blank-user.gif\'"/>' +
                                '<i ng-if="backLink.icon && !backLink.image" class="fa {{backLink.icon}}"></i></a>' +
                            '<a class="back-btn" ng-if="backLink.state && !backLink.text" accesskey="{{backLink.accessKey}}" ui-sref="{{backLink.state}}" ng-click="closeAllDialogs()" id="{{backLink.id}}">' +
                                '<i ng-if="backLink.icon" class="fa {{backLink.icon}}"></i></a>' +
         '<a ng-if="backLink.text && backLink.requiredPrivilege" show-if-privilege="{{backLink.requiredPrivilege}}" accesskey="{{backLink.accessKey}}" ui-sref="{{backLink.state}}" id="{{backLink.id}}" class="back-btn-noIcon" ui-sref-active="active">' +
         '<span>{{backLink.text | translate}}</span>' +
         '        </a>' +
                '<a ng-if="backLink.text && !backLink.requiredPrivilege" accesskey="{{backLink.accessKey}}" ui-sref="{{backLink.state}}" id="{{backLink.id}}" class="back-btn-noIcon" ui-sref-active="active">' +
                 '<span>{{backLink.text | translate}}</span>' +
        '        </a>' +
                        '</li>' +
                    '</ul>',
         controller: function ($scope, backlinkService) {
             $scope.backLinks = backlinkService.getAllUrls();
             $scope.$on('$stateChangeSuccess', function (event, state) {
                 if (state.data && state.data.backLinks) {
                     backlinkService.setUrls(state.data.backLinks);
                     $scope.backLinks = backlinkService.getAllUrls();
                 }
             });

             $scope.$on("$destroy", function () {
                 window.onbeforeunload = undefined;
             });
         },
         restrict: 'E'
     };
 });

'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('nonBlank', function () {
        return function ($scope, element, attrs) {
            var addNonBlankAttrs = function () {
                element.attr({'required': 'required'});
            };

            var removeNonBlankAttrs = function () {
                element.removeAttr('required');
            };

            if (!attrs.nonBlank) {
                return addNonBlankAttrs(element);
            }

            $scope.$watch(attrs.nonBlank, function (value) {
                return value ? addNonBlankAttrs() : removeNonBlankAttrs();
            });
        };
    })
    .directive('datepicker', function () {
        var link = function ($scope, element, attrs, ngModel) {
            var maxDate = attrs.maxDate;
            var minDate = attrs.minDate || "-120y";
            var format = attrs.dateFormat || 'dd-mm-yy';
            element.datepicker({
                changeYear: true,
                changeMonth: true,
                maxDate: maxDate,
                minDate: minDate,
                yearRange: 'c-120:c+120',
                dateFormat: format,
                onSelect: function (dateText) {
                    $scope.$apply(function () {
                        ngModel.$setViewValue(dateText);
                    });
                }
            });
        };

        return {
            require: 'ngModel',
            link: link
        };
    })
    .directive('myAutocomplete', ['$parse', function ($parse) {
        var link = function (scope, element, attrs, ngModelCtrl) {
            var ngModel = $parse(attrs.ngModel);
            var source = scope.source();
            var responseMap = scope.responseMap();
            var onSelect = scope.onSelect();

            element.autocomplete({
                autofocus: true,
                minLength: 2,
                source: function (request, response) {
                    source(attrs.id, request.term, attrs.itemType).then(function (data) {
                        var results = responseMap ? responseMap(data.data) : data.data;
                        response(results);
                    });
                },
                select: function (event, ui) {
                    scope.$apply(function (scope) {
                        ngModelCtrl.$setViewValue(ui.item.value);
                        scope.$eval(attrs.ngChange);
                        if (onSelect != null) {
                            onSelect(ui.item);
                        }
                    });
                    return true;
                },
                search: function (event) {
                    var searchTerm = $.trim(element.val());
                    if (searchTerm.length < 2) {
                        event.preventDefault();
                    }
                }
            });
        };
        return {
            link: link,
            require: 'ngModel',
            scope: {
                source: '&',
                responseMap: '&',
                onSelect: '&'
            }
        };
    }])
    .directive('bmForm', ['$timeout', function ($timeout) {
        var link = function (scope, elem, attrs) {
            $timeout(function () {
                $(elem).unbind('submit').submit(function (e) {
                    var formScope = scope.$parent;
                    var formName = attrs.name;
                    e.preventDefault();
                    if (scope.autofillable) {
                        $(elem).find('input').trigger('change');
                    }
                    if (formScope[formName].$valid) {
                        formScope.$apply(attrs.ngSubmit);
                        $(elem).removeClass('submitted-with-error');
                    } else {
                        $(elem).addClass('submitted-with-error');
                    }
                });
            }, 0);
        };
        return {
            link: link,
            require: 'form',
            scope: {
                autofillable: "="
            }
        };
    }])
    .directive('patternValidate', ['$timeout', function ($timeout) {
        return function ($scope, element, attrs) {
            var addPatternToElement = function () {
                if ($scope.fieldValidation && $scope.fieldValidation[attrs.id]) {
                    element.attr({"pattern": $scope.fieldValidation[attrs.id].pattern, "title": $scope.fieldValidation[attrs.id].errorMessage, "type": "text"});
                }
            };

            $timeout(addPatternToElement);
        };
    }])
    .directive('validateOn', function () {
        var link = function (scope, element, attrs, ngModelCtrl) {
            var validationMessage = attrs.validationMessage || 'Please enter a valid detail';

            var setValidity = function (value) {
                var valid = value ? true : false;
                ngModelCtrl.$setValidity('blank', valid);
                element[0].setCustomValidity(!valid ? validationMessage : '');
            };
            scope.$watch(attrs.validateOn, setValidity, true);
        };

        return {
            link: link,
            require: 'ngModel'
        };
    });

'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('MessageController', ['$scope', 'messagingService',
        function ($scope, messagingService) {
            $scope.messages = messagingService.messages;

            $scope.getMessageText = function (level) {
                var string = "";
                $scope.messages[level].forEach(function (message) {
                    string = string.concat(message.value);
                });
                return string;
            };

            $scope.hideMessage = function (level) {
                messagingService.hideMessages(level);
            };

            $scope.isErrorMessagePresent = function () {
                return $scope.messages.error.length > 0;
            };

            $scope.isInfoMessagePresent = function () {
                return $scope.messages.info.length > 0;
            };
        }]);

'use strict';

angular.module('bahmni.common.uiHelper')
    .service('messagingService', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        this.messages = {error: [], info: []};
        var self = this;

        $rootScope.$on('event:serverError', function (event, errorMessage) {
            self.showMessage('error', errorMessage, 'serverError');
        });

        this.showMessage = function (level, message, errorEvent) {
            var messageObject = {'value': '', 'isServerError': false};
            messageObject.value = message;
            if (errorEvent) {
                messageObject.isServerError = true;
            } else if (level == 'info') {
                this.createTimeout('info', 4000);
            }

            var index = _.findIndex(this.messages[level], function (msg) {
                return msg.value == messageObject.value;
            });

            if (index >= 0) {
                this.messages[level].splice(index, 1);
            }
            this.messages[level].push(messageObject);
        };

        this.createTimeout = function (level, time) {
            $timeout(function () {
                self.messages[level] = [];
            }, time, true);
        };

        this.hideMessages = function (level) {
            self.messages[level].length = 0;
        };

        this.clearAll = function () {
            self.messages["error"] = [];
            self.messages["info"] = [];
        };
    }]);

'use strict';

Bahmni.Common.Util.DateUtil = {
    diffInDays: function (dateFrom, dateTo) {
        return Math.floor((this.parse(dateTo) - this.parse(dateFrom)) / (60 * 1000 * 60 * 24));
    },

    diffInMinutes: function (dateFrom, dateTo) {
        return moment(dateTo).diff(moment(dateFrom), 'minutes');
    },

    diffInSeconds: function (dateFrom, dateTo) {
        return moment(dateFrom).diff(moment(dateTo), 'seconds');
    },

    isInvalid: function (date) {
        return date == "Invalid Date";
    },

    diffInDaysRegardlessOfTime: function (dateFrom, dateTo) {
        var from = new Date(dateFrom);
        var to = new Date(dateTo);
        from.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);
        return Math.floor((to - from) / (60 * 1000 * 60 * 24));
    },

    addSeconds: function (date, seconds) {
        return moment(date).add(seconds, 'seconds').toDate();
    },

    addMinutes: function (date, minutes) {
        return this.addSeconds(date, minutes * 60);
    },

    addDays: function (date, days) {
        return moment(date).add(days, 'day').toDate();
    },
    addMonths: function (date, months) {
        return moment(date).add(months, 'month').toDate();
    },
    addYears: function (date, years) {
        return moment(date).add(years, 'year').toDate();
    },

    subtractSeconds: function (date, seconds) {
        return moment(date).subtract(seconds, 'seconds').toDate();
    },
    subtractDays: function (date, days) {
        return this.addDays(date, -1 * days);
    },
    subtractMonths: function (date, months) {
        return this.addMonths(date, -1 * months);
    },
    subtractYears: function (date, years) {
        return this.addYears(date, -1 * years);
    },

    createDays: function (startDate, endDate) {
        var startDate = this.getDate(startDate);
        var endDate = this.getDate(endDate);
        var numberOfDays = this.diffInDays(startDate, endDate);
        var days = [];
        for (var i = 0; i <= numberOfDays; i++) {
            days.push({dayNumber: i + 1, date: this.addDays(startDate, i)});
        }
        return days;
    },

    getDayNumber: function (referenceDate, date) {
        return this.diffInDays(this.getDate(referenceDate), this.getDate(date)) + 1;
    },

    getDateWithoutTime: function (datetime) {
        return datetime ? moment(datetime).format("YYYY-MM-DD") : null;
    },

    getDateInMonthsAndYears: function (date, format) {
        var format = format || "MMM YY";
        var dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        if (!moment(dateRepresentation).isValid()) {
            return date;
        }
        return dateRepresentation ? moment(dateRepresentation).format(format) : null;
    },

    formatDateWithTime: function (datetime) {
        var dateRepresentation = isNaN(Number(datetime)) ? datetime : Number(datetime);
        if (!moment(dateRepresentation).isValid()) {
            return datetime;
        }
        return dateRepresentation ? moment(dateRepresentation).format("DD MMM YY h:mm a") : null;
    },

    formatDateWithoutTime: function (date) {
        var dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        if (!moment(dateRepresentation).isValid()) {
            return date;
        }
        return dateRepresentation ? moment(dateRepresentation).format("DD MMM YY") : null;
    },

    formatDateInStrictMode: function (date) {
        var dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        if (moment(dateRepresentation, 'YYYY-MM-DD', true).isValid()) {
            return moment(dateRepresentation).format("DD MMM YY");
        }
        if (moment(dateRepresentation, 'YYYY-MM-DDTHH:mm:ss.SSSZZ', true).isValid()) {
            return moment(dateRepresentation).format("DD MMM YY");
        }
        return date;
    },

    formatTime: function (date) {
        var dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        if (!moment(dateRepresentation).isValid()) {
            return date;
        }
        return dateRepresentation ? moment(dateRepresentation).format("h:mm a") : null;
    },

    getDate: function (dateTime) {
        return moment(this.parse(dateTime)).startOf('day').toDate();
    },

    parse: function (dateString) {
        return dateString ? moment(dateString).toDate() : null;
    },

    parseDatetime: function (dateTimeString) {
        return dateTimeString ? moment(dateTimeString) : null;
    },

    now: function () {
        return new Date();
    },

    today: function () {
        return this.getDate(this.now());
    },
    endOfToday: function () {
        return moment(this.parse(this.now())).endOf('day').toDate();
    },

    getDateWithoutHours: function (dateString) {
        return moment(dateString).toDate().setHours(0, 0, 0, 0);
    },

    getDateTimeWithoutSeconds: function (dateString) {
        return moment(dateString).toDate().setSeconds(0, 0);
    },

    isSameDateTime: function (date1, date2) {
        if (date1 == null || date2 == null) {
            return false;
        }
        var dateOne = this.parse(date1);
        var dateTwo = this.parse(date2);
        return dateOne.getTime() == dateTwo.getTime();
    },

    isBeforeDate: function (date1, date2) {
        return moment(date1).isBefore(moment(date2));
    },
    isSameDate: function (date1, date2) {
        if (date1 == null || date2 == null) {
            return false;
        }
        var dateOne = this.parse(date1);
        var dateTwo = this.parse(date2);
        return dateOne.getFullYear() === dateTwo.getFullYear() &&
            dateOne.getMonth() === dateTwo.getMonth() &&
            dateOne.getDate() === dateTwo.getDate();
    },

    diffInYearsMonthsDays: function (dateFrom, dateTo) {
        dateFrom = this.parse(dateFrom);
        dateTo = this.parse(dateTo);

        var from = {
            d: dateFrom.getDate(),
            m: dateFrom.getMonth(),
            y: dateFrom.getFullYear()
        };

        var to = {
            d: dateTo.getDate(),
            m: dateTo.getMonth(),
            y: dateTo.getFullYear()
        };

        var age = {
            d: 0,
            m: 0,
            y: 0
        };

        var daysFebruary = to.y % 4 != 0 || (to.y % 100 == 0 && to.y % 400 != 0) ? 28 : 29;
        var daysInMonths = [31, daysFebruary, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        age.y = to.y - from.y;
        age.m = to.m - from.m;

        if (from.m > to.m) {
            age.y = age.y - 1;
            age.m = to.m - from.m + 12;
        }
        age.d = to.d - from.d;

        if (from.d > to.d) {
            age.m = age.m - 1;

            if (from.m == to.m) {
                age.y = age.y - 1;
                age.m = age.m + 12;
            }
            age.d = to.d - from.d + daysInMonths[parseInt(from.m)];
        }
        return {
            days: age.d,
            months: age.m,
            years: age.y
        };
    },

    convertToUnits: function (minutes) {
        var allUnits = {"Years": 365 * 24 * 60, "Months": 30 * 24 * 60, "Weeks": 7 * 24 * 60, "Days": 24 * 60, "Hours": 60, "Minutes": 1};

        var durationRepresentation = function (value, unitName, unitValueInMinutes) {
            return {"value": value, "unitName": unitName, "unitValueInMinutes": unitValueInMinutes, "allUnits": allUnits };
        };

        for (var unitName in allUnits) {
            var unitValueInMinutes = allUnits[unitName];
            if (minutes || minutes !== 0) {
                if (minutes >= unitValueInMinutes && minutes % unitValueInMinutes === 0) {
                    return durationRepresentation(minutes / unitValueInMinutes, unitName, unitValueInMinutes);
                }
            }
        }
        return durationRepresentation(undefined, undefined, undefined);
    },

    getEndDateFromDuration: function (dateFrom, value, unit) {
        dateFrom = this.parse(dateFrom);
        var from = {
            h: dateFrom.getHours(),
            d: dateFrom.getDate(),
            m: dateFrom.getMonth(),
            y: dateFrom.getFullYear()
        };
        var to = new Date(from.y, from.m, from.d, from.h);

        if (unit === "Months") {
            to.setMonth(from.m + value);
        } else if (unit === "Weeks") {
            to.setDate(from.d + (value * 7));
        } else if (unit === "Days") {
            to.setDate(from.d + value);
        } else if (unit === "Hours") {
            to.setHours(from.h + value);
        }
        return to;
    },

    parseLongDateToServerFormat: function (longDate) {
        return longDate ? moment(longDate).format("YYYY-MM-DDTHH:mm:ss.SSS") : null;
    },

    parseServerDateToDate: function (longDate) {
        return longDate ? moment(longDate, "YYYY-MM-DDTHH:mm:ss.SSSZZ").toDate() : null;
    },
    getDateTimeInSpecifiedFormat: function (date, format) {
        return date ? moment(date).format(format) : null;
    },
    getISOString: function (date) {
        return date ? moment(date).toDate().toISOString() : null;
    }
};

'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('toggle', function () {
        var link = function ($scope, element) {
            $scope.toggle = $scope.toggle === undefined ? false : $scope.toggle;
            $(element).click(function () {
                $scope.$apply(function () {
                    $scope.toggle = !$scope.toggle;
                });
            });

            $scope.$watch('toggle', function () {
                $(element).toggleClass('active', $scope.toggle);
            });

            $scope.$on("$destroy", function () {
                element.off('click');
            });
        };

        return {
            scope: {
                toggle: "="
            },
            link: link
        };
    });

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Logging = Bahmni.Common.Logging || {};

angular.module('bahmni.common.logging', []);

'use strict';

angular.module('bahmni.common.logging')
.config(['$provide', function ($provide) {
    $provide.decorator("$exceptionHandler", function ($delegate, $injector, $window, $log) {
        var logError = function (exception, cause) {
            try {
                var messagingService = $injector.get('messagingService');
                var loggingService = $injector.get('loggingService');
                var errorMessage = exception.toString();
                var stackTrace = printStackTrace({ e: exception });
                var errorDetails = {
                    timestamp: new Date(),
                    browser: $window.navigator.userAgent,
                    errorUrl: $window.location.href,
                    errorMessage: errorMessage,
                    stackTrace: stackTrace,
                    cause: (cause || "")
                };
                loggingService.log(errorDetails);
                messagingService.showMessage('error', errorMessage);
                exposeException(errorDetails);
            } catch (loggingError) {
                $log.warn("Error logging failed");
                $log.log(loggingError);
            }
        };

        var exposeException = function (exceptionDetails) {
            window.angular_exception = window.angular_exception || [];
            window.angular_exception.push(exceptionDetails);
        };

        return function (exception, cause) {
            $delegate(exception, cause);
            logError(exception, cause);
        };
    });
}]);

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.I18n = Bahmni.Common.I18n || {};

angular.module('bahmni.common.i18n', []);

'use strict';

angular.module('bahmni.common.i18n', ['pascalprecht.translate'])
    .provider('$bahmniTranslate', ['$translateProvider', function ($translateProvider) {
        this.init = function (options) {
            var preferredLanguage = window.localStorage["NG_TRANSLATE_LANG_KEY"] || "en";
            $translateProvider.useLoader('mergeLocaleFilesService', options);
            $translateProvider.useSanitizeValueStrategy('escaped');
            $translateProvider.preferredLanguage(preferredLanguage);
            $translateProvider.useLocalStorage();
        };
        this.$get = [function () {
            return $translateProvider;
        }];
    }
    ])
    .filter('titleTranslate', ['$translate', function ($translate) {
        return function (input) {
            if (!input) {
                return input;
            }
            if (input.translationKey) {
                return $translate.instant(input.translationKey);
            }
            if (input.dashboardName) {
                return input.dashboardName;
            }
            if (input.title) {
                return input.title;
            }
            if (input.label) {
                return input.label;
            }
            if (input.display) {
                return input.display;
            }
            return $translate.instant(input);
        };
    }]);

'use strict';

angular.module('bahmni.common.i18n')
    .service('mergeLocaleFilesService', ['$http', '$q', 'mergeService', function ($http, $q, mergeService) {
        return function (options) {
            var baseLocaleUrl = '../i18n/';
            var customLocaleUrl = Bahmni.Common.Constants.offlineRootDir + '/bahmni_config/openmrs/i18n/';

            var loadFile = function (url) {
                return $http.get(url, {withCredentials: true});
            };

            var mergeLocaleFile = function (options) {
                var fileURL = options.app + "/locale_" + options.key + ".json";

                var loadBahmniTranslations = function () {
                    return loadFile(baseLocaleUrl + fileURL).then(function (result) {
                        return result;
                    }, function () {
                        return;
                    });
                };
                var loadCustomTranslations = function () {
                    return loadFile(customLocaleUrl + fileURL).then(function (result) {
                        return result;
                    }, function () {
                        return;
                    });
                };

                var mergeTranslations = function (result) {
                    var baseFileData = result[0] ? result[0].data : undefined;
                    var customFileData = result[1] ? result[1].data : undefined;
                    if (options.shouldMerge || options.shouldMerge === undefined) {
                        return mergeService.merge(baseFileData, customFileData);
                    }
                    return [baseFileData, customFileData];
                };

                return $q.all([loadBahmniTranslations(), loadCustomTranslations()])
                    .then(mergeTranslations);
            };
            return mergeLocaleFile(options);
        };
    }]);

'use strict';

angular.module('bahmni.home', ['ui.router', 'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.common.i18n', 'bahmni.common.uiHelper', 'bahmni.common.util',
    'bahmni.common.appFramework', 'bahmni.common.logging', 'bahmni.common.routeErrorHandler', 'pascalprecht.translate', 'ngCookies', 'bahmni.common.offline',
    'bahmni.common.models'])
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', '$compileProvider',
        function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
            $urlRouterProvider.otherwise('/dashboard');

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|file):/);

            $compileProvider.debugInfoEnabled(false);

            $stateProvider
            .state('dashboard',
                {
                    url: '/dashboard',
                    templateUrl: 'views/dashboard.html',
                    controller: 'DashboardController',
                    data: {extensionPointId: 'org.bahmni.home.dashboard'},
                    resolve: {
                        offlineDb: function (offlineDbInitialization) {
                            return offlineDbInitialization();
                        },
                        initialize: function (initialization, offlineDb) {
                            return initialization(offlineDb);
                        },
                        webWorker: function (schedulerService, initialize) {
                            return schedulerService.sync();
                        }
                    }
                }).state('changePassword', {
                    url: '/changePassword',
                    templateUrl: 'views/changePassword.html',
                    controller: 'ChangePasswordController'
                }).state('login',
                {
                    url: '/login?showLoginMessage',
                    templateUrl: 'views/login.html',
                    controller: 'LoginController',
                    resolve: {
                        offlineDb: function (offlineDbInitialization) {
                            return offlineDbInitialization();
                        },
                        initialData: function (loginInitialization, offlineDb) {
                            return loginInitialization();
                        },
                        webWorker: function (schedulerService, initialData) {
                            return schedulerService.stopSync();
                        }
                    }
                })
            .state('errorLog', {
                url: '/errorLog',
                controller: 'ErrorLogController',
                templateUrl: 'views/errorLog.html',
                data: {
                    backLinks: [
                        {label: "Home", state: "dashboard", accessKey: "h", icon: "fa-home"}
                    ]
                },
                resolve: {
                    offlineDb: function (offlineDbInitialization) {
                        return offlineDbInitialization();
                    }
                }
            });
            $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
            $bahmniTranslateProvider.init({app: 'home', shouldMerge: true});
        }]).run(['$rootScope', '$templateCache', function ($rootScope, $templateCache) {
        // Disable caching view template partials
            $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            });
        }]);

'use strict';

angular.module('bahmni.home')
    .factory('initialization', ['$rootScope', 'appService', 'spinner',
        function ($rootScope, appService, spinner) {
            var initApp = function () {
                return appService.initApp('home');
            };
            return function () {
                return spinner.forPromise(initApp());
            };
        }
    ]);

'use strict';

angular.module('bahmni.home')
    .factory('loginInitialization', ['$rootScope', '$q', 'locationService', 'spinner', 'messagingService',
        function ($rootScope, $q, locationService, spinner, messagingService) {
            var init = function () {
                var deferrable = $q.defer();
                locationService.getAllByTag("Login Location").then(
                    function (response) {
                        deferrable.resolve({locations: response.data.results});
                    },
                    function (response) {
                        deferrable.reject();
                        if (response.status) {
                            response = 'MESSAGE_START_OPENMRS';
                        }
                        messagingService.showMessage('error', response);
                    }
                );
                return deferrable.promise;
            };

            return function () {
                return spinner.forPromise(init());
            };
        }
    ]);

'use strict';

angular.module('bahmni.home')
    .controller('LoginController', ['$rootScope', '$scope', '$window', '$location', 'sessionService', 'initialData', 'spinner', '$q', '$stateParams', '$bahmniCookieStore', 'localeService', '$translate', 'userService', 'offlineService',
        function ($rootScope, $scope, $window, $location, sessionService, initialData, spinner, $q, $stateParams, $bahmniCookieStore, localeService, $translate, userService, offlineService) {
            var redirectUrl = $location.search()['from'];
            var landingPagePath = "/dashboard";
            var loginPagePath = "/login";
            var isOfflineApp = offlineService.isOfflineApp();
            $scope.locations = initialData.locations;
            $scope.loginInfo = {};
            var localeLanguages = [];

            var getLocalTimeZone = function () {
                var currentLocalTime = new Date().toString();
                var localTimeZoneList = currentLocalTime.split(" ");
                var localTimeZone = localTimeZoneList[localTimeZoneList.length - 1];
                localTimeZone = localTimeZone.substring(1, localTimeZone.length - 1);
                return localTimeZone;
            };

            var findLanguageByLocale = function (localeCode) {
                return _.find(localeLanguages, function (localeLanguage) {
                    return localeLanguage.code == localeCode; });
            };

            var promise = localeService.allowedLocalesList();
            localeService.serverDateTime().then(function (response) {
                var serverTime = response.data.date;
                var list = serverTime.split(" ");
                var serverTimeZone = list[list.length - 1];
                var localTime = new Date().toLocaleString();
                var localtimeZone = getLocalTimeZone();
                var localeTimeZone = localTime + " " + localtimeZone;
                $scope.timeZoneObject = { serverTime: serverTime, localeTimeZone: localeTimeZone};
                if (localtimeZone !== serverTimeZone) {
                    $scope.warning = "Warning";
                    $scope.warningMessage = "WARNING_SERVER_TIME_ZONE_MISMATCH";
                }
            });

            localeService.getLoginText().then(function (response) {
                $scope.logo = response.data.loginPage.logo;
                $scope.headerText = response.data.loginPage.showHeaderText;
                $scope.titleText = response.data.loginPage.showTitleText;
                $scope.helpLink = response.data.helpLink.url;
            });

            localeService.getLocalesLangs().then(function (response) {
                localeLanguages = response.data.locales;
            }).finally(function () {
                promise.then(function (response) {
                    var localeList = response.data.replace(/\s+/g, '').split(',');
                    $scope.locales = [];
                    _.forEach(localeList, function (locale) {
                        var localeLanguage = findLanguageByLocale(locale);
                        if (_.isUndefined(localeLanguage)) {
                            $scope.locales.push({"code": locale, "nativeName": locale});
                        }
                        else {
                            $scope.locales.push(localeLanguage);
                        }
                    });
                    $scope.selectedLocale = $translate.use() ? $translate.use() : $scope.locales[0].code;
                });
            });

            $scope.isChrome = function () {
                if ($window.navigator.userAgent.indexOf("Chrome") != -1) {
                    return true;
                }
                return false;
            };

            $scope.$watch('selectedLocale', function () {
                $translate.use($scope.selectedLocale);
            });

            var getLoginLocationUuid = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid : null;
            };
            var getLastLoggedinLocation = function () {
                return _.find(initialData.locations, function (location) {
                    return location.uuid === getLoginLocationUuid();
                });
            };

            $scope.loginInfo.currentLocation = getLastLoggedinLocation();

            if ($stateParams.showLoginMessage) {
                $scope.errorMessageTranslateKey = "LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY";
            }

            var redirectToLandingPageIfAlreadyAuthenticated = function () {
                sessionService.get().then(function (data) {
                    if (data.authenticated) {
                        $location.path(landingPagePath);
                    }
                });
            };

            if ($location.path() === loginPagePath) {
                redirectToLandingPageIfAlreadyAuthenticated();
            }
            var onSuccessfulAuthentication = function () {
                if (isOfflineApp) {
                    var encryptedPassword = offlineService.encrypt($scope.loginInfo.password, Bahmni.Common.Constants.encryptionType.SHA3);
                    $scope.loginInfo.password = encryptedPassword;
                    offlineService.setItem(Bahmni.Common.Constants.LoginInformation, $scope.loginInfo);
                }
                $bahmniCookieStore.remove(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, {
                    path: '/',
                    expires: 1
                });
                $rootScope.$broadcast('event:auth-loggedin');
                $scope.loginInfo.currentLocation = getLastLoggedinLocation();
            };

            $scope.login = function () {
                $scope.errorMessageTranslateKey = null;
                var deferrable = $q.defer();

                var ensureNoSessionIdInRoot = function () {
                    // See https://bahmni.mingle.thoughtworks.com/projects/bahmni_emr/cards/2934
                    // The cookie should ideally not be set at root, and is interfering with
                    // authentication for reporting. This seems to be one of the best places to remove it.
                    $bahmniCookieStore.remove(Bahmni.Common.Constants.JSESSIONID, {
                        path: '/',
                        expires: 1
                    });
                };

                sessionService.loginUser($scope.loginInfo.username, $scope.loginInfo.password, $scope.loginInfo.currentLocation, $scope.loginInfo.otp).then(

                    function (data) {
                        console.log(data);
                        ensureNoSessionIdInRoot();
                        if (data && data.firstFactAuthorization) {
                            $scope.showOTP = true;
                            deferrable.resolve(data);
                            return;
                        }
                        sessionService.loadCredentials().then(function () {
                            onSuccessfulAuthentication();
                            $rootScope.currentUser.addDefaultLocale($scope.selectedLocale);
                            userService.savePreferences().then(
                                function () { deferrable.resolve(); },
                                function (error) { deferrable.reject(error); }
                            );
                        }, function (error) {
                            $scope.errorMessageTranslateKey = error;
                            deferrable.reject(error);
                        }
                        );
                    },
                    function (error) {
                        $scope.errorMessageTranslateKey = error;
                        if (error === 'LOGIN_LABEL_MAX_FAILED_ATTEMPTS' || error == 'LOGIN_LABEL_OTP_EXPIRED') {
                            deleteUserCredentialsAndShowLoginPage();
                        } else if (error == 'LOGIN_LABEL_WRONG_OTP_MESSAGE_KEY') {
                            delete $scope.loginInfo.otp;
                        }
                        deferrable.reject(error);
                    }
                );

                var deleteUserCredentialsAndShowLoginPage = function () {
                    $scope.showOTP = false;
                    delete $scope.loginInfo.otp;
                    delete $scope.loginInfo.username;
                    delete $scope.loginInfo.password;
                };

                $scope.resendOTP = function () {
                    var promise = sessionService.resendOTP($scope.loginInfo.username, $scope.loginInfo.password);
                    spinner.forPromise(promise);
                    promise.then(function () {
                        $scope.errorMessageTranslateKey = 'LOGIN_LABEL_RESEND_SUCCESS';
                    }, function (response) {
                        if (response.status === 429) {
                            $scope.errorMessageTranslateKey = 'LOGIN_LABEL_MAX_RESEND_ATTEMPTS';
                            deleteUserCredentialsAndShowLoginPage();
                        }
                    });
                };

                spinner.forPromise(deferrable.promise).then(
                    function (data) {
                        if (data) return;
                        if (redirectUrl) {
                            $window.location = redirectUrl;
                        } else {
                            landingPagePath = offlineService.isOfflineApp() ? $window.location = '../offline/index.html#/scheduler' : landingPagePath;
                            $location.path(landingPagePath);
                        }
                    }
                );
            };
        }]);

'use strict';

angular.module('bahmni.home')
    .controller('DashboardController', ['$scope', '$state', 'appService', 'locationService', 'spinner', '$bahmniCookieStore', '$window', '$q', 'offlineService', 'schedulerService', 'eventQueue', 'offlineDbService', 'androidDbService', 'networkStatusService', 'messagingService',
        function ($scope, $state, appService, locationService, spinner, $bahmniCookieStore, $window, $q, offlineService, schedulerService, eventQueue, offlineDbService, androidDbService, networkStatusService, messagingService) {
            $scope.appExtensions = appService.getAppDescriptor().getExtensions($state.current.data.extensionPointId, "link") || [];
            $scope.selectedLocationUuid = {};
            $scope.isOfflineApp = offlineService.isOfflineApp();

            $scope.isVisibleExtension = function (extension) {
                if (!$scope.isOfflineApp) {
                    return true;
                }
                return extension.exclusiveOnlineModule ? networkStatusService.isOnline() : extension.exclusiveOfflineModule ? !networkStatusService.isOnline() : true;
            };

            var getCurrentLocation = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) : null;
            };

            var init = function () {
                if ($scope.isOfflineApp) {
                    setWatchersForErrorStatus();
                }
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                return locationService.getAllByTag("Login Location").then(function (response) {
                    $scope.locations = response.data.results;
                    $scope.selectedLocationUuid = getCurrentLocation().uuid;
                }
                );
            };

            var getLocationFor = function (uuid) {
                return _.find($scope.locations, function (location) {
                    return location.uuid === uuid;
                });
            };

            $scope.isCurrentLocation = function (location) {
                return getCurrentLocation().uuid === location.uuid;
            };

            $scope.onLocationChange = function () {
                var selectedLocation = getLocationFor($scope.selectedLocationUuid);
                $bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {
                    name: selectedLocation.display,
                    uuid: selectedLocation.uuid
                }, {path: '/', expires: 7});
                $window.location.reload();
            };

            $scope.sync = function () {
                schedulerService.sync(Bahmni.Common.Constants.syncButtonConfiguration);
            };

            var cleanUpListenerSchedulerStage = $scope.$on("schedulerStage", function (event, stage, restartSync) {
                $scope.isSyncing = (stage !== null);
                if (restartSync) {
                    schedulerService.stopSync();
                    schedulerService.sync();
                }
            });

            $scope.$on("$destroy", cleanUpListenerSchedulerStage);

            var getLastSyncTime = function () {
                var date = offlineService.getItem('lastSyncTime');
                var localeDate = Bahmni.Common.Util.DateUtil.parseServerDateToDate(date);
                $scope.lastSyncTime = Bahmni.Common.Util.DateUtil.getDateTimeInSpecifiedFormat(localeDate, "dddd, MMMM Do YYYY, HH:mm:ss");
            };

            var getErrorCount = function () {
                return eventQueue.getErrorCount().then(function (errorCount) {
                    return errorCount;
                });
            };

            var getEventCount = function () {
                return eventQueue.getCount().then(function (eventCount) {
                    return eventCount;
                });
            };

            var updateSyncStatusMessageBasedOnQueuesCount = function () {
                getErrorCount().then(function (errorCount) {
                    if (errorCount) {
                        $scope.syncStatusMessage = Bahmni.Common.Constants.syncStatusMessages.syncFailed;
                    } else {
                        getEventCount().then(function (eventCount) {
                            $scope.syncStatusMessage = eventCount ? Bahmni.Common.Constants.syncStatusMessages.syncPending : updateLastSyncTimeOnSuccessfullSyncAnReturnSuccessMessage();
                        });
                    }
                });
            };

            var getSyncStatusInfo = function () {
                getLastSyncTime();
                $scope.isSyncing ? $scope.syncStatusMessage = "Sync in Progress..." : updateSyncStatusMessageBasedOnQueuesCount();
            };

            var setErrorStatusOnErrorsInSync = function () {
                offlineDbService.getAllLogs().then(function (errors) {
                    $scope.errorsInSync = !!errors.length;
                });
            };

            getSyncStatusInfo();
            var setWatchersForErrorStatus = function () {
                $scope.$watch('isSyncing', function () {
                    getSyncStatusInfo();
                    setErrorStatusOnErrorsInSync();
                });
            };

            var updateLastSyncTimeOnSuccessfullSyncAnReturnSuccessMessage = function () {
                if ($scope.isSyncing !== undefined) {
                    offlineService.setItem('lastSyncTime', new Date());
                    getLastSyncTime();
                }
                return Bahmni.Common.Constants.syncStatusMessages.syncSuccess;
            };

            $scope.getStatusStyleCode = function () {
                return $scope.syncStatusMessage && ($scope.syncStatusMessage.match(/.*Success.*/i) ? 'success' : $scope.syncStatusMessage.match(/.*Pending.*/i) ? 'pending' : $scope.syncStatusMessage.match(/.*Failed.*/i) ? 'fail' : 'inProgress');
            };

            $scope.changePassword = function () {
                if ($scope.isOfflineApp) {
                    messagingService.showMessage("error", "CHANGE_PASSWORD_DOES_NOT_SUPPORT");
                    return;
                }
                $state.go('changePassword');
            };

            return spinner.forPromise($q.all(init()));
        }]);

'use strict';
angular.module('bahmni.home')
    .controller('ChangePasswordController', ['$scope', '$state', 'sessionService', '$rootScope', 'authenticator', '$window', 'userService', 'messagingService', function ($scope, $state, sessionService, $rootScope, authenticator, $window, userService, messagingService) {
        $scope.loginInfo = {};
        $scope.passwordDoesNotMatch = false;
        $scope.passwordPolicies = [];
        $scope.redirectToHomePage = function () {
            $state.go('dashboard');
        };
        var checkPasswordMatches = function () {
            return $scope.loginInfo.newPassword == $scope.loginInfo.confirmPassword;
        };
        $scope.changePassword = function () {
            if (_.isEmpty($scope.loginInfo.oldPassword) || _.isEmpty($scope.loginInfo.newPassword) || _.isEmpty($scope.loginInfo.confirmPassword)) {
                return;
            }
            if (checkPasswordMatches()) {
                $scope.passwordDoesNotMatch = false;
                sessionService.changePassword($rootScope.currentUser.uuid, $scope.loginInfo.oldPassword, $scope.loginInfo.newPassword).then(function (data) {
                    messagingService.showMessage("info", 'CHANGE_PASSWORD_SUCCESSFUL_MESSAGE');
                    clearPasswordFields();
                });
            }
            else {
                $scope.passwordDoesNotMatch = true;
            }
        };
        var clearPasswordFields = function () {
            $scope.loginInfo.newPassword = undefined;
            $scope.loginInfo.oldPassword = undefined;
            $scope.loginInfo.confirmPassword = undefined;
        };
        var convertPasswordPolicies = function (policies) {
            _.forEach(policies, function (value, key) {
                switch (key) {
                case "security.passwordCannotMatchUsername" :
                    value == "true" ? $scope.passwordPolicies.splice(0, 0, 'PASSWORD_SHOULD_NOT_MATCH_USER_NAME') : '';
                    break;
                case "security.passwordMinimumLength" :
                    $scope.passwordLength = value;
                    $scope.passwordPolicies.splice(1, 0, 'PASSWORD_SHOULD_BE_MINIMUM_CHARACTERS');
                    break;
                case "security.passwordRequiresUpperAndLowerCase":
                    value == "true" ? $scope.passwordPolicies.splice(2, 0, 'PASSWORD_SHOULD_BE_A_MIX_OF_BOTH_UPPER_CASE_AND_LOWER_CASE') : '';
                    break;
                case "security.passwordRequiresDigit" :
                    value == "true" ? $scope.passwordPolicies.splice(3, 0, 'PASSWORD_SHOULD_CONTAIN_DIGITS') : '';
                    break;
                case "security.passwordRequiresNonDigit" :
                    value == "true" ? $scope.passwordPolicies.splice(4, 0, 'PASSWORD_SHOULD_HAVE_ATLEAST_ONE_NON_DIGIT') : '';
                    break;
                case "security.passwordCustomRegex":
                    if (!_.isEmpty(value)) {
                        $scope.passwordPolicies.splice(5, 0, 'PASSWORD_SHOULD_MATCH_THE_REGEX');
                        $scope.passwordRegex = value;
                    }
                }
            });
        };
        var init = function () {
            authenticator.authenticateUser().then(function () {
                userService.getPasswordPolicies().then(function (response) {
                    convertPasswordPolicies(response.data);
                });
                sessionService.loadCredentials().then(function (data) {
                });
            }, function () {
                $window.location = "../home/index.html#/login";
            });
        };
        init();
    }]);

'use strict';

angular.module('bahmni.home')
    .controller('ErrorLogController', ['$q', 'spinner', 'offlineService', 'offlineDbService', 'androidDbService', '$scope',
        function ($q, spinner, offlineService, offlineDbService, androidDbService, $scope) {
            $scope.errorLogs = [];
            $scope.showErrorLog = true;
            if (offlineService.isOfflineApp()) {
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }

                spinner.forPromise(offlineDbService.getAllLogs().then(function (response) {
                    $scope.errorLogs = response;
                    _.each($scope.errorLogs, function (errorLog) {
                        try {
                            var value = JSON.parse(errorLog.stackTrace);
                            errorLog.stackTrace = value;
                        } catch (ex) {}
                    });
                }));
            }
        }]);


(function(window, undefined) {
    "use strict";
    var version = '0.2.0';
    var internal_db_version = 5;

    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB;
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange

    if (!indexedDB) throw 'IndexedDB required';

    // define error(s) used by tcrypt
    var extend_error = function(extend, errname) {
        var err = function() {
            var tmp = extend.apply(this, arguments);
            tmp.name = this.name = errname;

            this.stack = tmp.stack
            this.message = tmp.message

            return this;
        };
        err.prototype = Object.create(extend.prototype, {
            constructor: {
                value: err
            }
        });
        return err;
    }
    var HustleError = extend_error(window.Error, 'HustleError');
    var HustleDBClosed = extend_error(HustleError, 'HustleDBClosed');
    var HustleDBOpened = extend_error(HustleError, 'HustleDBOpened');
    var HustleBadTube = extend_error(HustleError, 'HustleBadTube');
    var HustleBadID = extend_error(HustleError, 'HustleBadID');
    var HustleNotice = extend_error(window.Error, 'HustleNotice');
    var HustleNotFound = extend_error(HustleNotice, 'HustleNotFound');

    var Hustle = function(qoptions) {
        qoptions || (qoptions = {});
        if (!qoptions.tubes) qoptions.tubes = [];

        // database version. should change every time the tubes change
        var db_version = qoptions.db_version ? qoptions.db_version : 1;

        // how often we do DB maintenance
        var maintenance_delay = qoptions.maintenance_delay ? qoptions.maintenance_delay : 1000;

        // define some system db vars
        var db_name = qoptions.db_name ? qoptions.db_name : 'hustle';

        // our reserved tables
        var tbl = {
            ids: '_ids',
            reserved: '_reserved',
            delayed: '_delayed',
            buried: '_buried'
        };

        // always add a default tube
        if (qoptions.tubes.indexOf('default') < 0) qoptions.tubes.push('default');

        var db = null;

        // ---------------------------------------------------------------------
        // database-related functions
        // ---------------------------------------------------------------------

        var check_db = function() {
            if (!db) throw new HustleDBClosed('Closed database being operated on. Did you call Hustle.open()?');
            return true;
        };

        // will be filled in later
        var do_maintenance;

        /**
         * helper function, creates a table if it doesn't exist, otherwise grabs
         * it. returns the store.
         */
        var update_table_schema = function(e, tablename, options) {
            options || (options = {});
            var store = null;
            var udb = e.target.result;
            var keypath = options.keypath ? options.keypath : 'id';
            var autoinc = options.autoincrement ? options.autoincrement : false;
            // grab an existing object store or create a new one
            if (udb.objectStoreNames.contains(tablename)) {
                store = e.currentTarget.transaction.objectStore(tablename);
            } else {
                store = udb.createObjectStore(tablename, {
                    keyPath: keypath,
                    autoIncrement: autoinc
                });
            }

            if (options.indexes) {
                var keys = Object.keys(options.indexes);
                for (var i = 0; i < keys.length; i++) {
                    (function(key, idx) {
                        var index_val = idx.index ? idx.index : key;
                        var unique = idx.unique ? true : false;
                        try {
                            store.createIndex(key, index_val, {
                                unique: unique
                            });
                        }
                        // index probably exists already
                        // TODO: check store.indexNames
                        catch (e) {}
                    })(keys[i], options.indexes[keys[i]]);
                }
            }
            return store;
        };

        /**
         * open the queue database and make sure the schema is ship-shape
         */
        var open = function(options) {
            options || (options = {});

            if (db) throw new HustleDBOpened('db is already open');

            var version = (internal_db_version * 1000) + db_version;
            var req = indexedDB.open(db_name, version);
            req.onerror = function(e) {
                if (options.error) options.error(e);
            }

            req.onsuccess = function(e) {
                db = req.result;
                if (options.success) options.success(e);
                do_maintenance();
            };

            req.onupgradeneeded = function(e) {
                var store = null;
                var tubes = qoptions.tubes;

                update_table_schema(e, tbl.ids);
                update_table_schema(e, tbl.reserved, {
                    indexes: {
                        expire: {
                            index: 'expire',
                            unique: false
                        }
                    }
                });
                update_table_schema(e, tbl.delayed, {
                    indexes: {
                        activate: {
                            index: 'activate',
                            unique: false
                        }
                    }
                });
                update_table_schema(e, tbl.buried, {
                    indexes: {
                        id: {
                            unique: false
                        }
                    }
                });

                for (var i = 0; i < tubes.length; i++) {
                    if ([tbl.reserved, tbl.buried].indexOf(tubes[i]) >= 0) continue;
                    update_table_schema(e, tubes[i], {
                        indexes: {
                            priority: {
                                index: ['priority', 'id'],
                                unique: false
                            }
                        }
                    });
                }
            };
        };

        /**
         * close the queue database
         */
        var close = function() {
            if (!db) return false;
            db.close();
            db = null;
            return true;
        };

        /**
         * convenience function to obliterate the queue
         */
        var wipe = function() {
            close();
            indexedDB.deleteDatabase(db_name);
            return true;
        };

        /**
         * generate a unique, auto-incrementing ID
         */
        var new_id = function(options) {
            check_db();
            options || (options = {});


            var id = null;

            var trx = db.transaction([tbl.ids], 'readwrite');
            trx.oncomplete = function(e) {
                if (!id) {
                    if (options.error) options.error('bad id');
                    return;
                }
                if (options.success) options.success(id, e);
            };

            trx.onerror = function(e) {
                    if (options.error) options.error(e);
                }
                // upsert the ID record
            var store = trx.objectStore(tbl.ids);
            var req = store.get('id');
            req.onsuccess = function(e) {
                var item = req.result;
                if (!item) {
                    id = 1;
                    store.put({
                        id: 'id',
                        value: 1
                    });
                } else {
                    item.value++;
                    id = item.value;
                    store.put(item);
                }
            };
        };

        /**
         * generic function to move a queue item from one table to another.
         */
        var move_item = function(id, from, to, options) {
            options || (options = {});

            var trx = db.transaction([from, to], 'readwrite');
            trx.oncomplete = function(e) {
                if (options.success) options.success(e);
            };
            trx.onerror = function(e) {
                if (options.error) options.error(e);
            }

            var do_move_item = function(item, success) {
                if (options.transform) {
                    item = options.transform(item);
                }
                var store = trx.objectStore(to);
                var req = store.add(item);
                req.onsuccess = success;
            };

            var store = trx.objectStore(from);
            var req;
            if (from == tbl.buried) {
                // if we're looking up the buried table, we use the "id" index
                var index = store.index('id');
                req = index.get(id);
            } else {
                req = store.get(id);
            }
            req.onsuccess = function(e) {
                var item = req.result;
                if (!item) {
                    if (options.error) options.error(new HustleNotFound('item ' + id + ' wasn\'t found'));
                    return;
                }

                var item_id = item.id;
                // account for the buried table's IDs
                if (from == tbl.buried) item_id = item._id;

                do_move_item(item, function(e) {
                    var req = store.delete(item_id);
                    req.onerror = options.error;
                });
            };
        };

        /**
         * wrapper to create a new queue item for storage in the DB
         *
         * valid option values are 'priority'
         */
        var create_queue_item = function(data, options) {
            var item = {
                data: data
            };
            var fields = [{
                name: 'priority',
                type: 'int',
                default: 1024
            }, {
                name: 'delay',
                type: 'int',
                default: 0
            }, {
                name: 'ttr',
                type: 'int',
                default: 0
            }];

            // loop over our fields, making sure they are the correct type and
            // format.
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (options[field.name]) {
                    item[field.name] = options[field.name];
                    switch (field.type) {
                        case 'int':
                            item[field.name] = parseInt(item[field.name]);
                            break;
                        case 'float':
                            item[field.name] = parseFloat(item[field.name]);
                            break;
                    }
                }

                if (field.default && typeof item[field.name] == 'undefined') {
                    item[field.name] = field.default;
                }
            }
            // some defaults
            item.age = 0;
            item.reserves = 0;
            item.releases = 0;
            item.timeouts = 0;
            item.buries = 0;
            item.kicks = 0;
            item.created = new Date().getTime();
            return item;
        };

        // ---------------------------------------------------------------------
        // queue interface functions
        // ---------------------------------------------------------------------

        /**
         * grab an item by id from the queue
         */
        var peek = function(id, options) {
            check_db();
            options || (options = {});
            if (!id) {
                if (options.error) options.error(new HustleBadId('bad id given'));
                return false;
            }

            var item = null;

            var tables = [tbl.reserved, tbl.delayed, tbl.buried].concat(qoptions.tubes);
            var trx = db.transaction(tables, 'readonly');
            trx.oncomplete = function(e) {
                if (!item && options.not_found_error) {
                    if (options.error) options.error(new HustleNotFound('item ' + id + ' not found'));
                    return;
                }
                if (options.success) options.success(item, e);
            };
            trx.onerror = function(e) {
                if (options.error) options.error(e);
            };

            // scan all tables for this id
            tables.forEach(function(table) {
                var req;
                if (table == tbl.buried) {
                    var index = trx.objectStore(table).index('id');
                    req = index.get(id);
                } else {
                    req = trx.objectStore(table).get(id);
                }
                req.onsuccess = function(e) {
                    var res = e && e.target && e.target.result;
                    if (item || !res) return false;

                    item = res;
                    item.age = Math.round((new Date().getTime() - item.expire) / 1000);
                    if (table == tbl.reserved) {
                        item.state = 'reserved';
                        if (item.ttr > 0) {
                            item.time_left = Math.round((item.expire - new Date().getTime()) / 1000);
                        }
                    } else if (table == tbl.buried) {
                        item.state = 'buried';
                    } else {
                        item.state = 'ready';
                        if (!item.tube) item.tube = table;
                    }
                }
            });
        };

        /**
         * put a new item in the queue in the specified tube (or the "default"
         * tube)
         */
        var put = function(data, options) {
            var getAllItems = function (tube, options) {
                var tr = db.transaction([tube], 'readonly');
                var store = tr.objectStore(tube);
                if (store.getAll) {
                    store.getAll().onsuccess = function (e) {
                        if (options.success) options.success(e.target.result);
                    };
                }
                else {
                    var items = [];
                    store.openCursor().onsuccess = function (e) {
                        var cursor = e.target.result;
                        if (cursor) {
                            items.push(cursor.value);
                            cursor.continue();
                        }
                        else {
                            options.success(items);
                        }
                    }
                }
            };

            check_db();
            options || (options = {});
            if (!data) return false;

            var tube = options.tube ? options.tube : 'default';
            if (qoptions.tubes.indexOf(tube) < 0) throw new HustleBadTube('tube ' + tube + ' doesn\'t exist');

            var item = create_queue_item(data, options);
            if (item.delay && item.delay > 0) {
                item.tube = tube;
                item.activate = new Date().getTime() + (1000 * item.delay);
                tube = tbl.delayed;
                delete item.delayed;
            }

            var comparator = options.comparator;

            var createItem = function () {
                // grab a unique ID for this item
                new_id({
                    success: function(id) {
                        item.id = id;

                        var trx = db.transaction([tube], 'readwrite');
                        trx.oncomplete = function(e) {
                            if (options.success) options.success(item, e);
                        };
                        trx.onerror = function(e) {
                            if (options.error) options.error(e);
                        };

                        var store = trx.objectStore(tube);
                        store.openCursor().onsuccess = function (e) {

                        };
                        var req = store.add(item);
                        req.onsuccess = function(e) {
                            item.id = e.target.result;
                        };
                    },
                    error: function(e) {
                        if (options.error) options.error(new HustleBadID('error generating id'));
                    }
                });
            };

            var addUniqueItemToQueue = function (items) {
                var existingItem = items.find(function (currentItem) {
                    return comparator(item.data, currentItem.data);
                });
                existingItem ? options.success(existingItem) : createItem();
            };

            comparator ? getAllItems(tube, {success: addUniqueItemToQueue}) : createItem();

        };

        /**
         * grab one item off of the given tube (or "default" tube) and move it
         * onto the reserved table.
         */
        var reserve = function(options) {
            check_db();
            options || (options = {});

            var tube = options.tube ? options.tube : 'default';
            if (qoptions.tubes.indexOf(tube) < 0) throw new HustleBadTube('tube ' + tube + ' doesn\'t exist');

            var item = null;

            var trx = db.transaction([tbl.reserved, tube], 'readwrite');
            trx.oncomplete = function(e) {
                if (options.success) options.success(item, e);
            };
            trx.onerror = function(e) {
                if (options.error) options.error(e);
            }

            // called once we have an item, puts the item in the reserved table
            var put_in_reserved = function(citem, success) {
                item = citem;
                item.reserves++;
                item.tube = tube;
                if (item.ttr > 0) {
                    item.expire = new Date().getTime() + (1000 * item.ttr);
                }
                var store = trx.objectStore(tbl.reserved);
                var req = store.add(item);
                req.onsuccess = success;
            };

            // grab one item from the tube, and put it in reserved
            var store = trx.objectStore(tube);
            var index = store.index('priority');
            index.openCursor().onsuccess = function(e) {
                var cursor = e.target.result;
                if (cursor) {
                    put_in_reserved(cursor.value, function(e) {
                        // remove the item from the tube once we know it's reserved
                        var req = store.delete(cursor.value.id);
                        req.onerror = options.error;
                    });
                }
            };
        };

        /**
         * delete a queue item by id. checks all tubes and the reserved/buried
         * tables as well.
         */
        var del = function(id, options) {
            check_db();
            options || (options = {});

            peek(id, {
                success: function(item) {
                    if (!item) {
                        if (options.success) options.success(null);
                        return;
                    }

                    var table = item.tube;
                    var item_id = item.id;
                    if (item.state == 'reserved') {
                        table = tbl.reserved;
                    } else if (item.state == 'buried') {
                        table = tbl.buried;
                        // be mindful of the buried table's own IDs
                        item_id = item._id;
                    }

                    var trx = db.transaction(table, 'readwrite');
                    trx.oncomplete = function(e) {
                        if (options.success) options.success(item, e);
                    };
                    trx.onerror = function(e) {
                        if (options.error) options.error(e);
                    }

                    trx.objectStore(table).delete(item_id);
                },
                error: options.error
            });
        };

        /**
         * release a reserved item back into the queue (from the tube it came
         * from).
         */
        var release = function(id, options) {
            check_db();
            options || (options = {});

            peek(id, {
                not_found_error: true,
                success: function(item) {
                    if (item.state != 'reserved') {
                        if (options.error) options.error(new HustleNotFound('item ' + id + ' isn\'t reserved'));
                        return;
                    }

                    var tube = item.tube;

                    if (options.delay) {
                        var delay = parseInt(options.delay);
                        if (delay) {
                            item.activate = new Date().getTime() + (1000 * delay);
                            tube = tbl.delayed;
                        }
                    }

                    move_item(id, tbl.reserved, tube, {
                        transform: function(item) {
                            item.releases++;
                            if (options.priority) {
                                var pri = parseInt(options.priority);
                                if (pri) item.priority = pri;
                            }
                            delete item.tube;
                            return item;
                        },
                        success: options.success,
                        error: options.error
                    });
                },
                error: options.error
            });
        };

        /**
         * move an item to the buried table. this is a great way to track items
         * that fail a lot and can't be ignored, allowing you to look over them
         * later on and see what jobs are failing.
         */
        var bury = function(id, options) {
            check_db();
            options || (options = {});

            peek(id, {
                not_found_error: true,
                success: function(item) {
                    if (item.state == 'buried') {
                        if (options.success) options.success();
                        return;
                    }
                    var table = item.tube;
                    if (item.state == 'reserved') {
                        table = tbl.reserved;
                    }

                    move_item(id, table, tbl.buried, {
                        transform: function(titem) {
                            titem.buries++;
                            titem.tube = item.tube;
                            if (options.priority) {
                                var pri = parseInt(options.priority);
                                if (pri) titem.priority = pri;
                            }
                            return titem;
                        },
                        success: options.success,
                        error: options.error
                    });
                },
                error: options.error
            });
        };

        /**
         * kick N many buried items back into their tubes
         */
        var kick = function(num, options) {
            check_db();
            options || (options = {});

            var records = 0;

            // open all tables since we may get a range of tubes when kicking
            var tables = [tbl.buried].concat(qoptions.tubes);
            var trx = db.transaction(tables, 'readwrite');
            trx.oncomplete = function(e) {
                if (options.success) options.success(records, e);
            };
            trx.onerror = function(e) {
                if (options.error) options.error(e);
            }

            var put_in_tube = function(item, success) {
                item.kicks++;
                var tube = item.tube;
                // remove the buried table's ID
                delete item._id;
                delete item.tube;
                var store = trx.objectStore(tube)
                var req = store.add(item);
                req.onsuccess = success;
            };

            // grab one item from the tube, and put it in reserved
            var store = trx.objectStore(tbl.buried);
            store.openCursor().onsuccess = function(e) {
                var cursor = e.target.result;
                if (cursor) {
                    put_in_tube(cursor.value, function(e) {
                        // remove the item from the tube once we know it's reserved
                        var req = store.delete(cursor.key);
                        req.onerror = options.error;
                    });
                    records++;
                    if (records < num) cursor.continue();
                }
            };
        };

        /**
         * kick a job from the buried table by its id
         */
        var kick_job = function(id, options) {
            check_db();
            options || (options = {});

            peek(id, {
                not_found_error: true,
                success: function(item) {
                    if (item.state != 'buried') {
                        if (options.error) options.error(new HustleNotFound('item ' + id + ' isn\'t buried'));
                        return;
                    }

                    move_item(id, tbl.buried, item.tube, {
                        transform: function(item) {
                            item.kicks++;
                            delete item._id;
                            delete item.tube;
                            return item;
                        },
                        success: options.success,
                        error: options.error
                    });
                },
                error: options.error
            });
        };

        /**
         * reset a job's ttr
         */
        var touch = function(id, options) {
            check_db();
            options || (options = {});

            peek(id, {
                not_found_error: true,
                success: function(item) {
                    if (item.state != 'reserved') {
                        console.log('item.state: ', item.state);
                        if (options.error) options.error(new HustleNotFound('item ' + id + ' isn\'t reserved'));
                        return;
                    }

                    if (item.ttr <= 0) {
                        if (options.success) options.success();
                        return;
                    }

                    var trx = db.transaction(tbl.reserved, 'readwrite');
                    trx.oncomplete = function(e) {
                        if (options.success) options.success(e);
                    };
                    trx.onerror = function(e) {
                        if (options.error) options.error(e);
                    }

                    var store = trx.objectStore(tbl.reserved);
                    var req = store.get(id);
                    req.onsuccess = function(e) {
                        var item = req.result;
                        item.expire = new Date().getTime() + (item.ttr * 1000);
                        store.put(item);
                    };
                },
                error: options.error
            });
        };

        var count_reserved = function(options) {
            check_db();
            options || (options = {});

            var count = null;

            var trx = db.transaction(tbl.reserved, 'readonly');
            trx.oncomplete = function(e) {
                if (options.success) options.success(count, e);
            };
            trx.onerror = function(e) {
                if (options.error) options.error(e);
            };

            var store = trx.objectStore(tbl.reserved);
            var req = store.count();
            req.onsuccess = function(e) {
                count = req.result;
            };
        };

        var count_ready = function(tube, options) {
            check_db();
            options || (options = {});

            if (qoptions.tubes.indexOf(tube) < 0) throw new HustleBadTube('tube ' + tube + ' doesn\'t exist');

            var count = null;

            var trx = db.transaction(tube, 'readonly');
            trx.oncomplete = function(e) {
                if (options.success) options.success(count, e);
            };
            trx.onerror = function(e) {
                if (options.error) options.error(e);
            }

            var store = trx.objectStore(tube);
            var req = store.count();
            req.onsuccess = function(e) {
                count = req.result;
            };
        };

        /**
         * A class that makes consumption of a tube more manageable. For each
         * reserved item, calls the given handler function.
         *
         * Has two public methods: start and stop. The consumer is started by
         * default on instantiation.
         */
        var Consumer = function(fn, coptions) {
            coptions || (coptions = {});

            var tube = coptions.tube ? coptions.tube : 'default';
            var delay = coptions.delay ? coptions.delay : 100;
            var do_stop = false;

            var poll = function(options) {
                options || (options = {});

                if (do_stop || !db) return;
                if (coptions.enable_fn) {
                    var res = coptions.enable_fn();
                    if (!res) {
                        do_stop = true;
                        return false;
                    }
                }

                // grab an item from the tube
                reserve({
                    tube: tube,
                    success: function(item) {
                        if (!item) return;
                        fn(item);
                        // immediately poll for new items
                        setTimeout(function() {
                            poll({
                                skip_recurse: true
                            });
                        }, 0);
                    }
                });

                // poll again
                if (!options.skip_recurse) setTimeout(poll, delay);
            };

            var start = function() {
                if (!do_stop) return false;
                do_stop = false;
                setTimeout(poll, delay);
                return true;
            };

            var stop = function() {
                if (do_stop) return false;
                do_stop = true;
                return true;
            };

            setTimeout(poll, delay);

            this.start = start;
            this.stop = stop;

            return this;
        };

        // ---------------------------------------------------------------------
        // maintenance/cleanup
        // ---------------------------------------------------------------------

        /**
         * move jobs in the delayed state into their respective tubes
         */
        var move_delayed_jobs_to_ready = function(options) {
            options || (options = {});

            var move_items = [];

            var trx = db.transaction(tbl.delayed, 'readonly');
            trx.oncomplete = function(e) {
                move_items.forEach(function(item) {
                    move_item(item.id, tbl.delayed, item.tube, {
                        error: function(e) {
                            console.error('Hustle: delayed move: ', e);
                        }
                    });
                });
            };
            trx.onerror = function(e) {
                console.error('Hustle: delayed move: ', e);
                if (options.error) options.error(e);
            }

            var store = trx.objectStore(tbl.delayed);
            var index = store.index('activate');
            var bound = new Date().getTime();
            var range = IDBKeyRange.upperBound(bound);
            index.openCursor(range).onsuccess = function(e) {
                var cursor = e.target.result;
                if (cursor) {
                    move_items.push(cursor.value);
                    cursor.continue();
                }
            }
        };

        /**
         * move expired jobs to their ready tube
         */
        var move_expired_jobs_to_ready = function(options) {
            options || (options = {});

            var move_items = [];

            var trx = db.transaction(tbl.reserved, 'readonly');
            trx.oncomplete = function(e) {
                move_items.forEach(function(item) {
                    move_item(item.id, tbl.reserved, item.tube, {
                        transform: function(item) {
                            delete item.expire;
                            item.timeouts++;
                            return item;
                        },
                        error: function(e) {
                            if (e instanceof HustleNotFound) {
                                move_items.erase(item);
                            }
                            console.error('Hustle: ttr move: ', e);
                        }
                    });
                });
            };
            trx.onerror = function(e) {
                console.error('Hustle: ttr move: ', e);
                if (options.error) options.error(e);
            }

            var store = trx.objectStore(tbl.reserved);
            var index = store.index('expire');
            var bound = new Date().getTime();
            var range = IDBKeyRange.upperBound(bound);
            index.openCursor(range).onsuccess = function(e) {
                var cursor = e.target.result;
                if (cursor) {
                    move_items.push(cursor.value);
                    cursor.continue();
                }
            }
        };

        /**
         * bury any items in the reserved queue
         */
        var cleanup_abandoned_items = function(options) {
            options || (options = {});
            var abandoned_items = [];
            var number_of_buried_items = 0;

            var move_items_to_buried = function() {
                abandoned_items.forEach(function(item) {
                    move_item(item.id, tbl.reserved, tbl.buried, {
                        transform: function(transform_item) {
                            transform_item.abandoned = true;
                            return transform_item;
                        },
                        success: exit_after_processing_all_items,
                        error: function(e) {
                            if (options.error) options.error(e);
                        }
                    });
                });
            };

            var exit_after_processing_all_items = function() {
                number_of_buried_items++;
                if(number_of_buried_items == abandoned_items.length) {
                    if (options.success) options.success();
                }
            };

            var trx = db.transaction(tbl.reserved, 'readonly');
            trx.oncomplete = function() {
                if (abandoned_items.length == 0) {
                    if (options.success) options.success();
                } else {
                    move_items_to_buried();
                }
            };
            trx.onerror = function(e) {
                if (options.error) options.error(e);
            };

            var store = trx.objectStore(tbl.reserved);
            store.openCursor().onsuccess = function(e) {
                var cursor = e.target.result;
                if (cursor) {
                    abandoned_items.push(cursor.value);
                    cursor.continue();
                }
            }
        };

        /**
         * rescues any items in the reserved queue by moving it to its tube
         * or moving it to buried queue if it exceeds a maximum rescue limit
         */
        var rescue_reserved_items = function (options) {
            var items_in_reserved = [];
            var number_of_rescued_items = 0;
            var DEFAULT_RESCUE_LIMIT = 5, DEFAULT_RESCUE_TIME_LIMIT_IN_SECONDS = 60;
            var maxRescueLimit = options.maxRescueLimit || DEFAULT_RESCUE_LIMIT;
            var rescueTimeLimitInSeconds = options.rescueTimeLimitInSeconds || DEFAULT_RESCUE_TIME_LIMIT_IN_SECONDS;


            var exit_after_processing_all_items = function () {
                number_of_rescued_items++;
                if(number_of_rescued_items == items_in_reserved.length) {
                    if(options.success) options.success();
                }
            };

            var move_items_in_reserved = function () {

                var move_item_to_tube = function (item) {

                    /**
                     * increase number of times it has been rescued based on timestamp it was rescued last
                     */
                    var should_increase_abandon_count = function (item) {
                        if(!item.lastAbandonedTime) {
                            return true;
                        }
                        var timeInSecondsAfterLastAbandoned =  (new Date().getTime() - item.lastAbandonedTime)/1000;
                        return timeInSecondsAfterLastAbandoned > rescueTimeLimitInSeconds;
                    };

                    move_item(item.id, tbl.reserved, item.tube, {
                        transform: function (item) {
                            if(should_increase_abandon_count(item)) {
                                item.lastAbandonedTime = new Date();
                                item.abandon_count = item.abandon_count || 0;
                                item.abandon_count++;
                            }
                            return item;
                        },
                        success: exit_after_processing_all_items,
                        error: function (e) {
                            if (options.error) options.error(e);
                        }
                    });
                };

                var move_item_to_buried = function (item) {
                    move_item(item.id, tbl.reserved, tbl.buried, {
                        success: exit_after_processing_all_items,
                        error: function (e) {
                            if (options.error) options.error(e);
                        }
                    });
                };

                items_in_reserved.forEach(function (item) {
                    var shouldRescue = !item.abandon_count || maxRescueLimit > item.abandon_count;
                    if(shouldRescue) {
                        move_item_to_tube(item);
                    } else {
                        move_item_to_buried(item);
                    }
                });
            };

            var trx = db.transaction(tbl.reserved, 'readonly');
            trx.oncomplete = function () {
                if (items_in_reserved.length == 0) {
                    if(options.success) options.success();
                } else {
                    move_items_in_reserved();
                }
            };
            trx.onerror = function(e) {
                if (options.error) options.error(e);
            };

            var store = trx.objectStore(tbl.reserved);
            store.openCursor().onsuccess = function (e) {
                var cursor = e.target.result;
                if(cursor) {
                    items_in_reserved.push(cursor.value);
                    cursor.continue();
                }
            };
        };

        /**
         * this function does database cleanup. only runs while db is open.
         */
        do_maintenance = function() {
            var run_maintenance = function() {
                if (!db) return false;

                move_delayed_jobs_to_ready();
                move_expired_jobs_to_ready();

                setTimeout(run_maintenance, maintenance_delay);
            };
            setTimeout(run_maintenance, maintenance_delay);
        };

        // ---------------------------------------------------------------------
        // exports
        // ---------------------------------------------------------------------
        var Queue = {
            peek: peek,
            put: put,
            reserve: reserve,
            delete: del,
            release: release,
            bury: bury,
            kick: kick,
            kick_job: kick_job,
            touch: touch,
            count_ready: count_ready,
            count_reserved: count_reserved,
            cleanup_abandoned_items: cleanup_abandoned_items,
            rescue_reserved_items: rescue_reserved_items,
            Consumer: Consumer
        };
        this.open = open;
        this.close = close;
        this.is_open = function() {
            return !!db;
        };
        this.wipe = wipe;
        this.Error = Error;
        this.Queue = Queue;
        this.promisify = function() {
            var _self = this;
            var do_promisify = function(fn, opts_idx) {
                return function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    if (!args[opts_idx]) args[opts_idx] = {};
                    return new Promise(function(success, error) {
                        args[opts_idx].success = success;
                        args[opts_idx].error = error;
                        fn.apply(_self, args);
                    });
                };
            };
            this.open = do_promisify(this.open, 0);
            this.Queue.peek = do_promisify(this.Queue.peek, 1);
            this.Queue.put = do_promisify(this.Queue.put, 1);
            this.Queue.reserve = do_promisify(this.Queue.reserve, 0);
            this.Queue.delete = do_promisify(this.Queue.delete, 1);
            this.Queue.release = do_promisify(this.Queue.release, 1);
            this.Queue.bury = do_promisify(this.Queue.bury, 1);
            this.Queue.kick = do_promisify(this.Queue.kick, 1);
            this.Queue.kick_job = do_promisify(this.Queue.kick_job, 1);
            this.Queue.touch = do_promisify(this.Queue.touch, 1);
            this.Queue.count_ready = do_promisify(this.Queue.count_ready, 1);
            this.Queue.count_reserved = do_promisify(this.Queue.count_reserved, 0);
            this.Queue.cleanup_abandoned_items = do_promisify(this.Queue.cleanup_abandoned_items, 0);
            this.Queue.rescue_reserved_items = do_promisify(this.Queue.rescue_reserved_items, 0);
            return this;
        }.bind(this);
        this.debug = {
            get_db: function() {
                return db;
            }
        };

        return this;
    };
    Hustle.Error = {
        DBClosed: HustleDBClosed,
        DBOpened: HustleDBOpened,
        BadTube: HustleBadTube,
        BadID: HustleBadID,
        NotFound: HustleNotFound
    };
    window.Hustle = Hustle;
})(window);
'use strict';

angular.module("bahmni.common.offline")
    .service("eventQueue", ['$q', function ($q) {
        var hustle;
        var init = function () {
            hustle = new Hustle({
                "db_name": "Bahmni_hustle",
                "db_version": 1,
                "tubes": ["event_queue", "error_queue"]
            });
            hustle.promisify();
        };

        init();

        var getQueue = function () {
            if (hustle.is_open()) {
                return $q.when(hustle);
            }
            return $q.when(hustle.open());
        };

        this.getCount = function () {
            return getQueue().then(function () {
                return hustle.Queue.count_ready("event_queue");
            });
        };

        this.getErrorCount = function () {
            return getQueue().then(function () {
                return hustle.Queue.count_ready("error_queue");
            });
        };

        this.addToEventQueue = function (eventContent) {
            return getQueue().then(function () {
                return hustle.Queue.put(eventContent, {tube: "event_queue", ttr: 10});
            });
        };

        this.addToErrorQueue = function (eventContent) {
            return getQueue().then(function () {
                return hustle.Queue.put(eventContent, {tube: "error_queue", ttr: 10});
            });
        };

        this.consumeFromEventQueue = function () {
            return getQueue().then(function () {
                return $q.when(hustle.Queue.reserve({tube: "event_queue"}));
            });
        };

        this.consumeFromErrorQueue = function () {
            return getQueue().then(function () {
                return $q.when(hustle.Queue.reserve({tube: "error_queue"}));
            });
        };

        this.removeFromQueue = function (event) {
            return getQueue().then(function () {
                return $q.when(hustle.Queue.delete(event.id));
            });
        };

        this.releaseFromQueue = function (event) {
            return getQueue().then(function () {
                return $q.when(hustle.Queue.release(event.id));
            });
        };
    }]);

'use strict';

angular.module('bahmni.common.offline')
    .factory('offlinePush', ['offlineService', 'eventQueue', '$http', 'offlineDbService', 'androidDbService', '$q', 'loggingService', '$bahmniCookieStore', 'dbNameService',
        function (offlineService, eventQueue, $http, offlineDbService, androidDbService, $q, loggingService, $bahmniCookieStore, dbNameService) {
            return function () {
                var releaseReservedEvents = function (reservedEvents) {
                    angular.forEach(reservedEvents, function (reservedEvent) {
                        eventQueue.releaseFromQueue(reservedEvent);
                    });
                };

                var getAllDbPromises = function () {
                    var dbPromises = [];
                    var dbNames = offlineDbService.getDbNames();
                    _.each(dbNames, function (dbName) {
                        dbPromises.push(offlineDbService.initSchema(dbName));
                    });
                    return dbPromises;
                };

                var consumeFromEventQueue = function () {
                    return eventQueue.consumeFromEventQueue().then(function (event) {
                        if (!event) {
                            deferred.resolve();
                            return;
                        }
                        else {
                            return processEvent(event, dbs[event.data.dbName]);
                        }
                    });
                };

                var consumeFromErrorQueue = function () {
                    return eventQueue.consumeFromErrorQueue().then(function (event) {
                        if (!event) {
                            return;
                        }
                        else {
                            return processEvent(event, dbs[event.data.dbName]);
                        }
                    });
                };

                var postData = function (event, response) {
                    if (response == undefined) {
                        eventQueue.releaseFromQueue(event);
                        return consumeFromEventQueue();
                    }
                    var config = {
                        withCredentials: true,
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        }
                    };

                    if (event.data.type && event.data.type == "encounter") {
                        return $http.post(Bahmni.Common.Constants.bahmniEncounterUrl, response.encounter, config);
                    } else if (event.data.type && event.data.type === "Error") {
                        return $http.post(Bahmni.Common.Constants.loggingUrl, angular.toJson(response));
                    } else {
                        response.relationships = [];
                        return $http.post(event.data.url, response, config);
                    }
                };

                var getEventData = function (event, db) {
                    if (event.data.type && event.data.type == "encounter") {
                        return offlineDbService.getEncounterByEncounterUuid(event.data.encounterUuid, db);
                    } else if (event.data.type && event.data.type === "Error") {
                        return offlineDbService.getErrorLogByUuid(event.data.uuid, db);
                    } else {
                        return offlineDbService.getPatientByUuidForPost(event.data.patientUuid, db).then(function (response) {
                            if (event.data.url.indexOf(event.data.patientUuid) == -1) {
                                if (response && response.patient && response.patient.person) {
                                    delete response.patient.person.preferredName;
                                    delete response.patient.person.preferredAddress;
                                }
                            }
                            // mapIdentifiersToPostFormat(response.patient);
                            return response;
                        });
                    }
                };

                var mapIdentifiersToPostFormat = function (patient) {
                    patient.identifiers = _.map(patient.identifiers, function (identifier) {
                        return {
                            identifier: identifier.identifier,
                            identifierPrefix: identifier.identifierPrefix,
                            identifierSourceUuid: identifier.identifierSourceUuid,
                            identifierType: identifier.identifierType && identifier.identifierType.uuid || identifier.identifierType,
                            uuid: identifier.uuid,
                            preferred: identifier.preferred,
                            voided: identifier.voided
                        };
                    });
                };

                var processEvent = function (event, db) {
                    return getEventData(event, db)
                        .then(function (response) {
                            return postData(event, response)
                                .success(function (data) {
                                    if (event.data.type && event.data.type == "encounter") {
                                        return offlineDbService.createEncounter(data, db).then(function () {
                                            return successCallBack(event);
                                        });
                                    }
                                    return successCallBack(event);
                                }).catch(function (response) {
                                    if (event.data.type !== "Error" && (parseInt(response.status / 100) === 5 || parseInt(response.status / 100) === 4)) {
                                        loggingService.logSyncError(response.config.url, response.status, response.data, response.config.data);
                                    }
                                    if (parseInt(response.status / 100) === 5 ||
                                        (parseInt(response.status / 100) === 4 && _.indexOf([401, 403, 404], response.status) == -1)) {
                                        if (event.tube === "event_queue") {
                                            eventQueue.removeFromQueue(event);
                                            eventQueue.addToErrorQueue(event.data);
                                            return consumeFromEventQueue();
                                        } else {
                                            reservedEvents.push(event);
                                            return consumeFromErrorQueue();
                                        }
                                    } else {
                                        eventQueue.releaseFromQueue(event);
                                        deferred.resolve();
                                        return "4xx error " + response.status;
                                    }
                                });
                        });
                };

                var successCallBack = function (event) {
                    if (event.data.type === "Error") {
                        offlineDbService.deleteErrorFromErrorLog(event.data.uuid);
                    }
                    eventQueue.removeFromQueue(event).then(function () {
                        if (event.tube === "event_queue") {
                            return consumeFromEventQueue();
                        } else {
                            return consumeFromErrorQueue();
                        }
                    });
                };

                var reservedEvents = [];
                var deferred = $q.defer();
                if (!offlineService.isOfflineApp()) {
                    return $q.when();
                }
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }

                var dbs = {};
                $q.all(getAllDbPromises()).then(function (allDbs) {
                    _.each(allDbs, function (db) {
                        offlineService.isAndroidApp() ? dbs[db] = db : dbs[db.getSchema().name()] = db;
                    });
                    consumeFromErrorQueue().then(function (response) {
                        releaseReservedEvents(reservedEvents);
                        if (_.isString(response) && response.indexOf("4xx error") != -1) {
                            return;
                        }
                        return consumeFromEventQueue();
                    });
                });
                return deferred.promise;
            };
        }
    ]);

'use strict';

angular.module('bahmni.common.offline')
    .service('schedulerService', ['offlineService', 'WorkerService', 'scheduledSync',
        function (offlineService, WorkerService, scheduledSync) {
            this.jobs = [];
            this.sync = function (config) {
                if (offlineService.isChromeApp() || offlineService.isAndroidApp()) {
                    var job = scheduledSync(config, undefined);
                    this.jobs.push(job);
                }
            };

            this.stopSync = function () {
                if (offlineService.isChromeApp() || offlineService.isAndroidApp()) {
                    _.each(this.jobs, function (job) {
                        job.stop();
                    });
                }
            };
        }
    ]);

'use strict';

angular.module('bahmni.common.offline')
    .service('appInfoStrategy', function () {
        var getVersion = function () {
            var manifest = chrome.app.getDetails();
            return manifest.version;
        };
        return {
            getVersion: getVersion
        };
    });

'use strict';

angular.module('bahmni.common.offline')
    .service('appUpdateService', ['$http', 'appInfoStrategy', '$q', function ($http, appInfoStrategy, $q) {
        var isForcedUpdateRequired = function (metadataInfo) {
            var installedVersion = appInfoStrategy.getVersion();
            var forcedUpdateRequired = false;
            var latestVersion = _.max(metadataInfo.compatibleVersions);

            if (latestVersion > installedVersion) {
                metadataInfo.compatibleVersions.map(function (version) {
                    return Number(version);
                });
                forcedUpdateRequired = metadataInfo.compatibleVersions.indexOf(Number(installedVersion)) === -1;
            }
            return forcedUpdateRequired;
        };

        var getUpdateInfo = function () {
            var appUpdateInfo = localStorage.getItem("appUpdateInfo");
            appUpdateInfo = appUpdateInfo ? JSON.parse(appUpdateInfo) : appUpdateInfo;
            if (appUpdateInfo) {
                appUpdateInfo.forcedUpdateRequired = isForcedUpdateRequired(appUpdateInfo);
            }

            var config = {
                headers: {
                    'If-None-Match': appUpdateInfo ? appUpdateInfo.etag : undefined
                }
            };
            var deferred = $q.defer();

            $http.get(Bahmni.Common.Constants.offlineMetadataUrl, config).then(function (response) {
                if (response.status === 200) {
                    var metadataInfo = response.data;
                    appUpdateInfo = {
                        latestAndroidAppUrl: metadataInfo.latestAndroidAppUrl,
                        latestChromeAppUrl: metadataInfo.latestChromeAppUrl,
                        compatibleVersions: metadataInfo.compatibleVersions,
                        etag: response.headers().etag
                    };
                    localStorage.setItem("appUpdateInfo", JSON.stringify(appUpdateInfo));
                    appUpdateInfo.forcedUpdateRequired = isForcedUpdateRequired(appUpdateInfo);
                }
                deferred.resolve(appUpdateInfo);
            }).catch(function (response) {
                if (response.status === 304) {
                    deferred.resolve(appUpdateInfo);
                } else if (response.status === 404) {
                    localStorage.removeItem("appUpdateInfo");
                    deferred.resolve({});
                } else {
                    deferred.reject(response);
                }
            });
            return deferred.promise;
        };

        return {
            getUpdateInfo: getUpdateInfo
        };
    }]);
