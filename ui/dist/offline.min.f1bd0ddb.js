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


var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Models = Bahmni.Common.Models || {};

angular.module('bahmni.common.models', []);

'use strict';

angular.module('bahmni.common.models')
    .factory('age', [function () {
        var dateUtil = Bahmni.Common.Util.DateUtil;

        var fromBirthDate = function (birthDate) {
            var today = dateUtil.now();
            var period = dateUtil.diffInYearsMonthsDays(birthDate, today);
            return create(period.years, period.months, period.days);
        };

        var create = function (years, months, days) {
            var isEmpty = function () {
                return !(this.years || this.months || this.days);
            };

            return {
                years: years,
                months: months,
                days: days,
                isEmpty: isEmpty
            };
        };

        var calculateBirthDate = function (age) {
            var birthDate = dateUtil.now();
            birthDate = dateUtil.subtractYears(birthDate, age.years);
            birthDate = dateUtil.subtractMonths(birthDate, age.months);
            birthDate = dateUtil.subtractDays(birthDate, age.days);
            return birthDate;
        };

        return {
            fromBirthDate: fromBirthDate,
            create: create,
            calculateBirthDate: calculateBirthDate
        };
    }]
);

angular.module('bahmni.common.appFramework', ['authentication']);

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.AppFramework = Bahmni.Common.AppFramework || {};

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

angular.module('bahmni.common.uiHelper', ['ngClipboard']);

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

angular.module('FredrikSandell.worker-pool', []).service('WorkerService', [
    '$q',
    function ($q) {
        var that = {};
        //this should be configured from the app in the future
        var urlToAngular = 'http://localhost:9876/base/bower_components/angular/angular.js';
        var serviceToUrlMap = {};
        var storage = {};
        var scriptsToLoad = [];
        that.setAngularUrl = function (urlToAngularJs) {
            urlToAngular = urlToAngularJs;
        };
        function createAngularWorkerTemplate() {
            /*jshint laxcomma:true */
            /*jshint quotmark: false */
            var workerTemplate = [
                '',
                '//try {',
                'var window = self;',
                'self.history = {};',
                'var Node = function() {};',
                'var app',
                'var localStorage = {storage: <STORAGE>, getItem: function(key) {return this.storage[key]}, setItem: function(key, value) {this.storage[key]=value}}',
                'var document = {',
                '      readyState: \'complete\',',
                '      cookie: \'\',',
                '      querySelector: function () {},',
                '      createElement: function () {',
                '          return {',
                '              pathname: \'\',',
                '              setAttribute: function () {}',
                '          };',
                '      }',
                '};',
                'importScripts(\'<URL_TO_ANGULAR>\');',
                '<CUSTOM_DEP_INCLUDES>',
                'angular = window.angular;',
                'var workerApp = angular.module(\'WorkerApp\', [<DEP_MODULES>]);',
                'workerApp.run([\'$q\'<STRING_DEP_NAMES>, function ($q<DEP_NAMES>) {',
                '  self.addEventListener(\'message\', function(e) {',
                '    var input = e.data;',
                '    var output = $q.defer();',
                '    var promise = output.promise;',
                '    promise.then(function(success) {',
                '      self.postMessage({event:\'success\', data : success});',
                '    }, function(reason) {',
                '      self.postMessage({event:\'failure\', data : reason});',
                '    }, function(update) {',
                '      self.postMessage({event:\'update\', data : update});',
                '    });',
                '    <WORKER_FUNCTION>;',
                '  });',
                '  self.postMessage({event:\'initDone\'});',
                '}]);',
                'angular.bootstrap(null, [\'WorkerApp\']);',
                '//} catch(e) {self.postMessage(JSON.stringify(e));}'
            ];
            return workerTemplate.join('\n');
        }
        var workerTemplate = createAngularWorkerTemplate();
        that.addDependency = function (serviceName, moduleName, url) {
            serviceToUrlMap[serviceName] = {
                url: url,
                moduleName: moduleName
            };
            return that;
        };
        that.includeScripts = function(url) {
            scriptsToLoad.push(url);
        };
        that.addToLocalStorage = function(key, value) {
            storage[key] = value;
        };
        function createIncludeStatements(listOfServiceNames) {
            var includeString = '';
            angular.forEach(scriptsToLoad, function(script) {
                includeString += 'importScripts(\'' + script + '\');';
            });

            angular.forEach(listOfServiceNames, function (serviceName) {
                if (serviceToUrlMap[serviceName]) {
                    includeString += 'importScripts(\'' + serviceToUrlMap[serviceName].url + '\');';
                }
            });
            return includeString;
        }
        function createModuleList(listOfServiceNames) {
            var moduleNameList = [];
            angular.forEach(listOfServiceNames, function (serviceName) {
                if (serviceToUrlMap[serviceName]) {
                    moduleNameList.push('\'' + serviceToUrlMap[serviceName].moduleName + '\'');
                }
            });
            return moduleNameList.join(',');
        }
        function createDependencyMetaData(dependencyList) {
            var dependencyServiceNames = dependencyList.filter(function (dep) {
                return dep !== 'input' && dep !== 'output' && dep !== '$q';
            });
            var depMetaData = {
                dependencies: dependencyServiceNames,
                moduleList: createModuleList(dependencyServiceNames),
                angularDepsAsStrings: dependencyServiceNames.length > 0 ? ',' + dependencyServiceNames.map(function (dep) {
                    return '\'' + dep + '\'';
                }).join(',') : '',
                angularDepsAsParamList: dependencyServiceNames.length > 0 ? ',' + dependencyServiceNames.join(',') : '',
                servicesIncludeStatements: createIncludeStatements(dependencyServiceNames)
            };
            depMetaData.workerFuncParamList = 'input,output' + depMetaData.angularDepsAsParamList;
            return depMetaData;
        }
        function populateWorkerTemplate(workerFunc, dependencyMetaData) {
            return workerTemplate
                .replace('<URL_TO_ANGULAR>', urlToAngular)
                .replace('<CUSTOM_DEP_INCLUDES>', dependencyMetaData.servicesIncludeStatements)
                .replace('<DEP_MODULES>', dependencyMetaData.moduleList)
                .replace('<STRING_DEP_NAMES>', dependencyMetaData.angularDepsAsStrings)
                .replace('<DEP_NAMES>', dependencyMetaData.angularDepsAsParamList)
                .replace('<STORAGE>', JSON.stringify(storage))
                .replace('<WORKER_FUNCTION>', workerFunc.toString());
        }
        var buildAngularWorker = function (initializedWorker) {
            var that = {};
            that.worker = initializedWorker;
            that.run = function (input) {
                var deferred = $q.defer();
                initializedWorker.addEventListener('message', function (e) {
                    var eventId = e.data.event;
                    //console.log(e.data);
                    if (eventId === 'initDone') {
                        throw 'Received worker initialization in run method. This should already have occurred!';
                    } else if (eventId === 'success') {
                        deferred.resolve(e.data.data);
                    } else if (eventId === 'failure') {
                        deferred.reject(e.data.data);
                    } else if (eventId === 'update') {
                        deferred.notify(e.data.data);
                    } else {
                        deferred.reject(e);
                    }
                });
                initializedWorker.postMessage(input);
                return deferred.promise;
            };
            that.terminate = function () {
                initializedWorker.terminate();
            };
            return that;
        };
        var extractDependencyList = function (depFuncList) {
            return depFuncList.slice(0, depFuncList.length - 1);
        };
        var workerFunctionToString = function (func, paramList) {
            return '(' + func.toString() + ')(' + paramList + ')';
        };
        /**
         * example call:
         * WorkerService.createAngularWorker(['input', 'output', '$http', function(input, output, $http)
         * {body of function}]);
         * Parameters "input" and "output" is required. Not defining them will cause a runtime error.
         * Declaring services to be injected, as '$http' is above, requires the web worker to be able to resolve them.
         * '$http' service is a part of the standard angular package which means it will resolve without additional information
         * since angular source is always loaded in the web worker.
         * But if a custom service was to be injected the WorkerService would need be be informed on how to resolve the.
         * @param depFuncList
         */
        that.createAngularWorker = function (depFuncList) {
            //validate the input
            if (!Array.isArray(depFuncList) || depFuncList.length < 3 || typeof depFuncList[depFuncList.length - 1] !== 'function') {
                throw 'Input needs to be: [\'workerInput\',\'deferredOutput\'/*optional additional dependencies*/,\n' + '    function(workerInput, deferredOutput /*optional additional dependencies*/)\n' + '        {/*worker body*/}' + ']';
            }
            var deferred = $q.defer();
            var dependencyMetaData = createDependencyMetaData(extractDependencyList(depFuncList));
            var blobURL = (window.webkitURL ? webkitURL : URL).createObjectURL(new Blob([populateWorkerTemplate(workerFunctionToString(depFuncList[depFuncList.length - 1], dependencyMetaData.workerFuncParamList), dependencyMetaData)], { type: 'application/javascript' }));
            var worker = new Worker(blobURL);
            //wait for the worker to load resources
            worker.addEventListener('message', function (e) {
                var eventId = e.data.event;
                console.log(e.data);
                if (eventId === 'initDone') {
                    deferred.resolve(buildAngularWorker(worker));
                } else {
                    deferred.reject(e);
                }
            });
            return deferred.promise;
        };
        return that;
    }
]);
'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Offline = Bahmni.Common.Offline || {};
Bahmni.Common.Offline.dbNameCondition = Bahmni.Common.Offline.dbNameCondition || {};

angular.module('bahmni.common.offline', ['bahmni.common.util', 'bahmni.common.models', 'FredrikSandell.worker-pool', 'ngDialog']);

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Logging = Bahmni.Common.Logging || {};

angular.module('bahmni.common.logging', []);

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Offline = Bahmni.Common.Offline || {};

Bahmni.Common.Offline.SchemaDefinitions = {
    AddressHierarchyLevel: {
        tableName: 'address_hierarchy_level',
        columns: [
            {
                name: 'addressHierarchyLevelId',
                type: 'INTEGER'
            }, {
                name: 'name',
                type: 'STRING'
            }, {
                name: 'parentLevelId',
                type: 'INTEGER'
            }, {
                name: 'addressField',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }, {
                name: 'required',
                type: 'INTEGER'
            }
        ],
        nullableColumns: ['name', 'parentLevelId', 'addressField'],
        primaryKeyColumns: ['uuid']
    },

    AddressHierarchyEntry: {
        tableName: 'address_hierarchy_entry',
        columns: [
            {
                name: 'id',
                type: 'INTEGER'
            }, {
                name: 'name',
                type: 'STRING'
            }, {
                name: 'levelId',
                type: 'INTEGER'
            }, {
                name: 'parentId',
                type: 'INTEGER'
            }, {
                name: 'userGeneratedId',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }
        ],
        nullableColumns: ['name', 'parentId', 'userGeneratedId'],
        primaryKeyColumns: ['uuid']
    },

    EventLogMarker: {
        tableName: 'event_log_marker',
        columns: [
            {
                name: 'markerName',
                type: 'STRING'
            },
            {
                name: 'lastReadEventUuid',
                type: 'STRING'
            }, {
                name: 'filters',
                type: 'STRING'
            }, {
                name: 'lastReadTime',
                type: 'DATE_TIME'
            }
        ],
        nullableColumns: ['filters', 'lastReadEventUuid'],
        primaryKeyColumns: ['markerName']
    },
    PatientAttributeType: {
        tableName: 'patient_attribute_type',
        columns: [
            {
                name: 'attributeTypeId',
                type: 'INTEGER'
            }, {
                name: 'attributeName',
                type: 'STRING'
            }, {
                name: 'format',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }
        ],
        nullableColumns: ['format'],
        primaryKeyColumns: ['uuid']
    },
    PatientAttribute: {
        tableName: 'patient_attribute',
        columns: [
            {
                name: 'attributeTypeId',
                type: 'INTEGER'
            }, {
                name: 'attributeValue',
                type: 'STRING'
            }, {
                name: 'patientUuid',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }
        ],
        nullableColumns: [],
        primaryKeyColumns: ['uuid']
    },

    Patient: {
        tableName: 'patient',
        columns: [
            {
                name: 'givenName',
                type: 'STRING'
            }, {
                name: 'middleName',
                type: 'STRING'
            }, {
                name: 'familyName',
                type: 'STRING'
            }, {
                name: 'gender',
                type: 'STRING'
            }, {
                name: 'voided',
                type: 'BOOLEAN'
            }, {
                name: 'birthdate',
                type: 'DATE_TIME'
            }, {
                name: 'dateCreated',
                type: 'DATE_TIME'
            }, {
                name: 'patientJson',
                type: 'OBJECT'
            }, {
                name: 'uuid',
                type: 'STRING'
            }
        ],
        nullableColumns: ['gender', 'birthdate', 'givenName', 'middleName', 'familyName'],
        primaryKeyColumns: ['uuid'],
        indexes: [
            {
                indexName: 'givenNameIndex',
                columnNames: ['givenName']
            }, {
                indexName: 'middleNameIndex',
                columnNames: ['middleName']
            }, {
                indexName: 'familyNameIndex',
                columnNames: ['familyName']
            }
        ]
    },
    PatientAddress: {
        tableName: 'patient_address',
        columns: [
            {
                name: 'address1',
                type: 'STRING'
            }, {
                name: 'address2',
                type: 'STRING'
            }, {
                name: 'cityVillage',
                type: 'STRING'
            }, {
                name: 'stateProvince',
                type: 'STRING'
            }, {
                name: 'postalCode',
                type: 'STRING'
            }, {
                name: 'country',
                type: 'STRING'
            }, {
                name: 'countyDistrict',
                type: 'STRING'
            }, {
                name: 'address3',
                type: 'STRING'
            }, {
                name: 'address4',
                type: 'STRING'
            }, {
                name: 'address5',
                type: 'STRING'
            }, {
                name: 'address6',
                type: 'STRING'
            }, {
                name: 'patientUuid',
                type: 'STRING'
            }
        ],
        nullableColumns: ['address1', 'address2', 'cityVillage', 'stateProvince', 'postalCode', 'country', 'countyDistrict', 'address3', 'address4', 'address5', 'address6'],
        primaryKeyColumns: ['patientUuid']
    },
    Visit: {
        tableName: 'visit',
        columns: [
            {
                name: 'uuid',
                type: 'STRING'
            },
            {
                name: 'patientUuid',
                type: 'STRING'
            },
            {
                name: 'startDatetime',
                type: 'DATE_TIME'
            },
            {
                name: 'visitJson',
                type: 'OBJECT'
            }
        ],
        nullableColumns: [],
        primaryKeyColumns: ['uuid']
    },
    Encounter: {
        tableName: 'encounter',
        columns: [
            {
                name: 'uuid',
                type: 'STRING'
            },
            {
                name: 'patientUuid',
                type: 'STRING'
            },
            {
                name: 'encounterDateTime',
                type: 'DATE_TIME'
            },
            {
                name: 'encounterType',
                type: 'STRING'
            },
            {
                name: 'providerUuid',
                type: 'STRING'
            },
            {
                name: 'visitUuid',
                type: 'STRING'
            },
            {
                name: 'encounterJson',
                type: 'OBJECT'
            }
        ],
        nullableColumns: ['visitUuid'],
        primaryKeyColumns: ['uuid']
    },
    Observation: {
        tableName: 'observation',
        columns: [
            {
                name: 'uuid',
                type: 'STRING'
            },
            {
                name: 'encounterUuid',
                type: 'STRING'
            },
            {
                name: 'visitUuid',
                type: 'STRING'
            },
            {
                name: 'patientUuid',
                type: 'STRING'
            },
            {
                name: 'conceptName',
                type: 'STRING'
            },
            {
                name: 'observationJson',
                type: 'OBJECT'
            }
        ],
        nullableColumns: ['visitUuid'],
        primaryKeyColumns: ['uuid']
    },
    ErrorLog: {
        tableName: 'error_log',
        columns: [
            {
                name: 'uuid',
                type: 'STRING'
            }, {
                name: 'failedRequestUrl',
                type: 'STRING'
            }, {
                name: 'logDateTime',
                type: 'DATE_TIME'
            }, {
                name: 'responseStatus',
                type: 'INTEGER'
            }, {
                name: 'stackTrace',
                type: 'STRING'
            }, {
                name: 'requestPayload',
                type: 'STRING'
            }, {
                name: 'provider',
                type: 'OBJECT'
            }
        ],
        nullableColumns: ['responseStatus'],
        uniqueKeyColumns: ['failedRequestUrl', 'requestPayload'],
        primaryKeyColumns: ['uuid']
    },
    PatientIdentifier: {
        tableName: 'patient_identifier',
        columns: [
            {
                name: 'typeUuid',
                type: 'STRING'
            },
            {
                name: 'identifier',
                type: 'STRING'
            },
            {
                name: 'primary',
                type: 'BOOLEAN'
            },
            {
                name: 'primaryIdentifier',
                type: 'STRING'
            },
            {
                name: 'extraIdentifiers',
                type: 'STRING'
            },
            {
                name: 'patientUuid',
                type: 'STRING'
            },
            {
                name: 'identifierJson',
                type: 'STRING'
            }
        ],
        nullableColumns: ['identifier', 'primaryIdentifier', 'extraIdentifiers'],
        primaryKeyColumns: ['typeUuid', 'patientUuid']
    },

    LabOrderResult: {
        tableName: 'lab_order_result',
        columns: [
            {
                name: 'patientUuid',
                type: 'STRING'
            },
            {
                name: 'labOrderResultsJson',
                type: 'STRING'
            }
        ],
        nullableColumns: [],
        primaryKeyColumns: ['patientUuid']
    }
};

Bahmni.Common.Offline.MetaDataSchemaDefinitions = {
    Concept: {
        tableName: 'concept',
        columns: [
            {
                name: 'data',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }, {
                name: 'name',
                type: 'STRING'
            }, {
                name: 'parents',
                type: 'OBJECT'
            }
        ],
        nullableColumns: [],
        primaryKeyColumns: ['uuid']
    },

    Configs: {
        tableName: 'configs',
        columns: [
            {
                name: 'key',
                type: 'STRING'
            }, {
                name: 'value',
                type: 'STRING'
            }, {
                name: 'etag',
                type: 'STRING'
            }
        ],
        nullableColumns: ['etag'],
        primaryKeyColumns: ['key']
    },

    ReferenceData: {
        tableName: 'reference_data',
        columns: [
            {
                name: 'key',
                type: 'STRING'
            }, {
                name: 'data',
                type: 'STRING'
            }, {
                name: 'etag',
                type: 'STRING'
            }
        ],
        nullableColumns: ['etag'],
        primaryKeyColumns: ['key']
    },

    LoginLocations: {
        tableName: 'login_locations',
        columns: [
            {
                name: 'uuid',
                type: 'STRING'
            }, {
                name: 'value',
                type: 'STRING'
            }
        ],
        nullableColumns: [],
        primaryKeyColumns: ['uuid']
    },
    EventLogMarker: {
        tableName: 'event_log_marker',
        columns: [
            {
                name: 'markerName',
                type: 'STRING'
            },
            {
                name: 'lastReadEventUuid',
                type: 'STRING'
            }, {
                name: 'filters',
                type: 'STRING'
            }, {
                name: 'lastReadTime',
                type: 'DATE_TIME'
            }
        ],
        nullableColumns: ['filters', 'lastReadEventUuid'],
        primaryKeyColumns: ['markerName']
    }
};

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Offline = Bahmni.Common.Offline || {};

// This file is added as a template, If need to run migrations use this template and create a new and change Migration1 to Migration[DB_VERSION-1]

Bahmni.Common.Offline.Migration1 = {
    SchemaDefinitions: {
        // Define table schema for new tables, same as that of SchemaDefinitions.js
    },
    Queries: [
        function (rawDb) {
            // Write your queries that rawDb supports
        }
    ],
    CopyOver: [
        function (db) {
            // Write your Lovefield queries using the given db instance
        }
    ]

};

'use strict';

angular.module('bahmni.common.offline').service('offlineService', ['$rootScope', '$bahmniCookieStore', function ($rootScope, $bahmniCookieStore) {
    this.getAppPlatform = function () {
        return $bahmniCookieStore.get(Bahmni.Common.Constants.platform);
    };

    this.setAppPlatform = function (platform) {
        $bahmniCookieStore.put(Bahmni.Common.Constants.platform, platform, {path: '/', expires: 365});
    };

    this.isOfflineApp = function () {
        return this.isAndroidApp() || this.isChromeApp();
    };

    this.isAndroidApp = function () {
        return this.getAppPlatform() === Bahmni.Common.Constants.platformType.android;
    };

    this.isChromeApp = function () {
        return this.getAppPlatform() === Bahmni.Common.Constants.platformType.chromeApp;
    };

    this.isChromeBrowser = function () {
        return this.getAppPlatform() === Bahmni.Common.Constants.platformType.chrome;
    };

    this.encrypt = function (value, encryptionType) {
        if (encryptionType === Bahmni.Common.Constants.encryptionType.SHA3) {
            return CryptoJS.SHA3(value);
        }
        return value;
    };

    this.setItem = function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };
    this.getItem = function (key) {
        var value = localStorage.getItem(key);
        if (value) {
            return JSON.parse(value);
        }
        return value;
    };

    this.validateLoginInfo = function (loginInfo) {
        var username = this.getItem(Bahmni.Common.Constants.LoginInformation)['username'] || '';
        return (username.toLowerCase() === loginInfo.username.toLowerCase() &&
        JSON.stringify(this.getItem(Bahmni.Common.Constants.LoginInformation)['password']) === JSON.stringify(CryptoJS.SHA3(loginInfo.password)));
    };

    this.setSchedulerStatus = function (stage) {
        $rootScope.$broadcast("schedulerStage", stage);
    };
}]);

'use strict';

angular.module('bahmni.common.offline')
    .service('dbNameService', ["offlineService", "offlineDbService", "androidDbService", "$q", function (offlineService, offlineDbService, androidDbService, $q) {
        var loadDbNameService = function () {
            var isOfflineApp = offlineService.isOfflineApp();
            if (isOfflineApp) {
                var defer = $q.defer();
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                offlineDbService.getConfig("dbNameCondition").then(function (config) {
                    var script = config.value['dbNameCondition.js'];
                    eval(script); // eslint-disable-line no-eval
                    defer.resolve();
                });
            }
            return defer.promise;
        };

        var getDbName = function (provider, loginLocation) {
            if (!offlineService.getItem("allowMultipleLoginLocation")) {
                return $q.when("Bahmni Connect");
            }
            return loadDbNameService().then(function () {
                return Bahmni.Common.Offline.dbNameCondition.get(provider, loginLocation);
            });
        };

        return {
            getDbName: getDbName
        };
    }]);

'use strict';

angular.module('bahmni.common.offline').service('initializeOfflineSchema', [function () {
    var DB_VERSION = 2;
    var DB_VERSION_OLD;
    var dbPromises = {};

    var dataTypes = {
        "INTEGER": lf.Type.INTEGER,
        "STRING": lf.Type.STRING,
        "DATE_TIME": lf.Type.DATE_TIME,
        "OBJECT": lf.Type.OBJECT,
        "ARRAY_BUFFER": lf.Type.ARRAY_BUFFER,
        "BOOLEAN": lf.Type.BOOLEAN
    };

    var upgradeExistingSchemaFn = function (migrations, rawDb) {
        if (migrations.Queries) {
            migrations.Queries.forEach(function (query) {
                query(rawDb);
            });
        }
    };

    var createSchemaFn = function (migrations, schemaBuilder) {
        if (migrations.SchemaDefinitions) {
            var tablesFromMigrations = _.values(migrations.SchemaDefinitions);
            tablesFromMigrations.forEach(function (table) {
                createTable(schemaBuilder, table);
            });
        }
    };

    var migrateDataUsingCustomLoveFieldQueries = function (migrations, db) {
        if (migrations.CopyOver) {
            var tablesFromMigrations = _.values(migrations.CopyOver);
            tablesFromMigrations.forEach(function (query) {
                query(db);
            });
        }
    };

    var runMigration = function (oldVersion, db, applyOn) {
        while (oldVersion < DB_VERSION) {
            var migrations = Bahmni.Common.Offline["Migration" + oldVersion] || {};
            applyOn(migrations, db);
            oldVersion = oldVersion + 1;
        }
    };

    var onUpgrade = function (rawDb) {
        DB_VERSION_OLD = rawDb.getVersion();
        var oldVersion = DB_VERSION_OLD;
        runMigration(oldVersion, rawDb, upgradeExistingSchemaFn);
        return rawDb.dump();
    };

    var LOVEFIELD_DB_CONFIG = {
        storeType: lf.schema.DataStoreType.INDEXED_DB,
        onUpgrade: onUpgrade
    };

    this.databasePromise = null;

    var initDbSchema = function (schemaBuilder, definitions) {
        var tables = _.values(definitions);
        var initalMigrationVersion = 2;
        tables.forEach(function (table) {
            createTable(schemaBuilder, table);
        });

        runMigration(initalMigrationVersion, schemaBuilder, createSchemaFn);
    };

    this.initSchema = function (dbName) {
        if (dbPromises[dbName] != null) {
            return dbPromises[dbName];
        }
        var schemaBuilder = lf.schema.create(dbName, DB_VERSION);
        if (dbName === Bahmni.Common.Constants.bahmniConnectMetaDataDb) {
            initDbSchema(schemaBuilder, Bahmni.Common.Offline.MetaDataSchemaDefinitions);
            this.databasePromise = schemaBuilder.connect(LOVEFIELD_DB_CONFIG);
            dbPromises[dbName] = this.databasePromise;
        } else {
            initDbSchema(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions);
            this.databasePromise = schemaBuilder.connect(LOVEFIELD_DB_CONFIG);
            dbPromises[dbName] = this.databasePromise;
            this.databasePromise.then(function (db) {
                var initalMigrationVersion = DB_VERSION_OLD || 2;
                runMigration(initalMigrationVersion, db, migrateDataUsingCustomLoveFieldQueries);
            });
        }
        return this.databasePromise;
    };

    this.reinitSchema = function (dbName) {
        this.databasePromise = null;
        return this.initSchema(dbName);
    };

    var createTable = function (schemaBuilder, tableDefinition) {
        var table = schemaBuilder.createTable(tableDefinition.tableName);

        _.map(tableDefinition.columns, function (column) {
            table.addColumn(column.name, dataTypes[column.type]);
        });

        table.addNullable(tableDefinition.nullableColumns);
        if (tableDefinition.autoIncrement) {
            table.addPrimaryKey(tableDefinition.primaryKeyColumns, true);
        } else {
            table.addPrimaryKey(tableDefinition.primaryKeyColumns);
        }
        if (tableDefinition.uniqueKeyColumns) {
            table.addUnique("uKey" + tableDefinition.uniqueKeyColumns.join(""), tableDefinition.uniqueKeyColumns);
        }
        _.each(tableDefinition.indexes, function (index) {
            table.addIndex(index.indexName, index.columnNames);
        });
    };
}]);

'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineDbInitialization', ['spinner', 'offlineService', 'initializeOfflineSchema', 'offlineDbService', 'androidDbService', 'dbNameService',
        function (spinner, offlineService, initializeOfflineSchema, offlineDbService, androidDbService, dbNameService) {
            var getDbName = function (provider, location) {
                return dbNameService.getDbName(provider, location);
            };
            return function () {
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var loginInformation = offlineService.getItem('LoginInformation');
                    var location = loginInformation ? loginInformation.currentLocation.display : null;
                    return offlineDbService.initSchema(Bahmni.Common.Constants.bahmniConnectMetaDataDb).then(function (metaDataDb) {
                        offlineDbService.init(metaDataDb);
                        if (location === null) {
                            return metaDataDb;
                        }
                        var dbNames = offlineService.getItem("dbNames") || [];
                        var username = offlineService.getItem("userData").results[0].username;
                        return getDbName(username, location).then(function (dbName) {
                            dbNames.push(dbName);
                            offlineService.setItem("dbNames", _.uniq(dbNames));
                            offlineService.setItem("currentDbName", dbName);
                            return offlineDbService.initSchema(dbName);
                        }).then(function (db) {
                            offlineDbService.init(db);
                            return db;
                        });
                    });
                }
            };
        }
    ]);

'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlineSyncService', 'offlineService',
            function (offlineSyncService, offlineService) {
                return function (isInitSync) {
                    if (offlineService.isOfflineApp()) {
                        return offlineSyncService.sync(isInitSync);
                    }
                };
            }
        ]);

'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineConfigInitialization', ['offlineService', '$http', 'offlineDbService', 'androidDbService', '$q', '$rootScope', 'loggingService',
        function (offlineService, $http, offlineDbService, androidDbService, $q, $rootScope, loggingService) {
            return function () {
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var modules = ['home', 'registration', 'clinical', "dbNameCondition"];
                    var length = modules.length;
                    var deferred = $q.defer();

                    var readConfigData = function (modules, index) {
                        if (length == index) {
                            deferred.resolve(1);
                            return deferred.promise;
                        }
                        var appName = modules[index];
                        return offlineDbService.getConfig(appName).then(function (result) {
                            var requestUrl = Bahmni.Common.Constants.baseUrl + appName + "/" + appName + ".json";
                            var req = {
                                method: 'GET',
                                url: requestUrl,
                                headers: {
                                    'If-None-Match': result ? result.etag : undefined
                                }
                            };
                            return req;
                        }).then(function (req) {
                            return $http(req).then(function (result) {
                                if (result.status == 200) {
                                    var eTag = result.headers().etag;
                                    return offlineDbService.insertConfig(appName, result.data, eTag).then(function (response) {
                                        if (response.key == 'home' || response.module == 'home') {
                                            var offlineConfig = response.value['offline-config.json'];
                                            var schedulerInterval = offlineConfig ? offlineConfig.schedulerInterval : 900000;
                                            localStorage.setItem('schedulerInterval', schedulerInterval);
                                        }
                                        return readConfigData(modules, ++index);
                                    });
                                }
                            }).catch(function (response) {
                                if (parseInt(response.status / 100) == 4 || parseInt(response.status / 100) == 5) {
                                    loggingService.logSyncError(response.config.url, response.status, response.data);
                                    return readConfigData(modules, ++index);
                                } else if (response.status == -1) {
                                    $rootScope.$broadcast("schedulerStage", null, true);
                                    deferred.reject(response);
                                } else {
                                    return readConfigData(modules, ++index);
                                }
                                return deferred.promise;
                            });
                        });
                    };
                    return readConfigData(modules, 0);
                }
            };
        }
    ]);

'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineReferenceDataInitialization', ['offlineService', '$http', 'offlineDbService', 'androidDbService', '$q', '$rootScope', 'loggingService', 'messagingService',
        function (offlineService, $http, offlineDbService, androidDbService, $q, $rootScope, loggingService, messagingService) {
            return function (isAuthenticated) {
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var referenceDataMap;
                    referenceDataMap = isAuthenticated ?
                        angular.extend(Bahmni.Common.Constants.authenticatedReferenceDataMap,
                            Bahmni.Common.Constants.unAuthenticatedReferenceDataMap) :
                        Bahmni.Common.Constants.unAuthenticatedReferenceDataMap;

                    var requests = [];

                    for (var key in referenceDataMap) {
                        var request = [];
                        if (referenceDataMap.hasOwnProperty(key)) {
                            request.push(key);
                            request.push(referenceDataMap[key]);
                            requests.push(request);
                        }
                    }

                    var deferred = $q.defer();

                    var readReferenceData = function (requests, index) {
                        if (requests.length == index) {
                            deferred.resolve(1);
                            return deferred.promise;
                        }
                        var url = requests[index][0];
                        var referenceData = requests[index][1];
                        return offlineDbService.getReferenceData(referenceData).then(function (result) {
                            var requestUrl = Bahmni.Common.Constants.hostURL + url;
                            if (result && Bahmni.Common.Constants.authenticatedReferenceDataMap[url] == "PersonAttributeType") {
                                result.etag = undefined;
                            }
                            var req = {
                                method: 'GET',
                                url: requestUrl,
                                headers: {
                                    'If-None-Match': result ? result.etag : undefined
                                },
                                withCredentials: true
                            };
                            if (referenceData == 'LocaleList' || referenceData == 'DefaultEncounterType' || referenceData == "NonCodedDrugConcept") {
                                req.headers.Accept = 'text/plain';
                            }
                            return req;
                        }).then(function (req) {
                            return $http(req).then(function (response) {
                                if (response.status == 200) {
                                    var eTag = response.headers().etag;
                                    return offlineDbService.insertReferenceData(referenceData, response.data, eTag).then(function () {
                                        return readReferenceData(requests, ++index);
                                    });
                                }
                            }).catch(function (response) {
                                if (parseInt(response.status / 100) == 4) {
                                    loggingService.logSyncError(response.config.url, response.status, response.data);
                                    $rootScope.$broadcast("schedulerStage", null, true);
                                    deferred.reject(response);
                                } else if (parseInt(response.status / 100) == 5) {
                                    loggingService.logSyncError(response.config.url, response.status, response.data);
                                    deferred.reject({"data": Bahmni.Common.Constants.offlineErrorMessages.openmrsServerError});
                                    messagingService.showMessage("error", Bahmni.Common.Constants.offlineErrorMessages.openmrsServerError);
                                    $rootScope.$broadcast("schedulerStage", null, true);
                                } else if (response.status == -1) {
                                    deferred.reject({"data": Bahmni.Common.Constants.offlineErrorMessages.networkError});
                                    messagingService.showMessage("error", Bahmni.Common.Constants.offlineErrorMessages.networkError);
                                    $rootScope.$broadcast("schedulerStage", null, true);
                                } else {
                                    return readReferenceData(requests, ++index);
                                }
                                return deferred.promise;
                            });
                        });
                    };

                    return readReferenceData(requests, 0);
                }
            };
        }
    ]);

'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineLocationInitialization', ['offlineService', 'offlineDbService', 'androidDbService', 'eventLogService', '$q',
            function (offlineService, offlineDbService, androidDbService, eventLogService, $q) {
                return function () {
                    var addressLevels;
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var loginLocation = offlineService.getItem('LoginInformation').currentLocation;
                    var deferred = $q.defer();

                    var insertMarkers = function (categoryFilterMap) {
                        var promises = [];
                        Object.keys(categoryFilterMap).forEach(function (category) {
                            var promise = offlineDbService.getMarker(category).then(function (marker) {
                                if (category === "transactionalData") {
                                    offlineService.setItem("initSyncFilter", categoryFilterMap[category]);
                                }
                                var filters = (marker && marker.filters) || [];
                                var lastReadEventUuid = (marker && marker.lastReadEventUuid) || null;
                                filters = filters.concat(categoryFilterMap[category]);
                                offlineDbService.insertMarker(category, lastReadEventUuid, _.uniq(filters));
                            });
                            promises.push(promise);
                        });
                        return promises;
                    };

                    offlineDbService.getReferenceData('AddressHierarchyLevels').then(function (addressHierarchyLevel) {
                        if (addressHierarchyLevel && addressHierarchyLevel.data ? false : true) {
                            deferred.resolve();
                            return;
                        }
                        addressLevels = _.reverse(addressHierarchyLevel.data);
                        var addressField = getLoginLocationAddress();
                        _.reverse(addressLevels);
                        var params = { searchString: loginLocation[addressField], addressField: addressField, limit: 5000};
                        if (params.searchString != undefined && params.addressField != undefined) {
                            eventLogService.getAddressForLoginLocation(params).then(function (results) {
                                var data = results.data;
                                for (var addressResults = 0; addressResults < data.length; addressResults++) {
                                    var loginAddress = data[addressResults];
                                    if (checkParents(loginAddress, getParentAddressLevel(addressField))) {
                                        var provider = offlineService.getItem('providerData').results[0];
                                        eventLogService.getEventCategoriesToBeSynced().then(function (results) {
                                            var categories = results.data;
                                            offlineService.setItem("eventLogCategories", categories);
                                            eventLogService.getFilterForCategoryAndLoginLocation(provider.uuid, loginAddress.uuid, loginLocation.uuid).then(function (results) {
                                                var promises = insertMarkers(angular.copy(results.data));
                                                $q.all(promises).then(deferred.resolve);
                                            });
                                        });
                                        break;
                                    }
                                }
                            });
                        } else {
                            deferred.resolve();
                        }
                    });

                    var getLoginLocationAddress = function () {
                        for (var addressLevel = 0; addressLevel < addressLevels.length; addressLevel++) {
                            if (loginLocation[addressLevels[addressLevel].addressField] != null) {
                                return addressLevels[addressLevel].addressField;
                            }
                        }
                    };

                    var checkParents = function (result, addressLevel) {
                        if (!result.parent) {
                            return true;
                        }
                        if (result.parent.name != loginLocation[addressLevel.addressField]) {
                            return false;
                        }
                        if (result.parent.name == loginLocation[addressLevel.addressField]) {
                            return checkParents(result.parent, getParentAddressLevel(addressLevel.addressField));
                        }
                    };

                    var getParentAddressLevel = function (addressField) {
                        var parent = null;
                        for (var addrLevel = 0; addrLevel < addressLevels.length; addrLevel++) {
                            if (addressLevels[addrLevel].addressField == addressField) {
                                return parent;
                            }
                            parent = addressLevels[addrLevel];
                        }
                    };
                    return deferred.promise;
                };
            }
        ]);

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

/*! ng-dialog - v0.3.12 (https://github.com/likeastore/ngDialog) */
!function(a,b){"undefined"!=typeof module&&module.exports?module.exports=b(require("angular")):"function"==typeof define&&define.amd?define(["angular"],b):b(a.angular)}(this,function(a){"use strict";var b,c=a.module("ngDialog",[]),d=a.element,e=a.isDefined,f=(document.body||document.documentElement).style,g=e(f.animation)||e(f.WebkitAnimation)||e(f.MozAnimation)||e(f.MsAnimation)||e(f.OAnimation),h="animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend",i=!1;return c.provider("ngDialog",function(){var c=this.defaults={className:"ngdialog-theme-default",plain:!1,showClose:!0,closeByDocument:!0,closeByEscape:!0,closeByNavigation:!1,appendTo:!1,preCloseCallback:!1,overlay:!0,cache:!0};this.setForceBodyReload=function(a){i=a||!1},this.setDefaults=function(b){a.extend(c,b)};var e,f=0,j=0,k={};this.$get=["$document","$templateCache","$compile","$q","$http","$rootScope","$timeout","$window","$controller",function(l,m,n,o,p,q,r,s,t){var u=l.find("body");i&&q.$on("$locationChangeSuccess",function(){u=l.find("body")});var v={onDocumentKeydown:function(a){27===a.keyCode&&w.close("$escape")},setBodyPadding:function(a){var b=parseInt(u.css("padding-right")||0,10);u.css("padding-right",b+a+"px"),u.data("ng-dialog-original-padding",b)},resetBodyPadding:function(){var a=u.data("ng-dialog-original-padding");a?u.css("padding-right",a+"px"):u.css("padding-right","")},performCloseDialog:function(a,c){var d=a.attr("id");if("undefined"!=typeof s.Hammer){var f=b.hammerTime;f.off("tap",e),f.destroy&&f.destroy(),delete b.hammerTime}else a.unbind("click");1===j&&u.unbind("keydown"),a.hasClass("ngdialog-closing")||(j-=1),q.$broadcast("ngDialog.closing",a),j=0>j?0:j,g?(b.$destroy(),a.unbind(h).bind(h,function(){a.remove(),0===j&&(u.removeClass("ngdialog-open"),v.resetBodyPadding()),q.$broadcast("ngDialog.closed",a)}).addClass("ngdialog-closing")):(b.$destroy(),a.remove(),0===j&&(u.removeClass("ngdialog-open"),v.resetBodyPadding()),q.$broadcast("ngDialog.closed",a)),k[d]&&(k[d].resolve({id:d,value:c,$dialog:a,remainingDialogs:j}),delete k[d])},closeDialog:function(b,c){var d=b.data("$ngDialogPreCloseCallback");if(d&&a.isFunction(d)){var e=d.call(b,c);a.isObject(e)?e.closePromise?e.closePromise.then(function(){v.performCloseDialog(b,c)}):e.then(function(){v.performCloseDialog(b,c)},function(){}):e!==!1&&v.performCloseDialog(b,c)}else v.performCloseDialog(b,c)}},w={open:function(g){function h(a,b){return p.get(a,b||{}).then(function(a){return a.data||""})}function i(b){return b?a.isString(b)&&x.plain?b:"boolean"!=typeof x.cache||x.cache?m.get(b)||h(b,{cache:!0}):h(b,{cache:!1}):"Empty template"}var l=this,x=a.copy(c);g=g||{},a.extend(x,g),f+=1,l.latestID="ngdialog"+f;var y;k[l.latestID]=y=o.defer(),b=a.isObject(x.scope)?x.scope.$new():q.$new();var z,A;return o.when(i(x.template||x.templateUrl)).then(function(c){if(m.put(x.template||x.templateUrl,c),x.showClose&&(c+='<div class="ngdialog-close"></div>'),l.$result=z=d('<div id="ngdialog'+f+'" class="ngdialog"></div>'),z.html(x.overlay?'<div class="ngdialog-overlay"></div><div class="ngdialog-content">'+c+"</div>":'<div class="ngdialog-content">'+c+"</div>"),x.data&&a.isString(x.data)){var g=x.data.replace(/^\s*/,"")[0];b.ngDialogData="{"===g||"["===g?a.fromJson(x.data):x.data}else x.data&&a.isObject(x.data)&&(b.ngDialogData=x.data);if(x.controller&&(a.isString(x.controller)||a.isArray(x.controller)||a.isFunction(x.controller))){var h=t(x.controller,{$scope:b,$element:z});z.data("$ngDialogControllerController",h)}if(x.className&&z.addClass(x.className),A=x.appendTo&&a.isString(x.appendTo)?a.element(document.querySelector(x.appendTo)):u,x.preCloseCallback){var i;a.isFunction(x.preCloseCallback)?i=x.preCloseCallback:a.isString(x.preCloseCallback)&&b&&(a.isFunction(b[x.preCloseCallback])?i=b[x.preCloseCallback]:b.$parent&&a.isFunction(b.$parent[x.preCloseCallback])?i=b.$parent[x.preCloseCallback]:q&&a.isFunction(q[x.preCloseCallback])&&(i=q[x.preCloseCallback])),i&&z.data("$ngDialogPreCloseCallback",i)}if(b.closeThisDialog=function(a){v.closeDialog(z,a)},r(function(){n(z)(b);var a=s.innerWidth-u.prop("clientWidth");u.addClass("ngdialog-open");var c=a-(s.innerWidth-u.prop("clientWidth"));c>0&&v.setBodyPadding(c),A.append(z),x.name?q.$broadcast("ngDialog.opened",{dialog:z,name:x.name}):q.$broadcast("ngDialog.opened",z)}),x.closeByEscape&&u.bind("keydown",v.onDocumentKeydown),x.closeByNavigation&&q.$on("$locationChangeSuccess",function(){v.closeDialog(z)}),e=function(a){var b=x.closeByDocument?d(a.target).hasClass("ngdialog-overlay"):!1,c=d(a.target).hasClass("ngdialog-close");(b||c)&&w.close(z.attr("id"),c?"$closeButton":"$document")},"undefined"!=typeof s.Hammer){var k=b.hammerTime=s.Hammer(z[0]);k.on("tap",e)}else z.bind("click",e);return j+=1,w}),{id:"ngdialog"+f,closePromise:y.promise,close:function(a){v.closeDialog(z,a)}}},openConfirm:function(b){var c=o.defer(),e={closeByEscape:!1,closeByDocument:!1};a.extend(e,b),e.scope=a.isObject(e.scope)?e.scope.$new():q.$new(),e.scope.confirm=function(a){c.resolve(a);var b=d(document.getElementById(f.id));v.performCloseDialog(b,a)};var f=w.open(e);return f.closePromise.then(function(a){return a?c.reject(a.value):c.reject()}),c.promise},close:function(a,b){var c=d(document.getElementById(a));return c.length?v.closeDialog(c,b):w.closeAll(b),w},closeAll:function(b){var c=document.querySelectorAll(".ngdialog");a.forEach(c,function(a){v.closeDialog(d(a),b)})},getDefaults:function(){return c}};return w}]}),c.directive("ngDialog",["ngDialog",function(b){return{restrict:"A",scope:{ngDialogScope:"="},link:function(c,d,e){d.on("click",function(d){d.preventDefault();var f=a.isDefined(c.ngDialogScope)?c.ngDialogScope:"noScope";a.isDefined(e.ngDialogClosePrevious)&&b.close(e.ngDialogClosePrevious);var g=b.getDefaults();b.open({template:e.ngDialog,className:e.ngDialogClass||g.className,controller:e.ngDialogController,scope:f,data:e.ngDialogData,showClose:"false"===e.ngDialogShowClose?!1:"true"===e.ngDialogShowClose?!0:g.showClose,closeByDocument:"false"===e.ngDialogCloseByDocument?!1:"true"===e.ngDialogCloseByDocument?!0:g.closeByDocument,closeByEscape:"false"===e.ngDialogCloseByEscape?!1:"true"===e.ngDialogCloseByEscape?!0:g.closeByEscape,preCloseCallback:e.ngDialogPreCloseCallback||g.preCloseCallback})})}}}]),c});
"use strict";

angular.module('bahmni.common.offline')
    .controller('InitSyncController', ['$scope', 'ngDialog', '$state', 'offlineService', 'offlinePush', 'offlinePull', 'spinner', 'sessionService', '$q', 'offlineLocationInitialization', 'dbNameService',
        function ($scope, ngDialog, $state, offlineService, offlinePush, offlinePull, spinner, sessionService, $q, offlineLocationInitialization, dbNameService) {
            var loginLocationUuid = offlineService.getItem('LoginInformation') ? offlineService.getItem('LoginInformation').currentLocation.uuid : undefined;
            var loginInformation = offlineService.getItem('LoginInformation');
            var location = loginInformation ? loginInformation.currentLocation.display : null;
            var username = offlineService.getItem("userData").results[0].username;
            var dbName;
            var init = function () {
                var deferred = $q.defer();
                dbNameService.getDbName(username, location).then(function (dbName) {
                    return dbName;
                }).then(function (dbName) {
                    offlinePull(true).then(function () {
                        setInitialStatus("complete", dbName);
                        deferred.resolve();
                    }, function () {
                        setInitialStatus("notComplete", dbName);
                        deferred.reject();
                    });
                });
                return deferred.promise;
            };

            var setInitialStatus = function (status, dbName) {
                if (loginLocationUuid) {
                    var initialSyncStatus = offlineService.getItem("initialSyncStatus") || {};
                    initialSyncStatus[dbName] = initialSyncStatus[dbName] || {};
                    initialSyncStatus[dbName][loginLocationUuid] = status;
                    offlineService.setItem("initialSyncStatus", initialSyncStatus);
                }
            };

            var syncSuccessCallBack = function () {
                $scope.showSyncInfo = false;
                ngDialog.open({
                    template: 'views/offlineSyncConfirm.html',
                    class: 'ngdialog-theme-default',
                    closeByEscape: false,
                    closeByDocument: false,
                    showClose: false,
                    scope: $scope

                });
            };

            var syncFailureCallBack = function () {
                $scope.showSyncInfo = false;
                ngDialog.open({
                    template: 'views/offlineSyncFailure.html',
                    class: 'ngdialog-theme-default',
                    closeByEscape: false,
                    closeByDocument: false,
                    showClose: false,
                    scope: $scope

                });
            };

            $scope.dashboard = function () {
                $state.go('dashboard');
            };

            $scope.logout = function () {
                sessionService.destroy().then(
                  function () {
                      $state.go('login');
                  }
                );
            };

            var syncStatus = offlineService.getItem("initialSyncStatus");
            dbNameService.getDbName(username, location).then(function (name) {
                dbName = name;
                return dbName;
            }).then(function (dbName) {
                if (syncStatus && syncStatus[dbName] && syncStatus[dbName][loginLocationUuid] === "complete") {
                    $state.go('dashboard');
                } else if (syncStatus && syncStatus[dbName] && !syncStatus[dbName][loginLocationUuid]) {
                    offlineLocationInitialization().then(function () {
                        init().then(syncSuccessCallBack, syncFailureCallBack);
                    });
                } else {
                    init().then(syncSuccessCallBack, syncFailureCallBack);
                }
            });
        }]
    );

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
    .factory('offlinePull', ['offlineService', 'offlineConfigInitialization', 'offlineReferenceDataInitialization', 'offlineSyncInitialization',
        function (offlineService, offlineConfigInitialization, offlineReferenceDataInitialization, offlineSyncInitialization) {
            return function (isInitSync) {
                if (offlineService.isOfflineApp()) {
                    return offlineConfigInitialization().then(function (response) {
                        return offlineReferenceDataInitialization(true).then(function (response) {
                            return offlineSyncInitialization(isInitSync);
                        });
                    });
                }
            };
        }
    ]);

'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSyncService', ['eventLogService', 'offlineDbService', '$q', 'offlineService', 'androidDbService', '$rootScope', 'loggingService',
        function (eventLogService, offlineDbService, $q, offlineService, androidDbService, $rootScope, loggingService) {
            var stages, categories;

            var initializeInitSyncInfo = function initializeCounters (categories) {
                $rootScope.initSyncInfo = {};
                $rootScope.showSyncInfo = true;
                _.map(categories, function (category) {
                    $rootScope.initSyncInfo[category] = {};
                    $rootScope.initSyncInfo[category].pendingEventsCount = 0;
                    $rootScope.initSyncInfo[category].savedEventsCount = 0;
                });
                $rootScope.initSyncInfo.savedEvents = 0;
            };

            var sync = function (isInitSync) {
                stages = 0;
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                var promises = [];
                categories = offlineService.getItem("eventLogCategories");
                initializeInitSyncInfo(categories);
                _.map(categories, function (category) {
                    promises.push(syncForCategory(category, isInitSync));
                });
                return $q.all(promises);
            };

            var syncForCategory = function (category, isInitSync) {
                return offlineDbService.getMarker(category).then(function (marker) {
                    if (category == "transactionalData" && isInitSync) {
                        marker = angular.copy(marker);
                        marker.filters = offlineService.getItem("initSyncFilter");
                    }
                    return syncForMarker(category, marker, isInitSync);
                });
            };

            var updatePendingEventsCount = function updatePendingEventsCount (category, pendingEventsCount) {
                $rootScope.initSyncInfo[category].pendingEventsCount = pendingEventsCount;
                $rootScope.initSyncInfo.totalEvents = categories.reduce(function (count, category) {
                    return count + $rootScope.initSyncInfo[category].savedEventsCount + $rootScope.initSyncInfo[category].pendingEventsCount;
                }, 0);
            };

            var syncForMarker = function (category, marker, isInitSync) {
                return eventLogService.getEventsFor(category, marker).then(function (response) {
                    var events = response.data ? response.data["events"] : undefined;
                    updatePendingEventsCount(category, response.data.pendingEventsCount);
                    if (events == undefined || events.length == 0) {
                        endSync(stages++);
                        return;
                    }
                    return readEvent(events, 0, category, isInitSync);
                }, function () {
                    endSync(-1);
                    var deferrable = $q.defer();
                    deferrable.reject();
                    return deferrable.promise;
                });
            };

            var createRejectedPromise = function () {
                var deferrable = $q.defer();
                deferrable.reject();
                return deferrable.promise;
            };

            var readEvent = function (events, index, category, isInitSync) {
                if (events.length == index && events.length > 0) {
                    return syncForCategory(category, isInitSync);
                }
                if (events.length == index) {
                    return;
                }
                var event = events[index];
                if (event.category == "SHREncounter") {
                    var uuid = event.object.match(Bahmni.Common.Constants.uuidRegex)[0];
                    event.object = Bahmni.Common.Constants.offlineBahmniEncounterUrl + uuid + "?includeAll=true";
                }
                return eventLogService.getDataForUrl(Bahmni.Common.Constants.hostURL + event.object)
                    .then(function (response) {
                        return saveData(event, response)
                            .then(function () {
                                updateSavedEventsCount(category);
                                return updateMarker(event, category);
                            }, createRejectedPromise)
                            .then(
                                function (lastEvent) {
                                    offlineService.setItem("lastSyncTime", lastEvent.lastReadTime);
                                    return readEvent(events, ++index, category, isInitSync);
                                });
                    }).catch(function (response) {
                        logSyncError(response);
                        $rootScope.$broadcast("schedulerStage", null, true);
                        endSync(-1);
                        return createRejectedPromise();
                    });
            };

            var logSyncError = function (response) {
                if (response && (parseInt(response.status / 100) == 4 || parseInt(response.status / 100) == 5)) {
                    loggingService.logSyncError(response.config.url, response.status, response.data);
                }
            };

            var isPrimary = function (identifier, identifierTypes) {
                return identifier.identifierType.retired ? false : !!(_.find(identifierTypes, {'uuid': identifier.identifierType.uuid})).primary;
            };

            var mapIdentifiers = function (identifiers) {
                var deferred = $q.defer();
                return offlineDbService.getReferenceData("IdentifierTypes").then(function (identifierTypesData) {
                    var identifierTypes = identifierTypesData.data;
                    angular.forEach(identifiers, function (identifier) {
                        identifier.identifierType.primary = isPrimary(identifier, identifierTypes);
                    });
                    var extraIdentifiersForSearch = {};
                    var extraIdentifiers = _.filter(identifiers, {'identifierType': {'primary': false}});
                    var primaryIdentifier = _.filter(identifiers, {'identifierType': {'primary': true}})[0];
                    angular.forEach(extraIdentifiers, function (extraIdentifier) {
                        var name = extraIdentifier.identifierType.display || extraIdentifier.identifierType.name;
                        extraIdentifiersForSearch[name] = extraIdentifier.identifier;
                    });
                    angular.forEach(identifiers, function (identifier) {
                        identifier.primaryIdentifier = primaryIdentifier.identifier;
                        identifier.extraIdentifiers = !_.isEmpty(extraIdentifiersForSearch) ? extraIdentifiersForSearch : undefined;
                    });
                    deferred.resolve({data: identifiers});
                    return deferred.promise;
                });
            };

            var saveData = function (event, response) {
                var deferrable = $q.defer();
                switch (event.category) {
                case 'patient':
                    offlineDbService.getAttributeTypes().then(function (attributeTypes) {
                        mapAttributesToPostFormat(response.data.person.attributes, attributeTypes);
                        mapIdentifiers(response.data.identifiers).then(function () {
                            offlineDbService.createPatient({patient: response.data}).then(function () {
                                deferrable.resolve();
                            }, function (response) {
                                deferrable.reject(response);
                            });
                        });
                    });
                    break;
                case 'Encounter':
                case 'SHREncounter':
                    offlineDbService.createEncounter(response.data).then(function () {
                        deferrable.resolve();
                    });
                    break;
                case 'LabOrderResults':
                    var patientUuid = event.object.match(Bahmni.Common.Constants.uuidRegex)[0];
                    offlineDbService.insertLabOrderResults(patientUuid, response.data).then(function () {
                        deferrable.resolve();
                    });
                    break;

                case 'offline-concepts':
                    offlineDbService.insertConceptAndUpdateHierarchy({"results": [response.data]}).then(function () {
                        deferrable.resolve();
                    });
                    break;
                case 'addressHierarchy':
                case 'parentAddressHierarchy':
                    offlineDbService.insertAddressHierarchy(response.data).then(function () {
                        deferrable.resolve();
                    });
                    break;
                default:
                    deferrable.resolve();
                    break;
                }
                return deferrable.promise;
            };

            var mapAttributesToPostFormat = function (attributes, attributeTypes) {
                angular.forEach(attributes, function (attribute) {
                    if (!attribute.voided && !attribute.attributeType.retired) {
                        var foundAttribute = _.find(attributeTypes, function (attributeType) {
                            return attributeType.uuid === attribute.attributeType.uuid;
                        });
                        if (foundAttribute.format === "org.openmrs.Concept") {
                            var value = attribute.value;
                            attribute.value = value.display;
                            attribute.hydratedObject = value.uuid;
                        }
                    }
                    return;
                });
            };

            var updateMarker = function (event, category) {
                return offlineDbService.getMarker(category).then(function (marker) {
                    return offlineDbService.insertMarker(marker.markerName, event.uuid, marker.filters);
                });
            };

            var updateSavedEventsCount = function (category) {
                $rootScope.initSyncInfo[category].savedEventsCount++;
                $rootScope.initSyncInfo[category].pendingEventsCount--;
                $rootScope.initSyncInfo.savedEvents++;
            };

            var endSync = function (status) {
                if (stages == categories.length || status == -1) {
                    $rootScope.$broadcast("schedulerStage", null);
                }
            };

            return {
                sync: sync
            };
        }
    ]);

'use strict';

angular.module('bahmni.common.offline').service('networkStatusService', ['$window', function ($window) {
    var isOnline = function () {
        return $window.navigator.onLine;
    };

    return {
        isOnline: isOnline
    };
}]);

'use strict';

angular.module('bahmni.common.offline')
    .factory('eventLogService', ['$http', function ($http) {
        var getEvents = function (url, marker) {
            return $http.get(url, { params: {filterBy: marker.filters, uuid: marker.lastReadEventUuid}});
        };

        var getDataForUrl = function (url) {
            return $http.get(url);
        };

        var getAddressForLoginLocation = function (params) {
            var url = Bahmni.Common.Constants.openmrsUrl +
                "/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form";
            return $http.get(url, { method: "GET", params: params, withCredentials: true});
        };

        var getFilterForCategoryAndLoginLocation = function (providerUuid, addressUuid, loginlocationUuid) {
            var url = Bahmni.Common.Constants.eventlogFilterUrl + "/markers/" + providerUuid + "/" + addressUuid + "/" + loginlocationUuid;
            return $http.get(url, {method: "GET", withCredentials: true});
        };

        var getEventCategoriesToBeSynced = function () {
            var url = Bahmni.Common.Constants.eventlogFilterUrl + "/category";
            return $http.get(url, { method: "GET", withCredentials: true});
        };

        var getEventsFor = function (category, marker) {
            switch (category) {
            case 'transactionalData':
                return getEvents(Bahmni.Common.Constants.eventLogServiceUrl, marker);
            case 'offline-concepts':
                return getEvents(Bahmni.Common.Constants.eventLogServiceConceptUrl, marker);
            case 'addressHierarchy':
            case 'parentAddressHierarchy':
                return getEvents(Bahmni.Common.Constants.addressEventLogServiceUrl, marker);
            }
        };

        return {
            getEventsFor: getEventsFor,
            getDataForUrl: getDataForUrl,
            getAddressForLoginLocation: getAddressForLoginLocation,
            getFilterForCategoryAndLoginLocation: getFilterForCategoryAndLoginLocation,
            getEventCategoriesToBeSynced: getEventCategoriesToBeSynced
        };
    }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('androidDbService', ['$q', 'eventLogService', 'offlineService',
        function ($q, eventLogService, offlineService) {
            var currentDbName = null;
            var getMarker = function (markerName) {
                var value = AndroidOfflineService.getMarker(markerName);
                value = value != undefined ? JSON.parse(value) : value;
                if (value && value.filters) {
                    value.filters = JSON.parse(value.filters);
                }
                return $q.when(value);
            };

            var insertMarker = function (markerName, uuid, filters) {
                var value = AndroidOfflineService.insertMarker(markerName, uuid, JSON.stringify(filters));
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var createPatient = function (patient) {
                var patientString = JSON.stringify(patient);
                var value = AndroidOfflineService.createPatient(patientString);
                value = value != undefined ? JSON.parse(value) : value;
                return value && value.isIdentifierDuplicate ? $q.reject(value) : $q.when(value);
            };

            var insertAddressHierarchy = function (addressHierarchy) {
                var addressHierarchyString = JSON.stringify(addressHierarchy);
                var value = AndroidOfflineService.insertAddressHierarchy(addressHierarchyString);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var init = function (dbName) {
                currentDbName = dbName;
                return $q.when(AndroidOfflineService.init(dbName));
            };

            var initSchema = function (dbName) {
                return $q.when(AndroidOfflineService.initSchema(dbName));
            };

            var deletePatientData = function (identifier) {
                AndroidOfflineService.deletePatientData(identifier);
                return $q.when({});
            };

            var getPatientByUuid = function (uuid, dbName) {
                dbName = dbName || null;
                var value = AndroidOfflineService.getPatientByUuid(uuid, dbName);
                value = value != undefined ? JSON.parse(value) : value;
                angular.forEach(value.patient.person.attributes, function (attribute) {
                    if (attribute.hydratedObject) {
                        var temp = attribute.hydratedObject;
                        delete attribute.hydratedObject;
                        attribute.hydratedObject = temp;
                    }
                });
                return $q.when(value);
            };

            var searchAddress = function (requestParams) {
                var addressParams = JSON.stringify(requestParams);
                var value = AndroidOfflineService.searchAddress(addressParams);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when({data: value});
            };

            var getConfig = function (module) {
                var value = AndroidConfigDbService.getConfig(module);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var insertConfig = function (module, data, eTag) {
                return $q.when(JSON.parse(AndroidConfigDbService.insertConfig(module, JSON.stringify(data), eTag)));
            };

            var getReferenceData = function (referenceDataKey) {
                var value = AndroidOfflineService.getReferenceData(referenceDataKey);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var insertReferenceData = function (key, data, eTag) {
                var referenceData;
                if (key == "LocaleList" || key == "DefaultEncounterType" || key == "NonCodedDrugConcept" || (key == "RelationshipTypeMap" && data == "")) {
                    referenceData = data;
                } else {
                    referenceData = JSON.stringify(data);
                }
                AndroidOfflineService.insertReferenceData(key, referenceData, eTag);
                return $q.when({});
            };

            var getLocationByUuid = function (uuid) {
                var value = AndroidLocationDbService.getLocationByUuid(uuid);
                value = value != undefined ? JSON.parse(value).value : value;
                return $q.when(value);
            };

            var getAttributeTypes = function () {
                var value = AndroidOfflineService.getAttributeTypes();
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var createEncounter = function (encounterData, dbName) {
                var deferred = $q.defer();
                insertEncounterData(encounterData, dbName).then(function () {
                    if (encounterData.visitUuid) {
                        eventLogService.getDataForUrl(Bahmni.Common.Constants.visitUrl + "/" + encounterData.visitUuid).then(function (response) {
                            insertVisitData(response.data, dbName).then(function () {
                                deferred.resolve({data: encounterData});
                            });
                        }, function () {
                            deferred.resolve({data: encounterData});
                        });
                    } else {
                        deferred.resolve({data: encounterData});
                    }
                });
                return deferred.promise;
            };

            var insertEncounterData = function (encounterData, dbName) {
                dbName = dbName || null;
                var encounter = AndroidOfflineService.insertEncounterData(JSON.stringify(encounterData), dbName);
                return insertObservationData(encounterData.patientUuid, encounterData.visitUuid, encounterData.observations, dbName).then(function () {
                    encounter = encounter != undefined ? JSON.parse(encounter) : encounter;
                    return encounter;
                });
            };

            var getEncountersByPatientUuid = function (patientUuid) {
                var response = AndroidOfflineService.getEncountersByPatientUuid(patientUuid);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var insertVisitData = function (visitData, dbName) {
                dbName = dbName || null;
                var response = AndroidOfflineService.insertVisitData(JSON.stringify(visitData), dbName);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getVisitByUuid = function (visitUuid) {
                var response = AndroidOfflineService.getVisitByUuid(visitUuid);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getActiveEncounter = function (params) {
                var deferred = $q.defer();
                getReferenceData("encounterSessionDuration").then(function (encounterSessionDurationData) {
                    var encounterSessionDuration = encounterSessionDurationData.data;
                    getReferenceData("DefaultEncounterType").then(function (defaultEncounterType) {
                        var encounterType = defaultEncounterType ? defaultEncounterType.data : null;
                        var response = AndroidOfflineService.findActiveEncounter(JSON.stringify({patientUuid: params.patientUuid, providerUuid: params.providerUuids[0], encounterType: encounterType}), encounterSessionDuration);
                        response = response != undefined ? JSON.parse(response) : response;
                        deferred.resolve(response);
                    });
                });
                return deferred.promise;
            };

            var insertObservationData = function (patientUuid, visitUuid, observationData, dbName) {
                dbName = dbName || null;
                var response = AndroidOfflineService.insertObservationData(patientUuid, visitUuid, JSON.stringify(observationData), dbName);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getVisitsByPatientUuid = function (patientUuid, numberOfVisits) {
                var response = AndroidOfflineService.getVisitsByPatientUuid(patientUuid, numberOfVisits);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getVisitDetailsByPatientUuid = function (patientUuid) {
                var response = AndroidOfflineService.getVisitDetailsByPatientUuid(patientUuid);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getObservationsFor = function (params) {
                var response = AndroidOfflineService.getObservationsFor(JSON.stringify(params));
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getObservationsForVisit = function (visitUuid) {
                var response = AndroidOfflineService.getObservationsForVisit(visitUuid);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var insertConceptAndUpdateHierarchy = function (data, parent) {
                if (!parent) {
                    parent = null;
                } else {
                    parent = JSON.stringify(parent);
                }
                AndroidConceptDbService.insertConceptAndUpdateHierarchy(JSON.stringify(data), parent);
                return $q.when({});
            };

            var getConcept = function (conceptUuid) {
                var value = AndroidConceptDbService.getConcept(conceptUuid);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var getConceptByName = function (conceptName) {
                var value = AndroidConceptDbService.getConceptByName(conceptName);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var getEncounterByEncounterUuid = function (encounterUuid, dbName) {
                dbName = dbName || null;
                var response = AndroidOfflineService.findEncounterByEncounterUuid(encounterUuid, dbName);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getAllParentsInHierarchy = function (conceptName) {
                var conceptNamesInHierarchy = [];
                var response = AndroidConceptDbService.getAllParentsInHierarchy(conceptName);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var insertLog = function (errorLogUuid, failedRequest, responseStatus, stacktrace, requestPayload) {
                var provider = _.has(requestPayload, 'providers') ? requestPayload.providers[0] :
                    (_.has(requestPayload, 'auditInfo.creator') ? requestPayload.auditInfo.creator : null);
                requestPayload = requestPayload ? requestPayload : null;
                var deferred = $q.defer();
                try {
                    var response = AndroidOfflineService.insertLog(errorLogUuid, failedRequest, responseStatus, JSON.stringify(stacktrace), JSON.stringify(requestPayload), JSON.stringify(provider));
                } catch (error) {
                    deferred.reject();
                    return deferred.promise;
                }
                return $q.when(response);
            };

            var getAllLogs = function () {
                var value = AndroidOfflineService.getAllLogs();
                value = _.isEmpty(value) ? [] : JSON.parse(value);
                return $q.when(value);
            };

            var getErrorLogByUuid = function (uuid, dbName) {
                dbName = dbName || null;
                var value = AndroidOfflineService.getErrorLogByUuid(uuid, dbName);
                value = value !== undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var deleteErrorFromErrorLog = function (uuid) {
                AndroidOfflineService.deleteByUuid(uuid);
                return $q.when({});
            };

            var getPrescribedAndActiveDrugOrders = function (params) {
                var response = AndroidOfflineService.getEncountersByVisits(JSON.stringify(params));
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getPatientByUuidForPost = function (uuid, dbName) {
                var deferred = $q.defer();
                getPatientByUuid(uuid, dbName).then(function (patientData) {
                    var patient = patientData.patient;
                    patient.identifiers = _.map(patient.identifiers, function (identifier) {
                        return {
                            identifier: identifier.identifier,
                            identifierPrefix: identifier.identifierPrefix || identifier.selectedIdentifierSource && identifier.selectedIdentifierSource.prefix,
                            identifierSourceUuid: identifier.identifierSourceUuid || identifier.selectedIdentifierSource && identifier.selectedIdentifierSource.uuid,
                            identifierType: identifier.identifierType && identifier.identifierType.uuid || identifier.identifierType,
                            uuid: identifier.uuid,
                            preferred: identifier.preferred,
                            voided: identifier.voided
                        };
                    });
                    deferred.resolve(patientData);
                });
                return deferred.promise;
            };

            var insertLabOrderResults = function (patientUuid, results) {
                var response = AndroidOfflineService.insertLabOrderResults(patientUuid, JSON.stringify(results));
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getLabOrderResultsForPatient = function (patientUuid) {
                var response = AndroidOfflineService.getLabOrderResultsByPatientUuid(patientUuid);
                return $q.when(JSON.parse(response));
            };

            var getDbNames = function () {
                return offlineService.getItem("dbNames");
            };

            var getCurrentDbName = function () {
                return currentDbName;
            };

            return {
                init: init,
                initSchema: initSchema,
                getPatientByUuid: getPatientByUuid,
                createPatient: createPatient,
                deletePatientData: deletePatientData,
                getMarker: getMarker,
                insertMarker: insertMarker,
                insertAddressHierarchy: insertAddressHierarchy,
                searchAddress: searchAddress,
                getConfig: getConfig,
                insertConfig: insertConfig,
                getReferenceData: getReferenceData,
                insertReferenceData: insertReferenceData,
                getLocationByUuid: getLocationByUuid,
                getAttributeTypes: getAttributeTypes,
                insertEncounterData: insertEncounterData,
                getEncountersByPatientUuid: getEncountersByPatientUuid,
                createEncounter: createEncounter,
                insertVisitData: insertVisitData,
                getVisitByUuid: getVisitByUuid,
                getActiveEncounter: getActiveEncounter,
                getVisitsByPatientUuid: getVisitsByPatientUuid,
                getObservationsFor: getObservationsFor,
                insertConceptAndUpdateHierarchy: insertConceptAndUpdateHierarchy,
                getConcept: getConcept,
                getConceptByName: getConceptByName,
                getEncounterByEncounterUuid: getEncounterByEncounterUuid,
                insertLog: insertLog,
                getAllLogs: getAllLogs,
                getAllParentsInHierarchy: getAllParentsInHierarchy,
                getPrescribedAndActiveDrugOrders: getPrescribedAndActiveDrugOrders,
                getErrorLogByUuid: getErrorLogByUuid,
                deleteErrorFromErrorLog: deleteErrorFromErrorLog,
                getPatientByUuidForPost: getPatientByUuidForPost,
                getVisitDetailsByPatientUuid: getVisitDetailsByPatientUuid,
                getObservationsForVisit: getObservationsForVisit,
                insertLabOrderResults: insertLabOrderResults,
                getLabOrderResultsForPatient: getLabOrderResultsForPatient,
                getDbNames: getDbNames,
                getCurrentDbName: getCurrentDbName
            };
        }
    ]);

'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSearchDbService', ['$http', '$q', '$rootScope', 'age', function ($http, $q, $rootScope, age) {
        var db;

        var search = function (params) {
            var defer = $q.defer();
            var response = {
                "data": {
                    pageOfResults: []
                }
            };

            if ($rootScope.searching) {
                response.data.pageOfResults.push({});
                return defer.resolve(response);
            }

            $rootScope.searching = true;
            var nameParts = null;
            if (params.q) {
                nameParts = params.q.split(" ");
                for (var i = 0; i < nameParts.length; i++) {
                    nameParts[i] = nameParts[i].replace('%', '.');
                }
            }

            if (!params.patientAttributes) {
                params.patientAttributes = "";
            }

            var snakeCaseToCamelCase = function (snake_str) { // eslint-disable-line camelcase
                return snake_str.replace(/_([a-z])/g, function (g) {
                    return g[1].toUpperCase();
                });
            };

            var camelCaseToSnakeCase = function (camelCaseSting) {
                return camelCaseSting.replace(/([A-Z])/g, function ($1) {
                    return "_" + $1.toLowerCase();
                });
            };

            var addressFieldName = null;
            if (params.addressFieldName) {
                addressFieldName = snakeCaseToCamelCase(params.addressFieldName);
            }

            var p = db.getSchema().table('patient');
            var pi = db.getSchema().table('patient_identifier');
            var pa = db.getSchema().table('patient_attribute');
            var pat = db.getSchema().table('patient_attribute_type');
            var padd = db.getSchema().table('patient_address').as('addressFieldValue');
            var encounter = db.getSchema().table('encounter');

            db.select(pat.attributeTypeId)
                .from(pat)
                .where(pat.attributeName.in(params.patientAttributes)).exec()
                .then(function (attributeTypeIds) {
                    var query = db.select(p.uuid.as('uuid'))
                        .from(p)
                        .innerJoin(padd, p.uuid.eq(padd.patientUuid))
                        .leftOuterJoin(pi, p.uuid.eq(pi.patientUuid))
                        .leftOuterJoin(pa, p.uuid.eq(pa.patientUuid))
                        .leftOuterJoin(encounter, p.uuid.eq(encounter.patientUuid))
                        .leftOuterJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId));
                    var predicates = [];

                    if (!_.isEmpty(params.addressFieldValue)) {
                        params.addressFieldValue = params.addressFieldValue.replace('%', '.');
                        predicates.push(padd[addressFieldName].match(new RegExp(params.addressFieldValue, 'i')));
                    }

                    if (params.duration) {
                        var startDate = Bahmni.Common.Util.DateUtil.subtractDays(new Date(), params.duration);
                        var encounterPredicate = encounter.encounterDateTime.gte(startDate);
                        var dateCreatedPredicate = p.dateCreated.gte(startDate);
                        predicates.push(lf.op.or(encounterPredicate, dateCreatedPredicate));
                    }

                    if (!_.isEmpty(params.identifier)) {
                        params.identifier = params.identifier.replace('%', '.');
                        predicates.push(pi.identifier.match(new RegExp(params.identifier, 'i')));
                        predicates.push(pi.identifier.match(new RegExp(params.identifierPrefix, 'i')));
                    }
                    if (!_.isEmpty(nameParts)) {
                        var nameSearchCondition = [];
                        if (!_.isEmpty(nameParts)) {
                            angular.forEach(nameParts, function (namePart) {
                                nameSearchCondition.push(lf.op.or(p.givenName.match(new RegExp(namePart, 'i')), p.middleName.match(new RegExp(namePart, 'i')),
                                    p.familyName.match(new RegExp(namePart, 'i')), pi.identifier.match(new RegExp(namePart, 'i'))));
                            });
                            predicates.push(lf.op.and.apply(null, nameSearchCondition));
                        }
                    }

                    if (!_.isEmpty(params.customAttribute)) {
                        params.customAttribute = params.customAttribute.replace('%', '.');
                        predicates.push(pa.attributeTypeId.in(_.map(attributeTypeIds, function (attributeTypeId) {
                            return attributeTypeId.attributeTypeId;
                        })));

                        predicates.push(pa.attributeValue.match(new RegExp(params.customAttribute, 'i')));
                    }

                    predicates.push(p.voided.eq(false));
                    var whereCondition = lf.op.and.apply(null, predicates);

                    if (!_.isEmpty(predicates)) {
                        query = query.where(whereCondition);
                    }

                    query.limit(50).skip(params.startIndex).orderBy(p.dateCreated, lf.Order.DESC).groupBy(p.uuid).exec()
                        .then(function (tempResults) {
                            var query = db.select(pi.primaryIdentifier.as('identifier'), pi.extraIdentifiers.as('extraIdentifiers'), p.givenName.as('givenName'), p.middleName.as('middleName'), p.familyName.as('familyName'),
                                p.dateCreated.as('dateCreated'), p.birthdate.as('birthdate'), p.gender.as('gender'), p.uuid.as('uuid'), padd[addressFieldName],
                                pat.attributeName.as('attributeName'), pa.attributeValue.as('attributeValue'), pat.format.as('attributeFormat'))
                                .from(p)
                                .innerJoin(padd, p.uuid.eq(padd.patientUuid))
                                .leftOuterJoin(pi, p.uuid.eq(pi.patientUuid))
                                .leftOuterJoin(pa, p.uuid.eq(pa.patientUuid))
                                .leftOuterJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId))
                                .where(p.uuid.in(_.map(tempResults, function (tempResult) {
                                    return tempResult.uuid;
                                }))).orderBy(p.dateCreated, lf.Order.DESC);

                            return query.exec()
                                .then(function (results) {
                                    var groupedResults = _.groupBy(results, function (res) {
                                        return res.uuid;
                                    });
                                    var patient;

                                    angular.forEach(groupedResults, function (groupedResult) {
                                        var customAttributes = {};
                                        patient = groupedResult[0];
                                        // ToDo:: Dependency of age factory in Admin page
                                        patient.age = age.fromBirthDate(patient.birthdate).years;
                                        patient.image = "../images/blank-user.png";

                                        angular.forEach(groupedResult, function (result) {
                                            if (result.attributeName) {
                                                customAttributes[result.attributeName] = result.attributeValue;
                                            }
                                        });
                                        patient.customAttribute = JSON.stringify(customAttributes);
                                        patient.extraIdentifiers = JSON.stringify(patient.extraIdentifiers);
                                        patient.addressFieldValue[camelCaseToSnakeCase(addressFieldName)] = patient.addressFieldValue[addressFieldName];
                                        response.data.pageOfResults.push(patient);
                                    });
                                    $rootScope.searching = false;

                                    defer.resolve(response);
                                });
                        }, function (e) {
                            console.log(e);
                            defer.reject(e);
                        });
                });
            return defer.promise;
        };

        var init = function (_db) {
            db = _db;
        };

        return {
            search: search,
            init: init
        };
    }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('offlineDbService', ['offlineService', '$http', '$q', 'patientDbService', 'patientAddressDbService', 'patientAttributeDbService', 'patientIdentifierDbService', 'offlineMarkerDbService', 'offlineAddressHierarchyDbService', 'labOrderResultsDbService',
        'offlineConfigDbService', 'initializeOfflineSchema', 'referenceDataDbService', 'locationDbService', 'offlineSearchDbService', 'encounterDbService', 'visitDbService', 'observationDbService', 'conceptDbService', 'errorLogDbService', 'eventLogService',
        function (offlineService, $http, $q, patientDbService, patientAddressDbService, patientAttributeDbService, patientIdentifierDbService, offlineMarkerDbService, offlineAddressHierarchyDbService, labOrderResultsDbService,
                  offlineConfigDbService, initializeOfflineSchema, referenceDataDbService, locationDbService, offlineSearchDbService, encounterDbService, visitDbService, observationDbService, conceptDbService, errorLogDbService, eventLogService) {
            var db, metaDataDb;

            var createPatient = function (postRequest) {
                var deferred = $q.defer();
                var uuid = postRequest.patient.uuid;
                insertPatientData(postRequest)
                    .then(function () {
                        getPatientByUuid(uuid).then(function (result) {
                            deferred.resolve({data: result});
                        });
                    }, function (response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getPatientByUuid = function (uuid, preferredDb) {
                preferredDb = preferredDb ? preferredDb : db;
                return patientDbService.getPatientByUuid(preferredDb, uuid);
            };

            var deletePatientData = function (uuid) {
                var deferred = $q.defer();
                var queries = [];

                var patientTable = db.getSchema().table('patient');
                var patientAddress = db.getSchema().table('patient_address');
                var patientAttributes = db.getSchema().table('patient_attribute');
                var patientIdentifier = db.getSchema().table('patient_identifier');

                queries.push(db.delete().from(patientAttributes).where(patientAttributes.patientUuid.eq(uuid)));
                queries.push(db.delete().from(patientAddress).where(patientAddress.patientUuid.eq(uuid)));
                queries.push(db.delete().from(patientTable).where(patientTable.uuid.eq(uuid)));
                queries.push(db.delete().from(patientIdentifier).where(patientIdentifier.patientUuid.eq(uuid)));

                var tx = db.createTransaction();
                tx.exec(queries);
                deferred.resolve({});
                return deferred.promise;
            };

            var insertPatientData = function (patientData) {
                var patient = patientData.patient;
                var person = patient.person;
                if (!patient.voided) {
                    return patientIdentifierDbService.insertPatientIdentifiers(db, person.uuid, patient.identifiers).then(function () {
                        return patientDbService.insertPatientData(db, patientData).then(function (patientUuid) {
                            patientAttributeDbService.insertAttributes(db, patientUuid, person.attributes);
                            patientAddressDbService.insertAddress(db, patientUuid, getAddress(person));
                            return patientData;
                        });
                    }, function (response) {
                        if (response && response.code == 201) {
                            response.message = "Patient failed to validate with reason: Identifier " + patient.identifiers[0].primaryIdentifier + " is already in use by another patient";
                            response.isIdentifierDuplicate = true;
                        }
                        return $q.reject(response);
                    });
                }
                return $q.when(patientData);
            };

            var getAddress = function (person) {
                return person.addresses[0] || person.preferredAddress || {};
            };

            var insertLabOrderResults = function (patientUuid, labOrderResults) {
                return labOrderResultsDbService.insertLabOrderResults(db, patientUuid, labOrderResults);
            };

            var getLabOrderResultsForPatient = function (params) {
                return labOrderResultsDbService.getLabOrderResultsForPatient(db, params);
            };

            var createEncounter = function (encounterData, preferredDb) {
                var deferred = $q.defer();
                insertEncounterData(encounterData, preferredDb).then(function () {
                    if (encounterData.visitUuid) {
                        eventLogService.getDataForUrl(Bahmni.Common.Constants.visitUrl + "/" + encounterData.visitUuid).then(function (response) {
                            insertVisitData(response.data, preferredDb).then(function () {
                                deferred.resolve({data: encounterData});
                            });
                        }, function () {
                            deferred.resolve({data: encounterData});
                        });
                    } else {
                        deferred.resolve({data: encounterData});
                    }
                });
                return deferred.promise;
            };

            var insertEncounterData = function (encounterData, preferredDb) {
                preferredDb = preferredDb ? preferredDb : db;
                return encounterDbService.insertEncounterData(preferredDb, encounterData).then(function () {
                    if (encounterData && encounterData.observations && encounterData.observations.length > 0) {
                        return observationDbService.insertObservationsData(preferredDb, encounterData.patientUuid, encounterData.visitUuid, encounterData.observations).then(function () {
                            return encounterData;
                        });
                    }
                    return encounterData;
                });
            };

            var getEncountersByPatientUuid = function (patientUuid) {
                return encounterDbService.getEncountersByPatientUuid(db, patientUuid);
            };

            var getActiveEncounter = function (params) {
                var deferred = $q.defer();
                getReferenceData("encounterSessionDuration").then(function (encounterSessionDurationData) {
                    var encounterSessionDuration = encounterSessionDurationData.data;
                    getReferenceData("DefaultEncounterType").then(function (defaultEncounterType) {
                        var encounterType = defaultEncounterType ? defaultEncounterType.data : null;
                        encounterDbService.findActiveEncounter(db, {
                            patientUuid: params.patientUuid,
                            providerUuid: params.providerUuids[0],
                            encounterType: encounterType
                        }, encounterSessionDuration).then(function (encounter) {
                            deferred.resolve(encounter);
                        });
                    });
                });
                return deferred.promise;
            };

            var init = function (offlineDb) {
                if (offlineDb.getSchema().name() == Bahmni.Common.Constants.bahmniConnectMetaDataDb) {
                    metaDataDb = offlineDb;
                    offlineConfigDbService.init(metaDataDb);
                    conceptDbService.init(metaDataDb);
                    referenceDataDbService.init(metaDataDb);
                } else {
                    db = offlineDb;
                    offlineAddressHierarchyDbService.init(offlineDb);
                    offlineSearchDbService.init(offlineDb);
                }
                if (metaDataDb && db) {
                    referenceDataDbService.init(metaDataDb, db);
                }
            };

            var initSchema = function (dbName) {
                return initializeOfflineSchema.initSchema(dbName);
            };

            var reinitSchema = function (dbName) {
                return initializeOfflineSchema.reinitSchema(dbName);
            };

            var getMarker = function (markerName) {
                var database = markerName == "offline-concepts" ? metaDataDb : db;
                return offlineMarkerDbService.getMarker(database, markerName);
            };

            var insertMarker = function (markerName, eventUuid, filters) {
                var database = markerName == "offline-concepts" ? metaDataDb : db;
                return offlineMarkerDbService.insertMarker(database, markerName, eventUuid, filters);
            };

            var insertAddressHierarchy = function (data) {
                return offlineAddressHierarchyDbService.insertAddressHierarchy(data);
            };

            var searchAddress = function (params) {
                return offlineAddressHierarchyDbService.search(params);
            };

            var getConfig = function (module) {
                return offlineConfigDbService.getConfig(module);
            };

            var insertConfig = function (module, data, eTag) {
                return offlineConfigDbService.insertConfig(module, data, eTag);
            };

            var getReferenceData = function (referenceDataKey) {
                return referenceDataDbService.getReferenceData(referenceDataKey);
            };

            var insertReferenceData = function (key, data, eTag) {
                return referenceDataDbService.insertReferenceData(key, data, eTag);
            };

            var getLocationByUuid = function (uuid) {
                return locationDbService.getLocationByUuid(metaDataDb, uuid);
            };

            var getAttributeTypes = function () {
                return patientAttributeDbService.getAttributeTypes(db);
            };

            var getConcept = function (conceptUuid) {
                return conceptDbService.getReferenceData(conceptUuid);
            };

            var getConceptByName = function (conceptName) {
                return conceptDbService.getConceptByName(conceptName);
            };

            var insertConceptAndUpdateHierarchy = function (data, parent) {
                return conceptDbService.insertConceptAndUpdateHierarchy(data, parent);
            };

            var updateChildren = function (concept) {
                return conceptDbService.updateChildren(concept);
            };

            var updateParentJson = function (child) {
                return conceptDbService.updateParentJson(child);
            };

            var insertVisitData = function (visitData, preferredDb) {
                preferredDb = preferredDb ? preferredDb : db;
                return visitDbService.insertVisitData(preferredDb, visitData);
            };

            var getVisitByUuid = function (visitUuid) {
                return visitDbService.getVisitByUuid(db, visitUuid);
            };

            var getEncounterByEncounterUuid = function (encounterUuid, preferredDb) {
                preferredDb = preferredDb ? preferredDb : db;
                return encounterDbService.getEncounterByEncounterUuid(preferredDb, encounterUuid);
            };

            var getObservationsFor = function (params) {
                return observationDbService.getObservationsFor(db, params);
            };

            var getObservationsForVisit = function (visitUuid) {
                return observationDbService.getObservationsForVisit(db, visitUuid);
            };

            var getVisitsByPatientUuid = function (patientUuid, numberOfVisits) {
                return visitDbService.getVisitsByPatientUuid(db, patientUuid, numberOfVisits);
            };

            var getVisitDetailsByPatientUuid = function (patientUuid) {
                return visitDbService.getVisitDetailsByPatientUuid(db, patientUuid);
            };

            var insertLog = function (errorUuid, failedRequest, responseStatus, stackTrace, requestPayload) {
                var provider = _.has(requestPayload, 'providers') ? requestPayload.providers[0] :
                (_.has(requestPayload, 'auditInfo.creator') ? requestPayload.auditInfo.creator : "");
                requestPayload = requestPayload ? requestPayload : "";
                return errorLogDbService.insertLog(db, errorUuid, failedRequest, responseStatus, stackTrace, requestPayload, provider);
            };

            var getErrorLogByUuid = function (uuid, preferredDb) {
                preferredDb = preferredDb ? preferredDb : db;
                return errorLogDbService.getErrorLogByUuid(preferredDb, uuid);
            };

            var deleteErrorFromErrorLog = function (uuid) {
                return errorLogDbService.deleteByUuid(db, uuid);
            };

            var getAllLogs = function () {
                var deferred = $q.defer();
                errorLogDbService.getLog(db).then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            };

            var getAllParentsInHierarchy = function (conceptName) {
                var conceptNamesInHierarchy = [];
                return conceptDbService.getAllParentsInHierarchy(conceptName, conceptNamesInHierarchy);
            };

            var getPrescribedAndActiveDrugOrders = function (params) {
                return encounterDbService.getEncountersByVisits(db, params);
            };

            var getPatientByUuidForPost = function (uuid, preferredDb) {
                var deferred = $q.defer();
                getPatientByUuid(uuid, preferredDb).then(function (patientData) {
                    var patient = patientData.patient;
                    patient.identifiers = _.map(patient.identifiers, function (identifier) {
                        return {
                            identifier: identifier.identifier,
                            identifierPrefix: identifier.identifierPrefix || identifier.selectedIdentifierSource && identifier.selectedIdentifierSource.prefix,
                            identifierSourceUuid: identifier.identifierSourceUuid || identifier.selectedIdentifierSource && identifier.selectedIdentifierSource.uuid,
                            identifierType: identifier.identifierType && identifier.identifierType.uuid || identifier.identifierType,
                            uuid: identifier.uuid,
                            preferred: identifier.preferred,
                            voided: identifier.voided
                        };
                    });
                    deferred.resolve(patientData);
                });
                return deferred.promise;
            };
            var getDbNames = function () {
                return offlineService.getItem("dbNames");
            };
            var getCurrentDbName = function () {
                return offlineService.getItem("currentDbName");
            };

            return {
                init: init,
                initSchema: initSchema,
                reinitSchema: reinitSchema,
                getPatientByUuid: getPatientByUuid,
                createPatient: createPatient,
                deletePatientData: deletePatientData,
                getMarker: getMarker,
                insertMarker: insertMarker,
                insertAddressHierarchy: insertAddressHierarchy,
                insertLabOrderResults: insertLabOrderResults,
                searchAddress: searchAddress,
                getConfig: getConfig,
                insertConfig: insertConfig,
                getReferenceData: getReferenceData,
                insertReferenceData: insertReferenceData,
                getLocationByUuid: getLocationByUuid,
                getAttributeTypes: getAttributeTypes,
                insertEncounterData: insertEncounterData,
                getEncountersByPatientUuid: getEncountersByPatientUuid,
                createEncounter: createEncounter,
                insertVisitData: insertVisitData,
                getVisitByUuid: getVisitByUuid,
                getActiveEncounter: getActiveEncounter,
                getEncounterByEncounterUuid: getEncounterByEncounterUuid,
                getObservationsFor: getObservationsFor,
                getVisitsByPatientUuid: getVisitsByPatientUuid,
                insertConceptAndUpdateHierarchy: insertConceptAndUpdateHierarchy,
                getConcept: getConcept,
                getConceptByName: getConceptByName,
                updateChildren: updateChildren,
                updateParentJson: updateParentJson,
                getAllParentsInHierarchy: getAllParentsInHierarchy,
                insertLog: insertLog,
                getAllLogs: getAllLogs,
                getErrorLogByUuid: getErrorLogByUuid,
                getPrescribedAndActiveDrugOrders: getPrescribedAndActiveDrugOrders,
                deleteErrorFromErrorLog: deleteErrorFromErrorLog,
                getPatientByUuidForPost: getPatientByUuidForPost,
                getVisitDetailsByPatientUuid: getVisitDetailsByPatientUuid,
                getObservationsForVisit: getObservationsForVisit,
                getLabOrderResultsForPatient: getLabOrderResultsForPatient,
                getDbNames: getDbNames,
                getCurrentDbName: getCurrentDbName
            };
        }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('patientAddressDbService', [function () {
        var insertAddress = function (db, patientUuid, address) {
            var patientAddressTable = db.getSchema().table('patient_address');
            var row = patientAddressTable.createRow({
                address1: address['address1'],
                address2: address['address2'],
                address3: address['address3'],
                address4: address['address4'],
                address5: address['address5'],
                address6: address['address6'],
                cityVillage: address['cityVillage'],
                stateProvince: address['stateProvince'],
                postalCode: address['postalCode'],
                country: address['country'],
                countyDistrict: address['countyDistrict'],
                patientUuid: patientUuid
            });

            return db.insertOrReplace().into(patientAddressTable).values([row]).exec();
        };

        return {
            insertAddress: insertAddress
        };
    }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('patientAttributeDbService', [ function () {
        var insertAttributeTypes = function (db, personAttributeTypeList) {
            var table, queries = [];
            table = db.getSchema().table('patient_attribute_type');
            db.delete().from(table).exec();
            for (var i = 0; i < personAttributeTypeList.length; i++) {
                var row = table.createRow({
                    'attributeTypeId': i,
                    'uuid': personAttributeTypeList[i].uuid,
                    'attributeName': personAttributeTypeList[i].name,
                    'format': personAttributeTypeList[i].format
                });
                queries.push(db.insertOrReplace().into(table).values([row]));
            }
            var tx = db.createTransaction();
            return tx.exec(queries);
        };

        var insertAttributes = function (db, patientUuid, attributes) {
            var attributeTable, value;
            attributeTable = db.getSchema().table('patient_attribute');
            var queries = [];
            return getAttributeTypes(db).then(function (attributeTypes) {
                if (attributes != null && attributes.length > 0) {
                    for (var j = 0; j < attributes.length; j++) {
                        if (!attributes[j].voided) {
                            var personAttribute = attributes[j];
                            var attributeValue = personAttribute.value;
                            if (typeof (attributeValue) == "object") {
                                value = attributeValue.display;
                            } else {
                                value = attributeValue;
                            }
                            var foundAttribute = _.find(attributeTypes, function (attributeType) {
                                return attributeType.uuid === personAttribute.attributeType.uuid;
                            });
                            if (foundAttribute != undefined) {
                                var row = attributeTable.createRow({
                                    'attributeTypeId': foundAttribute.attributeTypeId,
                                    'attributeValue': value,
                                    'patientUuid': patientUuid,
                                    'uuid': personAttribute.uuid ? personAttribute.uuid : Bahmni.Common.Offline.UUID.generateUuid()
                                });
                                queries.push(db.insertOrReplace().into(attributeTable).values([row]));
                            }
                        }
                    }
                    if (queries.length) {
                        var tx = db.createTransaction();
                        return tx.exec(queries);
                    }
                }
            });
        };

        var getAttributeTypes = function (db) {
            var attributeTypeTable = db.getSchema().table('patient_attribute_type');

            return db.select(attributeTypeTable.attributeTypeId, attributeTypeTable.uuid, attributeTypeTable.attributeName, attributeTypeTable.format).from(attributeTypeTable).exec()
                .then(function (attributeTypeMap) {
                    return attributeTypeMap;
                });
        };

        return {
            insertAttributeTypes: insertAttributeTypes,
            insertAttributes: insertAttributes,
            getAttributeTypes: getAttributeTypes
        };
    }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('patientDbService', function () {
        var getPatientByUuid = function (db, uuid) {
            var p = db.getSchema().table('patient');
            return db.select(p.patientJson.as('patient'))
                .from(p)
                .where(lf.op.and(p.uuid.eq(uuid), p.voided.eq(false))).exec()
                .then(function (result) {
                    return result[0];
                });
        };

        var insertPatientData = function (db, patientData) {
            var patient = patientData.patient;
            var patientTable, person;
            patientTable = db.getSchema().table('patient');
            person = patient.person;
            var personName = person.names[0] || person.preferredName;
            var row = patientTable.createRow({
                'uuid': patient.uuid,
                'givenName': personName.givenName,
                'middleName': personName.middleName,
                'familyName': personName.familyName,
                'gender': person.gender,
                'voided': patient.voided || false,
                'birthdate': new Date(person.birthdate),
                'dateCreated': new Date(patient.person.auditInfo.dateCreated),
                'patientJson': patient
            });
            return db.insertOrReplace().into(patientTable).values([row]).exec().then(function () {
                return patient.uuid;
            });
        };

        return {
            getPatientByUuid: getPatientByUuid,
            insertPatientData: insertPatientData
        };
    });

'use strict';

angular.module('bahmni.common.offline')
    .service('patientIdentifierDbService', ['$q', function ($q) {
        var getPatientIdentifiersByPatientUuid = function (db, patientUuid) {
            var pi = db.getSchema().table('patient_identifier');
            return db.select(pi.identifierJson)
                .from(pi)
                .where(pi.patientUuid.eq(patientUuid)).exec()
                .then(function (result) {
                    return result;
                });
        };

        var insertQueries = function (identifier, patientIdentifierTable, patientUuid, queries, db) {
            var identifierTypeUuid = identifier.identifierType && identifier.identifierType.uuid || identifier.identifierType;
            var isPrimaryIdentifier = identifier.identifierType && identifier.identifierType.primary;
            var row = patientIdentifierTable.createRow({
                'typeUuid': identifierTypeUuid,
                'identifier': identifier.identifier || null,
                'primaryIdentifier': identifier.primaryIdentifier,
                'extraIdentifiers': identifier.extraIdentifiers,
                'primary': isPrimaryIdentifier,
                'patientUuid': patientUuid,
                'identifierJson': identifier
            });
            queries.push(db.insertOrReplace().into(patientIdentifierTable).values([row]));
            return queries;
        };

        var insertPatientIdentifiers = function (db, patientUuid, identifiers) {
            var patientIdentifierTable = db.getSchema().table('patient_identifier');
            var defer = $q.defer();
            var promises = [], queries = [];
            _.each(identifiers, function (identifier) {
                if (!identifier.primaryIdentifier) {
                    queries = insertQueries(identifier, patientIdentifierTable, patientUuid, queries, db);
                }
                else {
                    var promise = db.select(patientIdentifierTable.primaryIdentifier)
                        .from(patientIdentifierTable)
                        .where(lf.op.and(patientIdentifierTable.primaryIdentifier.eq(identifier.primaryIdentifier), patientIdentifierTable.patientUuid.neq(patientUuid))).exec()
                        .then(function (results) {
                            if (results.length > 0) {
                                return defer.reject({code: 201});
                            } else {
                                queries = insertQueries(identifier, patientIdentifierTable, patientUuid, queries, db);
                            }
                        });
                    promises.push(promise);
                }
            });
            $q.all(promises).then(function () {
                var tx = db.createTransaction();
                return tx.exec(queries).then(function () {
                    return defer.resolve();
                });
            });
            return defer.promise;
        };

        return {
            insertPatientIdentifiers: insertPatientIdentifiers,
            getPatientIdentifiersByPatientUuid: getPatientIdentifiersByPatientUuid
        };
    }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('encounterDbService', function () {
        var insertEncounterData = function (db, encounterData) {
            encounterData = JSON.parse(JSON.stringify(encounterData));
            var patientUuid = encounterData.patientUuid;
            var uuid = encounterData.encounterUuid;
            var encounterDateTime = encounterData.encounterDateTime;
            var encounterType = encounterData.encounterType ? encounterData.encounterType.toUpperCase() : null;
            var providerUuid = encounterData.providers[0].uuid;
            var visitUuid = encounterData.visitUuid;
            var encounterTable = db.getSchema().table('encounter');

            var row = encounterTable.createRow({
                uuid: uuid,
                patientUuid: patientUuid,
                encounterDateTime: new Date(encounterDateTime),
                encounterType: encounterType,
                providerUuid: providerUuid,
                visitUuid: visitUuid,
                encounterJson: encounterData
            });
            return db.insertOrReplace().into(encounterTable).values([row]).exec().then(function () {
                return patientUuid;
            });
        };

        var getEncountersByPatientUuid = function (db, patientUuid) {
            var p = db.getSchema().table('encounter');
            return db.select(p.encounterJson.as('encounter'))
                .from(p)
                .where(p.patientUuid.eq(patientUuid)).exec()
                .then(function (results) {
                    return results;
                });
        };

        var findActiveEncounter = function (db, params, encounterSessionDurationInMinutes) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var encounterType = params.encounterType ? params.encounterType.toUpperCase() : null;
            var p = db.getSchema().table('encounter');
            return db.select(p.encounterJson.as('encounter'))
                .from(p)
                .where(lf.op.and(
                    p.patientUuid.eq(params.patientUuid), p.providerUuid.eq(params.providerUuid), p.encounterType.match(encounterType), p.encounterDateTime.gte(DateUtil.addMinutes(new Date(), -1 * encounterSessionDurationInMinutes))))
                .exec()
                .then(function (result) {
                    return angular.copy(result[0]);
                });
        };

        var getEncounterByEncounterUuid = function (db, encounterUuid) {
            var en = db.getSchema().table('encounter');
            return db.select(en.encounterJson.as('encounter'))
                .from(en)
                .where(en.uuid.eq(encounterUuid)).exec()
                .then(function (result) {
                    return angular.copy(result[0]);
                });
        };

        var getEncountersByVisits = function (db, params) {
            var encounter = db.getSchema().table('encounter');
            return db.select(encounter.encounterJson.as('encounter'))
                .from(encounter)
                .where(
                    lf.op.and(encounter.patientUuid.eq(params.patientUuid), encounter.visitUuid.in(params.visitUuids)))
                .orderBy(encounter.encounterDateTime, lf.Order.DESC)
                .exec()
                .then(function (results) {
                    return results;
                });
        };

        return {
            insertEncounterData: insertEncounterData,
            getEncountersByPatientUuid: getEncountersByPatientUuid,
            findActiveEncounter: findActiveEncounter,
            getEncounterByEncounterUuid: getEncounterByEncounterUuid,
            getEncountersByVisits: getEncountersByVisits
        };
    });

'use strict';

angular.module('bahmni.common.logging')
    .service('loggingService', ['$http', 'offlineLoggingService', 'eventQueue', 'offlineDbService', 'offlineService', 'androidDbService', function ($http, offlineLoggingService, eventQueue, offlineDbService, offlineService, androidDbService) {
        var log = function (errorDetails) {
            offlineDbService = offlineService.isAndroidApp() ? androidDbService : offlineDbService;
            var errorLogUuid = Bahmni.Common.Offline.UUID.generateUuid();
            return offlineLoggingService.log(errorLogUuid, errorDetails.errorUrl, null, angular.toJson(errorDetails)).then(function () {
                var event = { type: "Error", uuid: errorLogUuid, dbName: offlineDbService.getCurrentDbName() };
                eventQueue.addToEventQueue(event);
            }).catch(function (error) {
                console.log(error);
            });
        };

        var logSyncError = function (errorUrl, status, stackTrace, payload) {
            offlineDbService = offlineService.isAndroidApp() ? androidDbService : offlineDbService;
            var errorLogUuid = Bahmni.Common.Offline.UUID.generateUuid();
            return offlineLoggingService.log(errorLogUuid, errorUrl, status, stackTrace, payload).then(function () {
                var event = { type: "Error", uuid: errorLogUuid, dbName: offlineDbService.getCurrentDbName() };
                eventQueue.addToEventQueue(event);
            }).catch(function (error) {
                console.log(error);
            });
        };

        return {
            log: log,
            logSyncError: logSyncError
        };
    }]);

'use strict';

angular.module('bahmni.common.logging')
    .service('offlineLoggingService', ['$http', 'offlineDbService', function ($http, offlineDbService) {
        var log = function (errorUuid, failedRequest, responseStatus, stackTrace, requestPayload) {
            return offlineDbService.insertLog(errorUuid, failedRequest, responseStatus, stackTrace, requestPayload);
        };

        return {
            log: log
        };
    }]);

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

angular.module('bahmni.common.offline')
    .service('errorLogDbService', function () {
        var insertLog = function (db, uuid, failedRequest, responseStatus, stacktrace, requestPayload, provider) {
            var errorLogTable = db.getSchema().table('error_log');
            var row = errorLogTable.createRow({
                uuid: uuid,
                failedRequestUrl: failedRequest,
                logDateTime: new Date(),
                responseStatus: responseStatus,
                stackTrace: stacktrace,
                requestPayload: requestPayload,
                provider: provider
            });
            return db.insertOrReplace().into(errorLogTable).values([row]).exec();
        };

        var getLog = function (db) {
            var p = db.getSchema().table('error_log');

            return db.select()
                .from(p).exec()
                .then(function (results) {
                    return results;
                });
        };

        var getErrorLogByUuid = function (db, errorUuid) {
            var error = db.getSchema().table('error_log');
            return db.select()
                .from(error)
                .where(error.uuid.eq(errorUuid)).exec()
                .then(function (result) {
                    return result[0] || {};
                });
        };

        var deleteByUuid = function (db, uuid) {
            var error = db.getSchema().table('error_log');
            return db.delete()
                .from(error)
                .where(error.uuid.eq(uuid)).exec();
        };

        return {
            insertLog: insertLog,
            getLog: getLog,
            getErrorLogByUuid: getErrorLogByUuid,
            deleteByUuid: deleteByUuid
        };
    });

'use strict';

angular.module('bahmni.common.offline')
    .service('offlineMarkerDbService', [function () {
        var getMarkers = function (db, markerTable, markerName) {
            return db.select()
                .from(markerTable)
                .where(markerTable.markerName.eq(markerName)).exec();
        };

        var insertOrUpdateMarker = function (db, markerTable, row) {
            return db.insertOrReplace().into(markerTable).values([row]).exec();
        };

        var insertMarker = function (db, markerName, eventUuid, filters) {
            var markerTable = db.getSchema().table('event_log_marker');

            var marker = {
                markerName: markerName,
                lastReadEventUuid: eventUuid,
                filters: filters,
                lastReadTime: new Date()
            };
            var row = markerTable.createRow(marker);

            return insertOrUpdateMarker(db, markerTable, row).then(function () {
                return marker;
            });
        };

        var getMarker = function (db, markerName) {
            var markerTable = db.getSchema().table('event_log_marker');
            return getMarkers(db, markerTable, markerName).then(function (markers) {
                return markers[0];
            });
        };

        return {
            insertMarker: insertMarker,
            getMarker: getMarker
        };
    }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('offlineAddressHierarchyDbService', ['$q', function ($q) {
        var db;
        var addressFields;

        var init = function (_db) {
            db = _db;
        };

        var insertAddressHierarchy = function (addressHierarchy) {
            return insertAddressHierarchyLevel(addressHierarchy.addressHierarchyLevel).then(function () {
                return insertAddressHierarchyEntry(addressHierarchy);
            });
        };

        var insertAddressHierarchyEntry = function (entry) {
            var addressHierarchyEntryTable = db.getSchema().table('address_hierarchy_entry');

            var row = addressHierarchyEntryTable.createRow({
                id: entry.addressHierarchyEntryId,
                name: entry.name,
                levelId: entry.addressHierarchyLevel.levelId,
                parentId: entry.parentId,
                userGeneratedId: entry.userGeneratedId,
                uuid: entry.uuid
            });

            return db.insertOrReplace().into(addressHierarchyEntryTable).values([row]).exec().then(function () {
                return entry;
            });
        };

        var insertAddressHierarchyLevel = function (level) {
            var addressHierarchyLevelTable = db.getSchema().table('address_hierarchy_level');

            var row = addressHierarchyLevelTable.createRow({
                addressHierarchyLevelId: level.levelId,
                name: level.name,
                parentLevelId: level.parentLevelId,
                addressField: level.addressField,
                uuid: level.uuid,
                required: level.required
            });

            return db.insertOrReplace().into(addressHierarchyLevelTable).values([row]).exec().then(function () {
                return level;
            });
        };

        var search = function (params) {
            var addressHierarchyLevelTable = db.getSchema().table('address_hierarchy_level');
            var addressHierarchyEntryTable = db.getSchema().table('address_hierarchy_entry');
            addressFields = Bahmni.Common.Offline.AddressFields;
            var addressHierarchyField;
            var level;

            for (var i in addressFields) {
                if (addressFields[i] === params.addressField) {
                    addressHierarchyField = i;
                }
            }
            return db.select()
                .from(addressHierarchyLevelTable)
                .where(addressHierarchyLevelTable.addressField.eq(addressHierarchyField)).exec()
                .then(function (result) {
                    level = result[0];
                    if (level != null) {
                        if (params.parentUuid != null) {
                            return db.select()
                                .from(addressHierarchyEntryTable)
                                .where(addressHierarchyEntryTable.uuid.eq(params.parentUuid))
                                .exec()
                                .then(function (result) {
                                    var parent = result[0] != null ? result[0] : null;
                                    if (parent != null) {
                                        return db.select()
                                            .from(addressHierarchyEntryTable)
                                            .where(lf.op.and(
                                                addressHierarchyEntryTable.levelId.eq(level.addressHierarchyLevelId),
                                                addressHierarchyEntryTable.parentId.eq(parent.id),
                                                addressHierarchyEntryTable.name.match(new RegExp(params.searchString, 'i')
                                                )))
                                            .limit(params.limit).exec()
                                            .then(
                                                function (result) {
                                                    return getAddresses(result).then(function (response) {
                                                        return {data: response};
                                                    });
                                                });
                                    }
                                });
                        }
                        return db.select()
                            .from(addressHierarchyEntryTable)
                            .where(lf.op.and(
                                addressHierarchyEntryTable.levelId.eq(level.addressHierarchyLevelId),
                                addressHierarchyEntryTable.name.match(new RegExp(params.searchString, 'i')
                                )))
                            .limit(params.limit).exec()
                            .then(
                                function (result) {
                                    return getAddresses(result).then(function (response) {
                                        return {data: response};
                                    });
                                });
                    }
                    return {data: []};
                });
        };

        var getAddresses = function (addressHierarchyEntries) {
            var addressHierarchyModelPromises = [];
            _.each(addressHierarchyEntries, function (entry) {
                addressHierarchyModelPromises.push(getAddressesAndParents(entry));
            });
            return $q.all(addressHierarchyModelPromises).then(function (results) {
                return results;
            });
        };

        var getAddressesAndParents = function (entry) {
            var modelMap = {};
            modelMap.name = entry.name;
            modelMap.uuid = entry.uuid;
            modelMap.userGeneratedId = entry.userGeneratedId;
            if (entry.parentId != null) {
                return getParentAddressById(entry.parentId).then(function (result) {
                    modelMap.parent = result;
                    return modelMap;
                });
            } else {
                var addressPromise = $q.defer();
                addressPromise.resolve(modelMap);
                return addressPromise.promise;
            }
        };

        var getParentAddressById = function (id) {
            var addressHierarchyEntryTable = db.getSchema().table('address_hierarchy_entry');
            return db.select()
                .from(addressHierarchyEntryTable)
                .where(addressHierarchyEntryTable.id.eq(id))
                .exec()
                .then(function (result) {
                    var parent = result[0] != null ? result[0] : null;
                    if (parent != null) {
                        return getAddressesAndParents(parent);
                    }
                });
        };

        return {
            init: init,
            insertAddressHierarchy: insertAddressHierarchy,
            search: search,
            getParentAddressById: getParentAddressById
        };
    }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('labOrderResultsDbService', function () {
        var insertLabOrderResults = function (db, patientUuid, labOrderResults) {
            var labOrderResultsJson = JSON.parse(JSON.stringify(labOrderResults));
            var labOrderResultTable = db.getSchema().table('lab_order_result');
            var row = labOrderResultTable.createRow({
                patientUuid: patientUuid,
                labOrderResultsJson: labOrderResultsJson
            });

            return db.insertOrReplace().into(labOrderResultTable).values([row]).exec().then(function () {
                return {
                    patientUuid: patientUuid,
                    labOrderResults: labOrderResultsJson
                };
            });
        };

        var getLabOrderResultsForPatient = function (db, params) {
            var labOrderResultTable = db.getSchema().table('lab_order_result');
            return db.select(labOrderResultTable.labOrderResultsJson.as('results'))
                .from(labOrderResultTable)
                .where(labOrderResultTable.patientUuid.eq(params.patientUuid))
                .exec()
                .then(function (results) {
                    return results[0] ? results[0] : { results: {"results": [], "tabularResult": {"dates": [], "orders": [], "values": []}}};
                });
        };

        return {
            getLabOrderResultsForPatient: getLabOrderResultsForPatient,
            insertLabOrderResults: insertLabOrderResults
        };
    });

'use strict';

angular.module('bahmni.common.offline')
    .service('offlineConfigDbService', function () {
        var db;

        var getConfig = function (module) {
            var config = db.getSchema().table('configs');
            return db.select()
                .from(config)
                .where(config.key.eq(module)).exec()
                .then(function (result) {
                    return result[0];
                });
        };

        var insertConfig = function (module, data, eTag) {
            var config = db.getSchema().table('configs');

            var row = config.createRow({
                key: module,
                value: data,
                etag: eTag
            });

            return db.insertOrReplace().into(config).values([row]).exec().then(function (result) {
                return result[0];
            });
        };

        var init = function (_db) {
            db = _db;
        };

        return {
            init: init,
            getConfig: getConfig,
            insertConfig: insertConfig
        };
    });

'use strict';

angular.module('bahmni.common.offline')
    .service('referenceDataDbService', ['patientAttributeDbService', 'locationDbService',
        function (patientAttributeDbService, locationDbService) {
            var db, metaDataDb;

            var getReferenceData = function (referenceDataKey) {
                var referenceData = metaDataDb.getSchema().table('reference_data');
                return metaDataDb.select()
                .from(referenceData)
                .where(referenceData.key.eq(referenceDataKey)).exec()
                .then(function (result) {
                    return result[0];
                });
            };

            var insertReferenceData = function (referenceDataKey, data, eTag) {
                var referenceData = metaDataDb.getSchema().table('reference_data');

                var row = referenceData.createRow({
                    key: referenceDataKey,
                    data: data,
                    etag: eTag
                });

                return metaDataDb.insertOrReplace().into(referenceData).values([row]).exec().then(function () {
                    switch (referenceDataKey) {
                    case 'PersonAttributeType':
                        return patientAttributeDbService.insertAttributeTypes(db, data.results);
                    case 'LoginLocations':
                        return locationDbService.insertLocations(metaDataDb, data.results);
                    default :
                        return;
                    }
                });
            };

            var init = function (_metadatadb, _db) {
                metaDataDb = _metadatadb;
                db = _db;
            };

            return {
                init: init,
                getReferenceData: getReferenceData,
                insertReferenceData: insertReferenceData
            };
        }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('locationDbService', [ function () {
        var insertLocations = function (db, locations) {
            var table, queries = [];
            table = db.getSchema().table('login_locations');
            for (var i = 0; i < locations.length; i++) {
                var row = table.createRow({
                    'uuid': locations[i].uuid,
                    'value': locations[i]
                });
                queries.push(db.insertOrReplace().into(table).values([row]));
            }
            var tx = db.createTransaction();
            return tx.exec(queries);
        };

        var getLocationByUuid = function (db, uuid) {
            var loginLocationTable = db.getSchema().table('login_locations');

            return db.select(loginLocationTable.value)
                     .from(loginLocationTable)
                     .where(loginLocationTable.uuid.eq(uuid))
                     .exec()
                     .then(function (loginLocation) {
                         return loginLocation[0].value;
                     });
        };

        return {
            insertLocations: insertLocations,
            getLocationByUuid: getLocationByUuid
        };
    }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('visitDbService', [function () {
        var insertVisitData = function (db, visit) {
            var visitTable = db.getSchema().table('visit');
            var row = visitTable.createRow({
                'uuid': visit.uuid,
                'patientUuid': visit.patient.uuid,
                'startDatetime': new Date(visit.startDatetime),
                'visitJson': visit
            });
            return db.insertOrReplace().into(visitTable).values([row]).exec().then(function () {
                return visit;
            });
        };

        var getVisitByUuid = function (db, uuid) {
            var visitTable = db.getSchema().table('visit');

            return db.select(visitTable.value)
                .from(visitTable)
                .where(visitTable.uuid.eq(uuid))
                .exec()
                .then(function (visit) {
                    return visit[0];
                });
        };

        var getVisitsByPatientUuid = function (db, patientUuid, numberOfVisits) {
            var visitTable = db.getSchema().table('visit');

            return db.select(visitTable.uuid, visitTable.startDatetime)
                .from(visitTable)
                .where(visitTable.patientUuid.eq(patientUuid))
                .orderBy(visitTable.startDatetime, lf.Order.DESC)
                .limit(numberOfVisits)
                .exec()
                .then(function (visitUuids) {
                    return visitUuids;
                });
        };

        var getVisitDetailsByPatientUuid = function (db, patientUuid) {
            var visitTable = db.getSchema().table('visit');

            return db.select(visitTable.visitJson.as('visit'))
                .from(visitTable)
                .where(visitTable.patientUuid.eq(patientUuid))
                .orderBy(visitTable.startDatetime, lf.Order.DESC)
                .exec()
                .then(function (visits) {
                    return _.map(visits, function (visit) {
                        return visit.visit;
                    });
                });
        };

        return {
            insertVisitData: insertVisitData,
            getVisitByUuid: getVisitByUuid,
            getVisitsByPatientUuid: getVisitsByPatientUuid,
            getVisitDetailsByPatientUuid: getVisitDetailsByPatientUuid
        };
    }]);

'use strict';

angular.module('bahmni.common.offline')
    .service('observationDbService', function () {
        var insertObservationsData = function (db, patientUuid, visitUuid, observationsDataList) {
            observationsDataList = JSON.parse(JSON.stringify(observationsDataList));
            var observationTable = db.getSchema().table('observation');
            var queries = [];
            _.each(observationsDataList, function (observationData) {
                if (observationData.groupMembers.length) {
                    var row = observationTable.createRow({
                        uuid: observationData.uuid,
                        patientUuid: patientUuid,
                        encounterUuid: observationData.encounterUuid,
                        visitUuid: visitUuid,
                        conceptName: observationData.concept.name,
                        observationJson: observationData
                    });
                    queries.push(db.insertOrReplace().into(observationTable).values([row]));
                } else {
                    var obsToBeRemoved = removeObservationByObservationUuid(db, observationData.uuid);
                    queries.push(obsToBeRemoved);
                }
            });
            var tx = db.createTransaction();
            return tx.exec(queries);
        };

        var getObservationsFor = function (db, params) {
            var obs = db.getSchema().table('observation');
            return db.select(obs.observationJson.as('observation'))
                .from(obs)
                .where(
                    lf.op.and(obs.patientUuid.eq(params.patientUuid), obs.conceptName.in(params.conceptNames), lf.op.or(obs.visitUuid.in(params.visitUuids), obs.visitUuid.eq(null)))
                )
                .exec()
                .then(function (results) {
                    return results;
                });
        };

        var getObservationsForVisit = function (db, visitUuid) {
            var obs = db.getSchema().table('observation');
            return db.select(obs.observationJson.as('observation'))
                .from(obs)
                .where(obs.visitUuid.eq(visitUuid))
                .exec()
                .then(function (results) {
                    return results;
                });
        };

        var removeObservationByObservationUuid = function (db, observationUuid) {
            var obs = db.getSchema().table('observation');
            return db.delete()
                .from(obs)
                .where(obs.uuid.eq(observationUuid));
        };

        return {
            getObservationsFor: getObservationsFor,
            insertObservationsData: insertObservationsData,
            getObservationsForVisit: getObservationsForVisit
        };
    });

'use strict';

angular.module('bahmni.common.offline')
    .service('conceptDbService', ['$q',
        function ($q) {
            var db;

            var getConcept = function (conceptUuid) {
                var deferred = $q.defer();
                var concept = db.getSchema().table('concept');
                db.select()
                    .from(concept)
                    .where(concept.uuid.eq(conceptUuid)).exec()
                    .then(function (result) {
                        deferred.resolve(result[0]);
                    });
                return deferred.promise;
            };

            var getConceptByName = function (conceptName) {
                var deferred = $q.defer();
                var concept = db.getSchema().table('concept');
                db.select()
                    .from(concept)
                    .where(concept.name.eq(conceptName)).exec()
                    .then(function (result) {
                        deferred.resolve(result[0]);
                    });
                return deferred.promise;
            };

            var insertConceptAndUpdateHierarchy = function (data, parent) {
                return insertConcept(data, parent).then(function () {
                    return updateChildren(data.results[0]).then(function () {
                        return updateParentJson(data.results[0]);
                    });
                });
            };

            var insertConcept = function (data, parent) {
                var concept = db.getSchema().table('concept');
                var uuid = data.results && data.results[0] ? data.results[0].uuid : undefined;
                return getParents(uuid).then(function (response) {
                    var parents = {};
                    if (response.length == 0 || response[0].parents == undefined) {
                        parents.parentConcepts = [];
                    } else {
                        parents = response[0].parents;
                    }

                    if (parent && parent.length > 0) {
                        _.each(parent, function (member) {
                            if (!_.find(parents.parentConcepts, member)) {
                                parents.parentConcepts.push(member);
                            }
                        });
                    }

                    var row = concept.createRow({
                        data: data,
                        name: data.results[0].name.name,
                        uuid: uuid,
                        parents: parents
                    });

                    return db.insertOrReplace().into(concept).values([row]).exec();
                });
            };

            var getParents = function (childUuid) {
                var concept = db.getSchema().table('concept');
                return db.select(concept.parents)
                    .from(concept)
                    .where(concept.uuid.eq(childUuid)).exec();
            };

            var updateChildren = function (concept) {
                var deferred = $q.defer();
                var length = concept.setMembers.length;
                if (length == 0) {
                    deferred.resolve();
                }
                var count = 0;
                _.each(concept.setMembers, function (child) {
                    insertConcept({"results": [child]}, [{conceptName: concept.name.name, uuid: concept.uuid}]).then(function () {
                        count++;
                        if (count == length) {
                            deferred.resolve();
                        }
                    });
                });
                return deferred.promise;
            };

            var updateParentJson = function (child) {
                return getParents(child.uuid).then(function (response) {
                    if (response[0].parents == undefined) {
                        return;
                    }
                    _.each(response[0].parents.parentConcepts, function (eachParent) {
                        return getConcept(eachParent.uuid).then(function (parent) {
                            for (var i = 0; i < parent.data.results[0].setMembers.length; i++) {
                                if (parent.data.results[0].setMembers[i].uuid == child.uuid) {
                                    parent.data.results[0].setMembers[i] = child;
                                }
                            }
                            insertConcept(parent.data, parent.parents.parentConcepts);
                            updateParentJson(parent.data.results[0]);
                        });
                    });
                });
            };

            var init = function (_db) {
                db = _db;
            };

            var getAllParentsInHierarchy = function (conceptName, conceptNamesInHierarchy) {
                return getConceptByName(conceptName).then(function (result) {
                    if (!result) {
                        return [];
                    }
                    conceptNamesInHierarchy.push(conceptName);
                    var parentConcepts = result.parents.parentConcepts;
                    // TODO not considering all the parents
                    if (parentConcepts && parentConcepts.length > 0) {
                        return getAllParentsInHierarchy(parentConcepts[0].conceptName, conceptNamesInHierarchy);
                    }
                    return conceptNamesInHierarchy;
                });
            };

            return {
                init: init,
                getConcept: getConcept,
                getConceptByName: getConceptByName,
                insertConceptAndUpdateHierarchy: insertConceptAndUpdateHierarchy,
                updateChildren: updateChildren,
                updateParentJson: updateParentJson,
                getAllParentsInHierarchy: getAllParentsInHierarchy
            };
        }]);

'use strict';

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Offline = Bahmni.Common.Offline || {};

Bahmni.Common.Offline.UUID = {
    generateUuid: function () {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };

        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    }
};

'use strict';

angular.module("bahmni.common.offline")
    .service("scheduledJob", ['$q', '$interval', function ($q, $interval) {
        this.create = function (config) {
            return new Job(config.worker, config.interval, config.count);
        };

        var Job = function (worker, interval, repeat) {
            var jobPromise = null;

            this.start = function () {
                this.jobPromise = $interval(worker.execute, interval, repeat);
            };

            this.stop = function () {
                if (this.jobPromise != null) {
                    $interval.cancel(this.jobPromise);
                    this.jobPromise = null;
                }
            };

            this.pause = function () {
                worker.pause();
                this.stop();
            };
        };
    }]);

'use strict';

Bahmni.Common.Offline.MultiStageWorker = function ($q) {
    var self = this;
    this.stages = [];
    this.paused = false;
    this.currentlyExecutingStage = null;

    var checkForPause = function () {
        if (self.paused) {
            return $q.reject({});
        }
        return $q.when({});
    };

    var getStagesToBeExecuted = function () {
        var index = self.stages.indexOf(self.currentlyExecutingStage);
        index = index < 0 ? 0 : index;
        return self.stages.slice(index);
    };

    this.addStage = function (worker) {
        self.stages.push(worker);
    };

    this.execute = function () {
        self.paused = false;
        return getStagesToBeExecuted().reduce(function (promise, worker) {
            return promise.then(checkForPause).then(function () {
                self.currentlyExecutingStage = worker;
                return worker.execute();
            });
        }, checkForPause()).then(function () {
            self.currentlyExecutingStage = null;
        });
    };

    this.pause = function () {
        self.paused = true;
        if (this.currentlyExecutingStage !== null && this.currentlyExecutingStage.pause) {
            this.currentlyExecutingStage.pause();
        }
    };
};

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

angular.module("bahmni.common.offline")
    .service("scheduledSync", ['$q', '$rootScope', 'scheduledJob', 'offlineService', 'offlineDbService', 'androidDbService', 'offlinePush', 'offlinePull',
        'appUpdateService', 'ngDialog',
        function ($q, $rootScope, scheduledJob, offlineService, offlineDbService, androidDbService, offlinePush, offlinePull,
                  appUpdateService, ngDialog) {
            return function (syncButtonConfig) {
                var job;
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }

                if (syncButtonConfig === undefined) {
                    syncButtonConfig = {delay: offlineService.getItem('schedulerInterval'), repeat: 0};
                }
                var multiStageWorker = new Bahmni.Common.Offline.MultiStageWorker($q);
                var STAGES = {
                    STAGE0: "STAGE 0",
                    STAGE1: "STAGE 1",
                    STAGE2: "STAGE 2"
                };
                multiStageWorker.addStage(
                    {
                        execute: function () {
                            try {
                                $rootScope.$broadcast("schedulerStage", STAGES.STAGE0);
                                console.log(STAGES.STAGE0);

                                return appUpdateService.getUpdateInfo().then(function (appUpdateInfo) {
                                    if (appUpdateInfo && appUpdateInfo.forcedUpdateRequired) {
                                        console.log(STAGES.STAGE0 + ' Stopping other stages, app needs an update');
                                        $rootScope.$broadcast("schedulerStage", null, true);
                                        multiStageWorker.pause();

                                        ngDialog.open({
                                            template: '../common/ui-helper/views/appUpdatePopup.html',
                                            className: 'test ngdialog-theme-default',
                                            data: appUpdateInfo,
                                            showClose: true,
                                            controller: 'AppUpdateController'
                                        });
                                    }
                                }).catch(function (response) {
                                    if (response.status === -1) {
                                        multiStageWorker.pause();
                                        $rootScope.$broadcast("schedulerStage", null, true);
                                    }
                                });
                            } catch (e) {
                                console.log('Error at ' + STAGES.STAGE0, e);
                            }
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function () {
                            try {
                                $rootScope.$broadcast("schedulerStage", STAGES.STAGE1);
                                console.log(STAGES.STAGE1);
                                return offlinePush().then(function () {
                                }, function (error) {
                                    console.log("Error " + STAGES.STAGE1 + "\n" + error.config.url + " " + error.statusText);
                                });
                            } catch (e) {
                                console.log('Error at ' + STAGES.STAGE1, e);
                            }
                        }

                    });
                multiStageWorker.addStage(
                    {
                        execute: function () {
                            try {
                                $rootScope.$broadcast("schedulerStage", STAGES.STAGE2);
                                console.log(STAGES.STAGE2);
                                return offlinePull().then(function () {
                                }, function (error) {
                                    console.log("Error " + STAGES.STAGE2 + "\n" + error.config.url + " " + error.statusText);
                                });
                            } catch (e) {
                                console.log('Error at ' + STAGES.STAGE2, e);
                            }
                        }
                    });
                if (!job) {
                    job = scheduledJob.create({
                        worker: multiStageWorker,
                        interval: syncButtonConfig.delay,
                        count: syncButtonConfig.repeat
                    });
                    job.start();
                }
                return job;
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

angular.module('bahmni.offline', ['ui.router', 'httpErrorInterceptor', 'bahmni.common.uiHelper', 'bahmni.common.util', 'bahmni.common.i18n', 'bahmni.common.logging', 'bahmni.common.offline', 'bahmni.common.models', 'bahmni.common.appFramework', 'ngCookies'])
    .config(['$urlRouterProvider', '$stateProvider', '$bahmniTranslateProvider',
        function ($urlRouterProvider, $stateProvider, $bahmniTranslateProvider) {
            $urlRouterProvider.otherwise('/initScheduler');
        // @endif
            $stateProvider
            .state('initScheduler',
                {
                    url: '/initScheduler',
                    resolve: {
                        offlineDb: function (offlineDbInitialization) {
                            return offlineDbInitialization();
                        },
                        offlineConfigInitialization: function (offlineConfigInitialization, offlineDb, offlineService, offlineDbService, androidDbService, $q) {
                            var checkConfig = function () {
                                var allowMultipleLoginLocation = offlineService.getItem("allowMultipleLoginLocation");
                                return allowMultipleLoginLocation !== null && !allowMultipleLoginLocation;
                            };
                            if (offlineService.isAndroidApp()) {
                                offlineDbService = androidDbService;
                            }
                            return offlineDbService.getConfig("dbNameCondition").then(function (result) {
                                if (result || checkConfig()) {
                                    return $q.when();
                                }
                                else return offlineConfigInitialization();
                            });
                        },
                        offlineReferenceDataInitialization: function (offlineReferenceDataInitialization, offlineDbService, offlineService, androidDbService, $state, offlineConfigInitialization) {
                            if (offlineService.isAndroidApp()) {
                                offlineDbService = androidDbService;
                            }
                            return offlineDbService.getReferenceData("LoginLocations").then(function (result) {
                                if (result) {
                                    $state.go('login');
                                }
                                return offlineReferenceDataInitialization(false).then(function (response) {
                                    if (response.data) {
                                        offlineService.setItem("networkError", response.data);
                                    }
                                    $state.go('login');
                                });
                            });
                        }
                    }
                }).state('scheduler',
                {
                    url: '/scheduler',
                    resolve: {
                        offlineDb: function (offlineDbInitialization) {
                            return offlineDbInitialization();
                        },
                        testConfig: function (offlineDb, offlineService, offlineDbService, androidDbService, $state) {
                            if (offlineService.isAndroidApp()) {
                                offlineDbService = androidDbService;
                            }
                            return offlineDbService.getConfig("home").then(function (result) {
                                if (result && offlineService.getItem('eventLogCategories')) {
                                    $state.go('initSync');
                                }
                            });
                        },
                        offlineReferenceDataInitialization: function (offlineReferenceDataInitialization, offlineDb, testConfig) {
                            return offlineReferenceDataInitialization(true, offlineDb, testConfig);
                        },
                        offlineLocationInitialization: function (offlineLocationInitialization, offlineReferenceDataInitialization) {
                            return offlineLocationInitialization(offlineReferenceDataInitialization);
                        },
                        offlineConfigInitialization: function (offlineConfigInitialization, offlineLocationInitialization) {
                            return offlineConfigInitialization(offlineLocationInitialization);
                        },
                        state: function ($state, offlineConfigInitialization) {
                            $state.go('initSync');
                        }
                    }
                }).state('initSync', {
                    templateUrl: 'views/initSync.html',
                    controller: 'InitSyncController',
                    url: '/initSync',
                    resolve: {
                        offlineDb: function (offlineDbInitialization) {
                            return offlineDbInitialization();
                        }
                    }
                }).state('device',
                {
                    url: "/device/:deviceType",
                    controller: function ($stateParams, $rootScope, $state, offlineService, $http) {
                        if ($stateParams.deviceType === 'chrome-app' || $stateParams.deviceType === 'android') {
                            offlineService.setAppPlatform($stateParams.deviceType);
                            var syncStatus = offlineService.getItem("initialSyncStatus");
                            if (!(syncStatus instanceof Object)) {
                                var url = Bahmni.Common.Constants.globalPropertyUrl + "?property=allowMultipleLoginLocation";
                                $http.get(url).then(function (res) {
                                    offlineService.setItem("allowMultipleLoginLocation", res.data);
                                });
                            }
                            $state.go('initScheduler');
                        }
                    }
                }).state('login',
                {
                    controller: function () {
                        window.location.href = "../home/index.html#/login";
                    }
                }).state('dashboard',
                {
                    controller: function () {
                        window.location.href = "../home/index.html#/dashboard";
                    }
                });
            $bahmniTranslateProvider.init({app: 'offline', shouldMerge: true});
        }]).run(['$rootScope', '$templateCache', function ($rootScope, $templateCache) {
    // Disable caching view template partials
            $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            });
        }]);
