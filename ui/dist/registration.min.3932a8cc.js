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

Bahmni.Common.Util.ValidationUtil = (function () {
    var isAcceptableType = function (propertyToCheck) {
        return _.includes(["string", "boolean", "number", "object"], typeof propertyToCheck);
    };

    var flattenObject = function (ob) {
        var toReturn = {};
        for (var i in ob) {
            if (!ob.hasOwnProperty(i) || !isAcceptableType(ob[i])) {
                continue;
            }
            if ((typeof ob[i]) == 'object' && !(ob[i] instanceof Date)) {
                var flatObject = flattenObject(ob[i]);
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x) || !isAcceptableType(flatObject[x])) {
                        continue;
                    }
                    toReturn[i + '.' + x] = flatObject[x];
                }
            } else {
                toReturn[i] = ob[i];
            }
        }
        return toReturn;
    };

    // This will work only for patient attributes, since we are passing concept behind the attribute.
    // To have a generic one, we need to remove the concept dependency.. And concept will be null for non concept fields
    var validate = function (complexObject, objectConfiguration) {
        var allCustomValidators = Bahmni.Registration.customValidator;
        if (!allCustomValidators) {
            return [];
        }

        var dataArray = flattenObject(complexObject);
        var errorMessages = [];
        _.every(dataArray, function (value, field) {
            var isValid = true;
            var fieldSpecificValidator = allCustomValidators[field];
            if (!fieldSpecificValidator) {
                return isValid;
            }
            if (typeof fieldSpecificValidator.method == 'function' && value) {
                var personAttributeTypeConfig = _.find(objectConfiguration, {name: field});
                isValid = fieldSpecificValidator.method(field, value, personAttributeTypeConfig);
                if (!isValid) {
                    errorMessages.push(fieldSpecificValidator.errorMessage);
                    isValid = true;
                }
            }
            return isValid;
        });
        return errorMessages;
    };
    return {
        validate: validate
    };
})();

'use strict';

Bahmni.Common.Util.DynamicResourceLoader = (function () {
    return {
        includeJs: function (script, isOfflineApp) {
            var element = document.createElement('script');
            if (isOfflineApp) {
                var file = new Blob([script], {type: 'text/javascript'});
                var url = URL.createObjectURL(file);
                element.setAttribute('src', url);
            } else {
                element.setAttribute('src', script);
            }
            document.body.appendChild(element);
        },
        includeCss: function (url) {
            var element = document.createElement('link');
            element.setAttribute('href', url);
            element.setAttribute('rel', "stylesheet");
            element.setAttribute('type', "text/css");
            document.head.appendChild(element);
        }
    };
})();

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

'use strict';

Bahmni.Common.VisitControl = function (visitTypes, defaultVisitTypeName, encounterService,
                                       $translate, visitService) {
    var self = this;
    self.visitTypes = visitTypes;
    self.defaultVisitTypeName = defaultVisitTypeName;
    self.defaultVisitType = visitTypes.filter(function (visitType) {
        return visitType.name === defaultVisitTypeName;
    })[0];

    self.startButtonText = function (visitType) {
        return $translate.instant('REGISTRATION_START_VISIT', {visitType: visitType.name});
    };

    self.startVisit = function (visitType) {
        self.onStartVisit();
        self.selectedVisitType = visitType;
    };

    self.createVisitOnly = function (patientUuid, visitLocationUuid) {
        var visitType = self.selectedVisitType || self.defaultVisitType;
        var visitDetails = {patient: patientUuid, visitType: visitType.uuid, location: visitLocationUuid};
        return visitService.createVisit(visitDetails);
    };
};


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
    Bahmni.Common.Domain.ObservationFilter = function () {
        var self = this;

        var voidExistingObservationWithOutValue = function (observations) {
            observations.forEach(function (observation) {
                voidExistingObservationWithOutValue(observation.groupMembers);
                observation.voided = observation.voided || observation.canBeVoided();

                if (observation.voided) {
                    voidAllChildren(observation);
                }
            });
        };

        var voidAllChildren = function (voidedObservation) {
            voidedObservation.groupMembers.forEach(function (childWithVoidedParent) {
                childWithVoidedParent.voided = true;

                voidAllChildren(childWithVoidedParent);
            });
        };

        var removeNewObservationsWithoutValue = function (observations) {
            observations.forEach(function (observation) {
                observation.groupMembers = removeNewObservationsWithoutValue(observation.groupMembers);
            });
            return observations.filter(function (observation) {
                var validObs = observation.isExisting() || observation.hasValue() || observation.hasMemberWithValue();
                return (validObs && !observation.voided) || (observation.isExisting() && observation.voided);
            });
        };

        var removeNewObservationsWhichAreVoided = function (observations) {
            observations.forEach(function (observation) {
                observation.groupMembers = removeNewObservationsWhichAreVoided(observation.groupMembers);
            });
            return _.reject(observations, function (observation) {
                return observation.isNew() && observation.voided;
            });
        };

        self.filter = function (observations) {
            var wrappedObservations = observations.map(Observation.wrap);
            var filteredObservations = removeNewObservationsWithoutValue(wrappedObservations);
            filteredObservations = removeNewObservationsWhichAreVoided(filteredObservations);
            voidExistingObservationWithOutValue(filteredObservations);
            return filteredObservations;
        };
    };

    var Observation = function (observationData) {
        angular.extend(this, observationData);

        this.isNew = function () {
            return !this.uuid;
        };

        this.isExisting = function () {
            return !this.isNew();
        };

        this.hasValue = function () {
            return this.value !== undefined && this.value !== null && this.value !== '';
        };

        this.hasMemberWithValue = function () {
            return this.groupMembers.some(function (groupMember) {
                return groupMember.hasValue() || groupMember.hasMemberWithValue();
            });
        };

        this.isGroup = function () {
            return this.groupMembers.length > 0;
        };

        this.isLeaf = function () {
            return !this.isGroup();
        };

        this.isGroupWithOnlyVoidedMembers = function () {
            return this.isGroup() && this.groupMembers.every(function (groupMember) {
                return groupMember.voided;
            });
        };

        this.isLeafNodeWithOutValue = function () {
            return this.isLeaf() && !this.hasValue();
        };

        this.canBeVoided = function () {
            return this.isExisting() && (this.isLeafNodeWithOutValue() || this.isGroupWithOnlyVoidedMembers());
        };
    };

    Observation.wrap = function (observationData) {
        var observation = new Observation(observationData);
        observation.groupMembers = observation.groupMembers ? observation.groupMembers.map(Observation.wrap) : [];
        return observation;
    };
})();


'use strict';

Bahmni.Common.Domain.Helper.getHintForNumericConcept = function (concept) {
    if (!concept) {
        return;
    }
    if (concept.hiNormal != null && concept.lowNormal != null) {
        return '(' + concept.lowNormal + ' - ' + concept.hiNormal + ')';
    }
    if (concept.hiNormal != null && concept.lowNormal == null) {
        return '(< ' + concept.hiNormal + ')';
    }
    if (concept.hiNormal == null && concept.lowNormal != null) {
        return '(> ' + concept.lowNormal + ')';
    }
    return '';
};

'use strict';

Bahmni.Common.Domain.ConceptMapper = function () {
    this.map = function (openMrsConcept) {
        if (!openMrsConcept) {
            return null;
        }
        if (alreadyMappedConcept(openMrsConcept)) {
            return openMrsConcept;
        } // TODO: Clean up: God knows why people are passing already mapped concept. Keeping this non sense check in this one line alone to avoid confusion
        var openMrsDescription = openMrsConcept.descriptions ? openMrsConcept.descriptions[0] : null;
        var shortConceptName = _.find(openMrsConcept.names, {conceptNameType: "SHORT"});
        return {
            uuid: openMrsConcept.uuid,
            name: openMrsConcept.name.name,
            shortName: shortConceptName ? shortConceptName.name : null,
            description: openMrsDescription ? openMrsDescription.description : null,
            set: openMrsConcept.set,
            dataType: openMrsConcept.datatype ? openMrsConcept.datatype.name : null,
            hiAbsolute: openMrsConcept.hiAbsolute,
            lowAbsolute: openMrsConcept.lowAbsolute,
            hiNormal: openMrsConcept.hiNormal,
            handler: openMrsConcept.handler,
            allowDecimal: openMrsConcept.allowDecimal,
            lowNormal: openMrsConcept.lowNormal,
            conceptClass: openMrsConcept.conceptClass ? openMrsConcept.conceptClass.name : null,
            answers: openMrsConcept.answers,
            units: openMrsConcept.units,
            displayString: shortConceptName ? shortConceptName.name : openMrsConcept.name.name,
            names: openMrsConcept.names
        };
    };

    var alreadyMappedConcept = function (concept) {
        return !concept.name.name;
    };
};

'use strict';

angular.module('bahmni.common.domain')
    .factory('providerService', ['$http', function ($http) {
        var search = function (fieldValue) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: {q: fieldValue, v: "full"},
                withCredentials: true
            });
        };

        var searchByUuid = function (uuid) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: {
                    user: uuid
                },
                cache: false
            });
        };

        var list = function (params) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                cache: false,
                params: params
            });
        };

        return {
            search: search,
            searchByUuid: searchByUuid,
            list: list
        };
    }]);

'use strict';

/* exported EncounterConfig */
var EncounterConfig = (function () {
    function EncounterConfig (encounterTypes) {
        this.encounterTypes = encounterTypes;
    }
    EncounterConfig.prototype = {
        getConsultationEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("Consultation");
        },
        getAdmissionEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("ADMISSION");
        },
        getDischargeEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("DISCHARGE");
        },
        getTransferEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("TRANSFER");
        },
        getRadiologyEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("RADIOLOGY");
        },
        getPatientDocumentEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("Patient Document");
        },
        getValidationEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid(Bahmni.Common.Constants.validationNotesEncounterType);
        },
        getEncounterTypeUuid: function (encounterTypeName) {
            return this.encounterTypes[encounterTypeName];
        },
        getVisitTypes: function () {
            var visitTypesArray = [];
            for (var name in this.visitTypes) {
                visitTypesArray.push({name: name, uuid: this.visitTypes[name]});
            }
            return visitTypesArray;
        },
        getEncounterTypes: function () {
            var encounterTypesArray = [];
            for (var name in this.encounterTypes) {
                encounterTypesArray.push({name: name, uuid: this.encounterTypes[name]});
            }
            return encounterTypesArray;
        },
        getVisitTypeByUuid: function (uuid) {
            var visitTypes = this.getVisitTypes();
            return visitTypes.filter(function (visitType) {
                return visitType.uuid === uuid;
            })[0];
        },
        getEncounterTypeByUuid: function (uuid) {
            var encounterType = this.getEncounterTypes();
            return encounterType.filter(function (encounterType) {
                return encounterType.uuid === uuid;
            })[0];
        }
    };
    return EncounterConfig;
})();

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


angular.module('bahmni.common.uiHelper', ['ngClipboard']);

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

angular.module('bahmni.common.uiHelper')
    .directive('bmPopOver', function () {
        var controller = function ($scope) {
            $scope.targetElements = [];

            var hideTargetElements = function () {
                $scope.targetElements.forEach(function (el) { el.hide(); });
            };

            var showTargetElements = function () {
                $scope.targetElements.forEach(function (el) { el.show(); });
            };

            this.registerTriggerElement = function (triggerElement) {
                $scope.triggerElement = triggerElement;

                var docClickHandler = function () {
                    if (!$scope.autoclose) {
                        return;
                    }
                    hideTargetElements();
                    $scope.isTargetOpen = false;
                    $(document).off('click', docClickHandler);
                };

                $scope.triggerElement.on('click', function (event) {
                    if ($scope.isTargetOpen) {
                        $scope.isTargetOpen = false;
                        hideTargetElements(0);
                        $(document).off('click', docClickHandler);
                    } else {
                        $scope.isTargetOpen = true;
                        showTargetElements();
                        $(document).on('click', docClickHandler);
                        event.stopImmediatePropagation();
                    }
                });

                $scope.$on('$destroy', function () {
                    $(document).off('click', docClickHandler);
                });
            };

            this.registerTargetElement = function (targetElement) {
                targetElement.hide();
                $scope.targetElements.push(targetElement);
            };
            var hideOrShowTargetElements = function () {
                if ($scope.isTargetOpen) {
                    $scope.isTargetOpen = false;
                    hideTargetElements(0);
                }
            };

            $(document).on('click', '.reg-wrapper', hideOrShowTargetElements);

            $scope.$on('$destroy', function () {
                $(document).off('click', '.reg-wrapper', hideOrShowTargetElements);
            });
        };

        return {
            restrict: 'A',
            controller: controller,
            scope: {
                autoclose: "="
            }
        };
    })
    .directive('bmPopOverTarget', function () {
        var link = function ($scope, element, attrs, popOverController) {
            popOverController.registerTargetElement(element);
        };

        return {
            restrict: 'A',
            require: '^bmPopOver',
            link: link
        };
    })
    .directive('bmPopOverTrigger', function () {
        var link = function ($scope, element, attrs, popOverController) {
            popOverController.registerTriggerElement(element);
        };

        return {
            restrict: 'A',
            require: '^bmPopOver',
            link: link
        };
    });

'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('splitButton', ['$timeout', function ($timeout) {
        var controller = function ($scope) {
            $scope.primaryOption = $scope.primaryOption || $scope.options[0];
            $scope.secondaryOptions = _.without($scope.options, $scope.primaryOption);
            $scope.hasMultipleOptions = function () {
                return $scope.secondaryOptions.length > 0;
            };
        };

        var link = function (scope, element) {
            var shouldScroll = function (elementPosition, elementHeight) {
                var windowHeight = window.innerHeight + $(window).scrollTop();
                return windowHeight < (elementHeight + elementPosition);
            };

            scope.scrollToBottom = function () {
                var timeout = $timeout(function () {
                    var scrollHeight = $(element)[0].scrollHeight;
                    if (shouldScroll(element.position().top, scrollHeight)) {
                        window.scrollBy(0, scrollHeight);
                        $timeout.cancel(timeout);
                    }
                });
            };
        };
        return {
            restrict: 'A',
            template: '<div class="split-button" bm-pop-over>' +
                        '<button bm-pop-over-trigger class="toggle-button fa fa-caret-down" ng-show="::hasMultipleOptions()" ng-click="scrollToBottom()" ng-disabled="optionDisabled" type="button"></button>' +
                        '<ul class="options">' +
                            '<li class="primaryOption">' +
                                '<button class="buttonClass" ng-click="optionClick()(primaryOption)" accesskey="{{::primaryOption.shortcutKey}}" ng-disabled="optionDisabled" ng-bind-html="::optionText()(primaryOption,\'primary\') | translate "></button>' +
                            '</li>' +
                            '<ul class="hidden-options">' +
                            '<li bm-pop-over-target ng-repeat="option in ::secondaryOptions" class="secondaryOption">' +
                                '<button class="buttonClass" ng-click="optionClick()(option)" accesskey="{{::option.shortcutKey}}" ng-disabled="optionDisabled" ng-bind-html="::optionText()(option) | translate"></button>' +
                            '</li>' +
                            '</ul>' +
                        '</ul>' +
                      '</div>',
            controller: controller,
            link: link,
            scope: {
                options: '=',
                primaryOption: '=',
                optionText: '&',
                optionClick: '&',
                optionDisabled: '='
            }
        };
    }]);

'use strict';

angular.module('bahmni.common.uiHelper')
.directive('focusOn', ['$timeout', function ($timeout) {
    return function (scope, elem, attrs) {
        if (Modernizr.ios) {
            return;
        }
        scope.$watch(attrs.focusOn, function (value) {
            if (value) {
                $timeout(function () {
                    $(elem).focus();
                });
            }
        });
    };
}]);

(function () {
    'use strict';

    var constructSearchResult = function (concept, searchString) {
        var matchingName = null;
        var conceptName = concept.name;
        if (!_.includes(_.toLower(conceptName), _.toLower(searchString))) {
            var synonyms = _.map(concept.names, 'name');
            matchingName = _.find(synonyms, function (name) {
                return (name !== conceptName) && name.search(new RegExp(searchString, "i")) !== -1;
            });
        }
        return {
            label: matchingName ? matchingName + " => " + conceptName : conceptName,
            value: conceptName,
            concept: concept,
            uuid: concept.uuid,
            name: conceptName
        };
    };

    var searchWithDefaultConcept = function (searchMethod, request, response) {
        var searchTerm = _.toLower(request.term.trim());
        var isMatching = function (answer) {
            var conceptNameFound = _.find(answer.names, function (name) {
                return _.includes(_.toLower(name.name), searchTerm);
            });
            var conceptDrugNameFound = _.includes(_.toLower(answer.name), searchTerm);
            return conceptNameFound || conceptDrugNameFound;
        };
        var responseMap = _.partial(constructSearchResult, _, searchTerm);

        searchMethod()
            .then(_.partial(_.filter, _, isMatching))// == .then(function(value){return _.filter(value,isMatching);})
            .then(_.partial(_.map, _, responseMap))
            .then(response);
    };

    var searchWithGivenConcept = function (searchMethod, request, response) {
        var searchTerm = request.term.trim();
        var responseMap = _.partial(constructSearchResult, _, searchTerm);
        searchMethod()
            .then(_.partial(_.map, _, responseMap))
            .then(response);
    };

    var toBeInjected = ['$parse', '$http', 'conceptService'];
    var conceptAutocomplete = function ($parse, $http, conceptService) {
        var link = function (scope, element, attrs, ngModelCtrl) {
            var minLength = scope.minLength || 2;
            var previousValue = scope.previousValue;

            var validator = function (searchTerm) {
                if (!scope.strictSelect) {
                    return;
                }
                if (!scope.illegalValue && (_.isEmpty(searchTerm) || searchTerm === previousValue)) {
                    element.removeClass('illegalValue');
                    return;
                }
                element.addClass('illegalValue');
            };

            element.autocomplete({
                autofocus: true,
                minLength: minLength,
                source: function (request, response) {
                    var searchMethod;
                    if (!scope.answersConceptName && scope.defaultConcept) {
                        searchMethod = _.partial(conceptService.getAnswers, scope.defaultConcept);
                        searchWithDefaultConcept(searchMethod, request, response);
                    } else {
                        searchMethod = _.partial(conceptService.getAnswersForConceptName, {
                            term: request.term,
                            answersConceptName: scope.answersConceptName
                        });
                        searchWithGivenConcept(searchMethod, request, response);
                    }
                },
                select: function (event, ui) {
                    scope.$apply(function (scope) {
                        ngModelCtrl.$setViewValue(ui.item);
                        if (scope.blurOnSelect) {
                            element.blur();
                        }
                        previousValue = ui.item.value;
                        validator(previousValue);
                        scope.$eval(attrs.ngChange);
                    });
                    return true;
                },
                search: function (event) {
                    var searchTerm = $.trim(element.val());
                    if (searchTerm.length < minLength) {
                        event.preventDefault();
                    }
                    previousValue = null;
                }
            });

            var blurHandler = function () {
                var searchTerm = $.trim(element.val());
                validator(searchTerm);
            };

            element.on('blur', blurHandler);

            scope.$on("$destroy", function () {
                element.off('blur', blurHandler);
            });
        };

        return {
            link: link,
            require: 'ngModel',
            scope: {
                illegalValue: '=',
                defaultConcept: '=',
                answersConceptName: '=',
                minLength: '=',
                blurOnSelect: '=',
                strictSelect: '=?',
                previousValue: '='
            }
        };
    };

    conceptAutocomplete.$inject = toBeInjected;
    angular.module('bahmni.common.uiHelper').directive('conceptAutocomplete', conceptAutocomplete);
})();

'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
        return {
            link: function (scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                scope.$watch(model, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    }]);

'use strict';

angular.module('bahmni.common.uiHelper')
.directive('bahmniAutocomplete', function () {
    var link = function (scope, element, attrs, ngModelCtrl) {
        var source = scope.source();
        var responseMap = scope.responseMap && scope.responseMap();
        var onSelect = scope.onSelect();
        var onEdit = scope.onEdit && scope.onEdit();
        var minLength = scope.minLength || 2;
        var formElement = element[0];
        var validationMessage = scope.validationMessage || 'Please select a value from auto complete';

        var validateIfNeeded = function (value) {
            if (!scope.strictSelect) {
                return;
            }
            scope.isInvalid = (value !== scope.selectedValue);
            if (_.isEmpty(value)) {
                scope.isInvalid = false;
            }
        };

        scope.$watch('initialValue', function () {
            if (scope.initialValue) {
                scope.selectedValue = scope.initialValue;
                scope.isInvalid = false;
            }
        });

        element.autocomplete({
            autofocus: true,
            minLength: minLength,
            source: function (request, response) {
                source({elementId: attrs.id, term: request.term, elementType: attrs.type}).then(function (data) {
                    var results = responseMap ? responseMap(data) : data;
                    response(results);
                });
            },
            select: function (event, ui) {
                scope.selectedValue = ui.item.value;
                ngModelCtrl.$setViewValue(ui.item.value);
                if (onSelect != null) {
                    onSelect(ui.item);
                }
                validateIfNeeded(ui.item.value);
                if (scope.blurOnSelect) {
                    element.blur();
                }
                scope.$apply();
                scope.$eval(attrs.ngDisabled);
                scope.$apply();
                return true;
            },
            search: function (event, ui) {
                if (onEdit != null) {
                    onEdit(ui.item);
                }
                var searchTerm = $.trim(element.val());
                validateIfNeeded(searchTerm);
                if (searchTerm.length < minLength) {
                    event.preventDefault();
                }
            }
        });
        var changeHanlder = function (e) {
            validateIfNeeded(element.val());
        };

        var keyUpHandler = function (e) {
            validateIfNeeded(element.val());
            scope.$apply();
        };

        element.on('change', changeHanlder);
        element.on('keyup', keyUpHandler);

        scope.$watch('isInvalid', function () {
            ngModelCtrl.$setValidity('selection', !scope.isInvalid);
            formElement.setCustomValidity(scope.isInvalid ? validationMessage : '');
        });

        scope.$on("$destroy", function () {
            element.off('change', changeHanlder);
            element.off('keyup', keyUpHandler);
        });
    };

    return {
        link: link,
        require: 'ngModel',
        scope: {
            source: '&',
            responseMap: '&?',
            onSelect: '&',
            onEdit: '&?',
            minLength: '=?',
            blurOnSelect: '=?',
            strictSelect: '=?',
            validationMessage: '@',
            isInvalid: "=?",
            initialValue: "=?"
        }
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
    .factory('printer', ['$rootScope', '$compile', '$http', '$timeout', '$q', 'spinner',
        function ($rootScope, $compile, $http, $timeout, $q, spinner) {
            var printHtml = function (html) {
                var deferred = $q.defer();
                var hiddenFrame = $('<iframe style="visibility: hidden"></iframe>').appendTo('body')[0];
                hiddenFrame.contentWindow.printAndRemove = function () {
                    hiddenFrame.contentWindow.print();
                    $(hiddenFrame).remove();
                    deferred.resolve();
                };
                var htmlContent = "<!doctype html>" +
                        "<html>" +
                            '<body onload="printAndRemove();">' +
                                html +
                            '</body>' +
                        "</html>";
                var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
                doc.write(htmlContent);
                doc.close();
                return deferred.promise;
            };

            var openNewWindow = function (html) {
                var newWindow = window.open("printTest.html");
                newWindow.addEventListener('load', function () {
                    $(newWindow.document.body).html(html);
                }, false);
            };

            var print = function (templateUrl, data) {
                $rootScope.isBeingPrinted = true;
                $http.get(templateUrl).then(function (templateData) {
                    var template = templateData.data;
                    var printScope = $rootScope.$new();
                    angular.extend(printScope, data);
                    var element = $compile($('<div>' + template + '</div>'))(printScope);
                    var renderAndPrintPromise = $q.defer();
                    var waitForRenderAndPrint = function () {
                        if (printScope.$$phase || $http.pendingRequests.length) {
                            $timeout(waitForRenderAndPrint, 1000);
                        } else {
                        // Replace printHtml with openNewWindow for debugging
                            printHtml(element.html()).then(function () {
                                $rootScope.isBeingPrinted = false;
                                renderAndPrintPromise.resolve();
                            });
                            printScope.$destroy();
                        }
                        return renderAndPrintPromise.promise;
                    };
                    spinner.forPromise(waitForRenderAndPrint());
                });
            };

            var printFromScope = function (templateUrl, scope, afterPrint) {
                $rootScope.isBeingPrinted = true;
                $http.get(templateUrl).then(function (response) {
                    var template = response.data;
                    var printScope = scope;
                    var element = $compile($('<div>' + template + '</div>'))(printScope);
                    var renderAndPrintPromise = $q.defer();
                    var waitForRenderAndPrint = function () {
                        if (printScope.$$phase || $http.pendingRequests.length) {
                            $timeout(waitForRenderAndPrint);
                        } else {
                            printHtml(element.html()).then(function () {
                                $rootScope.isBeingPrinted = false;
                                if (afterPrint) {
                                    afterPrint();
                                }
                                renderAndPrintPromise.resolve();
                            });
                        }
                        return renderAndPrintPromise.promise;
                    };
                    spinner.forPromise(waitForRenderAndPrint());
                });
            };
            return {
                print: print,
                printFromScope: printFromScope
            };
        }]);

'use strict';

angular.module('bahmni.common.uiHelper')
 .service('contextChangeHandler', ['$rootScope', function ($rootScope) {
     var callbacks = [];
     var self = this;

     $rootScope.$on('$stateChangeSuccess', function () {
         self.reset();
     });

     this.reset = function () {
         callbacks = [];
     };

     this.add = function (callback) {
         callbacks.push(callback);
     };

     this.execute = function () {
         var allow = true;
         var callBackReturn = null;
         var errorMessage = null;
         callbacks.forEach(function (callback) {
             callBackReturn = callback();
             allow = allow && callBackReturn["allow"];
             if (_.isEmpty(errorMessage)) {
                 errorMessage = callBackReturn["errorMessage"];
             }
         });
         if (callBackReturn && errorMessage) {
             return {allow: allow, errorMessage: errorMessage};
         }
         return {allow: allow};
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

'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('ngConfirmClick', function () {
        var link = function (scope, element, attr) {
            var msg = attr.confirmMessage || "Are you sure?";
            var clickAction = attr.ngConfirmClick;
            element.bind('click', function () {
                if (window.confirm(msg)) {
                    scope.$apply(clickAction);
                }
            });
        };
        return {
            restrict: 'A',
            link: link
        };
    });

'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('bmShow', ['$rootScope', function ($rootScope) {
        var link = function ($scope, element) {
            $scope.$watch('bmShow', function () {
                if ($rootScope.isBeingPrinted || $scope.bmShow) {
                    element.removeClass('ng-hide');
                } else {
                    element.addClass('ng-hide');
                }
            });
        };

        return {
            scope: {
                bmShow: "="
            },
            link: link
        };
    }]);

'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('monthyearpicker', ['$translate', function ($translate) {
        var link = function ($scope) {
            var monthNames = $translate.instant('MONTHS');
            $scope.monthNames = monthNames.split(",");

            var getYearList = function () {
                var minYear = $scope.minYear ? $scope.minYear : moment().toDate().getFullYear() - 15;
                var maxYear = $scope.maxYear ? $scope.maxYear : moment().toDate().getFullYear() + 5;
                var yearList = [];
                for (var i = maxYear; i >= minYear; i--) {
                    yearList.push(i);
                }
                return yearList;
            };
            $scope.years = getYearList();

            var valueCompletelyFilled = function () {
                return ($scope.selectedMonth != null && $scope.selectedYear != null);
            };
            var valueNotFilled = function () {
                return $scope.selectedMonth == null && $scope.selectedYear == null;
            };

            var getCompleteDate = function () {
                var month = $scope.selectedMonth + 1;
                return $scope.selectedYear + "-" + month + "-01";
            };

            $scope.updateModel = function () {
                if (valueCompletelyFilled()) {
                    $scope.model = getCompleteDate();
                } else if (!$scope.isValid()) {
                    $scope.model = "Invalid Date";
                } else {
                    $scope.model = "";
                }
            };
            $scope.isValid = function () {
                return valueNotFilled() || valueCompletelyFilled();
            };

            $scope.illegalMonth = function () {
                return ($scope.selectedMonth === undefined || $scope.selectedMonth === null) && ($scope.selectedYear !== null && $scope.selectedYear !== undefined);
            };

            $scope.illegalYear = function () {
                return ($scope.selectedMonth !== null && $scope.selectedMonth !== undefined) && ($scope.selectedYear === undefined || $scope.selectedYear === null);
            };

            if ($scope.model) {
                var date = moment($scope.model).toDate();
                $scope.selectedMonth = date.getMonth();
                $scope.selectedYear = date.getFullYear();
            }
        };

        return {
            restrict: 'E',
            link: link,
            scope: {
                observation: "=",
                minYear: "=",
                maxYear: "=",
                illegalValue: '=',
                model: "="
            },
            template: '<span><select ng-model=\'selectedMonth\'  ng-class=\"{\'illegalValue\': illegalMonth() || illegalValue}\" ng-change="updateModel()" ng-options="monthNames.indexOf(month) as month for month in monthNames" ><option value="">{{\'CHOOSE_MONTH_KEY\' | translate}}</option>>' +
            '</select></span>' +
            '<span><select ng-model=\'selectedYear\'   ng-class=\"{\'illegalValue\': illegalYear() || illegalValue}\" ng-change="updateModel()" ng-options="year as year for year in years"><option value="">{{\'CHOOSE_YEAR_KEY\' | translate}}</option>>' +
            '</select></span>'
        };
    }]);

'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('singleSubmit', function () {
        var ignoreSubmit = false;
        var link = function (scope, element) {
            var submitHandler = function () {
                if (ignoreSubmit) {
                    return;
                }
                ignoreSubmit = true;
                scope.singleSubmit().finally(function () {
                    ignoreSubmit = false;
                });
            };

            element.on('submit', submitHandler);

            scope.$on("$destroy", function () {
                element.off('submit', submitHandler);
            });
        };
        return {
            scope: {
                singleSubmit: '&'
            },
            restrict: 'A',
            link: link
        };
    });

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.UIControls = Bahmni.Common.UIControls || {};

angular.module('bahmni.common.uicontrols', []);

(function () {
    'use strict';

    var constructSearchResult = function (concept) {
        var conceptName = concept.shortName || concept.name.name || concept.name;
        return {
            label: conceptName,
            value: conceptName,
            concept: concept,
            uuid: concept.uuid,
            name: conceptName
        };
    };

    var find = function (allAnswers, savedAnswer) {
        return _.find(allAnswers, function (answer) {
            return savedAnswer && (savedAnswer.uuid === answer.concept.uuid);
        });
    };

    var toBeInjected = ['conceptService'];
    var conceptDropdown = function (conceptService) {
        var controller = function ($scope) {
            $scope.onChange = $scope.onChange();

            var response = function (answers) {
                $scope.answers = answers;
                $scope.selectedAnswer = find(answers, $scope.selectedAnswer);
            };
            if (!$scope.answersConceptName && $scope.defaultConcept) {
                conceptService.getAnswers($scope.defaultConcept).then(function (results) {
                    return _.map(results, constructSearchResult);
                }).then(response);
                return;
            }

            conceptService.getAnswersForConceptName({
                answersConceptName: $scope.answersConceptName
            }).then(function (results) {
                return _.map(results, constructSearchResult);
            }).then(response);
        };

        return {
            controller: controller,
            restrict: 'E',
            scope: {
                selectedAnswer: '=model',
                answersConceptName: '=?',
                defaultConcept: '=',
                onChange: '&',
                onInvalidClass: '@',
                isValid: '=',
                ngDisabled: '='
            },
            templateUrl: '../common/uicontrols/concept-dropdown/views/conceptDropdown.html'
        };
    };

    conceptDropdown.$inject = toBeInjected;
    angular.module('bahmni.common.uicontrols').directive('conceptDropdown', conceptDropdown);
})();

'use strict';

angular.module('bahmni.common.attributeTypes', []).directive('attributeTypes', [function () {
    return {
        scope: {
            targetModel: '=',
            attribute: '=',
            fieldValidation: '=',
            isAutoComplete: '&',
            getAutoCompleteList: '&',
            getDataResults: '&',
            handleUpdate: '&',
            handleChange: '&',
            isReadOnly: '&',
            isForm: '=?'
        },
        templateUrl: '../common/attributeTypes/views/attributeInformation.html',
        restrict: 'E',
        controller: function ($scope) {
            $scope.getAutoCompleteList = $scope.getAutoCompleteList();
            $scope.getDataResults = $scope.getDataResults();
            // to avoid watchers in one way binding
            $scope.isAutoComplete = $scope.isAutoComplete() || function () { return false; };
            $scope.isReadOnly = $scope.isReadOnly() || function () { return false; };
            $scope.handleUpdate = $scope.handleUpdate() || function () { return false; };
            $scope.handleChange = $scope.handleChange() || function () { return false; };

            $scope.appendConceptNameToModel = function (attribute) {
                var attributeValueConceptType = $scope.targetModel[attribute.name];
                var concept = _.find(attribute.answers, function (answer) {
                    return answer.conceptId === attributeValueConceptType.conceptUuid;
                });
                attributeValueConceptType.value = concept && concept.fullySpecifiedName;
            };
        }
    };
}]);

angular.module('bahmni.common.photoCapture', []);

'use strict';

angular.module('bahmni.common.photoCapture')
    .directive('capturePhoto', ['$parse', '$window', function factory ($parse, $window) {
        var link = function (scope, iElement, iAttrs) {
            var activeStream,
                dialogElement = iElement.find(".photoCaptureDialog"),
                video = dialogElement.find("video")[0],
                canvas = dialogElement.find("canvas")[0],
                confirmImageButton = dialogElement.find(".confirmImage"),
                dialogOpen = false;
            var context = canvas.getContext("2d");
            var pixelRatio = window.devicePixelRatio;
            context.scale(pixelRatio, pixelRatio);

            scope.launchPhotoCapturePopup = function () {
                if (dialogOpen) {
                    alert("Please allow access to web camera and wait for photo capture dialog to be launched");
                    return;
                }
                dialogOpen = true;
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                if (navigator.getUserMedia) {
                    navigator.getUserMedia(
                        {video: true, audio: false},
                        function (localMediaStream) {
                            video.src = $window.URL.createObjectURL(localMediaStream);
                            activeStream = localMediaStream;
                            dialogElement.dialog('open');
                        },
                        function () {
                            alert("Could not get access to web camera. Please allow access to web camera");
                        }
                    );
                } else {
                    alert('Photo capture is not supported in your browser. Please use chrome');
                }
            };

            var closeDialog = function () {
                dialogElement.dialog('close');
            };

            var onConfirmationSuccess = function (image) {
                var ngModel = $parse(iAttrs.ngModel);
                ngModel.assign(scope, image);
                closeDialog();
            };

            scope.confirmImage = function () {
                var image = canvas.toDataURL("image/jpeg");
                if (iAttrs.capturePhoto) {
                    var onConfirmationPromise = scope[iAttrs.capturePhoto](image);
                    onConfirmationPromise.then(function () {
                        onConfirmationSuccess(image);
                    }, function () {
                        alert("Failed to save image. Please try again later");
                    });
                } else {
                    onConfirmationSuccess(image);
                }
            };

            scope.clickImage = function () {
                var sourceX = 0;
                var sourceY = 0;
                var destX = 0;
                var destY = 0;
                var stretchRatio, sourceWidth, sourceHeight;
                if (canvas.width > canvas.height) {
                    stretchRatio = (video.videoWidth / canvas.width);
                    sourceWidth = video.videoWidth;
                    sourceHeight = Math.floor(canvas.height * stretchRatio);
                    sourceY = Math.floor((video.videoHeight - sourceHeight) / 2);
                } else {
                    stretchRatio = (video.videoHeight / canvas.height);
                    sourceWidth = Math.floor(canvas.width * stretchRatio);
                    sourceHeight = video.videoHeight;
                    sourceX = Math.floor((video.videoWidth - sourceWidth) / 2);
                }
                var destWidth = Math.floor(canvas.width / pixelRatio);
                var destHeight = Math.floor(canvas.height / pixelRatio);
                context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
                confirmImageButton.prop('disabled', false);
                confirmImageButton.focus();
            };

            dialogElement.dialog({autoOpen: false, height: 300, width: 500, modal: true,
                close: function () {
                    dialogOpen = false;
                    if (activeStream) {
                        var activeStreamTrack = activeStream.getTracks();
                        if (activeStreamTrack) {
                            activeStreamTrack[0].stop();
                        }
                    }
                }
            });

            iElement.bind("$destroy", function () {
                dialogElement.dialog("destroy");
            });
        };

        return {
            templateUrl: '../common/photo-capture/views/photo.html',
            restrict: 'A',
            scope: true,
            link: link
        };
    }]);

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

angular.module('bahmni.common.patient', []);

'use strict';

angular.module('bahmni.common.patient')
.filter('age', function () {
    return function (age) {
        if (age.years) {
            return age.years + " y";
        }
        if (age.months) {
            return age.months + " m";
        }
        return age.days + " d";
    };
});

'use strict';
var Bahmni = Bahmni || {};
Bahmni.ConceptSet = Bahmni.ConceptSet || {};
Bahmni.ConceptSet.FormConditions = Bahmni.ConceptSet.FormConditions || {};

angular.module('bahmni.common.conceptSet', ['bahmni.common.uiHelper', 'ui.select2', 'pasvaz.bindonce', 'ngSanitize', 'ngTagsInput']);

'use strict';

angular.module('bahmni.common.conceptSet')
    .controller('ConceptSetGroupController', ['$scope', 'contextChangeHandler', 'spinner', 'messagingService',
        'conceptSetService', '$rootScope', 'sessionService', 'encounterService', 'treatmentConfig',
        'retrospectiveEntryService', 'userService', 'conceptSetUiConfigService', '$timeout', 'clinicalAppConfigService', '$stateParams', '$translate',
        function ($scope, contextChangeHandler, spinner, messagingService, conceptSetService, $rootScope, sessionService,
                  encounterService, treatmentConfig, retrospectiveEntryService, userService,
                  conceptSetUiConfigService, $timeout, clinicalAppConfigService, $stateParams, $translate) {
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var init = function () {
                $scope.validationHandler = new Bahmni.ConceptSet.ConceptSetGroupPanelViewValidationHandler($scope.allTemplates);
                contextChangeHandler.add($scope.validationHandler.validate);
            };
            $scope.toggleSideBar = function () {
                $rootScope.showLeftpanelToggle = !$rootScope.showLeftpanelToggle;
            };
            $scope.showLeftpanelToggle = function () {
                return $rootScope.showLeftpanelToggle;
            };

            $scope.togglePref = function (conceptSet, conceptName) {
                $rootScope.currentUser.toggleFavoriteObsTemplate(conceptName);
                spinner.forPromise(userService.savePreferences());
            };

            $scope.getNormalized = function (conceptName) {
                return conceptName.replace(/['\.\s\(\)\/,\\]+/g, "_");
            };

            $scope.showPreviousButton = function (conceptSetName) {
                return conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].showPreviousButton;
            };

            $scope.showPrevious = function (conceptSetName, event) {
                event.stopPropagation();
                $timeout(function () {
                    $scope.$broadcast('event:showPrevious' + conceptSetName);
                });
            };
            $scope.isInEditEncounterMode = function () {
                return $stateParams.encounterUuid !== undefined && $stateParams.encounterUuid !== 'active';
            };

            $scope.computeField = function (conceptSet, event) {
                event.stopPropagation();
                $scope.consultation.preSaveHandler.fire();
                var defaultRetrospectiveVisitType = clinicalAppConfigService.getVisitTypeForRetrospectiveEntries();

                var encounterData = new Bahmni.Clinical.EncounterTransactionMapper().map(angular.copy($scope.consultation), $scope.patient, sessionService.getLoginLocationUuid(),
                    retrospectiveEntryService.getRetrospectiveEntry(), defaultRetrospectiveVisitType, $scope.isInEditEncounterMode());
                encounterData = encounterService.buildEncounter(encounterData);
                encounterData.drugOrders = [];

                var conceptSetData = {name: conceptSet.conceptName, uuid: conceptSet.uuid};
                var data = {
                    encounterModifierObservations: encounterData.observations,
                    drugOrders: encounterData.drugOrders,
                    conceptSetData: conceptSetData,
                    patientUuid: encounterData.patientUuid,
                    encounterDateTime: encounterData.encounterDateTime
                };

                spinner.forPromise(treatmentConfig().then(function (treatmentConfig) {
                    $scope.treatmentConfiguration = treatmentConfig;
                    return conceptSetService.getComputedValue(data);
                }).then(function (response) {
                    response = response.data;
                    copyValues($scope.consultation.observations, response.encounterModifierObservations);
                    $scope.consultation.newlyAddedTreatments = $scope.consultation.newlyAddedTreatments || [];
                    response.drugOrders.forEach(function (drugOrder) {
                        $scope.consultation.newlyAddedTreatments.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, $scope.treatmentConfiguration));
                    });
                }));
            };

            $scope.canRemove = function (index) {
                var observations = $scope.allTemplates[index].observations;
                if (observations === undefined || _.isEmpty(observations)) {
                    return true;
                }
                return observations[0].uuid === undefined;
            };

            $scope.clone = function (index) {
                var clonedObj = $scope.allTemplates[index].clone();
                $scope.allTemplates.splice(index + 1, 0, clonedObj);
                $.scrollTo('#concept-set-' + (index + 1), 200, {offset: {top: -400}});
            };

            $scope.clonePanelConceptSet = function (conceptSet) {
                var index = _.findIndex($scope.allTemplates, conceptSet);
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_ADDED_SUCCESS_KEY", {label: $scope.allTemplates[index].label}));
                $scope.clone(index);
                $scope.showLeftPanelConceptSet($scope.allTemplates[index + 1]);
            };

            $scope.isClonedSection = function (conceptSetTemplate, allTemplates) {
                if (allTemplates) {
                    var index = allTemplates.indexOf(conceptSetTemplate);
                    return (index > 0) ? allTemplates[index].label == allTemplates[index - 1].label : false;
                }
                return false;
            };

            $scope.isLastClonedSection = function (conceptSetTemplate) {
                var index = _.findIndex($scope.allTemplates, conceptSetTemplate);
                if ($scope.allTemplates) {
                    if (index == $scope.allTemplates.length - 1 || $scope.allTemplates[index].label != $scope.allTemplates[index + 1].label) {
                        return true;
                    }
                }
                return false;
            };

            $scope.remove = function (index) {
                var label = $scope.allTemplates[index].label;
                var currentTemplate = $scope.allTemplates[index];
                var anotherTemplate = _.find($scope.allTemplates, function (template) {
                    return template.label == currentTemplate.label && template !== currentTemplate;
                });
                if (anotherTemplate) {
                    $scope.allTemplates.splice(index, 1);
                }
                else {
                    var clonedObj = $scope.allTemplates[index].clone();
                    $scope.allTemplates[index] = clonedObj;
                    $scope.allTemplates[index].isAdded = false;
                    $scope.allTemplates[index].isOpen = false;
                    $scope.allTemplates[index].klass = "";
                    $scope.allTemplates[index].isLoaded = false;
                }
                $scope.leftPanelConceptSet = "";
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_REMOVED_SUCCESS_KEY", {label: label}));
            };

            $scope.openActiveForm = function (conceptSet) {
                if (conceptSet && conceptSet.klass == 'active' && conceptSet != $scope.leftPanelConceptSet) {
                    $scope.showLeftPanelConceptSet(conceptSet);
                }
                return conceptSet.klass;
            };

            var copyValues = function (existingObservations, modifiedObservations) {
                existingObservations.forEach(function (observation, index) {
                    if (observation.groupMembers && observation.groupMembers.length > 0) {
                        copyValues(observation.groupMembers, modifiedObservations[index].groupMembers);
                    } else {
                        observation.value = modifiedObservations[index].value;
                    }
                });
            };

            var collapseExistingActiveSection = function (section) {
                if (section) {
                    section.klass = "";
                    section.isOpen = false;
                    section.isLoaded = false;
                }
            };

            $scope.showLeftPanelConceptSet = function (selectedConceptSet) {
                collapseExistingActiveSection($scope.leftPanelConceptSet);
                $scope.leftPanelConceptSet = selectedConceptSet;
                $scope.leftPanelConceptSet.isOpen = true;
                $scope.leftPanelConceptSet.isLoaded = true;
                $scope.leftPanelConceptSet.klass = "active";
                $scope.leftPanelConceptSet.atLeastOneValueIsSet = selectedConceptSet.hasSomeValue();
                $scope.leftPanelConceptSet.isAdded = true;
                $scope.consultation.lastvisited = selectedConceptSet.id || selectedConceptSet.formUuid;
                $(window).scrollTop(0);
            };

            $scope.focusOnErrors = function () {
                var errorMessage = $scope.leftPanelConceptSet.errorMessage ? $scope.leftPanelConceptSet.errorMessage : "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}";
                messagingService.showMessage('error', errorMessage);
                $scope.$parent.$parent.$broadcast("event:errorsOnForm");
            };

            $scope.isFormTemplate = function (data) {
                return data.formUuid;
            };

            $timeout(init);
        }])
    .directive('conceptSetGroup', function () {
        return {
            restrict: 'EA',
            scope: {
                conceptSetGroupExtensionId: "=?",
                observations: "=",
                allTemplates: "=",
                context: "=",
                autoScrollEnabled: "=",
                patient: "=",
                consultation: "="

            },
            controller: 'ConceptSetGroupController',
            templateUrl: '../common/concept-set/views/conceptSetGroup.html'
        };
    });

'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('conceptSet', ['contextChangeHandler', 'appService', 'observationsService', 'messagingService', 'conceptSetService', 'conceptSetUiConfigService', 'spinner',
        function (contextChangeHandler, appService, observationsService, messagingService, conceptSetService, conceptSetUiConfigService, spinner) {
            var controller = function ($scope) {
                var conceptSetName = $scope.conceptSetName;
                var ObservationUtil = Bahmni.Common.Obs.ObservationUtil;
                var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
                var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
                var validationHandler = $scope.validationHandler() || contextChangeHandler;
                var id = "#" + $scope.sectionId;

                $scope.atLeastOneValueIsSet = $scope.atLeastOneValueIsSet || false;
                $scope.conceptSetRequired = false;
                $scope.showTitleValue = $scope.showTitle();
                $scope.numberOfVisits = conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].numberOfVisits ? conceptSetUIConfig[conceptSetName].numberOfVisits : null;
                $scope.hideAbnormalButton = conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].hideAbnormalButton;

                var focusFirstObs = function () {
                    if ($scope.conceptSetFocused && $scope.rootObservation.groupMembers && $scope.rootObservation.groupMembers.length > 0) {
                        var firstObs = _.find($scope.rootObservation.groupMembers, function (obs) {
                            return obs.isFormElement && obs.isFormElement();
                        });
                        if (firstObs) {
                            firstObs.isFocused = true;
                        }
                    }
                };

                var updateObservationsOnRootScope = function () {
                    if ($scope.rootObservation) {
                        for (var i = 0; i < $scope.observations.length; i++) {
                            if ($scope.observations[i].concept.uuid === $scope.rootObservation.concept.uuid) {
                                $scope.observations[i] = $scope.rootObservation;
                                return;
                            }
                        }
                        $scope.observations.push($scope.rootObservation);
                    }
                };

                var getObservationsOfCurrentTemplate = function () {
                    return _.filter($scope.observations, function (observation) {
                        return _.toLower(observation.conceptSetName) === _.toLower($scope.rootObservation.concept.name);
                    });
                };

                var getDefaults = function () {
                    var conceptSetUI = appService.getAppDescriptor().getConfigValue("conceptSetUI");
                    if (!conceptSetUI || !conceptSetUI.defaults) {
                        return;
                    }
                    return conceptSetUI.defaults || {};
                };

                var getCodedAnswerWithDefaultAnswerString = function (defaults, groupMember) {
                    var possibleAnswers = groupMember.possibleAnswers;
                    var defaultAnswer = defaults[groupMember.concept.name];
                    var defaultCodedAnswer;
                    if (defaultAnswer instanceof Array) {
                        defaultCodedAnswer = [];
                        _.each(defaultAnswer, function (answer) {
                            defaultCodedAnswer.push(_.find(possibleAnswers, {displayString: answer}));
                        });
                    } else {
                        defaultCodedAnswer = _.find(possibleAnswers, {displayString: defaultAnswer});
                    }
                    return defaultCodedAnswer;
                };

                var setDefaultsForGroupMembers = function (groupMembers, defaults) {
                    if (defaults) {
                        _.each(groupMembers, function (groupMember) {
                            var conceptFullName = groupMember.concept.name;
                            var present = _.includes(_.keys(defaults), conceptFullName);
                            if (present && groupMember.value == undefined) {
                                if (groupMember.concept.dataType == "Coded") {
                                    setDefaultsForCodedObservations(groupMember, defaults);
                                } else {
                                    groupMember.value = defaults[conceptFullName];
                                }
                            }
                            if (groupMember.groupMembers && groupMember.groupMembers.length > 0) {
                                setDefaultsForGroupMembers(groupMember.groupMembers, defaults);
                                if (groupMember instanceof Bahmni.ConceptSet.ObservationNode && defaults[groupMember.label] && groupMember.abnormalObs && groupMember.abnormalObs.value == undefined) {
                                    groupMember.onValueChanged(groupMember.value);
                                }
                            }
                        });
                    }
                };

                var setDefaultsForCodedObservations = function (observation, defaults) {
                    var defaultCodedAnswer = getCodedAnswerWithDefaultAnswerString(defaults, observation);
                    if (observation.isMultiSelect) {
                        if (!observation.hasValue()) {
                            _.each(defaultCodedAnswer, function (answer) {
                                observation.selectAnswer(answer);
                            });
                        }
                    } else if (!(defaultCodedAnswer instanceof Array)) {
                        observation.value = defaultCodedAnswer;
                    }
                };

                var getFlattenedObsValues = function (flattenedObs) {
                    return _.reduce(flattenedObs, function (flattenedObsValues, obs) {
                        if (flattenedObsValues[obs.concept.name + '|' + obs.uniqueId] == undefined) {
                            if (obs.isMultiSelect) {
                                var selectedObsConceptNames = [];
                                _.each(obs.selectedObs, function (observation) {
                                    if (!observation.voided) {
                                        selectedObsConceptNames.push(observation.value.name);
                                    }
                                    if (!observation.voided) {
                                        selectedObsConceptNames.push(observation.value.name);
                                    }
                                });
                                flattenedObsValues[obs.concept.name + '|' + obs.uniqueId] = selectedObsConceptNames;
                            } else if (obs.conceptUIConfig.multiSelect) {
                                var alreadyProcessedMultiSelect = [];
                                _.each(_.keys(flattenedObsValues), function (eachObsKey) {
                                    eachObsKey.split('|')[0] == obs.concept.name && alreadyProcessedMultiSelect.push(eachObsKey);
                                });
                                if (alreadyProcessedMultiSelect.length < 2) {
                                    flattenedObsValues[obs.concept.name + '|' + obs.uniqueId] = flattenedObsValues[obs.concept.name + '|' + undefined];
                                    // Set the individual Observation of Multi Select to be the MultiSelect Obs
                                }
                            } else if (obs.value instanceof Object) {
                                flattenedObsValues[obs.concept.name + '|' + obs.uniqueId] = (obs.value.name instanceof Object) ? obs.value.name.name : obs.value.name;
                            } else {
                                flattenedObsValues[obs.concept.name + '|' + obs.uniqueId] = obs.value;
                            }
                        }
                        return flattenedObsValues;
                    }, {});
                };

                var clearFieldValuesOnDisabling = function (obs) {
                    obs.comment = undefined;
                    if (obs.value || obs.isBoolean) {
                        obs.value = undefined;
                    } else if (obs.isMultiSelect) {
                        for (var key in obs.selectedObs) {
                            if (!obs.selectedObs[key].voided) {
                                obs.toggleSelection(obs.selectedObs[key].value);
                            }
                        }
                    }
                };

                var setObservationState = function (obsArray, disable, error, hide) {
                    if (!_.isEmpty(obsArray)) {
                        _.each(obsArray, function (obs) {
                            obs.disabled = disable || hide;
                            obs.error = error;
                            obs.hide = hide;
                            if (hide || obs.disabled) {
                                clearFieldValuesOnDisabling(obs);
                            }
                            if (obs.groupMembers) {
                                _.each(obs.groupMembers, function (groupMember) {
                                    // TODO : Hack to fix issue with formconditions on multiselect - Swathi
                                    groupMember && setObservationState([groupMember], disable, error, hide);
                                });
                            }
                        });
                    }
                };

                var processConditions = function (flattenedObs, fields, disable, error, hide) {
                    _.each(fields, function (field) {
                        var matchingObsArray = [];
                        var clonedObsInSameGroup;
                        flattenedObs.forEach(function (obs) {
                            if (clonedObsInSameGroup != false && obs.concept.name == field) {
                                matchingObsArray.push(obs);
                                clonedObsInSameGroup = true;
                            } else if (clonedObsInSameGroup && obs.concept.name != field) {
                                clonedObsInSameGroup = false;
                            }
                        });

                        if (!_.isEmpty(matchingObsArray)) {
                            setObservationState(matchingObsArray, disable, error, hide);
                        } else {
                            messagingService.showMessage("error", "No element found with name : " + field);
                        }
                    });
                };

                var runFormConditionForObs = function (enableCase, formName, formCondition, conceptName, flattenedObs) {
                    var conceptSetObsValues = getFlattenedObsValues(flattenedObs);
                    _.each(_.keys(conceptSetObsValues), function (eachObsKey) {
                        if (eachObsKey.split('|')[0] == conceptName && eachObsKey.split('|')[1] != 'undefined') {
                            var valueMap = _.reduce(conceptSetObsValues, function (conceptSetValueMap, obsValue, conceptName) {
                                conceptSetValueMap[conceptName.split('|')[0]] = obsValue;
                                return conceptSetValueMap;
                            }, {});
                            var conditions = formCondition(formName, valueMap, $scope.patient);
                            if (!_.isUndefined(conditions)) {
                                if (conditions.error && !_.isEmpty(conditions.error)) {
                                    messagingService.showMessage('error', conditions.error);
                                    processConditions(flattenedObs, [conceptName], false, true, false);
                                } else {
                                    enableCase && processConditions(flattenedObs, [conceptName], false, false, false);
                                }
                                processConditions(flattenedObs, conditions.disable, true);
                                processConditions(flattenedObs, conditions.enable, false);
                                processConditions(flattenedObs, conditions.show, false, undefined, false);
                                processConditions(flattenedObs, conditions.hide, false, undefined, true);
                                _.each(conditions.enable, function (subConditionConceptName) {
                                    var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[subConditionConceptName];
                                    if (conditionFn != null) {
                                        runFormConditionForObs(true, formName, conditionFn, subConditionConceptName, flattenedObs);
                                    }
                                });
                                _.each(conditions.disable, function (subConditionConceptName) {
                                    var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[subConditionConceptName];
                                    if (conditionFn != null) {
                                        _.each(flattenedObs, function (obs) {
                                            if (obs.concept.name == subConditionConceptName) {
                                                runFormConditionForObs(false, formName, conditionFn, subConditionConceptName, flattenedObs);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                };

                var updateFormConditions = function (observationsOfCurrentTemplate, rootObservation) {
                    if (Bahmni.ConceptSet.FormConditions.rules) {
                        runFormConditionForAllObsRecursively(rootObservation.concept.name, rootObservation);
                    }
                };

                var runFormConditionForAllObsRecursively = function (formName, rootObservation) {
                    _.each(rootObservation.groupMembers, function (observation) {
                        var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[observation.concept.name];
                        if (conditionFn != null) {
                            var flattenedObs = ObservationUtil.flattenObsToArray([rootObservation]);
                            runFormConditionForObs(false, formName, conditionFn, observation.concept.name, flattenedObs);
                        }
                        if (observation.groupMembers && observation.groupMembers.length > 0) {
                            runFormConditionForAllObsRecursively(formName, observation);
                        }
                    });
                };
                var addDummyImage = function () {
                    _.each($scope.rootObservation.groupMembers, function (observation) {
                        addDummyImageObservationForSavedObs(observation, $scope.rootObservation);
                    });
                };
                var addDummyImageObservationForSavedObs = function (observation, rootObservation) {
                    _.each(observation.groupMembers, function (childObservation) {
                        addDummyImageObservationForSavedObs(childObservation, observation);
                    });
                    if (observation.getControlType() === 'image' && observation.value && rootObservation.groupMembers.indexOf(observation) === rootObservation.groupMembers.length - 1) {
                        rootObservation.groupMembers.push(observation.cloneNew());
                        return;
                    }
                };
                var init = function () {
                    return conceptSetService.getConcept({
                        name: conceptSetName,
                        v: "bahmni"
                    }).then(function (response) {
                        $scope.conceptSet = response.data.results[0];
                        $scope.rootObservation = $scope.conceptSet ? observationMapper.map($scope.observations, $scope.conceptSet, conceptSetUIConfig) : null;
                        if ($scope.rootObservation) {
                            $scope.rootObservation.conceptSetName = $scope.conceptSetName;
                            focusFirstObs();
                            updateObservationsOnRootScope();
                            var groupMembers = getObservationsOfCurrentTemplate()[0].groupMembers;
                            var defaults = getDefaults();
                            addDummyImage();
                            setDefaultsForGroupMembers(groupMembers, defaults);
                            var observationsOfCurrentTemplate = getObservationsOfCurrentTemplate();
                            updateFormConditions(observationsOfCurrentTemplate, $scope.rootObservation);
                        } else {
                            $scope.showEmptyConceptSetMessage = true;
                        }
                    }).catch(function (error) {
                        messagingService.showMessage('error', error.message);
                    });
                };
                spinner.forPromise(init(), id);

                var validateObservationTree = function () {
                    if (typeof $scope.rootObservation === "undefined" || $scope.rootObservation === null) {
                        return {allow: true, errorMessage: null };
                    }
                    $scope.atLeastOneValueIsSet = $scope.rootObservation && $scope.rootObservation.atLeastOneValueSet();
                    $scope.conceptSetRequired = $scope.required ? $scope.required : true;
                    var nodes = $scope.rootObservation && findInvalidNodes($scope.rootObservation.groupMembers, $scope.rootObservation);
                    return {allow: !nodes.status, errorMessage: nodes.message};
                }; // TODO: Write unit test for this function

                var findInvalidNodes = function (members, parentNode) {
                    var errorMessage = null;
                    var status = members.some(function (childNode) {
                        if (childNode.voided) {
                            return false;
                        }
                        var groupMembers = childNode.groupMembers || [];
                        for (var index in groupMembers) {
                            var information = groupMembers[index].groupMembers && groupMembers[index].groupMembers.length ? findInvalidNodes(groupMembers[index].groupMembers, groupMembers[index]) : validateChildNode(groupMembers[index], childNode);
                            if (information.status) {
                                errorMessage = information.message;
                                return true;
                            }
                        }
                        information = validateChildNode(childNode, parentNode);
                        if (information.status) {
                            errorMessage = information.message;
                            return true;
                        }
                        return !childNode.isValid($scope.atLeastOneValueIsSet, $scope.conceptSetRequired);
                    });
                    return {message: errorMessage, status: status};
                };
                var validateChildNode = function (childNode, parentNode) {
                    var errorMessage;
                    if (childNode.possibleAnswers && !childNode.possibleAnswers.length) {
                        if (typeof childNode.isValueInAbsoluteRange == 'function' && !childNode.isValueInAbsoluteRange()) {
                            errorMessage = "The value you entered (red field) is outside the range of allowable values for that record. Please check the value.";
                            return {message: errorMessage, status: true};
                        }

                        if (childNode.isNumeric()) {
                            if (!childNode.isValidNumeric()) {
                                errorMessage = "Please enter Integer value, decimal value is not allowed";
                                return {message: errorMessage, status: true};
                            }
                            if (parentNode) {
                                if (!childNode.isValidNumericValue() || !parentNode.isValidNumericValue()) {
                                    errorMessage = "Please enter Numeric values";
                                    return {message: errorMessage, status: true};
                                }
                            } else {
                                if (!childNode.isValidNumericValue()) {
                                    errorMessage = "Please enter Numeric values";
                                    return {message: errorMessage, status: true};
                                }
                            }
                        }
                    }
                    return {status: false};
                };

                validationHandler.add(validateObservationTree);

                var cleanUpListenerShowPrevious = $scope.$on('event:showPrevious' + conceptSetName, function () {
                    return spinner.forPromise(observationsService.fetch($scope.patient.uuid, $scope.conceptSetName, null, $scope.numberOfVisits, null, true), id).then(function (response) {
                        var recentObservations = ObservationUtil.flattenObsToArray(response.data);
                        var conceptSetObservation = $scope.observations.filter(function (observation) {
                            return observation.conceptSetName === $scope.conceptSetName;
                        });
                        ObservationUtil.flattenObsToArray(conceptSetObservation).forEach(function (obs) {
                            var correspondingRecentObs = _.filter(recentObservations, function (recentObs) {
                                return obs.concept.uuid === recentObs.concept.uuid;
                            });
                            if (correspondingRecentObs != null && correspondingRecentObs.length > 0) {
                                correspondingRecentObs.sort(function (obs1, obs2) {
                                    return new Date(obs2.encounterDateTime) - new Date(obs1.encounterDateTime);
                                });
                                obs.previous = correspondingRecentObs.map(function (previousObs) {
                                    return {
                                        value: Bahmni.Common.Domain.ObservationValueMapper.map(previousObs),
                                        date: previousObs.observationDateTime
                                    };
                                });
                            }
                        });
                    });
                });

                var deregisterAddMore = $scope.$root.$on("event:addMore", function (event, observation) {
                    updateFormConditions([observation], observation);
                });

                var deregisterObservationUpdated = $scope.$root.$on("event:observationUpdated-" + conceptSetName, function (event, conceptName, rootObservation) {
                    var formName = rootObservation.concept.name;
                    var formCondition = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[conceptName];
                    if (formCondition) {
                        var flattenedObs = ObservationUtil.flattenObsToArray([rootObservation]);
                        runFormConditionForObs(true, formName, formCondition, conceptName, flattenedObs);
                    }
                });

                $scope.$on('$destroy', function () {
                    deregisterObservationUpdated();
                    deregisterAddMore();
                    cleanUpListenerShowPrevious();
                });
            };

            return {
                restrict: 'E',
                scope: {
                    conceptSetName: "=",
                    observations: "=?",
                    required: "=?",
                    showTitle: "&",
                    validationHandler: "&",
                    patient: "=",
                    conceptSetFocused: "=?",
                    collapseInnerSections: "=?",
                    atLeastOneValueIsSet: "=?",
                    sectionId: "="
                },
                templateUrl: '../common/concept-set/views/conceptSet.html',
                controller: controller
            };
        }]);

'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('concept', ['RecursionHelper', 'spinner', '$filter', 'messagingService',
        function (RecursionHelper, spinner, $filter, messagingService) {
            var link = function (scope) {
                var hideAbnormalbuttonConfig = scope.observation && scope.observation.conceptUIConfig && scope.observation.conceptUIConfig['hideAbnormalButton'];

                scope.now = moment().format("YYYY-MM-DD hh:mm:ss");
                scope.showTitle = scope.showTitle === undefined ? true : scope.showTitle;
                scope.hideAbnormalButton = hideAbnormalbuttonConfig == undefined ? scope.hideAbnormalButton : hideAbnormalbuttonConfig;

                scope.cloneNew = function (observation, parentObservation) {
                    observation.showAddMoreButton = function () {
                        return false;
                    };
                    var newObs = observation.cloneNew();
                    newObs.scrollToElement = true;
                    var index = parentObservation.groupMembers.indexOf(observation);
                    parentObservation.groupMembers.splice(index + 1, 0, newObs);
                    messagingService.showMessage("info", "A new " + observation.label + " section has been added");
                    scope.$root.$broadcast("event:addMore", newObs);
                };

                scope.removeClonedObs = function (observation, parentObservation) {
                    observation.voided = true;
                    var lastObservationByLabel = _.findLast(parentObservation.groupMembers, function (groupMember) {
                        return groupMember.label === observation.label && !groupMember.voided;
                    });

                    lastObservationByLabel.showAddMoreButton = function () { return true; };
                    observation.hidden = true;
                };

                scope.isClone = function (observation, parentObservation) {
                    if (parentObservation && parentObservation.groupMembers) {
                        var index = parentObservation.groupMembers.indexOf(observation);
                        return (index > 0) ? parentObservation.groupMembers[index].label == parentObservation.groupMembers[index - 1].label : false;
                    }
                    return false;
                };

                scope.isRemoveValid = function (observation) {
                    if (observation.getControlType() == 'image') {
                        return !observation.value;
                    }
                    return true;
                };

                scope.getStringValue = function (observations) {
                    return observations.map(function (observation) {
                        return observation.value + ' (' + $filter('bahmniDate')(observation.date) + ")";
                    }).join(", ");
                };

                scope.toggleSection = function () {
                    scope.collapse = !scope.collapse;
                };

                scope.isCollapsibleSet = function () {
                    return scope.showTitle == true;
                };

                scope.hasPDFAsValue = function () {
                    return scope.observation.value && (scope.observation.value.indexOf(".pdf") > 0);
                };

                scope.$watch('collapseInnerSections', function () {
                    scope.collapse = scope.collapseInnerSections && scope.collapseInnerSections.value;
                });

                scope.handleUpdate = function () {
                    scope.$root.$broadcast("event:observationUpdated-" + scope.conceptSetName, scope.observation.concept.name, scope.rootObservation);
                };

                scope.update = function (value) {
                    if (scope.getBooleanResult(scope.observation.isObservationNode)) {
                        scope.observation.primaryObs.value = value;
                    } else if (scope.getBooleanResult(scope.observation.isFormElement())) {
                        scope.observation.value = value;
                    }
                    scope.handleUpdate();
                };

                scope.getBooleanResult = function (value) {
                    return !!value;
                };
            };

            var compile = function (element) {
                return RecursionHelper.compile(element, link);
            };

            return {
                restrict: 'E',
                compile: compile,
                scope: {
                    conceptSetName: "=",
                    observation: "=",
                    atLeastOneValueIsSet: "=",
                    showTitle: "=",
                    conceptSetRequired: "=",
                    rootObservation: "=",
                    patient: "=",
                    collapseInnerSections: "=",
                    rootConcept: "&",
                    hideAbnormalButton: "="
                },
                templateUrl: '../common/concept-set/views/observation.html'
            };
        }]);

'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('buttonSelect', function () {
        return {
            restrict: 'E',
            scope: {
                observation: '=',
                abnormalObs: '=?'
            },

            link: function (scope, element, attrs) {
                if (attrs.dirtyCheckFlag) {
                    scope.hasDirtyFlag = true;
                }
            },
            controller: function ($scope) {
                $scope.isSet = function (answer) {
                    return $scope.observation.hasValueOf(answer);
                };

                $scope.select = function (answer) {
                    $scope.observation.toggleSelection(answer);
                    if ($scope.$parent.observation && typeof $scope.$parent.observation.onValueChanged == 'function') {
                        $scope.$parent.observation.onValueChanged();
                    }
                    $scope.$parent.handleUpdate();
                };

                $scope.getAnswerDisplayName = function (answer) {
                    var shortName = answer.names ? _.first(answer.names.filter(function (name) {
                        return name.conceptNameType === 'SHORT';
                    })) : null;
                    return shortName ? shortName.name : answer.displayString;
                };
            },
            templateUrl: '../common/concept-set/views/buttonSelect.html'
        };
    });

'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('stepper', function () {
        return {
            restrict: 'E',
            require: 'ngModel',
            replace: true,
            scope: { ngModel: '=',
                obs: '=',
                ngClass: '=',
                focusMe: '='
            },
            template: '<div class="stepper clearfix">' +
                        '<button ng-click="decrement()" class="stepper__btn stepper__minus" ng-disabled="obs.disabled">-</button>' +
                        '<input id="{{::obs.uniqueId}}" obs-constraints ng-model="ngModel" obs="::obs" ng-class="ngClass" focus-me="focusMe" type="text" class="stepper__field" ng-disabled="obs.disabled" />' +
                        '<button ng-click="increment()" class="stepper__btn stepper__plus"  ng-disabled="obs.disabled">+</button>' +
                  '</div> ',

            link: function (scope, element, attrs, ngModelController) {
 // Specify how UI should be updated
                ngModelController.$render = function () {
//          element.html(ngModelController.$viewValue || '');
                };

            // when model change, cast to integer
                ngModelController.$formatters.push(function (value) {
                    return parseInt(value, 10);
                });

            // when view change, cast to integer
                ngModelController.$parsers.push(function (value) {
                    return parseInt(value, 10);
                });

                scope.increment = function () {
                    if (scope.obs.concept.hiNormal != null) {
                        var currValue = (isNaN(ngModelController.$viewValue) ? 0 : ngModelController.$viewValue);
                        if (currValue < scope.obs.concept.hiNormal) {
                            updateModel(+1);
                        }
                    } else {
                        updateModel(+1);
                    }
                };
                scope.decrement = function () {
                    if (scope.obs.concept.lowNormal != null) {
                        var currValue = (isNaN(ngModelController.$viewValue) ? 0 : ngModelController.$viewValue);
                        if (currValue > scope.obs.concept.lowNormal) {
                            updateModel(-1);
                        }
                    } else {
                        updateModel(-1);
                    }
                };
                function updateModel (offset) {
                    var currValue = 0;
                    if (isNaN(ngModelController.$viewValue)) {
                        if (scope.obs.concept.lowNormal != null) {
                            currValue = scope.obs.concept.lowNormal - offset; // To mention the start point for Plus And Minus
                            // if - or + is pressed on empty field, set them with low value or 0
                        }
                    } else {
                        currValue = parseInt(ngModelController.$viewValue);
                    }
                    ngModelController.$setViewValue(currValue + offset);
                }
            }
        };
    });

'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('obsConstraints', function () {
        var attributesMap = {'Numeric': 'number', 'Date': 'date', 'Datetime': 'datetime'};
        var link = function ($scope, element) {
            var attributes = {};
            var obsConcept = $scope.obs.concept;
            if (obsConcept.conceptClass == Bahmni.Common.Constants.conceptDetailsClassName) {
                obsConcept = $scope.obs.primaryObs.concept;
            }
            attributes['type'] = attributesMap[obsConcept.dataType] || "text";
            if (attributes['type'] === 'number') {
                attributes['step'] = 'any';
            }
            if (obsConcept.hiNormal) {
                attributes['max'] = obsConcept.hiNormal;
            }
            if (obsConcept.lowNormal) {
                attributes['min'] = obsConcept.lowNormal;
            }
            if (attributes['type'] == 'date') {
                if ($scope.obs.conceptUIConfig == null || !$scope.obs.conceptUIConfig['allowFutureDates']) {
                    attributes['max'] = Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime();
                }
            }
            element.attr(attributes);
        };

        return {
            link: link,
            scope: {
                obs: '='
            },
            require: 'ngModel'
        };
    });

'use strict';
angular.module('bahmni.common.conceptSet')
    .directive('duration', ['contextChangeHandler', function (contextChangeHandler) {
        var link = function ($scope, element, attrs, ngModelController) {
            var setValue = function () {
                if ($scope.unitValue && $scope.measureValue) {
                    var value = $scope.unitValue * $scope.measureValue;
                    ngModelController.$setViewValue(value);
                } else {
                    ngModelController.$setViewValue(undefined);
                }
            };

            $scope.$watch('measureValue', setValue);
            $scope.$watch('unitValue', setValue);

            $scope.$watch('disabled', function (value) {
                if (value) {
                    $scope.unitValue = undefined;
                    $scope.measureValue = undefined;
                    $scope.hours = undefined;
                }
            });

            var illegalValueChecker = $scope.$watch('illegalValue', function (value) {
                $scope.illegalDurationValue = value;
                var contextChange = function () {
                    return {allow: !$scope.illegalDurationValue};
                };
                contextChangeHandler.add(contextChange);
            });

            $scope.$on('$destroy', function () {
                $scope.illegalDurationValue = false;
                illegalValueChecker();
            });
        };

        var controller = function ($scope) {
            var valueAndUnit = Bahmni.Common.Util.DateUtil.convertToUnits($scope.hours);
            $scope.units = valueAndUnit["allUnits"];
            $scope.measureValue = valueAndUnit["value"];
            $scope.unitValue = valueAndUnit["unitValueInMinutes"];
            var durations = Object.keys($scope.units).reverse();
            $scope.displayUnits = durations.map(function (duration) {
                return {"name": duration, "value": $scope.units[duration]};
            });
        };

        return {
            restrict: 'E',
            require: 'ngModel',
            controller: controller,
            scope: {
                hours: "=ngModel",
                illegalValue: "=",
                disabled: "="
            },
            link: link,
            template: '<span><input tabindex="1" style="float: left;" type="number" min="0" class="duration-value" ng-class="{\'illegalValue\': illegalValue}" ng-model=\'measureValue\' ng-disabled="disabled"/></span>' +
            '<span><select tabindex="1" ng-model=\'unitValue\' class="duration-unit" ng-class="{\'illegalValue\': illegalValue}" ng-options="displayUnit.value as displayUnit.name for displayUnit in displayUnits" ng-disabled="disabled"><option value=""></option>>' +
            '</select></span>'
        };
    }]);

'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('latestObs', function () {
        var controller = function ($scope, observationsService, $q, spinner) {
            var init = function () {
                spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.conceptNames, "latest").then(function (response) {
                    var observations = new Bahmni.Common.Obs.ObservationMapper().map(response.data, []);
                    $scope.observations = _.sortBy(observations, 'sortWeight');
                }));
            };
            init();
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: '../common/concept-set/views/latestObs.html',
            scope: {
                patientUuid: "=",
                conceptNames: "="
            }
        };
    });

'use strict';

Bahmni.ConceptSet.ConceptSetGroupValidationHandler = function (conceptSetSections) {
    var validations = [];

    this.add = function (validation) {
        validations.push(validation);
    };

    this.validate = function () {
        var errorMessage = "";
        var allConceptSetSectionsValid = true;

        validations.forEach(function (validation) {
            var validationReturn = validation();
            if (_.isEmpty(errorMessage)) {
                errorMessage = validationReturn["errorMessage"];
            }
            allConceptSetSectionsValid = allConceptSetSectionsValid && validationReturn["allow"];
        });

        if (!allConceptSetSectionsValid) {
            conceptSetSections.filter(_.property('isLoaded')).forEach(function (conceptSetSection) { conceptSetSection.show(); });
        }
        return {allow: allConceptSetSectionsValid, errorMessage: errorMessage};
    };
};

'use strict';

Bahmni.ConceptSet.Observation = function (observation, savedObs, conceptUIConfig) {
    var self = this;
    angular.extend(this, observation);
    this.isObservation = true;
    this.conceptUIConfig = conceptUIConfig[this.concept.name] || [];
    this.uniqueId = _.uniqueId('observation_');
    this.erroneousValue = null;

    if (savedObs) {
        this.uuid = savedObs.uuid;
        this.value = savedObs.value;
        this.observationDateTime = savedObs.observationDateTime;
        this.provider = savedObs.provider;
    } else {
        this.value = this.conceptUIConfig.defaultValue;
    }

    Object.defineProperty(this, 'autocompleteValue', {
        enumerable: true,
        get: function () {
            return (this.value != null && (typeof this.value === "object")) ? this.value.name : this.value;
        },
        set: function (newValue) {
            this.__prevValue = this.value;
            this.value = newValue;
        }
    });

    Object.defineProperty(this, 'value', {
        enumerable: true,
        get: function () {
            if (self._value != null) {
                return self._value;
            }
            if (savedObs) {
                if (typeof (savedObs.value) === "object" && savedObs.value) {
                    savedObs.value['displayString'] = (savedObs.value.shortName ? savedObs.value.shortName : savedObs.value.name);
                }
            }
            return savedObs ? savedObs.value : undefined;
        },
        set: function (newValue) {
            self.__prevValue = this.value;
            self._value = newValue;
            if (!newValue) {
                savedObs = null;
            }
            self.onValueChanged();
        }
    });

    var cloneNonTabularObs = function (oldObs) {
        var newGroupMembers = [];
        oldObs.groupMembers.forEach(function (member) {
            if (member.isTabularObs === undefined) {
                var clone = member.cloneNew();
                clone.hidden = member.hidden;
                newGroupMembers.push(clone);
            }
        });
        return newGroupMembers;
    };

    var getTabularObs = function (oldObs) {
        var tabularObsList = [];
        oldObs.groupMembers.forEach(function (member) {
            if (member.isTabularObs !== undefined) {
                tabularObsList.push(member);
            }
        });
        return tabularObsList;
    };

    var cloneTabularObs = function (oldObs, tabularObsList) {
        tabularObsList = _.map(tabularObsList, function (tabularObs) {
            var matchingObsList = _.filter(oldObs.groupMembers, function (member) {
                return member.concept.name == tabularObs.concept.name;
            });
            return new Bahmni.ConceptSet.TabularObservations(matchingObsList, oldObs, conceptUIConfig);
        });
        tabularObsList.forEach(function (tabularObs) {
            oldObs.groupMembers.push(tabularObs);
        });
        return oldObs;
    };

    this.cloneNew = function () {
        var oldObs = angular.copy(observation);
        if (oldObs.groupMembers && oldObs.groupMembers.length > 0) {
            oldObs.groupMembers = _.filter(oldObs.groupMembers, function (member) {
                return !member.isMultiSelect;
            });
            var newGroupMembers = cloneNonTabularObs(oldObs);
            var tabularObsList = getTabularObs(oldObs);
            oldObs.groupMembers = newGroupMembers;
            if (!_.isEmpty(tabularObsList)) {
                oldObs = cloneTabularObs(oldObs, tabularObsList);
            }
        }
        new Bahmni.ConceptSet.MultiSelectObservations(conceptUIConfig).map(oldObs.groupMembers);
        var clone = new Bahmni.ConceptSet.Observation(oldObs, null, conceptUIConfig);
        clone.comment = undefined;
        clone.disabled = this.disabled;
        return clone;
    };
};

Bahmni.ConceptSet.Observation.prototype = {
    displayValue: function () {
        if (this.possibleAnswers.length > 0) {
            for (var i = 0; i < this.possibleAnswers.length; i++) {
                if (this.possibleAnswers[i].uuid === this.value) {
                    return this.possibleAnswers[i].display;
                }
            }
        } else {
            return this.value;
        }
    },

    isGroup: function () {
        if (this.groupMembers) {
            return this.groupMembers.length > 0;
        }
        return false;
    },

    isComputed: function () {
        return this.concept.conceptClass === "Computed";
    },

    isComputedAndEditable: function () {
        return this.concept.conceptClass === "Computed/Editable";
    },

    isNumeric: function () {
        return this.getDataTypeName() === "Numeric";
    },

    isValidNumeric: function () {
        if (!this.isDecimalAllowed()) {
            if (this.value && this.value.toString().indexOf('.') >= 0) {
                return false;
            }
        }
        return true;
    },
    isValidNumericValue: function () {
        var element = document.getElementById(this.uniqueId);
        if (this.value === "" && element) {
            return element.checkValidity();
        }
        return true;
    },

    isText: function () {
        return this.getDataTypeName() === "Text";
    },

    isCoded: function () {
        return this.getDataTypeName() === "Coded";
    },

    isDatetime: function () {
        return this.getDataTypeName() === "Datetime";
    },

    isImage: function () {
        return this.concept.conceptClass == Bahmni.Common.Constants.imageClassName;
    },

    isVideo: function () {
        return this.concept.conceptClass == Bahmni.Common.Constants.videoClassName;
    },

    getDataTypeName: function () {
        return this.concept.dataType;
    },

    isDecimalAllowed: function () {
        return this.concept.allowDecimal;
    },

    isDateDataType: function () {
        return 'Date'.indexOf(this.getDataTypeName()) != -1;
    },

    isVoided: function () {
        return this.voided === undefined ? false : this.voided;
    },

    getPossibleAnswers: function () {
        return this.possibleAnswers;
    },

    getHighAbsolute: function () {
        return this.concept.hiAbsolute;
    },

    getLowAbsolute: function () {
        return this.concept.lowAbsolute;
    },

    isHtml5InputDataType: function () {
        return ['Date', 'Numeric'].indexOf(this.getDataTypeName()) != -1;
    },

    isGrid: function () {
        return this.conceptUIConfig.grid;
    },

    isButtonRadio: function () {
        return this.conceptUIConfig.buttonRadio;
    },

    getControlType: function () {
        if (this.hidden) {
            return "hidden";
        }
        if (this.conceptUIConfig.freeTextAutocomplete) {
            return "freeTextAutocomplete";
        }
        if (this.isHtml5InputDataType()) {
            return "html5InputDataType";
        }
        if (this.isImage()) {
            return "image";
        }
        if (this.isVideo()) {
            return "video";
        }
        if (this.isText()) {
            return "text";
        }
        if (this.isCoded()) {
            return this._getCodedControlType();
        }
        if (this.isGrid()) {
            return "grid";
        }
        if (this.isDatetime()) {
            return "datetime";
        }
        return "unknown";
    },

    canHaveComment: function () {
        return this.conceptUIConfig.disableAddNotes ? !this.conceptUIConfig.disableAddNotes : (!this.isText() && !this.isImage() && !this.isVideo());
    },

    canAddMore: function () {
        return this.conceptUIConfig.allowAddMore == true;
    },

    isStepperControl: function () {
        if (this.isNumeric()) {
            return this.conceptUIConfig.stepper == true;
        }
    },

    isConciseText: function () {
        return this.conceptUIConfig.conciseText == true;
    },

    _getCodedControlType: function () {
        var conceptUIConfig = this.conceptUIConfig;
        if (conceptUIConfig.autocomplete) {
            return "autocomplete";
        }
        if (conceptUIConfig.dropdown) {
            return "dropdown";
        }
        return "buttonselect";
    },

    onValueChanged: function () {
        if (this.isNumeric()) {
            this.setErroneousValue();
        }
    },

    setErroneousValue: function () {
        if (this.hasValue()) {
            var erroneousValue = this.value > (this.concept.hiAbsolute || Infinity) || this.value < (this.concept.lowAbsolute || 0);
            this.erroneousValue = erroneousValue;
        } else {
            this.erroneousValue = undefined;
        }
    },

    getInputType: function () {
        return this.getDataTypeName();
    },

    atLeastOneValueSet: function () {
        if (this.isGroup()) {
            return this.groupMembers.some(function (childNode) {
                return childNode.atLeastOneValueSet();
            });
        } else {
            return this.hasValue() && !this.isVoided();
        }
    },

    hasValue: function () {
        var value = this.value;
        if (value === false) {
            return true;
        }
        if (value === 0) {
            return true;
        } //! value ignores 0
        if (value === '' || !value) {
            return false;
        }
        if (value instanceof Array) {
            return value.length > 0;
        }
        return true;
    },

    hasValueOf: function (value) {
        if (!this.value || !value) {
            return false;
        }
        return this.value == value || this.value.uuid == value.uuid;
    },

    toggleSelection: function (answer) {
        if (this.value && this.value.uuid === answer.uuid) {
            this.value = null;
        } else {
            this.value = answer;
        }
    },

    isValidDate: function () {
        if (this.isComputed()) {
            return true;
        }
        if (!this.hasValue()) {
            return true;
        }
        var date = Bahmni.Common.Util.DateUtil.parse(this.value);
        if (!this.conceptUIConfig.allowFutureDates) {
            var today = Bahmni.Common.Util.DateUtil.parse(moment().format("YYYY-MM-DD"));
            if (today < date) {
                return false;
            }
        }
        return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4;
    },

    hasInvalidDateTime: function () {
        if (this.isComputed()) {
            return false;
        }
        var date = Bahmni.Common.Util.DateUtil.parse(this.value);
        if (!this.conceptUIConfig.allowFutureDates) {
            if (moment() < date) {
                return true;
            }
        }
        return this.value === "Invalid Datetime";
    },

    isValid: function (checkRequiredFields, conceptSetRequired) {
        if (this.isNumeric() && !this.isValidNumeric()) {
            return false;
        }
        if (this.error) {
            return false;
        }
        if (this.hidden) {
            return true;
        }
        if (checkRequiredFields) {
            if (this.isGroup()) {
                return this._hasValidChildren(checkRequiredFields, conceptSetRequired);
            }
            if (conceptSetRequired && this.isRequired() && !this.hasValue()) {
                return false;
            }
            if (this.isRequired() && !this.hasValue()) {
                return false;
            }
        }
        if (this._isDateDataType()) {
            return this.isValidDate();
        }
        if (this._isDateTimeDataType()) { return !this.hasInvalidDateTime(); }
        if (this.erroneousValue) {
            return false;
        }
        if (this.getControlType() === 'autocomplete') {
            return _.isEmpty(this.value) || _.isObject(this.value);
        }
        return true;
    },

    isValueInAbsoluteRange: function () {
        if (this.erroneousValue) {
            return false;
        }
        if (this.isGroup()) {
            return this._areChildNodesInAbsoluteRange();
        }
        return true;
    },

    _isDateDataType: function () {
        return this.getDataTypeName() === 'Date';
    },

    _isDateTimeDataType: function () {
        return this.getDataTypeName() === "Datetime";
    },

    isRequired: function () {
        this.disabled = this.disabled ? this.disabled : false;
        return this.conceptUIConfig.required === true && this.disabled === false;
    },

    isFormElement: function () {
        return (!this.concept.set || this.isGrid()) && !this.isComputed();
    },

    _hasValidChildren: function (checkRequiredFields, conceptSetRequired) {
        return this.groupMembers.every(function (member) {
            return member.isValid(checkRequiredFields, conceptSetRequired);
        });
    },

    _areChildNodesInAbsoluteRange: function () {
        return this.groupMembers.every(function (member) {
            // Other than Bahmni.ConceptSet.Observation  and Bahmni.ConceptSet.ObservationNode, other concepts does not have isValueInAbsoluteRange fn
            return (typeof member.isValueInAbsoluteRange == 'function') ? member.isValueInAbsoluteRange() : true;
        });
    },

    markAsNonCoded: function () {
        this.markedAsNonCoded = !this.markedAsNonCoded;
    },

    toggleVoidingOfImage: function () {
        this.voided = !this.voided;
    },

    assignAddMoreButtonID: function () {
        return this.concept.name.split(' ').join('_').toLowerCase() + '_addmore_' + this.uniqueId;
    }
};

'use strict';

Bahmni.ConceptSet.BooleanObservation = function (observation, conceptUIConfig) {
    angular.extend(this, observation);

    this.isBoolean = true;
    this.conceptUIConfig = conceptUIConfig[this.concept.name] || {};

    this.cloneNew = function () {
        var clone = new Bahmni.ConceptSet.BooleanObservation(angular.copy(observation), conceptUIConfig);
        clone.value = undefined;
        clone.comment = undefined;
        clone.uuid = null;
        clone.disabled = this.disabled;
        return clone;
    };

    var possibleAnswers = [
        {displayString: "OBS_BOOLEAN_YES_KEY", value: true},
        {displayString: "OBS_BOOLEAN_NO_KEY", value: false}
    ];

    this.getPossibleAnswers = function () {
        return possibleAnswers;
    };

    this.hasValueOf = function (answer) {
        return this.value === answer.value;
    };

    this.toggleSelection = function (answer) {
        if (this.value === answer.value) {
            this.value = null;
        } else {
            this.value = answer.value;
        }
    };

    this.isFormElement = function () {
        return true;
    };

    this.getControlType = function () {
        return "buttonselect";
    };

    this.isRequired = function () {
        this.disabled = this.disabled ? this.disabled : false;
        return this.getConceptUIConfig().required === true && this.disabled === false;
    };

    this.isComputedAndEditable = function () {
        return this.concept.conceptClass === "Computed/Editable";
    };

    this.atLeastOneValueSet = function () {
        return (this.value != undefined);
    };
    this.isValid = function (checkRequiredFields, conceptSetRequired) {
        if (this.error) {
            return false;
        }
        var notYetSet = function (value) {
            return (typeof value == 'undefined' || value == null);
        };
        if (checkRequiredFields) {
            if (conceptSetRequired && this.isRequired() && notYetSet(this.value)) {
                return false;
            }
            if (this.isRequired() && notYetSet(this.value)) {
                return false;
            }
        }
        return true;
    };

    this.canHaveComment = function () {
        return this.getConceptUIConfig().disableAddNotes ? !this.getConceptUIConfig().disableAddNotes : true;
    };

    this.getConceptUIConfig = function () {
        return this.conceptUIConfig;
    };

    this.canAddMore = function () {
        return this.getConceptUIConfig().allowAddMore == true;
    };

    this.isComputed = function () {
        return this.concept.conceptClass === "Computed";
    };

    this.getDataTypeName = function () {
        return this.concept.dataType;
    };

    this.hasValue = function () {
        var value = this.value;
        if (value === false) {
            return true;
        }
        if (value === 0) {
            return true;
        } //! value ignores 0
        if (value === '' || !value) {
            return false;
        }
        if (value instanceof Array) {
            return value.length > 0;
        }
        return true;
    };

    this.isNumeric = function () {
        return this.getDataTypeName() === "Numeric";
    };

    this.isText = function () {
        return this.getDataTypeName() === "Text";
    };

    this.isCoded = function () {
        return this.getDataTypeName() === "Coded";
    };

    this._isDateTimeDataType = function () {
        return this.getDataTypeName() === "Datetime";
    };
};

'use strict';

(function () {
    var findObservationByClassName = function (groupMembers, conceptClassName) {
        return _.find(groupMembers, function (member) {
            return (member.concept.conceptClass.name === conceptClassName) || (member.concept.conceptClass === conceptClassName);
        });
    };
    var findObservationByConceptName = function (groupMembers, conceptName) {
        return _.find(groupMembers, {concept: {name: conceptName}});
    };
    var setNewObservation = function (observation, newValue) {
        if (observation) {
            observation.__prevValue = observation.value;
            observation.value = newValue;
            observation.voided = false;
        }
    };
    var voidObservation = function (observation) {
        if (observation) {
            if (observation.uuid) {
                observation.voided = true;
            } else {
                observation.value = undefined;
            }
        }
    };

    var isFreeTextAutocompleteType = function (conceptUIConfig) {
        return conceptUIConfig.autocomplete && conceptUIConfig.nonCodedConceptName && conceptUIConfig.codedConceptName;
    };

    Bahmni.ConceptSet.ObservationNode = function (observation, savedObs, conceptUIConfig, concept) {
        angular.extend(this, observation);

        this.conceptUIConfig = conceptUIConfig[concept.name.name] || (!_.isEmpty(concept.setMembers) && conceptUIConfig[concept.setMembers[0].name.name]) || {};

        this.cloneNew = function () {
            var oldObs = angular.copy(observation);
            oldObs.groupMembers = _.map(oldObs.groupMembers, function (member) {
                return member.cloneNew();
            });

            var clone = new Bahmni.ConceptSet.ObservationNode(oldObs, null, conceptUIConfig, concept);
            clone.comment = undefined;
            return clone;
        };

        var getPrimaryObservationValue = function () {
            return this.primaryObs && _.get(this, 'primaryObs.value.name') || _.get(this, 'primaryObs.value');
        };
        var setFreeTextPrimaryObservationValue = function (newValue) {
            var codedObservation = findObservationByConceptName(this.groupMembers, this.conceptUIConfig.codedConceptName);
            var nonCodedObservation = findObservationByConceptName(this.groupMembers, this.conceptUIConfig.nonCodedConceptName);
            if (typeof newValue === "object") {
                setNewObservation(codedObservation, newValue);
                voidObservation(nonCodedObservation);
                this.markedAsNonCoded = false;
            } else {
                setNewObservation(nonCodedObservation, newValue);
                voidObservation(codedObservation);
            }
            this.onValueChanged(newValue);
        };
        var setFirstObservationValue = function (newValue) {
            setNewObservation(this.primaryObs, newValue);
            this.onValueChanged(newValue);
        };
        Object.defineProperty(this, 'value', {
            enumerable: true,
            get: getPrimaryObservationValue,
            set: isFreeTextAutocompleteType(this.conceptUIConfig) ? setFreeTextPrimaryObservationValue : setFirstObservationValue
        });

        var getFreeTextPrimaryObservation = function () {
            var isAlreadySavedObservation = function (observation) {
                return _.isString(_.get(observation, 'value')) && !_.get(observation, 'voided');
            };
            var codedConceptObservation = findObservationByConceptName(this.groupMembers, this.conceptUIConfig.codedConceptName);
            var nonCodedConceptObservation = findObservationByConceptName(this.groupMembers, this.conceptUIConfig.nonCodedConceptName);

            if (isAlreadySavedObservation(nonCodedConceptObservation)) {
                return nonCodedConceptObservation;
            }
            if (!codedConceptObservation) {
                throw new Error("Configuration Error: Concept '" + this.conceptUIConfig.codedConceptName + "' is not a set member of '" + concept.name.name + "'.");
            }
            return codedConceptObservation;
        };
        var getGroupMembersWithoutClass = function (groupMembers, classNames) {
            return _.filter(groupMembers, function (member) {
                return !(_.includes(classNames, member.concept.conceptClass.name) || _.includes(classNames, member.concept.conceptClass));
            });
        };
        var getFirstObservation = function () {
            var observations = getGroupMembersWithoutClass(this.groupMembers, [Bahmni.Common.Constants.abnormalConceptClassName,
                Bahmni.Common.Constants.unknownConceptClassName,
                Bahmni.Common.Constants.durationConceptClassName]);

            if (_.isEmpty(observations)) {
                return this.groupMembers[0];
            }
            var primaryObs = observations[1] && observations[1].uuid && !observations[1].voided ? observations[1] : observations[0];
            if (observations[0].isMultiSelect) {
                return observations[0];
            }
            if (primaryObs.uuid && !primaryObs.voided) {
                return primaryObs;
            }
            return observations[1] && (observations[1].value || observations[1].value === "") && !observations[1].voided ? observations[1] : observations[0];
        };
        Object.defineProperty(this, 'primaryObs', {
            enumerable: true,
            get: isFreeTextAutocompleteType(this.conceptUIConfig) ? getFreeTextPrimaryObservation : getFirstObservation
        });

        this.isObservationNode = true;
        this.uniqueId = _.uniqueId('observation_');
        this.durationObs = findObservationByClassName(this.groupMembers, Bahmni.Common.Constants.durationConceptClassName);
        this.abnormalObs = findObservationByClassName(this.groupMembers, Bahmni.Common.Constants.abnormalConceptClassName);
        this.unknownObs = findObservationByClassName(this.groupMembers, Bahmni.Common.Constants.unknownConceptClassName);
        this.markedAsNonCoded = this.primaryObs.concept.dataType !== "Coded" && this.primaryObs.uuid;

        if (savedObs) {
            this.uuid = savedObs.uuid;
            this.observationDateTime = savedObs.observationDateTime;
        } else {
            this.value = this.conceptUIConfig.defaultValue;
        }
    };

    Bahmni.ConceptSet.ObservationNode.prototype = {
        canAddMore: function () {
            return this.conceptUIConfig.allowAddMore == true;
        },

        isStepperControl: function () {
            if (this.isNumeric()) {
                return this.conceptUIConfig.stepper == true;
            }
            return false;
        },

        getPossibleAnswers: function () {
            return this.primaryObs.concept.answers;
        },

        getCodedConcept: function () {
            return findObservationByConceptName(this.groupMembers, this.conceptUIConfig.codedConceptName).concept;
        },

        onValueChanged: function () {
            if (!this.primaryObs.hasValue() && this.abnormalObs) {
                this.abnormalObs.value = undefined;
                this.abnormalObs.erroneousValue = undefined;
            }
            if (this.primaryObs.isNumeric() && this.primaryObs.hasValue() && this.abnormalObs) {
                this.setAbnormal();
            }
//        TODO: Mihir, D3 : Hacky fix to update the datetime to current datetime on the server side. Ideal would be void the previous observation and create a new one.
            this.primaryObs.observationDateTime = null;
            if (this.unknownObs) {
                this.setUnknown();
            }
        },

        setAbnormal: function () {
            if (this.primaryObs.hasValue()) {
                var erroneousValue = this.value > (this.primaryObs.concept.hiAbsolute || Infinity) || this.value < (this.primaryObs.concept.lowAbsolute || 0);
                var valueInRange = this.value <= (this.primaryObs.concept.hiNormal || Infinity) && this.value >= (this.primaryObs.concept.lowNormal || 0);
                this.abnormalObs.value = !valueInRange;
                this.abnormalObs.erroneousValue = erroneousValue;
            } else {
                this.abnormalObs.value = undefined;
                this.abnormalObs.erroneousValue = undefined;
            }
        },

        setUnknown: function () {
            if (this.primaryObs.atLeastOneValueSet() && this.primaryObs.hasValue()) {
                this.unknownObs.value = false;
            } else {
                if (this.unknownObs.value == false) {
                    this.unknownObs.value = undefined;
                }
            }
        },

        displayValue: function () {
            if (this.possibleAnswers.length > 0) {
                for (var i = 0; i < this.possibleAnswers.length; i++) {
                    if (this.possibleAnswers[i].uuid === this.value) {
                        return this.possibleAnswers[i].display;
                    }
                }
            } else {
                return this.value;
            }
        },

        isGroup: function () {
            return false;
        },

        getControlType: function () {
            if (isFreeTextAutocompleteType(this.conceptUIConfig)) {
                return "freeTextAutocomplete";
            }
            if (this.conceptUIConfig.autocomplete) {
                return "autocomplete";
            }
            if (this.isHtml5InputDataType()) {
                return "html5InputDataType";
            }
            if (this.primaryObs.isText()) {
                return "text";
            }
            if (this.conceptUIConfig.dropdown) {
                return "dropdown";
            }
            return "buttonselect";
        },

        isHtml5InputDataType: function () {
            return ['Date', 'Numeric', 'Datetime'].indexOf(this.primaryObs.getDataTypeName()) != -1;
        },

        _isDateTimeDataType: function () {
            return this.primaryObs.getDataTypeName() === "Datetime";
        },

        isComputed: function () {
            return this.primaryObs.isComputed();
        },

        isConciseText: function () {
            return this.conceptUIConfig.conciseText === true;
        },

        isComputedAndEditable: function () {
            return this.concept.conceptClass === "Computed/Editable";
        },

        atLeastOneValueSet: function () {
            return this.primaryObs.hasValue();
        },

        doesNotHaveDuration: function () {
            if (!this.durationObs || !this.conceptUIConfig.durationRequired) {
                return false;
            } else {
                if (!this.durationObs.value) {
                    return true;
                }
                return this.durationObs.value < 0;
            }
        },

        isValid: function (checkRequiredFields, conceptSetRequired) {
            if (this.isNumeric() && (!this.isValidNumeric() || !this.isValidNumericValue())) {
                return false;
            }
            if (this.isGroup()) {
                return this._hasValidChildren(checkRequiredFields, conceptSetRequired);
            }
            if (checkRequiredFields) {
                if (conceptSetRequired && this.isRequired() && !this.primaryObs.hasValue()) {
                    return false;
                }
                if (this.isRequired() && !this.primaryObs.hasValue()) {
                    return false;
                }
                if (this.getControlType() === "freeTextAutocomplete") {
                    return this.isValidFreeTextAutocomplete();
                }
            }
            if (this.primaryObs.getDataTypeName() === "Date") {
                return this.primaryObs.isValidDate();
            }
            if (this.primaryObs.hasValue() && this.doesNotHaveDuration()) {
                return false;
            }
            if (this.abnormalObs && this.abnormalObs.erroneousValue) {
                return false;
            }
            if (this.primaryObs.hasValue() && this.primaryObs._isDateTimeDataType()) {
                return !this.hasInvalidDateTime();
            }
            if (this.getControlType() === 'autocomplete') {
                return _.isEmpty(this.primaryObs.value) || _.isObject(this.primaryObs.value);
            }
            if (this.primaryObs.hasValue() && this.primaryObs.erroneousValue) {
                return false;
            }
            return true;
        },

        isValueInAbsoluteRange: function () {
            return !(this.abnormalObs && this.abnormalObs.erroneousValue);
        },

        isValidFreeTextAutocomplete: function () {
            return !(this.primaryObs.concept.dataType !== "Coded" && !this.markedAsNonCoded && this.primaryObs.value);
        },

        isRequired: function () {
            this.disabled = this.disabled ? this.disabled : false;
            return this.conceptUIConfig.required === true && this.disabled === false;
        },

        isDurationRequired: function () {
            return !!this.conceptUIConfig.durationRequired && !!this.primaryObs.value;
        },

        isNumeric: function () {
            return this.primaryObs.getDataTypeName() === "Numeric";
        },

        isDecimalAllowed: function () {
            return this.primaryObs.concept.allowDecimal;
        },

        isValidNumeric: function () {
            if (!this.isDecimalAllowed()) {
                if (this.value && this.value.toString().indexOf('.') >= 0) {
                    return false;
                }
            }
            return true;
        },
        isValidNumericValue: function () {
            var element = document.getElementById(this.uniqueId);
            if (this.value === "" && element) {
                return element.checkValidity();
            }
            return true;
        },

        _hasValidChildren: function (checkRequiredFields, conceptSetRequired) {
            return this.groupMembers.every(function (member) {
                return member.isValid(checkRequiredFields, conceptSetRequired);
            });
        },

        markAsNonCoded: function () {
            this.markedAsNonCoded = !this.markedAsNonCoded;
        },

        toggleAbnormal: function () {
            this.abnormalObs.value = !this.abnormalObs.value;
        },

        toggleUnknown: function () {
            if (!this.unknownObs.value) {
                this.unknownObs.value = true;
            } else {
                this.unknownObs.value = undefined;
            }
        },

        assignAddMoreButtonID: function () {
            return this.concept.name.split(' ').join('_').toLowerCase() + '_addmore_' + this.uniqueId;
        },

        canHaveComment: function () {
            return this.conceptUIConfig.disableAddNotes ? !this.conceptUIConfig.disableAddNotes : true;
        },

        hasInvalidDateTime: function () {
            if (this.isComputed()) {
                return false;
            }
            var date = Bahmni.Common.Util.DateUtil.parse(this.value);
            if (!this.conceptUIConfig.allowFutureDates) {
                if (moment() < date) {
                    return true;
                }
            }
            return this.value === "Invalid Datetime";
        }

    };
})();

'use strict';

Bahmni.ConceptSet.TabularObservations = function (obsGroups, parentObs, conceptUIConfig) {
    this.parentObs = parentObs;
    this.concept = obsGroups[0] && obsGroups[0].concept;
    this.label = obsGroups[0] && obsGroups[0].label;
    this.conceptUIConfig = conceptUIConfig[this.concept.name] || {};
    this.isTabularObs = true;
    this.rows = _.map(obsGroups, function (group) {
        return new Bahmni.ConceptSet.ObservationRow(group, conceptUIConfig);
    });

    this.columns = _.map(obsGroups[0].groupMembers, function (group) {
        return group.concept;
    });

    this.cloneNew = function () {
        var old = this;
        var clone = new Bahmni.ConceptSet.TabularObservations(angular.copy(obsGroups), parentObs, conceptUIConfig);
        clone.rows = _.map(old.rows, function (row) {
            return row.cloneNew();
        });
        clone.disabled = this.disabled;
        return clone;
    };

    this.addNew = function (row) {
        var newRow = row.cloneNew();
        this.rows.push(newRow);
        this.parentObs.groupMembers.push(newRow.obsGroup);
    };

    this.remove = function (row) {
        row.void();
        this.rows.splice(this.rows.indexOf(row), 1);
        if (this.rows.length == 0) {
            this.addNew(row);
        }
    };

    this.isFormElement = function () {
        return false;
    };

    this.getControlType = function () {
        return "tabular";
    };

    this.isValid = function (checkRequiredFields, conceptSetRequired) {
        return _.every(this.rows, function (observationRow) {
            return _.every(observationRow.cells, function (conceptSetObservation) {
                return conceptSetObservation.isValid(checkRequiredFields, conceptSetRequired);
            });
        });
    };

    this.getConceptUIConfig = function () {
        return this.conceptUIConfig || {};
    };

    this.canAddMore = function () {
        return this.getConceptUIConfig().allowAddMore == true;
    };

    this.atLeastOneValueSet = function () {
        return this.rows.some(function (childNode) {
            return childNode.obsGroup.atLeastOneValueSet();
        });
    };

    this.isNumeric = function () {
        return this.concept.dataType === "Numeric";
    };
    this.isValidNumericValue = function () {
        var element = document.getElementById(this.uniqueId);
        if (this.value === "" && element) {
            return element.checkValidity();
        }
        return true;
    };
};

Bahmni.ConceptSet.ObservationRow = function (obsGroup, conceptUIConfig) {
    this.obsGroup = obsGroup;
    this.concept = obsGroup.concept;
    this.cells = obsGroup.groupMembers;
    this.void = function () {
        this.obsGroup.voided = true;
    };

    this.cloneNew = function () {
        var newObsGroup = this.obsGroup.cloneNew();
        newObsGroup.hidden = true;
        var clone = new Bahmni.ConceptSet.ObservationRow(newObsGroup, conceptUIConfig);
        clone.disabled = this.disabled;
        return clone;
    };
};

'use strict';

Bahmni.ConceptSet.MultiSelectObservations = function (conceptSetConfig) {
    var self = this;
    this.multiSelectObservationsMap = {};

    this.map = function (memberOfCollection) {
        memberOfCollection.forEach(function (member) {
            if (isMultiSelectable(member.concept, conceptSetConfig)) {
                add(member.concept, member, memberOfCollection);
            }
        });
        insertMultiSelectObsInExistingOrder(memberOfCollection);
    };

    var isMultiSelectable = function (concept, conceptSetConfig) {
        return conceptSetConfig[concept.name] && conceptSetConfig[concept.name].multiSelect;
    };

    var insertMultiSelectObsInExistingOrder = function (memberOfCollection) {
        getAll().forEach(function (multiObs) {
            var index = _.findIndex(memberOfCollection, function (member) {
                return member.concept.name === multiObs.concept.name;
            });
            memberOfCollection.splice(index, 0, multiObs);
        });
    };

    var add = function (concept, obs, memberOfCollection) {
        var conceptName = concept.name.name || concept.name;
        self.multiSelectObservationsMap[conceptName] = self.multiSelectObservationsMap[conceptName] || new Bahmni.ConceptSet.MultiSelectObservation(concept, memberOfCollection, conceptSetConfig);
        self.multiSelectObservationsMap[conceptName].add(obs);
    };

    var getAll = function () {
        return _.values(self.multiSelectObservationsMap);
    };
};

Bahmni.ConceptSet.MultiSelectObservation = function (concept, memberOfCollection, conceptSetConfig) {
    var self = this;
    this.label = concept.shortName || concept.name;
    this.isMultiSelect = true;
    this.selectedObs = {};
    this.concept = concept;
    this.concept.answers = this.concept.answers || [];
    this.groupMembers = [];
    this.provider = null;
    this.observationDateTime = "";
    this.conceptUIConfig = conceptSetConfig[this.concept.name] || {};

    this.possibleAnswers = self.concept.answers.map(function (answer) {
        var cloned = _.cloneDeep(answer);
        if (answer.name.name) {
            cloned.name = answer.name.name;
        }
        return cloned;
    });

    this.getPossibleAnswers = function () {
        return this.possibleAnswers;
    };

    this.cloneNew = function () {
        var clone = new Bahmni.ConceptSet.MultiSelectObservation(concept, memberOfCollection, conceptSetConfig);
        clone.disabled = this.disabled;
        return clone;
    };

    this.add = function (obs) {
        if (obs.value) {
            self.selectedObs[obs.value.name] = obs;

            if (!self.provider) {
                self.provider = self.selectedObs[obs.value.name].provider;
            }
            var currentObservationDateTime = self.selectedObs[obs.value.name].observationDateTime;
            if (self.observationDateTime < currentObservationDateTime) {
                self.observationDateTime = currentObservationDateTime;
            }
        }
        obs.hidden = true;
    };

    this.isComputedAndEditable = function () {
        return this.concept.conceptClass === "Computed/Editable";
    };

    this.hasValueOf = function (answer) {
        return self.selectedObs[answer.name] && !self.selectedObs[answer.name].voided;
    };

    this.toggleSelection = function (answer) {
        if (self.hasValueOf(answer)) {
            unselectAnswer(answer);
        } else {
            self.selectAnswer(answer);
        }
    };

    this.isFormElement = function () {
        return true;
    };

    this.getControlType = function () {
        var conceptConfig = this.getConceptUIConfig();
        if (this.isCoded() && conceptConfig.autocomplete == true && conceptConfig.multiSelect == true) { return "autocompleteMultiSelect"; } else if (conceptConfig.autocomplete == true) {
            return "autocomplete";
        }
        return "buttonselect";
    };

    this.atLeastOneValueSet = function () {
        var obsValue = _.filter(this.selectedObs, function (obs) {
            return obs.value;
        });
        return !_.isEmpty(obsValue);
    };

    this.hasValue = function () {
        return !_.isEmpty(this.selectedObs);
    };

    this.hasNonVoidedValue = function () {
        var hasNonVoidedValue = false;
        if (this.hasValue()) {
            angular.forEach(this.selectedObs, function (obs) {
                if (!obs.voided) {
                    hasNonVoidedValue = true;
                }
            });
        }
        return hasNonVoidedValue;
    };

    this.isValid = function (checkRequiredFields, conceptSetRequired) {
        if (this.error) {
            return false;
        }
        if (checkRequiredFields) {
            if (conceptSetRequired && this.isRequired() && !this.hasNonVoidedValue()) {
                return false;
            }
            if (this.isRequired() && !this.hasNonVoidedValue()) {
                return false;
            }
        }
        return true;
    };

    this.canHaveComment = function () {
        return false;
    };

    this.getConceptUIConfig = function () {
        return this.conceptUIConfig || {};
    };

    this.canAddMore = function () {
        return this.getConceptUIConfig().allowAddMore == true;
    };

    this.isRequired = function () {
        this.disabled = this.disabled ? this.disabled : false;
        return this.getConceptUIConfig().required === true && this.disabled === false;
    };

    var createObsFrom = function (answer) {
        var obs = newObservation(concept, answer, conceptSetConfig);
        memberOfCollection.push(obs);
        return obs;
    };

    var removeObsFrom = function (answer) {
        var obs = newObservation(concept, answer, conceptSetConfig);
        _.remove(memberOfCollection, function (member) {
            if (member.value) {
                return obs.value.displayString == member.value.displayString;
            }
            return false;
        });
    };

    this.selectAnswer = function (answer) {
        var obs = self.selectedObs[answer.name];
        if (obs) {
            obs.value = answer;
            obs.voided = false;
        } else {
            obs = createObsFrom((answer));
            self.add(obs);
        }
    };

    var unselectAnswer = function (answer) {
        var obs = self.selectedObs[answer.name];
        if (obs && obs.uuid) {
            obs.value = null;
            obs.voided = true;
        } else {
            removeObsFrom(answer);
            delete self.selectedObs[answer.name];
        }
    };

    var newObservation = function (concept, value, conceptSetConfig) {
        var observation = buildObservation(concept);
        return new Bahmni.ConceptSet.Observation(observation, {value: value}, conceptSetConfig, []);
    };

    var buildObservation = function (concept) {
        return { concept: concept, units: concept.units, label: concept.shortName || concept.name, possibleAnswers: self.concept.answers, groupMembers: [], comment: null};
    };

    this.getValues = function () {
        var values = [];
        _.values(self.selectedObs).forEach(function (obs) {
            if (obs.value) {
                values.push(obs.value.shortName || obs.value.name);
            }
        });
        return values;
    };

    this.isComputed = function () {
        return this.concept.conceptClass === "Computed";
    };

    this.getDataTypeName = function () {
        return this.concept.dataType;
    };

    this._isDateTimeDataType = function () {
        return this.getDataTypeName() === "Datetime";
    };

    this.isNumeric = function () {
        return this.getDataTypeName() === "Numeric";
    };

    this.isText = function () {
        return this.getDataTypeName() === "Text";
    };

    this.isCoded = function () {
        return this.getDataTypeName() === "Coded";
    };
};

'use strict';

Bahmni.ConceptSet.CustomRepresentationBuilder = {
    build: function (fields, childPropertyName, numberOfLevels) {
        var childPropertyRep = childPropertyName + ':{{entity_fileds}}';
        var singleEntityString = "(" + fields.concat(childPropertyRep).join(',') + ")";
        var customRepresentation = singleEntityString;
        for (var i = 0; i < numberOfLevels; i++) {
            customRepresentation = customRepresentation.replace("{{entity_fileds}}", singleEntityString);
        }
        customRepresentation = customRepresentation.replace("," + childPropertyRep, '');
        return customRepresentation;
    }
};

'use strict';

Bahmni.ConceptSet.ConceptSetSection = function (extensions, user, config, observations, conceptSet) {
    var self = this;

    self.clone = function () {
        var clonedConceptSetSection = new Bahmni.ConceptSet.ConceptSetSection(extensions, user, config, [], conceptSet);
        clonedConceptSetSection.isAdded = true;
        return clonedConceptSetSection;
    };

    var init = function () {
        self.observations = observations;
        self.options = extensions.extensionParams || {};
        self.conceptName = conceptSet.name ? conceptSet.name.name : self.options.conceptName;
        var conceptName = _.find(conceptSet.names, {conceptNameType: "SHORT"}) || _.find(conceptSet.names, {conceptNameType: "FULLY_SPECIFIED"});
        conceptName = conceptName ? conceptName.name : conceptName;
        self.label = conceptName || self.conceptName || self.options.conceptName;
        self.isLoaded = self.isOpen;
        self.collapseInnerSections = {value: false};
        self.uuid = conceptSet.uuid;
        self.alwaysShow = user.isFavouriteObsTemplate(self.conceptName);
        self.allowAddMore = config.allowAddMore;
        self.id = "concept-set-" + conceptSet.uuid;
    };

    var getShowIfFunction = function () {
        if (!self.showIfFunction) {
            var showIfFunctionStrings = self.options.showIf || ["return true;"];
            self.showIfFunction = new Function("context", showIfFunctionStrings.join('\n')); // eslint-disable-line no-new-func
        }
        return self.showIfFunction;
    };

    var atLeastOneValueSet = function (observation) {
        if (observation.groupMembers && observation.groupMembers.length > 0) {
            return observation.groupMembers.some(function (groupMember) {
                return atLeastOneValueSet(groupMember);
            });
        } else {
            return !(_.isUndefined(observation.value) || observation.value === "");
        }
    };

    self.isAvailable = function (context) {
        return getShowIfFunction()(context || {});
    };

    self.show = function () {
        self.isOpen = true;
        self.isLoaded = true;
    };

    self.hide = function () {
        self.isOpen = false;
    };

    self.getObservationsForConceptSection = function () {
        return self.observations.filter(function (observation) {
            return observation.concept.name === self.conceptName;
        });
    };
    self.hasSomeValue = function () {
        var observations = self.getObservationsForConceptSection();
        return _.some(observations, function (observation) {
            return atLeastOneValueSet(observation);
        });
    };

    self.showComputeButton = function () {
        return config.computeDrugs === true;
    };

    self.toggle = function () {
        self.added = !self.added;
        if (self.added) {
            self.show();
        }
    };
    self.maximizeInnerSections = function (event) {
        event.stopPropagation();
        self.collapseInnerSections = {value: false};
    };
    self.minimizeInnerSections = function (event) {
        event.stopPropagation();
        self.collapseInnerSections = {value: true};
    };

    self.toggleDisplay = function () {
        if (self.isOpen) {
            self.hide();
        } else {
            self.show();
        }
    };

    self.canToggle = function () {
        return !self.hasSomeValue();
    };

    self.canAddMore = function () {
        return self.allowAddMore == true;
    };

    Object.defineProperty(self, "isOpen", {
        get: function () {
            if (self.open === undefined) {
                self.open = self.hasSomeValue();
            }
            return self.open;
        },
        set: function (value) {
            self.open = value;
        }
    });

    self.isDefault = function () {
        return self.options.default;
    };

    Object.defineProperty(self, "isAdded", {
        get: function () {
            if (self.added === undefined) {
                if (self.options.default) {
                    self.added = true;
                } else {
                    self.added = self.hasSomeValue();
                }
            }
            return self.added;
        },
        set: function (value) {
            self.added = value;
        }
    });

    init();
};

'use strict';

Bahmni.ConceptSet.ObservationMapper = function () {
    var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
    var self = this;
    // TODO : Shouldn't this be in clinical module. Don't see a reason for this to be in concept-set code - Shruthi
    this.getObservationsForView = function (observations, conceptSetConfig) {
        return internalMapForDisplay(observations, conceptSetConfig);
    };

    var internalMapForDisplay = function (observations, conceptSetConfig) {
        var observationsForDisplay = [];
        _.forEach(observations, function (savedObs) {
            if (savedObs.concept.conceptClass && (savedObs.concept.conceptClass === Bahmni.Common.Constants.conceptDetailsClassName || savedObs.concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName)) {
                var observationNode = new Bahmni.ConceptSet.ObservationNode(savedObs, savedObs, [], savedObs.concept);
                var obsToDisplay = createObservationForDisplay(observationNode, observationNode.primaryObs.concept);
                if (obsToDisplay) {
                    observationsForDisplay.push(obsToDisplay);
                }
            } else {
                if (savedObs.concept.set) {
                    if (conceptSetConfig[savedObs.concept.name] && conceptSetConfig[savedObs.concept.name].grid) {
                        savedObs.value = self.getGridObservationDisplayValue(savedObs);
                        observationsForDisplay = observationsForDisplay.concat(createObservationForDisplay(savedObs, savedObs.concept));
                    } else {
                        var groupMemberObservationsForDisplay = internalMapForDisplay(savedObs.groupMembers, conceptSetConfig);
                        observationsForDisplay = observationsForDisplay.concat(groupMemberObservationsForDisplay);
                    }
                } else {
                    var obsToDisplay = null;
                    if (savedObs.isMultiSelect) {
                        obsToDisplay = savedObs;
                    } else if (!savedObs.hidden) {
                        var observation = newObservation(savedObs.concept, savedObs, []);
                        obsToDisplay = createObservationForDisplay(observation, observation.concept);
                    }
                    if (obsToDisplay) {
                        observationsForDisplay.push(obsToDisplay);
                    }
                }
            }
        });
        return observationsForDisplay;
    };

    this.map = function (observations, rootConcept, conceptSetConfig) {
        var savedObs = findInSavedObservation(rootConcept, observations)[0];
        return mapObservation(rootConcept, savedObs, conceptSetConfig || {});
    };

    var findInSavedObservation = function (concept, observations) {
        return _.filter(observations, function (obs) {
            return obs && obs.concept && concept.uuid === obs.concept.uuid;
        });
    };

    var mapObservation = function (concept, savedObs, conceptSetConfig, parentConcept) {
        var obs = null;
        if (savedObs && (savedObs.isObservation || savedObs.isObservationNode)) {
            return savedObs;
        }
        var mappedGroupMembers = concept.set ? mapObservationGroupMembers(savedObs ? savedObs.groupMembers : [], concept, conceptSetConfig) : [];

        if (concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName) {
            obs = newObservationNode(concept, savedObs, conceptSetConfig, mappedGroupMembers);
        } else {
            obs = newObservation(concept, savedObs, conceptSetConfig, mappedGroupMembers);
            new Bahmni.ConceptSet.MultiSelectObservations(conceptSetConfig).map(mappedGroupMembers);
        }

        mapTabularObs(mappedGroupMembers, concept, obs, conceptSetConfig);
        return obs;
    };

    function mapTabularObs (mappedGroupMembers, concept, obs, conceptSetConfig) {
        var tabularObsGroups = _.filter(mappedGroupMembers, function (member) {
            return conceptSetConfig[member.concept.name] && conceptSetConfig[member.concept.name]['isTabular'];
        });

        if (tabularObsGroups.length > 0) {
            var array = _.map(concept.setMembers, function (member) {
                return member.name.name;
            });
            tabularObsGroups.forEach(function (group) {
                group.hidden = true;
            });

            var groupedObsGroups = _.groupBy(tabularObsGroups, function (group) {
                return group.concept.name;
            });

            _.values(groupedObsGroups).forEach(function (groups) {
                var tabularObservations = new Bahmni.ConceptSet.TabularObservations(groups, obs, conceptSetConfig);
                obs.groupMembers.push(tabularObservations);
            });
            obs.groupMembers = _.sortBy(obs.groupMembers, function (observation) {
                return array.indexOf(observation.concept.name);
            });
        }
    }

    var mapObservationGroupMembers = function (observations, parentConcept, conceptSetConfig) {
        var observationGroupMembers = [];
        var conceptSetMembers = parentConcept.setMembers;
        conceptSetMembers.forEach(function (memberConcept) {
            var savedObservations = findInSavedObservation(memberConcept, observations);
            var configForConcept = conceptSetConfig[memberConcept.name.name] || {};
            var numberOfNodes = configForConcept.multiple || 1;
            for (var i = savedObservations.length - 1; i >= 0; i--) {
                observationGroupMembers.push(mapObservation(memberConcept, savedObservations[i], conceptSetConfig, parentConcept));
            }
            for (var i = 0; i < numberOfNodes - savedObservations.length; i++) {
                observationGroupMembers.push(mapObservation(memberConcept, null, conceptSetConfig, parentConcept));
            }
        });
        return observationGroupMembers;
    };

    var getDatatype = function (concept) {
        if (concept.dataType) {
            return concept.dataType;
        }
        return concept.datatype && concept.datatype.name;
    };

    // tODO : remove conceptUIConfig
    var newObservation = function (concept, savedObs, conceptSetConfig, mappedGroupMembers) {
        var observation = buildObservation(concept, savedObs, mappedGroupMembers);
        var obs = new Bahmni.ConceptSet.Observation(observation, savedObs, conceptSetConfig, mappedGroupMembers);
        if (getDatatype(concept) == "Boolean") {
            obs = new Bahmni.ConceptSet.BooleanObservation(obs, conceptSetConfig);
        }
        return obs;
    };

    // TODO : remove conceptUIConfig
    var newObservationNode = function (concept, savedObsNode, conceptSetConfig, mappedGroupMembers) {
        var observation = buildObservation(concept, savedObsNode, mappedGroupMembers);
        return new Bahmni.ConceptSet.ObservationNode(observation, savedObsNode, conceptSetConfig, concept);
    };

    var showAddMoreButton = function (rootObservation) {
        var observation = this;
        var lastObservationByLabel = _.findLast(rootObservation.groupMembers, {label: observation.label});
        return lastObservationByLabel.uuid === observation.uuid;
    };

    function buildObservation (concept, savedObs, mappedGroupMembers) {
        var comment = savedObs ? savedObs.comment : null;
        return {
            concept: conceptMapper.map(concept),
            units: concept.units,
            label: getLabel(concept),
            possibleAnswers: concept.answers,
            groupMembers: mappedGroupMembers,
            comment: comment,
            showAddMoreButton: showAddMoreButton
        };
    }

    var createObservationForDisplay = function (observation, concept) {
        if (observation.value == null) {
            return;
        }
        var observationValue = getObservationDisplayValue(observation);
        observationValue = observation.durationObs ? observationValue + " " + getDurationDisplayValue(observation.durationObs) : observationValue;
        return {
            "value": observationValue, "abnormalObs": observation.abnormalObs, "duration": observation.durationObs,
            "provider": observation.provider, "label": getLabel(observation.concept),
            "observationDateTime": observation.observationDateTime, "concept": concept,
            "comment": observation.comment, "uuid": observation.uuid
        };
    };

    var getObservationDisplayValue = function (observation) {
        if (observation.isBoolean || observation.type === "Boolean") {
            return observation.value === true ? "Yes" : "No";
        }
        if (!observation.value) {
            return "";
        }
        if (typeof observation.value.name === 'object') {
            var valueConcept = conceptMapper.map(observation.value);
            return valueConcept.shortName || valueConcept.name;
        }
        return observation.value.shortName || observation.value.name || observation.value;
    };

    var getDurationDisplayValue = function (duration) {
        var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(duration.value);
        if (durationForDisplay["value"] && durationForDisplay["unitName"]) {
            return "since " + durationForDisplay["value"] + " " + durationForDisplay["unitName"];
        }
        return "";
    };

    this.getGridObservationDisplayValue = function (observation) {
        var memberValues = _.compact(_.map(observation.groupMembers, function (member) {
            return getObservationDisplayValue(member);
        }));
        return memberValues.join(', ');
    };

    var getLabel = function (concept) {
        var mappedConcept = conceptMapper.map(concept);
        return mappedConcept.shortName || mappedConcept.name;
    };
};

'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('conceptService', ['$q', '$http', function ($q, $http) {
        var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
        var mapConceptOrGetDrug = function (conceptAnswer) {
            return conceptAnswer.concept && conceptMapper.map(conceptAnswer.concept) || conceptAnswer.drug;
        };

        var getAnswersForConceptName = function (request) {
            var params = {
                q: request.term,
                question: request.answersConceptName,
                v: "custom:(concept:(uuid,name:(display,uuid,name,conceptNameType),names:(display,uuid,name,conceptNameType)),drug:(uuid,name,display))",
                s: "byQuestion"
            };
            return $http.get(Bahmni.Common.Constants.bahmniConceptAnswerUrl, {params: params})
                .then(_.partial(_.get, _, 'data.results'))
                .then(function (conceptAnswers) {
                    return _(conceptAnswers)
                        .map(mapConceptOrGetDrug)
                        .uniqBy('uuid')
                        .value();
                });
        };

        var getAnswers = function (defaultConcept) {
            var deferred = $q.defer();
            var response = _(defaultConcept.answers)
                .uniqBy('uuid')
                .map(conceptMapper.map)
                .value();
            deferred.resolve(response);
            return deferred.promise;
        };

        return {
            getAnswersForConceptName: getAnswersForConceptName,
            getAnswers: getAnswers
        };
    }]);

'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('conceptSetUiConfigService', ['$http', '$q', 'appService', function ($http, $q, appService) {
        var setConceptUuidInsteadOfName = function (config, conceptNameField, uuidField) {
            var conceptName = config[conceptNameField];
            if (conceptName != null) {
                return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                    params: {name: conceptName, v: "custom:(uuid,name)"}
                }).then(function (response) {
                    var concept = response.data.results.filter(function (c) {
                        return c.name.name === conceptName;
                    });
                    if (concept.length > 0) {
                        config[uuidField] = concept[0].uuid;
                    }
                });
            }
        };

        var setExtraData = function (config) {
            Object.getOwnPropertyNames(config).forEach(function (conceptConfigKey) {
                var conceptConfig = config[conceptConfigKey];
                if (conceptConfig['freeTextAutocomplete'] instanceof Object) {
                    setConceptUuidInsteadOfName(conceptConfig['freeTextAutocomplete'], 'codedConceptName', 'codedConceptUuid');
                    setConceptUuidInsteadOfName(conceptConfig['freeTextAutocomplete'], 'conceptSetName', 'conceptSetUuid');
                }
            });
        };

        var getConfig = function () {
            var config = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
            setExtraData(config);
            return config;
        };

        return {
            getConfig: getConfig
        };
    }]);

'use strict';

angular.module('bahmni.common.uiHelper')
.filter('thumbnail', function () {
    return function (url, extension) {
        if (url) {
            if (extension) {
                return Bahmni.Common.Constants.documentsPath + '/' + url.replace(/(.*)\.(.*)$/, "$1_thumbnail." + extension) || null;
            }
            return Bahmni.Common.Constants.documentsPath + '/' + url.replace(/(.*)\.(.*)$/, "$1_thumbnail.$2") || null;
        }
    };
});

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
Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {};

angular.module('bahmni.common.displaycontrol', []);

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {};
Bahmni.Common.DisplayControl.Observation = Bahmni.Common.DisplayControl.Observation || {};

angular.module('bahmni.common.displaycontrol.observation', ['bahmni.common.conceptSet']);

'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('observationFormService', ['$http', function ($http) {
        var getFormList = function (encounterUuid) {
            return $http.get(Bahmni.Common.Constants.latestPublishedForms, {params: {encounterUuid: encounterUuid}});
        };

        var getAllForms = function (params) {
            return $http.get(Bahmni.Common.Constants.formUrl, {params: {v: "custom:(version,name,uuid)"}});
        };

        var getFormDetail = function (formUuid, params) {
            return $http.get(Bahmni.Common.Constants.formUrl + '/' + formUuid, {params: params});
        };

        return {
            getFormList: getFormList,
            getAllForms: getAllForms,
            getFormDetail: getFormDetail
        };
    }]);

'use strict';

Bahmni.Common.DisplayControl.Observation.GroupingFunctions = function () {
    var self = this;
    var observationGroupingFunction = function (obs) {
        return Bahmni.Common.Util.DateUtil.getDateTimeWithoutSeconds(obs.encounterDateTime);
    };

    self.groupByEncounterDate = function (bahmniObservations) {
        var obsArray = [];
        bahmniObservations = _.groupBy(bahmniObservations, observationGroupingFunction);

        var sortWithInAConceptDateCombination = function (anObs, challengerObs) {
            if (anObs.encounterDateTime < challengerObs.encounterDateTime) {
                return 1;
            }
            if (anObs.encounterDateTime > challengerObs.encounterDateTime) {
                return -1;
            }
            if (anObs.sortWeight < challengerObs.sortWeight) {
                return -1;
            }
            if (anObs.sortWeight > challengerObs.sortWeight) {
                return 1;
            }

            return 0;
        };

        for (var obsKey in bahmniObservations) {
            var dateTime = obsKey;

            var anObs = {
                "key": dateTime,
                "value": bahmniObservations[dateTime].sort(sortWithInAConceptDateCombination),
                "date": dateTime
            };

            obsArray.push(anObs);
        }
        return _.sortBy(obsArray, 'date').reverse();
    };

    self.persistOrderOfConceptNames = function (bahmniObservations) {
        var obsArray = [];
        for (var obsKey in bahmniObservations) {
            var anObs = {
                "key": obsKey,
                "value": [bahmniObservations[obsKey]],
                "date": bahmniObservations[obsKey].encounterDateTime
            };
            obsArray.push(anObs);
        }
        return obsArray;
    };

    return self;
};

'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .service('formHierarchyService', ['observationFormService', function (observationFormService) {
        var self = this;

        self.build = function (observations) {
            var obs = self.preProcessMultipleSelectObsToObs(observations);
            obs = self.createDummyObsGroupForObservationsForForm(obs);
            self.createDummyObsGroupForSectionsForForm(obs);
        };

        self.preProcessMultipleSelectObsToObs = function (observations) {
            _.forEach(observations, function (obs) {
                _.forEach(obs.value, function (value, index) {
                    if (value.type == "multiSelect") {
                        obs.value.push(value.groupMembers[0]);
                        obs.value.splice(index, 1);
                    }
                });
            });
            return observations;
        };

        self.createDummyObsGroupForObservationsForForm = function (observations) {
            _.forEach(observations, function (obs) {
                var newValues = [];
                _.forEach(obs.value, function (value) {
                    if (!value.formFieldPath) {
                        newValues.push(value);
                        return;
                    }

                    var dummyObsGroup = {
                        "groupMembers": [],
                        "concept": {
                            "shortName": "",
                            "conceptClass": null
                        },
                        "encounterUuid": ""
                    };

                    dummyObsGroup.concept.shortName = value.formFieldPath.split('.')[0];
                    dummyObsGroup.encounterUuid = value.encounterUuid;
                    var previousDummyObsGroupFound;
                    _.forEach(newValues, function (newValue) {
                        if (dummyObsGroup.concept.shortName == newValue.concept.shortName) {
                            newValue.groupMembers.push(value);
                            previousDummyObsGroupFound = true;
                        }
                    });

                    if (previousDummyObsGroupFound) {
                        return;
                    }

                    dummyObsGroup.groupMembers.push(value);
                    newValues.push(dummyObsGroup);
                });

                obs.value = newValues;
            });

            return observations;
        };

        self.getFormVersion = function (members) {
            var formVersion;
            _.forEach(members, function (member) {
                if (member.formFieldPath) {
                    formVersion = member.formFieldPath.split('.')[1].split('/')[0];
                    return false;
                }
            });
            return formVersion;
        };

        self.getMemberFromFormByFormFieldPath = function (members, id) {
            return _.filter(members, function (member) {
                return member.formFieldPath.split('.')[1].split('/')[1].split('-')[0] == id;
            });
        };

        self.getFormByFormName = function (formList, formName, formVersion) {
            return _.find(formList, function (form) {
                return form.name == formName && form.version == formVersion;
            });
        };

        self.parseSection = function (members, controls, value) {
            var sectionIsEmpty = true;
            _.forEach(controls, function (control) {
                var dummyObsGroup = {
                    "groupMembers": [],
                    "concept": {
                        "shortName": "",
                        "conceptClass": null
                    }
                };
                if (control.type == "section") {
                    dummyObsGroup.concept.shortName = control.label.value;
                    value.groupMembers.push(dummyObsGroup);
                    if (!self.parseSection(members, control.controls, dummyObsGroup)) {
                        value.groupMembers.pop();
                    } else {
                        sectionIsEmpty = false;
                    }
                } else {
                    var member = self.getMemberFromFormByFormFieldPath(members, control.id);
                    if (member.length != 0) {
                        if (member[0].formFieldPath.split('-')[1] != 0) {
                            _.reverse(member);
                        }
                        _.map(member, function (m) {
                            value.groupMembers.push(m);
                        });
                        sectionIsEmpty = false;
                    }
                }
            });
            if (sectionIsEmpty) {
                return null;
            }
            return value;
        };

        self.createSectionForSingleForm = function (obsFromSameForm, formDetails) {
            var members = obsFromSameForm.groupMembers.slice();
            obsFromSameForm.groupMembers.splice(0, obsFromSameForm.groupMembers.length);

            return self.parseSection(members, formDetails.controls, obsFromSameForm);
        };

        self.createDummyObsGroupForSectionsForForm = function (bahmniObservations) {
            observationFormService.getAllForms().then(function (response) {
                var allForms = response.data.results;
                _.forEach(bahmniObservations, function (observation) {
                    var forms = [];
                    _.forEach(observation.value, function (form) {
                        if (form.concept.conceptClass) {
                            forms.push(form);
                            return;
                        }
                        if (!self.getFormByFormName(allForms, form.concept.shortName, self.getFormVersion(form.groupMembers))) {
                            return;
                        }
                        observationFormService.getFormDetail(self.getFormByFormName(allForms, form.concept.shortName, self.getFormVersion(form.groupMembers)).uuid, {
                            v: "custom:(resources:(value))"
                        }).then(function (response) {
                            var formDetailsAsString = _.get(response, 'data.resources[0].value');
                            if (formDetailsAsString) {
                                var formDetails = JSON.parse(formDetailsAsString);
                                forms.push(self.createSectionForSingleForm(form, formDetails));
                            }
                            observation.value = forms;
                        });
                    });
                });
            });
        };
    }
    ]);

'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .directive('bahmniObservation', ['observationsService', 'appService', '$q', 'spinner', '$rootScope', 'formHierarchyService',
        function (observationsService, appService, $q, spinner, $rootScope, formHierarchyService) {
            var controller = function ($scope) {
                $scope.print = $rootScope.isBeingPrinted || false;

                $scope.showGroupDateTime = $scope.config.showGroupDateTime !== false;

                var mapObservation = function (observations) {
                    var conceptsConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
                    observations = new Bahmni.Common.Obs.ObservationMapper().map(observations, conceptsConfig);

                    if ($scope.config.conceptNames) {
                        observations = _.filter(observations, function (observation) {
                            return _.some($scope.config.conceptNames, function (conceptName) {
                                return _.toLower(conceptName) === _.toLower(_.get(observation, 'concept.name'));
                            });
                        });
                    }

                    if ($scope.config.persistOrderOfConcepts) {
                        $scope.bahmniObservations = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().persistOrderOfConceptNames(observations);
                    } else {
                        $scope.bahmniObservations = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().groupByEncounterDate(observations);
                    }

                    if (_.isEmpty($scope.bahmniObservations)) {
                        $scope.noObsMessage = Bahmni.Common.Constants.messageForNoObservation;
                        $scope.$emit("no-data-present-event");
                    } else {
                        if (!$scope.showGroupDateTime) {
                            _.forEach($scope.bahmniObservations, function (bahmniObs) {
                                bahmniObs.isOpen = true;
                            });
                        } else {
                            $scope.bahmniObservations[0].isOpen = true;
                        }
                    }
                    formHierarchyService.build($scope.bahmniObservations);
                };

                var fetchObservations = function () {
                    if ($scope.observations) {
                        mapObservation($scope.observations, $scope.config);
                        $scope.isFulfilmentDisplayControl = true;
                    } else {
                        if ($scope.config.observationUuid) {
                            $scope.initialization = observationsService.getByUuid($scope.config.observationUuid).then(function (response) {
                                mapObservation([response.data], $scope.config);
                            });
                        } else if ($scope.config.encounterUuid) {
                            var fetchForEncounter = observationsService.fetchForEncounter($scope.config.encounterUuid, $scope.config.conceptNames);
                            $scope.initialization = fetchForEncounter.then(function (response) {
                                mapObservation(response.data, $scope.config);
                            });
                        } else if ($scope.enrollment) {
                            $scope.initialization = observationsService.fetchForPatientProgram($scope.enrollment, $scope.config.conceptNames, $scope.config.scope).then(function (response) {
                                mapObservation(response.data, $scope.config);
                            });
                        } else {
                            $scope.initialization = observationsService.fetch($scope.patient.uuid, $scope.config.conceptNames,
                                $scope.config.scope, $scope.config.numberOfVisits, $scope.visitUuid,
                                $scope.config.obsIgnoreList, null).then(function (response) {
                                    mapObservation(response.data, $scope.config);
                                });
                        }
                    }
                };

                $scope.toggle = function (element) {
                    element.isOpen = !element.isOpen;
                };

                $scope.isClickable = function () {
                    return $scope.isOnDashboard && $scope.section.expandedViewConfig &&
                        ($scope.section.expandedViewConfig.pivotTable || $scope.section.expandedViewConfig.observationGraph);
                };

                fetchObservations();

                $scope.dialogData = {
                    "patient": $scope.patient,
                    "section": $scope.section
                };
            };

            var link = function ($scope, element) {
                $scope.initialization && spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                controller: controller,
                link: link,
                templateUrl: "../common/displaycontrols/observation/views/observationDisplayControl.html",
                scope: {
                    patient: "=",
                    visitUuid: "@",
                    section: "=?",
                    config: "=",
                    title: "=sectionTitle",
                    isOnDashboard: "=?",
                    observations: "=?",
                    message: "=?",
                    enrollment: "=?"
                }
            };
        }]);

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {};
Bahmni.Common.DisplayControl.PivotTable = Bahmni.Common.DisplayControl.PivotTable || {};

angular.module('bahmni.common.displaycontrol', []);
angular.module('bahmni.common.displaycontrol.pivottable', []);

'use strict';
angular.module('bahmni.common.displaycontrol.pivottable').directive('pivotTable', ['$rootScope', '$filter', '$stateParams', 'spinner', 'pivotTableService', 'appService', 'conceptSetUiConfigService', '$interval',
    function ($rootScope, $filter, $stateParams, spinner, pivotTableService, appService, conceptSetUiConfigService, $interval) {
        return {
            scope: {
                patientUuid: "=",
                diseaseName: "=",
                displayName: "=",
                config: "=",
                visitUuid: "=",
                status: "=?"
            },
            link: function (scope, element) {
                var tablescroll;
                if (!scope.config) {
                    return;
                }

                scope.groupBy = scope.config.groupBy || "visits";
                scope.groupByEncounters = scope.groupBy === "encounters";
                scope.groupByVisits = scope.groupBy === "visits";

                scope.getOnlyDate = function (startdate) {
                    return Bahmni.Common.Util.DateUtil.formatDateWithoutTime(startdate);
                };

                scope.getOnlyTime = function (startDate) {
                    return Bahmni.Common.Util.DateUtil.formatTime(startDate);
                };

                scope.isLonger = function (value) {
                    return value ? value.length > 13 : false;
                };

                scope.getColumnValue = function (value, conceptName) {
                    if (conceptName && conceptSetUiConfigService.getConfig()[conceptName] && conceptSetUiConfigService.getConfig()[conceptName].displayMonthAndYear == true) {
                        return Bahmni.Common.Util.DateUtil.getDateInMonthsAndYears(value);
                    }
                    return scope.isLonger(value) ? value.substring(0, 10) + "..." : value;
                };

                scope.scrollLeft = function () {
                    $('table.pivot-table tbody').animate({
                        scrollLeft: 0});
                    return false;
                };
                scope.scrollRight = function () {
                    $('table.pivot-table tbody').animate({
                        scrollLeft: tablescroll});
                    return false;
                };

                var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};

                var startDate = null, endDate = null;
                if (programConfig.showDetailsWithinDateRange) {
                    startDate = $stateParams.dateEnrolled;
                    endDate = $stateParams.dateCompleted;
                }

                var checkIfPivotTableLoaded = $interval(function () {
                    if ($('table.pivot-table tbody tr').length > 11) {
                        $('table.pivot-table tbody').animate({
                            scrollLeft: '20000px' }, 500);
                        tablescroll = $('table.pivot-table tbody').scrollLeft();
                        clearInterval(checkIfPivotTableLoaded);
                    }
                    else if ($('table.pivot-table tbody tr').length < 12) {
                        $('.btn-scroll-right, .btn-scroll-left').attr("disabled", true);
                        clearInterval(checkIfPivotTableLoaded);
                    }
                }, 1000, 2);

                var pivotDataPromise = pivotTableService.getPivotTableFor(scope.patientUuid, scope.config, scope.visitUuid, startDate, endDate);
                spinner.forPromise(pivotDataPromise, element);
                pivotDataPromise.then(function (response) {
                    var concepts = _.map(response.data.conceptDetails, function (conceptDetail) {
                        return {
                            name: conceptDetail.fullName,
                            shortName: conceptDetail.name,
                            lowNormal: conceptDetail.lowNormal,
                            hiNormal: conceptDetail.hiNormal,
                            units: conceptDetail.units
                        };
                    });
                    var tabluarDataInAscOrderByDate = _(response.data.tabularData).toPairs().sortBy(0).fromPairs().value();
                    scope.result = {concepts: concepts, tabularData: tabluarDataInAscOrderByDate};
                    scope.hasData = !_.isEmpty(scope.result.tabularData);
                    scope.status = scope.status || {};
                    scope.status.data = scope.hasData;
                });
                scope.showOnPrint = !$rootScope.isBeingPrinted;
            },

            templateUrl: '../common/displaycontrols/pivottable/views/pivotTable.html'
        };
    }]);

'use strict';

angular.module('bahmni.common.displaycontrol.pivottable')
    .service('pivotTableService', ['$http', function ($http) {
        this.getPivotTableFor = function (patientUuid, diseaseSummaryConfig, visitUuid, startDate, endDate) {
            return $http.get(Bahmni.Common.Constants.diseaseSummaryPivotUrl, {
                params: {
                    patientUuid: patientUuid,
                    visit: visitUuid,
                    numberOfVisits: diseaseSummaryConfig["numberOfVisits"],
                    initialCount: diseaseSummaryConfig["initialCount"],
                    latestCount: diseaseSummaryConfig["latestCount"],
                    obsConcepts: diseaseSummaryConfig["obsConcepts"],
                    drugConcepts: diseaseSummaryConfig["drugConcepts"],
                    labConcepts: diseaseSummaryConfig["labConcepts"],
                    groupBy: diseaseSummaryConfig["groupBy"],
                    startDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(startDate),
                    endDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endDate)
                }
            });
        };
    }]);

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {};
Bahmni.Common.DisplayControl.Custom = Bahmni.Common.DisplayControl.Custom || {};

angular.module('bahmni.common.displaycontrol.custom', []);

'use strict';

angular.module('bahmni.common.displaycontrol.custom')
    .directive('customDisplayControl', [function () {
        return {
            restrict: 'E',
            template: '<div compile-html="config.template"></div>',
            scope: {
                patient: "=",
                visitUuid: "=",
                section: "=",
                config: "=",
                enrollment: "=",
                params: "=",
                visitSummary: '='
            }
        };
    }]);

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Obs = Bahmni.Common.Obs || {};

angular.module('bahmni.common.obs', []);

'use strict';

Bahmni.Common.Obs.Observation = (function () {
    var Observation = function (obs, conceptConfig) {
        angular.extend(this, obs);
        this.concept = obs.concept;
        this.conceptConfig = conceptConfig;
    };

    Observation.prototype = {

        isFormElement: function () {
            return this.groupMembers && this.groupMembers.length <= 0;
        },

        isImageConcept: function () {
            return this.concept.conceptClass === "Image";
        },
        isVideoConcept: function () {
            return this.concept.conceptClass === "Video";
        },

        hasPDFAsValue: function () {
            return (this.value.indexOf(".pdf") > 0);
        },

        getDisplayValue: function () {
            var value;
            if (this.type === "Boolean" || this.concept && this.concept.dataType === "Boolean") {
                return this.value === true ? "OBS_BOOLEAN_YES_KEY" : "OBS_BOOLEAN_NO_KEY";
            }
            if (this.type === "Datetime" || this.concept && this.concept.dataType === "Datetime") {
                var date = Bahmni.Common.Util.DateUtil.parseDatetime(this.value);
                return date != null ? Bahmni.Common.Util.DateUtil.formatDateWithTime(date) : "";
            }
            if (this.conceptConfig && this.conceptConfig.displayMonthAndYear) {
                value = Bahmni.Common.Util.DateUtil.getDateInMonthsAndYears(this.value);
                if (value != null) {
                    return value;
                }
            }
            if (this.type === "Date" || this.concept && this.concept.dataType === "Date") {
                return this.value ? Bahmni.Common.Util.DateUtil.formatDateWithoutTime(this.value) : "";
            }
            value = this.value;
            var displayValue = value && (value.shortName || (value.name && (value.name.name || value.name)) || value);
            if (this.duration) {
                displayValue = displayValue + " " + this.getDurationDisplayValue();
            }
            return displayValue;
        },

        getDurationDisplayValue: function () {
            var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(this.duration);
            return "since " + durationForDisplay["value"] + " " + durationForDisplay["unitName"];
        }
    };

    return Observation;
})();


'use strict';

Bahmni.Common.Obs.ObservationMapper = function () {
    var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();

    this.map = function (bahmniObservations, allConceptsConfig, dontSortByObsDateTime) {
        var mappedObservations = mapObservations(bahmniObservations, allConceptsConfig, dontSortByObsDateTime);
        return mapUIObservations(mappedObservations, allConceptsConfig);
    };

    var mapObservations = function (bahmniObservations, allConceptsConfig, dontSortByObsDateTime) {
        var mappedObservations = [];
        if (dontSortByObsDateTime) {
            bahmniObservations = _.flatten(bahmniObservations);
        } else {
            bahmniObservations = Bahmni.Common.Obs.ObservationUtil.sortSameConceptsWithObsDateTime(bahmniObservations);
        }
        $.each(bahmniObservations, function (i, bahmniObservation) {
            var conceptConfig = allConceptsConfig[bahmniObservation.concept.name] || [];
            var observation = new Bahmni.Common.Obs.Observation(bahmniObservation, conceptConfig);
            if (observation.groupMembers && observation.groupMembers.length >= 0) {
                observation.groupMembers = mapObservations(observation.groupMembers, allConceptsConfig, dontSortByObsDateTime);
            }
            mappedObservations.push(observation);
        });
        return mappedObservations;
    };

    var mapUIObservations = function (observations, allConceptsConfig) {
        var groupedObservations = _.groupBy(observations, function (observation) {
            return observation.concept.name;
        });
        var mappedObservations = [];
        $.each(groupedObservations, function (i, obsGroup) {
            var conceptConfig = allConceptsConfig[obsGroup[0].concept.name] || [];
            if (conceptConfig.multiSelect) {
                var multiSelectObservations = {};
                $.each(obsGroup, function (i, observation) {
                    if (multiSelectObservations[observation.encounterDateTime]) {
                        multiSelectObservations[observation.encounterDateTime].push(observation);
                    } else {
                        var observations = [];
                        observations.push(observation);
                        multiSelectObservations[observation.encounterDateTime] = observations;
                    }
                });
                $.each(multiSelectObservations, function (i, observations) {
                    mappedObservations.push(new Bahmni.Common.Obs.MultiSelectObservation(observations, conceptConfig));
                });
            } else if (conceptConfig.grid) {
                mappedObservations.push(new Bahmni.Common.Obs.GridObservation(obsGroup[0], conceptConfig));
            } else {
                $.each(obsGroup, function (i, obs) {
                    obs.groupMembers = mapUIObservations(obs.groupMembers, allConceptsConfig);
                    mappedObservations.push(obs);
                });
            }
        });
        return mappedObservations;
    };

    this.getGridObservationDisplayValue = function (observationTemplate) {
        var memberValues = _.compact(_.map(observationTemplate.bahmniObservations, function (observation) {
            return getObservationDisplayValue(observation);
        }));
        return memberValues.join(', ');
    };

    var getObservationDisplayValue = function (observation) {
        if (observation.isBoolean || observation.type === "Boolean") {
            return observation.value === true ? "Yes" : "No";
        }
        if (!observation.value) {
            return "";
        }
        if (typeof observation.value.name === 'object') {
            var valueConcept = conceptMapper.map(observation.value);
            return valueConcept.shortName || valueConcept.name;
        }
        return observation.value.shortName || observation.value.name || observation.value;
    };
};

'use strict';

angular.module('bahmni.common.obs')
    .directive('showObservation', function () {
        var controller = function ($scope, $rootScope, $filter) {
            $scope.toggle = function (observation) {
                observation.showDetails = !observation.showDetails;
            };

            $scope.print = $rootScope.isBeingPrinted || false;

            $scope.dateString = function (observation) {
                var filterName;
                if ($scope.showDate && $scope.showTime) {
                    filterName = 'bahmniDateTime';
                } else if (!$scope.showDate && ($scope.showTime || $scope.showTime === undefined)) {
                    filterName = 'bahmniTime';
                } else {
                    return null;
                }
                return $filter(filterName)(observation.observationDateTime);
            };
        };
        return {
            restrict: 'E',
            scope: {
                observation: "=?",
                patient: "=",
                showDate: "=?",
                showTime: "=?",
                showDetailsButton: "=?"
            },
            controller: controller,
            template: '<ng-include src="\'../common/obs/views/showObservation.html\'" />'
        };
    });

'use strict';

Bahmni.Common.Obs.ObservationUtil = (function () {
    var sortSameConceptsWithObsDateTime = function (observation) {
        var sortedObservations = [];
        for (var i = 0; i < observation.length; i++) {
            if (i !== observation.length - 1) {
                if (observation[i].conceptUuid !== observation[i + 1].conceptUuid) {
                    sortedObservations.push(observation[i]);
                } else {
                    var sameConceptsSubArray = [];
                    var j = i + 1;
                    sameConceptsSubArray.push(observation[i]);
                    while (j < observation.length && observation[i].conceptUuid === observation[j].conceptUuid) {
                        sameConceptsSubArray.push(observation[j++]);
                    }
                    sameConceptsSubArray = _.sortBy(sameConceptsSubArray, 'observationDateTime');
                    sortedObservations.push(sameConceptsSubArray);
                    i = j - 1;
                }
            } else {
                sortedObservations.push(observation[i]);
            }
        }
        return _.flatten(sortedObservations);
    };

    var getValue = function (observation) {
        if (observation.selectedObs) {
            return observation.getValues();
        }
        var obsValue;
        if (observation.value && observation.value.name && observation.value.name.name) {
            obsValue = observation.value.name.name;
        } else if (observation.value && observation.value.name && !observation.value.name.name) {
            obsValue = observation.value.name;
        } else {
            obsValue = observation.value;
        }

        return (obsValue === undefined || obsValue === null) ? obsValue : (obsValue.displayString || obsValue);
    };

    var collect = function (flattenedObservations, key, value) {
        if (value != undefined) {
            flattenedObservations[key] = flattenedObservations[key] ? _.uniq(_.flatten(_.union([flattenedObservations[key]], [value]))) : value;
        }
    };

    var findLeafObservations = function (flattenedObservations, observation) {
        if (!_.isEmpty(observation.groupMembers)) {
            _.each(observation.groupMembers, function (member) {
                findLeafObservations(flattenedObservations, member);
            });
        } else {
            collect(flattenedObservations, observation.concept.name, getValue(observation));
        }
    };

    var flatten = function (observation) {
        var flattenedObservation = {};
        if (!_.isEmpty(observation)) {
            findLeafObservations(flattenedObservation, observation);
        }
        return flattenedObservation;
    };

    var flattenObsToArray = function (observations) {
        var flattened = [];
        flattened.push.apply(flattened, observations);
        observations.forEach(function (obs) {
            if (obs.groupMembers && obs.groupMembers.length > 0) {
                flattened.push.apply(flattened, flattenObsToArray(obs.groupMembers));
            }
        });
        return flattened;
    };

    return {
        sortSameConceptsWithObsDateTime: sortSameConceptsWithObsDateTime,
        flatten: flatten,
        flattenObsToArray: flattenObsToArray
    };
})();

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {};
Bahmni.Common.DisplayControl.hint = Bahmni.Common.DisplayControl.hint || {};

angular.module('bahmni.common.displaycontrol.hint', []);

'use strict';

angular.module('bahmni.common.displaycontrol.hint')
    .directive('hint', [
        function () {
            var link = function ($scope) {
                $scope.hintForNumericConcept = Bahmni.Common.Domain.Helper.getHintForNumericConcept($scope.conceptDetails);
            };

            return {
                restrict: 'E',
                link: link,
                template: '<small class="hint" ng-if="::hintForNumericConcept">{{::hintForNumericConcept}}</small>',
                scope: {
                    conceptDetails: "="
                }
            };
        }]);

'use strict';

Bahmni.Common.Domain.Diagnosis = function (codedAnswer, order, certainty, existingObsUuid, freeTextAnswer, diagnosisDateTime, voided) {
    var self = this;
    self.codedAnswer = codedAnswer;
    self.order = order;
    self.certainty = certainty;
    self.existingObs = existingObsUuid;
    self.freeTextAnswer = freeTextAnswer;
    self.diagnosisDateTime = diagnosisDateTime;
    self.diagnosisStatus = undefined;
    self.isNonCodedAnswer = false;
    if (self.codedAnswer) {
        self.conceptName = self.codedAnswer.name;
    }
    self.voided = voided;
    self.firstDiagnosis = null;
    self.comments = "";

    self.getDisplayName = function () {
        if (self.freeTextAnswer) {
            return self.freeTextAnswer;
        } else {
            return self.codedAnswer.shortName || self.codedAnswer.name;
        }
    };

    self.isPrimary = function () {
        return self.order == "PRIMARY";
    };

    self.isSecondary = function () {
        return self.order == "SECONDARY";
    };

    self.isRuledOut = function () {
        return self.diagnosisStatus == $rootScope.diagnosisStatus;
    };

    self.answerNotFilled = function () {
        return !self.codedAnswer.name;
    };

    self.isValidAnswer = function () {
        return (self.codedAnswer.name && self.codedAnswer.uuid) ||
            (self.codedAnswer.name && !self.codedAnswer.uuid && self.isNonCodedAnswer) ||
            self.answerNotFilled();
    };
    self.isValidOrder = function () {
        return self.isEmpty() || self.order !== undefined;
    };

    self.isValidCertainty = function () {
        return self.isEmpty() || self.certainty !== undefined;
    };

    self.isEmpty = function () {
        return self.getDisplayName() === undefined || self.getDisplayName().length === 0;
    };

    self.diagnosisStatusValue = null;
    self.diagnosisStatusConcept = null;
    Object.defineProperty(this, 'diagnosisStatus', {
        get: function () {
            return this.diagnosisStatusValue;
        },
        set: function (newStatus) {
            if (newStatus) {
                this.diagnosisStatusValue = newStatus;
                this.diagnosisStatusConcept = { name: Bahmni.Common.Constants.ruledOutdiagnosisStatus};
            } else {
                this.diagnosisStatusValue = null;
                this.diagnosisStatusConcept = null;
            }
        }
    });

    self.clearCodedAnswerUuid = function () {
        self.codedAnswer.uuid = undefined;
    };

    self.setAsNonCodedAnswer = function () {
        self.isNonCodedAnswer = !self.isNonCodedAnswer;
    };
};

'use strict';

Bahmni.DiagnosisMapper = function (diagnosisStatus) {
    var self = this;

    var mapDiagnosis = function (diagnosis) {
        if (!diagnosis.codedAnswer) {
            diagnosis.codedAnswer = {
                name: undefined,
                uuid: undefined
            };
        }
        var mappedDiagnosis = angular.extend(new Bahmni.Common.Domain.Diagnosis(), diagnosis);
        if (mappedDiagnosis.firstDiagnosis) {
            mappedDiagnosis.firstDiagnosis = mapDiagnosis(mappedDiagnosis.firstDiagnosis);
        }
        if (mappedDiagnosis.latestDiagnosis) {
            mappedDiagnosis.latestDiagnosis = mapDiagnosis(mappedDiagnosis.latestDiagnosis);
        }

        if (diagnosis.diagnosisStatusConcept) {
            if (Bahmni.Common.Constants.ruledOutdiagnosisStatus === diagnosis.diagnosisStatusConcept.name) {
                mappedDiagnosis.diagnosisStatus = diagnosisStatus;
            }
        }
        return mappedDiagnosis;
    };

    self.mapDiagnosis = mapDiagnosis;

    self.mapDiagnoses = function (diagnoses) {
        var mappedDiagnoses = [];
        _.each(diagnoses, function (diagnosis) {
            mappedDiagnoses.push(mapDiagnosis(diagnosis));
        });
        return mappedDiagnoses;
    };

    self.mapPastDiagnosis = function (diagnoses, currentEncounterUuid) {
        var pastDiagnosesResponse = [];
        diagnoses.forEach(function (diagnosis) {
            if (diagnosis.encounterUuid !== currentEncounterUuid) {
                diagnosis.previousObs = diagnosis.existingObs;
                diagnosis.existingObs = null;
                diagnosis.inCurrentEncounter = undefined;
                pastDiagnosesResponse.push(diagnosis);
            }
        });
        return pastDiagnosesResponse;
    };

    self.mapSavedDiagnosesFromCurrentEncounter = function (diagnoses, currentEncounterUuid) {
        var savedDiagnosesFromCurrentEncounter = [];
        diagnoses.forEach(function (diagnosis) {
            if (diagnosis.encounterUuid === currentEncounterUuid) {
                diagnosis.inCurrentEncounter = true;
                savedDiagnosesFromCurrentEncounter.push(diagnosis);
            }
        });
        return savedDiagnosesFromCurrentEncounter;
    };
};

'use strict';

angular.module('bahmni.common.domain')
    .service('diagnosisService', ['$http', '$rootScope', function ($http, $rootScope) {
        var self = this;
        this.getAllFor = function (searchTerm) {
            var url = Bahmni.Common.Constants.emrapiConceptUrl;
            return $http.get(url, {
                params: {term: searchTerm, limit: 20}
            });
        };

        this.getDiagnoses = function (patientUuid, visitUuid) {
            var url = Bahmni.Common.Constants.bahmniDiagnosisUrl;
            return $http.get(url, {
                params: { patientUuid: patientUuid, visitUuid: visitUuid}
            });
        };

        this.deleteDiagnosis = function (obsUuid) {
            var url = Bahmni.Common.Constants.bahmniDeleteDiagnosisUrl;
            return $http.get(url, {
                params: {obsUuid: obsUuid}
            });
        };

        this.getDiagnosisConceptSet = function () {
            return $http.get(Bahmni.Common.Constants.conceptUrl, {
                method: "GET",
                params: {
                    v: 'custom:(uuid,name,setMembers)',
                    code: Bahmni.Common.Constants.diagnosisConceptSet,
                    source: Bahmni.Common.Constants.emrapiConceptMappingSource
                },
                withCredentials: true
            });
        };

        this.getPastAndCurrentDiagnoses = function (patientUuid, encounterUuid) {
            return self.getDiagnoses(patientUuid).then(function (response) {
                var diagnosisMapper = new Bahmni.DiagnosisMapper($rootScope.diagnosisStatus);
                var allDiagnoses = diagnosisMapper.mapDiagnoses(response.data);
                var pastDiagnoses = diagnosisMapper.mapPastDiagnosis(allDiagnoses, encounterUuid);
                var savedDiagnosesFromCurrentEncounter = diagnosisMapper.mapSavedDiagnosesFromCurrentEncounter(allDiagnoses, encounterUuid);
                return {
                    "pastDiagnoses": pastDiagnoses,
                    "savedDiagnosesFromCurrentEncounter": savedDiagnosesFromCurrentEncounter
                };
            });
        };

        this.populateDiagnosisInformation = function (patientUuid, consultation) {
            return this.getPastAndCurrentDiagnoses(patientUuid, consultation.encounterUuid).then(function (diagnosis) {
                consultation.pastDiagnoses = diagnosis.pastDiagnoses;
                consultation.savedDiagnosesFromCurrentEncounter = diagnosis.savedDiagnosesFromCurrentEncounter;
                return consultation;
            });
        };
    }]);

'use strict';
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {};
Bahmni.Common.DisplayControl.Diagnosis = Bahmni.Common.DisplayControl.Diagnosis || {};

angular.module('bahmni.common.displaycontrol.diagnosis', []);

'use strict';

angular.module('bahmni.common.displaycontrol.diagnosis')
.filter('primaryDiagnosisFirst', function () {
    return function (diagnoses) {
        var primaryDiagnoses = _.filter(diagnoses, function (diagnosis) { return diagnosis.isPrimary(); });
        var otherDiagnoses = _.filter(diagnoses, function (diagnosis) { return !diagnosis.isPrimary(); });
        return primaryDiagnoses.concat(otherDiagnoses);
    };
});

'use strict';

angular.module('bahmni.common.displaycontrol.diagnosis')
    .directive('bahmniDiagnosis', ['diagnosisService', '$q', 'spinner', '$rootScope', '$filter',
        function (diagnosisService, $q, spinner, $rootScope, $filter) {
            var controller = function ($scope) {
                var getAllDiagnosis = function () {
                    return diagnosisService.getDiagnoses($scope.patientUuid, $scope.visitUuid).then(function (response) {
                        var diagnosisMapper = new Bahmni.DiagnosisMapper($rootScope.diagnosisStatus);
                        $scope.allDiagnoses = diagnosisMapper.mapDiagnoses(response.data);
                        if ($scope.showRuledOutDiagnoses == false) {
                            $scope.allDiagnoses = _.filter($scope.allDiagnoses, function (diagnoses) {
                                return diagnoses.diagnosisStatus !== $rootScope.diagnosisStatus;
                            });
                        }
                        $scope.isDataPresent = function () {
                            if ($scope.allDiagnoses && $scope.allDiagnoses.length == 0) {
                                $scope.$emit("no-data-present-event");
                                return false;
                            }
                            return true;
                        };
                    });
                };
                $scope.title = $scope.config.title;
                $scope.toggle = function (diagnosis, toggleLatest) {
                    if (toggleLatest) {
                        diagnosis.showDetails = false;
                        diagnosis.showLatestDetails = !diagnosis.showLatestDetails;
                    } else {
                        diagnosis.showLatestDetails = false;
                        diagnosis.showDetails = !diagnosis.showDetails;
                    }
                };

                var getPromises = function () {
                    return [getAllDiagnosis()];
                };

                $scope.isLatestDiagnosis = function (diagnosis) {
                    return diagnosis.latestDiagnosis ? diagnosis.existingObs == diagnosis.latestDiagnosis.existingObs : false;
                };

                $scope.initialization = $q.all(getPromises());
            };

            var link = function ($scope, element) {
                spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                controller: controller,
                link: link,
                templateUrl: "../common/displaycontrols/diagnosis/views/diagnosisDisplayControl.html",
                scope: {
                    patientUuid: "=",
                    config: "=",
                    visitUuid: "=?",
                    showRuledOutDiagnoses: "=?",
                    hideTitle: "=?",
                    showLatestDiagnosis: "@showLatestDiagnosis"
                }
            };
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

var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};
Bahmni.Registration.AttributesConditions = Bahmni.Registration.AttributesConditions || {};

angular.module('bahmni.registration', ['ui.router', 'bahmni.common.config', 'bahmni.common.domain', 'bahmni.common.util',
    'bahmni.common.uiHelper', 'bahmni.common.conceptSet', 'infinite-scroll', 'bahmni.common.patient',
    'bahmni.common.logging', 'pascalprecht.translate']);

'use strict';

angular
    .module('registration', ['ui.router', 'bahmni.registration', 'authentication', 'bahmni.common.config',
        'bahmni.common.appFramework', 'httpErrorInterceptor', 'bahmni.common.photoCapture', 'bahmni.common.obs',
        'bahmni.common.displaycontrol.observation', 'bahmni.common.i18n', 'bahmni.common.displaycontrol.custom',
        'bahmni.common.routeErrorHandler', 'bahmni.common.displaycontrol.pivottable', 'RecursionHelper', 'ngSanitize',
        'bahmni.common.uiHelper', 'bahmni.common.domain', 'ngDialog', 'pascalprecht.translate', 'ngCookies',
        'monospaced.elastic', 'bahmni.common.offline', 'bahmni.common.displaycontrol.hint', 'bahmni.common.attributeTypes',
        'bahmni.common.models', 'bahmni.common.uicontrols',
        'bahmni.common.displaycontrol.diagnosis'])
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', '$compileProvider', function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        $urlRouterProvider.otherwise('/search');
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|file):/);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|blob|chrome-extension):/);

        $compileProvider.debugInfoEnabled(false);


        $stateProvider
            .state('search', {
                url: '/search',
                reloadOnSearch: false,
                views: {
                    'layout': {templateUrl: 'views/layout.html', controller: 'SearchPatientController'},
                    'content@search': {templateUrl: 'views/search.html'}
                },
                resolve: {
                    offlineDb: function (offlineDbInitialization) {
                        return offlineDbInitialization();
                    },
                    initialize: function (initialization, offlineDb) {
                        return initialization(offlineDb);
                    }
                }
            })
            .state('newpatient', {
                url: '/patient/new',
                views: {
                    'layout': {templateUrl: 'views/layout.html', controller: 'CreatePatientController'},
                    'content@newpatient': {templateUrl: 'views/newpatient.html'}
                },
                resolve: {
                    offlineDb: function (offlineDbInitialization) {
                        return offlineDbInitialization();
                    },
                    initialize: function (initialization, offlineDb) {
                        return initialization(offlineDb);
                    }
                }
            })
            .state('patient', {
                url: '/patient/:patientUuid',
                abstract: true,
                views: {
                    'layout': {template: '<div ui-view="layout"></div>'}
                },
                resolve: {
                    offlineDb: function (offlineDbInitialization) {
                        return offlineDbInitialization();
                    },
                    initialize: function (initialization, offlineDb) {
                        return initialization(offlineDb);
                    }
                }
            })
            .state('patient.edit', {
                url: '?serverError',
                views: {
                    'layout': {templateUrl: 'views/layout.html', controller: 'EditPatientController'},
                    'content@patient.edit': {templateUrl: 'views/editpatient.html'},
                    'headerExtension@patient.edit': {template: '<div print-options></div>'}
                }
            })
            .state('patient.visit', {
                url: '/visit',
                views: {
                    'layout': {templateUrl: 'views/layout.html', controller: 'VisitController'},
                    'content@patient.visit': {templateUrl: 'views/visit.html'},
                    'headerExtension@patient.visit': {template: '<div print-options></div>'}
                }
            })
            .state('patient.printSticker', {
                url: '/printSticker',
                views: {
                    'layout': {templateUrl: 'views/layout.html'},
                    'content@patient.printSticker': {templateUrl: 'views/notimplemented.html'}
                }
            });
        $bahmniTranslateProvider.init({app: 'registration', shouldMerge: true});
    }]).run(['$rootScope', '$templateCache', 'offlineService', 'schedulerService', '$bahmniCookieStore', 'locationService', 'messagingService', function ($rootScope, $templateCache, offlineService, schedulerService, $bahmniCookieStore, locationService, messagingService) {
        // Disable caching view template partials

        var loginLocationUuid = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid;
        locationService.getVisitLocation(loginLocationUuid).then(function (response) {
            if (response.data) {
                $rootScope.visitLocation = response.data.uuid;
            }
        });
        if (offlineService.isChromeApp() || offlineService.isAndroidApp()) {
            schedulerService.sync();
        }

        $rootScope.$on('$stateChangeStart', function () {
            messagingService.hideMessages("error");
        });
    }]);

'use strict';

angular.module('bahmni.registration').factory('initialization',
    ['$rootScope', '$q', 'configurations', 'authenticator', 'appService', 'spinner', 'preferences', 'locationService', 'offlineService', 'offlineDbService', 'androidDbService', 'mergeService',
        function ($rootScope, $q, configurations, authenticator, appService, spinner, preferences, locationService, offlineService, offlineDbService, androidDbService, mergeService) {
            var getConfigs = function () {
                var configNames = ['encounterConfig', 'patientAttributesConfig', 'identifierTypesConfig', 'addressLevels', 'genderMap', 'relationshipTypeConfig', 'relationshipTypeMap', 'loginLocationToVisitTypeMapping'];
                return configurations.load(configNames).then(function () {
                    var mandatoryPersonAttributes = appService.getAppDescriptor().getConfigValue("mandatoryPersonAttributes");
                    var patientAttributeTypes = new Bahmni.Common.Domain.AttributeTypeMapper().mapFromOpenmrsAttributeTypes(configurations.patientAttributesConfig(), mandatoryPersonAttributes);
                    $rootScope.regEncounterConfiguration = angular.extend(new Bahmni.Registration.RegistrationEncounterConfig(), configurations.encounterConfig());
                    $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                    $rootScope.patientConfiguration = new Bahmni.Registration.PatientConfig(patientAttributeTypes.attributeTypes,
                    configurations.identifierTypesConfig(), appService.getAppDescriptor().getConfigValue("patientInformation"));
                    $rootScope.regEncounterConfiguration.loginLocationToVisitTypeMap = configurations.loginLocationToVisitTypeMapping();

                    $rootScope.addressLevels = configurations.addressLevels();
                    $rootScope.fieldValidation = appService.getAppDescriptor().getConfigValue("fieldValidation");
                    $rootScope.genderMap = configurations.genderMap();
                    $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                    $rootScope.relationshipTypes = configurations.relationshipTypes();
                });
            };

            var loadValidators = function (baseUrl, contextPath) {
                var script;
                var isOfflineApp = offlineService.isOfflineApp();
                if (isOfflineApp) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    offlineDbService.getConfig("registration").then(function (config) {
                        script = config.value['fieldValidation.js'];
                        Bahmni.Common.Util.DynamicResourceLoader.includeJs(script, isOfflineApp);
                    });
                } else {
                    script = baseUrl + contextPath + '/fieldValidation.js';
                    Bahmni.Common.Util.DynamicResourceLoader.includeJs(script, isOfflineApp);
                }
            };

            var initApp = function () {
                return appService.initApp('registration', {'app': true, 'extension': true });
            };

            var getIdentifierPrefix = function () {
                preferences.identifierPrefix = appService.getAppDescriptor().getConfigValue("defaultIdentifierPrefix");
            };

            var initAppConfigs = function () {
                $rootScope.registration = $rootScope.registration || {};
                getIdentifierPrefix();
            };

            var mapRelationsTypeWithSearch = function () {
                var relationshipTypeMap = $rootScope.relationshipTypeMap || {};
                if (!relationshipTypeMap.provider) {
                    return "patient";
                }
                $rootScope.relationshipTypes.forEach(function (relationshipType) {
                    relationshipType.searchType = (relationshipTypeMap.provider.indexOf(relationshipType.aIsToB) > -1) ? "provider" : "patient";
                });
            };

            var loggedInLocation = function () {
                return locationService.getLoggedInLocation().then(function (location) {
                    $rootScope.loggedInLocation = location;
                });
            };

            var mergeFormConditions = function () {
                var formConditions = Bahmni.ConceptSet.FormConditions;
                if (formConditions) {
                    formConditions.rules = mergeService.merge(formConditions.rules, formConditions.rulesOverride);
                }
            };

            var loadFormConditionsIfOffline = function () {
                var isOfflineApp = offlineService.isOfflineApp();
                if (isOfflineApp) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    return offlineDbService.getConfig("clinical").then(function (config) {
                        var script = config.value['formConditions.js'];
                        eval(script); // eslint-disable-line no-eval
                    });
                }
            };

            return function () {
                return spinner.forPromise(authenticator.authenticateUser()
                .then(initApp)
                .then(getConfigs)
                .then(initAppConfigs)
                .then(mapRelationsTypeWithSearch)
                .then(loggedInLocation)
                .then(loadValidators(appService.configBaseUrl(), "registration"))
                .then(loadFormConditionsIfOffline)
                .then(mergeFormConditions)
            );
            };
        }]
);

'use strict';

/* exported defaults */
var defaults = {
    maxAutocompleteResults: 20
};

var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};
var hostUrl = Bahmni.Common.Constants.hostURL;
var RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";

Bahmni.Registration.Constants = {
    openmrsUrl: hostUrl + "/openmrs",
    registrationEncounterType: "REG",
    baseOpenMRSRESTURL: RESTWS_V1,
    patientImageUrlByPatientUuid: RESTWS_V1 + "/patientImage?patientUuid=",
    bahmniRESTBaseURL: hostUrl + "/openmrs/ws/rest/v1/bahmnicore",
    emrApiRESTBaseURL: hostUrl + "/openmrs/ws/rest/emrapi",
    emrApiEncounterUrl: hostUrl + "/openmrs/ws/rest/emrapi/encounter",
    webServiceRestBaseURL: hostUrl + "/openmrs/ws/rest/v1",
    patientSearchURL: "/search",
    allAddressFileds: ["uuid", "preferred", "address1", "address2", "address3", "address4", "address5", "address6", "cityVillage", "countyDistrict", "stateProvince", "postalCode", "country", "latitude", "longitude"],
    nextStepConfigId: "org.bahmni.registration.patient.next"
};

Bahmni.Registration.Constants.Errors = {
    manageIdentifierSequencePrivilege: "You don't have the privilege to create a patient with the given ID."
};

'use strict';

function getWatchers (element) {
    var elementToWatch = element ? angular.element(element) : angular.element(document.getElementsByTagName('body'));

    var watchers = [];

    var f = function (element) {
        angular.forEach(['$scope', '$isolateScope'], function (scopeProperty) {
            if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
                angular.forEach(element.data()[scopeProperty].$$watchers, function (watcher) {
                    watchers.push(watcher);
                });
            }
        });

        angular.forEach(element.children(), function (childElement) {
            f(angular.element(childElement));
        });
    };

    f(elementToWatch);

    // Remove duplicate watchers
    var watchersWithoutDuplicates = [];
    angular.forEach(watchers, function (item) {
        if (watchersWithoutDuplicates.indexOf(item) < 0) {
            watchersWithoutDuplicates.push(item);
        }
    });

    console.log(watchersWithoutDuplicates);
    return watchersWithoutDuplicates;
}

'use strict';

angular.module('bahmni.common.patient')
    .directive('fallbackSrc', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (_.isEmpty(attrs.ngSrc)) {
                    element.attr('src', attrs.fallbackSrc);
                }
                element.bind('error', function () {
                    element.attr('src', attrs.fallbackSrc);
                });
            }
        };
    });

'use strict';

angular.module('bahmni.registration')
    .directive('addressFields', function () {
        return {
            restrict: 'AE',
            templateUrl: ' views/addressFields.html',
            controller: 'AddressFieldsDirectiveController',
            scope: {
                address: '=',
                addressLevels: '=',
                fieldValidation: '=',
                strictAutocompleteFromLevel: '='
            }
        };
    })
    .controller('AddressFieldsDirectiveController', ['$scope', 'addressHierarchyService', function ($scope, addressHierarchyService) {
        var addressLevelsCloneInDescendingOrder = $scope.addressLevels.slice(0).reverse();
        $scope.addressLevelsChunks = Bahmni.Common.Util.ArrayUtil.chunk(addressLevelsCloneInDescendingOrder, 2);
        var addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(function (addressLevel) {
            return addressLevel.addressField;
        });

        $scope.addressFieldSelected = function (fieldName) {
            return function (addressFieldItem) {
                var parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);
                $scope.selectedValue[fieldName] = addressFieldItem.addressField.name;
                var parent = addressFieldItem.addressField.parent;
                parentFields.forEach(function (parentField) {
                    if (!parent) {
                        return;
                    }
                    $scope.address[parentField] = parent.name;
                    $scope.selectedValue[parentField] = parent.name;
                    parent = parent.parent;
                });
            };
        };

        $scope.removeAutoCompleteEntry = function (fieldName) {
            return function () {
                $scope.selectedValue[fieldName] = null;
            };
        };

        $scope.getAddressEntryList = function (field) {
            return function (searchAttrs) {
                return addressHierarchyService.search(field, searchAttrs.term);
            };
        };

        $scope.getAddressDataResults = addressHierarchyService.getAddressDataResults;

        $scope.clearFields = function (fieldName) {
            var childFields = addressLevelsNamesInDescendingOrder.slice(0, addressLevelsNamesInDescendingOrder.indexOf(fieldName));
            childFields.forEach(function (childField) {
                if (!_.isEmpty($scope.selectedValue[childField])) {
                    $scope.address[childField] = null;
                    $scope.selectedValue[childField] = null;
                }
            });
        };
        var init = function () {
            $scope.addressLevels.reverse();
            var isStrictEntry = false;
            _.each($scope.addressLevels, function (addressLevel) {
                addressLevel.isStrictEntry = $scope.strictAutocompleteFromLevel == addressLevel.addressField || isStrictEntry;
                isStrictEntry = addressLevel.isStrictEntry;
            });
            $scope.addressLevels.reverse();

            // wait for address to be resolved in edit patient scenario
            var addressWatch = $scope.$watch('address', function (newValue) {
                if (newValue !== undefined) {
                    $scope.selectedValue = _.mapValues($scope.address, function (value, key) {
                        var addressLevel = _.find($scope.addressLevels, {addressField: key});
                        return addressLevel && addressLevel.isStrictEntry ? value : null;
                    });
                    addressWatch();
                }
            });
        };
        init();
    }]);

'use strict';

angular.module('bahmni.registration')
    .directive('topDownAddressFields', function () {
        return {
            restrict: 'AE',
            templateUrl: 'views/topDownAddressFields.html',
            controller: 'TopDownAddressFieldsDirectiveController',
            scope: {
                address: '=',
                addressLevels: '=',
                fieldValidation: '=',
                strictAutocompleteFromLevel: '='
            }
        };
    })
    .controller('TopDownAddressFieldsDirectiveController', ['$scope', 'addressHierarchyService', function ($scope, addressHierarchyService) {
        $scope.addressFieldInvalid = false;
        var selectedAddressUuids = {};
        var selectedUserGeneratedIds = {};

        var addressLevelsCloneInDescendingOrder = $scope.addressLevels.slice(0).reverse();
        var addressLevelUIOrderBasedOnConfig = $scope.addressLevels;
        $scope.addressLevelsChunks = Bahmni.Common.Util.ArrayUtil.chunk(addressLevelUIOrderBasedOnConfig, 2);
        var addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(function (addressLevel) {
            return addressLevel.addressField;
        });

        var populateSelectedAddressUuids = function (levelIndex, parentUuid) {
            if ($scope.addressLevels.length === 0 || !$scope.addressLevels[levelIndex]) {
                return;
            }

            var fieldName = $scope.addressLevels[levelIndex].addressField;
            var addressValue = $scope.address[fieldName];
            if (addressValue) {
                addressHierarchyService.search(fieldName, addressValue, parentUuid).then(function (response) {
                    var address = response && response.data && response.data[0];
                    if (address) {
                        selectedAddressUuids[fieldName] = address.uuid;
                        selectedUserGeneratedIds[fieldName] = address.userGeneratedId;
                        populateSelectedAddressUuids(levelIndex + 1, address.uuid);
                    }
                });
            }
        };

        $scope.addressFieldSelected = function (fieldName) {
            return function (addressFieldItem) {
                selectedAddressUuids[fieldName] = addressFieldItem.addressField.uuid;
                selectedUserGeneratedIds[fieldName] = addressFieldItem.addressField.userGeneratedId;
                $scope.selectedValue[fieldName] = addressFieldItem.addressField.name;
                var parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);
                var parent = addressFieldItem.addressField.parent;
                parentFields.forEach(function (parentField) {
                    if (!parent) {
                        return;
                    }
                    $scope.address[parentField] = parent.name;
                    $scope.selectedValue[parentField] = parent.name;
                    parent = parent.parent;
                });
            };
        };

        $scope.findParentField = function (fieldName) {
            var found = _.find($scope.addressLevels, {addressField: fieldName});
            var index = _.findIndex($scope.addressLevels, found);
            var parentFieldName;
            var topLevel = 0;
            if (index !== topLevel) {
                var parent = $scope.addressLevels[index - 1];
                parentFieldName = parent.addressField;
            }
            return parentFieldName;
        };

        $scope.isReadOnly = function (addressLevel) {
            if (!$scope.address) {
                return false;
            }
            if (!addressLevel.isStrictEntry) {
                return false;
            }
            var fieldName = addressLevel.addressField;
            var parentFieldName = $scope.findParentField(fieldName);
            var parentValue = $scope.address[parentFieldName];
            var parentValueInvalid = isParentValueInvalid(parentFieldName);
            if (!parentFieldName) {
                return false;
            }
            if (parentFieldName && !parentValue) {
                return true;
            }
            return parentFieldName && parentValue && parentValueInvalid;
        };

        var isParentValueInvalid = function (parentId) {
            return angular.element($("#" + parentId)).hasClass('illegalValue');
        };

        var parentUuid = function (field) {
            return selectedAddressUuids[$scope.findParentField(field)];
        };

        $scope.getAddressEntryList = function (field) {
            return function (searchAttrs) {
                return addressHierarchyService.search(field, searchAttrs.term, parentUuid(field));
            };
        };

        $scope.getAddressDataResults = addressHierarchyService.getAddressDataResults;

        $scope.clearFields = function (fieldName) {
            var childFields = addressLevelsNamesInDescendingOrder.slice(0, addressLevelsNamesInDescendingOrder.indexOf(fieldName));
            childFields.forEach(function (childField) {
                if ($scope.selectedValue[childField] !== null) {
                    $scope.address[childField] = null;
                    $scope.selectedValue[childField] = null;
                    selectedAddressUuids[childField] = null;
                    selectedUserGeneratedIds[childField] = null;
                }
            });

            if (_.isEmpty($scope.address[fieldName])) {
                $scope.address[fieldName] = null;
                selectedUserGeneratedIds[fieldName] = null;
            }
        };

        $scope.removeAutoCompleteEntry = function (fieldName) {
            return function () {
                $scope.selectedValue[fieldName] = null;
            };
        };

        var init = function () {
            $scope.addressLevels.reverse();
            var isStrictEntry = false;
            _.each($scope.addressLevels, function (addressLevel) {
                addressLevel.isStrictEntry = $scope.strictAutocompleteFromLevel == addressLevel.addressField || isStrictEntry;
                isStrictEntry = addressLevel.isStrictEntry;
            });
            $scope.addressLevels.reverse();

            // wait for address to be resolved in edit patient scenario
            var deregisterAddressWatch = $scope.$watch('address', function (newValue) {
                if (newValue !== undefined) {
                    populateSelectedAddressUuids(0);
                    $scope.selectedValue = _.mapValues($scope.address, function (value, key) {
                        var addressLevel = _.find($scope.addressLevels, {addressField: key});
                        return addressLevel && addressLevel.isStrictEntry ? value : null;
                    });
                    deregisterAddressWatch();
                }
            });
        };
        init();
    }]);

'use strict';

angular.module('bahmni.registration')
    .directive('printOptions', ['$rootScope', 'registrationCardPrinter', 'spinner', 'appService', '$filter',
        function ($rootScope, registrationCardPrinter, spinner, appService, $filter) {
            var controller = function ($scope) {
                $scope.printOptions = appService.getAppDescriptor().getConfigValue("printOptions");
                $scope.defaultPrint = $scope.printOptions && $scope.printOptions[0];

                var mapRegistrationObservations = function () {
                    var obs = {};
                    $scope.observations = $scope.observations || [];
                    var getValue = function (observation) {
                        obs[observation.concept.name] = obs[observation.concept.name] || [];
                        observation.value && obs[observation.concept.name].push(observation.value);
                        observation.groupMembers.forEach(getValue);
                    };

                    $scope.observations.forEach(getValue);
                    return obs;
                };

                $scope.print = function (option) {
                    return registrationCardPrinter.print(option.templateUrl, $scope.patient, mapRegistrationObservations(), $scope.encounterDateTime);
                };

                $scope.buttonText = function (option, type) {
                    var printHtml = "";
                    var optionValue = option && $filter('titleTranslate')(option);
                    if (type) {
                        printHtml = '<i class="fa fa-print"></i>';
                    }
                    return '<span>' + optionValue + '</span>' + printHtml;
                };
            };

            return {
                restrict: 'A',
                templateUrl: 'views/printOptions.html',
                controller: controller
            };
        }]);

'use strict';

angular.module('bahmni.registration')
    .directive('patientRelationship', function () {
        return {
            restrict: 'AE',
            templateUrl: 'views/patientRelationships.html',
            controller: 'PatientRelationshipController',
            scope: {
                patient: "="
            }
        };
    })
    .controller('PatientRelationshipController', ['$window', '$scope', '$rootScope', 'spinner', 'patientService', 'providerService', 'appService',
        function ($window, $scope, $rootScope, spinner, patientService, providerService, appService) {
            $scope.addPlaceholderRelationship = function () {
                $scope.patient.newlyAddedRelationships.push({});
            };

            $scope.hideRelationShipDuration = appService.getAppDescriptor().getConfigValue('hideRelationShipDuration');

            $scope.removeRelationship = function (relationship, index) {
                if (relationship.uuid) {
                    relationship.voided = true;
                    $scope.patient.deletedRelationships.push(relationship);
                } else {
                    $scope.patient.newlyAddedRelationships.splice(index, 1);
                }
            };

            $scope.isPatientRelationship = function (relationship) {
                var relationshipType = getRelationshipType(relationship);
                return relationshipType && (_.isUndefined(relationshipType.searchType) || relationshipType.searchType === "patient");
            };

            var getRelationshipType = function (relationship) {
                if (angular.isUndefined(relationship['relationshipType'])) {
                    return false;
                }
                return $scope.getRelationshipType(relationship.relationshipType.uuid);
            };

            $scope.getChosenRelationshipType = function (relation) {
                if ($scope.isPatientRelationship(relation)) {
                    return "patient";
                } else if ($scope.isProviderRelationship(relation)) {
                    return "provider";
                }
            };

            $scope.isProviderRelationship = function (relationship) {
                var relationshipType = getRelationshipType(relationship);
                return relationshipType && relationshipType.searchType === "provider";
            };

            $scope.getRelationshipType = function (uuid) {
                return _.find($scope.relationshipTypes, {uuid: uuid});
            };

            $scope.getRelationshipTypeForDisplay = function (relationship) {
                var personUuid = $scope.patient.uuid;
                var relationshipType = $scope.getRelationshipType(relationship.relationshipType.uuid);
                if (!relationship.personA) {
                    return "";
                }
                if (relationship.personA.uuid === personUuid) {
                    return relationshipType.aIsToB;
                } else {
                    return relationshipType.bIsToA;
                }
            };

            $scope.getRelatedToPersonForDisplay = function (relationship) {
                var personRelatedTo = getPersonRelatedTo(relationship);
                return personRelatedTo ? personRelatedTo.display : "";
            };

            $scope.searchByPatientIdentifier = function (relationship) {
                if (!relationship.patientIdentifier) {
                    relationship.personB = null;
                    relationship.content = null;
                    return;
                }
                if (relationship.hasOwnProperty('personB')) {
                    relationship.personB = null;
                }
                return patientService.searchByIdentifier(relationship.patientIdentifier).then(function (response) {
                    if (angular.isUndefined(response)) {
                        return;
                    }

                    var patients = response.data.pageOfResults;
                    if (patients.length === 0) {
                        return;
                    }
                    relationship.content = getPatientGenderAndAge(patients[0]);
                    var personUuid = patients[0]['uuid'];
                    var personName = patients[0]['givenName'] + " " + patients[0]['familyName'];

                    relationship.personB = {'display': personName, 'uuid': personUuid};
                });
            };

            $scope.showPersonNotFound = function (relationship) {
                return relationship.patientIdentifier && !relationship.personB;
            };

            var getPersonRelatedTo = function (relationship) {
                return relationship.personA && relationship.personA.uuid === $scope.patient.uuid ? relationship.personB : relationship.personA;
            };

            $scope.openPatientDashboardInNewTab = function (relationship) {
                var personRelatedTo = getPersonRelatedTo(relationship);
                $window.open(getPatientRegistrationUrl(personRelatedTo.uuid), '_blank');
            };

            var getPatientRegistrationUrl = function (patientUuid) {
                return '#/patient/' + patientUuid;
            };

            $scope.getProviderList = function () {
                return function (searchAttrs) {
                    return providerService.search(searchAttrs.term);
                };
            };

            $scope.providerSelected = function (relationship) {
                return function (providerData) {
                    relationship.providerName = providerData.identifier;
                    relationship.personB = {'display': providerData.identifier, 'uuid': providerData.uuid};
                };
            };

            $scope.clearProvider = function (relationship) {
                if (!relationship.providerName) {
                    delete relationship.personB;
                }
            };

            $scope.getProviderDataResults = function (data) {
                return data.data.results.filter(function (provider) {
                    return provider.person;
                })
                .map(function (providerDetails) {
                    return {
                        'value': providerDetails.display || providerDetails.person.display,
                        'uuid': providerDetails.person.uuid,
                        'identifier': providerDetails.identifier || providerDetails.person.display
                    };
                });
            };

            $scope.onEditProviderName = function (relationship) {
                delete relationship.personB;
            };

            $scope.clearRelationshipRow = function (relationship, index) {
                delete relationship.personB;
                delete relationship.patientIdentifier;
                delete relationship.providerName;
                delete relationship.endDate;
                delete relationship.content;
                managePlaceholderRelationshipRows(index);
            };

            var managePlaceholderRelationshipRows = function (index) {
                var iter;
                for (iter = 0; iter < $scope.patient.newlyAddedRelationships.length; iter++) {
                    if ($scope.isEmpty($scope.patient.newlyAddedRelationships[iter]) && iter !== index) {
                        $scope.patient.newlyAddedRelationships.splice(iter, 1);
                    }
                }

                var emptyRows = _.filter($scope.patient.newlyAddedRelationships, $scope.isEmpty);
                if (emptyRows.length === 0) {
                    $scope.addPlaceholderRelationship();
                }
            };

            $scope.isEmpty = function (relationship) {
                return !relationship.relationshipType || !relationship.relationshipType.uuid;
            };

            var getPatientGenderAndAge = function (patient) {
                var patientGenderAndAge = [patient.givenName, patient.age, $rootScope.genderMap[angular.uppercase(patient.gender)]];
                return patientGenderAndAge.join(", ");
            };

            var init = function () {
                $scope.relationshipTypes = $rootScope.relationshipTypes;
                $scope.patient.relationships = $scope.patient.relationships || [];
            };

            init();
        }
    ]);

'use strict';

angular.module('bahmni.registration')
    .controller('NavigationController', ['$scope', '$rootScope', '$location', 'sessionService', '$window', 'appService', '$sce', 'offlineService', 'schedulerService',
        function ($scope, $rootScope, $location, sessionService, $window, appService, $sce, offlineService, schedulerService) {
            $scope.extensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.navigation", "link");
            $scope.isOfflineApp = offlineService.isOfflineApp();
            $scope.goTo = function (url) {
                $location.url(url);
            };

            $scope.htmlLabel = function (label) {
                return $sce.trustAsHtml(label);
            };

            $scope.logout = function () {
                $rootScope.errorMessage = null;
                sessionService.destroy().then(
                    function () {
                        $window.location = "../home/";
                    }
                );
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
        }]);

'use strict';

angular.module('bahmni.registration')
    .controller('SearchPatientController', ['$rootScope', '$scope', '$location', '$window', 'spinner', 'patientService', 'appService',
        'messagingService', '$translate', '$filter',
        function ($rootScope, $scope, $location, $window, spinner, patientService, appService, messagingService, $translate, $filter) {
            $scope.results = [];
            $scope.extraIdentifierTypes = _.filter($rootScope.patientConfiguration.identifierTypes, function (identifierType) {
                return !identifierType.primary;
            });
            var searching = false;
            var maxAttributesFromConfig = 5;
            var allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {};
            var patientSearchResultConfigs = appService.getAppDescriptor().getConfigValue("patientSearchResults") || {};
            maxAttributesFromConfig = !_.isEmpty(allSearchConfigs.programAttributes) ? maxAttributesFromConfig - 1 : maxAttributesFromConfig;

            $scope.getAddressColumnName = function (column) {
                var columnName = "";
                var columnCamelCase = column.replace(/([-_][a-z])/g, function ($1) {
                    return $1.toUpperCase().replace(/[-_]/, '');
                });
                _.each($scope.addressLevels, function (addressLevel) {
                    if (addressLevel.addressField === columnCamelCase) { columnName = addressLevel.name; }
                });
                return columnName;
            };

            var hasSearchParameters = function () {
                return $scope.searchParameters.name.trim().length > 0 ||
                    $scope.searchParameters.addressFieldValue.trim().length > 0 ||
                    $scope.searchParameters.customAttribute.trim().length > 0 ||
                    $scope.searchParameters.programAttributeFieldValue.trim().length > 0;
            };

            var searchBasedOnQueryParameters = function (offset) {
                if (!isUserPrivilegedForSearch()) {
                    showInsufficientPrivMessage();
                    return;
                }
                var searchParameters = $location.search();
                $scope.searchParameters.addressFieldValue = searchParameters.addressFieldValue || '';
                $scope.searchParameters.name = searchParameters.name || '';
                $scope.searchParameters.customAttribute = searchParameters.customAttribute || '';
                $scope.searchParameters.programAttributeFieldValue = searchParameters.programAttributeFieldValue || '';
                $scope.searchParameters.addressSearchResultsConfig = searchParameters.addressSearchResultsConfig || '';
                $scope.searchParameters.personSearchResultsConfig = searchParameters.personSearchResultsConfig || '';

                $scope.searchParameters.registrationNumber = searchParameters.registrationNumber || "";
                if (hasSearchParameters()) {
                    searching = true;
                    var searchPromise = patientService.search(
                        $scope.searchParameters.name,
                        undefined,
                        $scope.addressSearchConfig.field,
                        $scope.searchParameters.addressFieldValue,
                        $scope.searchParameters.customAttribute,
                        offset,
                        $scope.customAttributesSearchConfig.fields,
                        $scope.programAttributesSearchConfig.field,
                        $scope.searchParameters.programAttributeFieldValue,
                        $scope.addressSearchResultsConfig.fields,
                        $scope.personSearchResultsConfig.fields
                    ).then(function (response) {
                        mapExtraIdentifiers(response);
                        mapCustomAttributesSearchResults(response);
                        mapAddressAttributesSearchResults(response);
                        mapProgramAttributesSearchResults(response);
                        return response;
                    });
                    searchPromise['finally'](function () {
                        searching = false;
                    });
                    return searchPromise;
                }
            };
            $scope.convertToTableHeader = function (camelCasedText) {
                return camelCasedText.replace(/[A-Z]|^[a-z]/g, function (str) {
                    return " " + str.toUpperCase() + "";
                }).trim();
            };

            $scope.getProgramAttributeValues = function (result) {
                var attributeValues = result && result.patientProgramAttributeValue && result.patientProgramAttributeValue[$scope.programAttributesSearchConfig.field];
                var commaSeparatedAttributeValues = "";
                _.each(attributeValues, function (attr) {
                    commaSeparatedAttributeValues = commaSeparatedAttributeValues + attr + ", ";
                });
                return commaSeparatedAttributeValues.substring(0, commaSeparatedAttributeValues.length - 2);
            };

            var mapExtraIdentifiers = function (data) {
                if (data !== "Searching") {
                    _.each(data.pageOfResults, function (result) {
                        result.extraIdentifiers = result.extraIdentifiers && JSON.parse(result.extraIdentifiers);
                    });
                }
            };

            var mapCustomAttributesSearchResults = function (data) {
                if (($scope.personSearchResultsConfig.fields) && data !== "Searching") {
                    _.map(data.pageOfResults, function (result) {
                        result.customAttribute = result.customAttribute && JSON.parse(result.customAttribute);
                    });
                }
            };

            var mapAddressAttributesSearchResults = function (data) {
                if (($scope.addressSearchResultsConfig.fields) && data !== "Searching") {
                    _.map(data.pageOfResults, function (result) {
                        try {
                            result.addressFieldValue = JSON.parse(result.addressFieldValue);
                        } catch (e) {
                        }
                    });
                }
            };

            var mapProgramAttributesSearchResults = function (data) {
                if (($scope.programAttributesSearchConfig.field) && data !== "Searching") {
                    _.map(data.pageOfResults, function (result) {
                        var programAttributesObj = {};
                        var arrayOfStringOfKeysValue = result.patientProgramAttributeValue && result.patientProgramAttributeValue.substring(2, result.patientProgramAttributeValue.length - 2).split('","');
                        _.each(arrayOfStringOfKeysValue, function (keyValueString) {
                            var keyValueArray = keyValueString.split('":"');
                            var key = keyValueArray[0];
                            var value = keyValueArray[1];
                            if (!_.includes(_.keys(programAttributesObj), key)) {
                                programAttributesObj[key] = [];
                                programAttributesObj[key].push(value);
                            } else {
                                programAttributesObj[key].push(value);
                            }
                        });
                        result.patientProgramAttributeValue = programAttributesObj;
                    });
                }
            };

            var showSearchResults = function (searchPromise) {
                $scope.noMoreResultsPresent = false;
                if (searchPromise) {
                    searchPromise.then(function (data) {
                        $scope.results = data.pageOfResults;
                        $scope.noResultsMessage = $scope.results.length === 0 ? 'REGISTRATION_NO_RESULTS_FOUND' : null;
                    });
                }
            };

            var setPatientIdentifierSearchConfig = function () {
                $scope.patientIdentifierSearchConfig = {};
                $scope.patientIdentifierSearchConfig.show = allSearchConfigs.searchByPatientIdentifier === undefined ? true : allSearchConfigs.searchByPatientIdentifier;
            };

            var setAddressSearchConfig = function () {
                $scope.addressSearchConfig = allSearchConfigs.address || {};
                $scope.addressSearchConfig.show = !_.isEmpty($scope.addressSearchConfig) && !_.isEmpty($scope.addressSearchConfig.field);
                if ($scope.addressSearchConfig.label && !$scope.addressSearchConfig.label) {
                    throw new Error("Search Config label is not present!");
                }
                if ($scope.addressSearchConfig.field && !$scope.addressSearchConfig.field) {
                    throw new Error("Search Config field is not present!");
                }
            };

            var setCustomAttributesSearchConfig = function () {
                var customAttributesSearchConfig = allSearchConfigs.customAttributes;
                $scope.customAttributesSearchConfig = customAttributesSearchConfig || {};
                $scope.customAttributesSearchConfig.show = !_.isEmpty(customAttributesSearchConfig) && !_.isEmpty(customAttributesSearchConfig.fields);
            };

            var setProgramAttributesSearchConfig = function () {
                $scope.programAttributesSearchConfig = allSearchConfigs.programAttributes || {};
                $scope.programAttributesSearchConfig.show = !_.isEmpty($scope.programAttributesSearchConfig.field);
            };

            var sliceExtraColumns = function () {
                var orderedColumns = Object.keys(patientSearchResultConfigs);
                _.each(orderedColumns, function (column) {
                    if (patientSearchResultConfigs[column].fields && !_.isEmpty(patientSearchResultConfigs[column].fields)) {
                        patientSearchResultConfigs[column].fields = patientSearchResultConfigs[column].fields.slice(patientSearchResultConfigs[column].fields, maxAttributesFromConfig);
                        maxAttributesFromConfig -= patientSearchResultConfigs[column].fields.length;
                    }
                });
            };

            var setSearchResultsConfig = function () {
                var resultsConfigNotFound = false;
                if (_.isEmpty(patientSearchResultConfigs)) {
                    resultsConfigNotFound = true;
                    patientSearchResultConfigs.address = {"fields": allSearchConfigs.address ? [allSearchConfigs.address.field] : {}};
                    patientSearchResultConfigs.personAttributes
                        = {fields: allSearchConfigs.customAttributes ? allSearchConfigs.customAttributes.fields : {}};
                } else {
                    if (!patientSearchResultConfigs.address) patientSearchResultConfigs.address = {};
                    if (!patientSearchResultConfigs.personAttributes) patientSearchResultConfigs.personAttributes = {};
                }

                if (patientSearchResultConfigs.address.fields && !_.isEmpty(patientSearchResultConfigs.address.fields)) {
                    patientSearchResultConfigs.address.fields =
                        patientSearchResultConfigs.address.fields.filter(function (item) {
                            return !_.isEmpty($scope.getAddressColumnName(item));
                        });
                }
                if (!resultsConfigNotFound) sliceExtraColumns();
                $scope.personSearchResultsConfig = patientSearchResultConfigs.personAttributes;
                $scope.addressSearchResultsConfig = patientSearchResultConfigs.address;
            };

            var initialize = function () {
                $scope.searchParameters = {};
                $scope.searchActions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.search.result.action");
                setPatientIdentifierSearchConfig();
                setAddressSearchConfig();
                setCustomAttributesSearchConfig();
                setProgramAttributesSearchConfig();
                setSearchResultsConfig();
            };

            var identifyParams = function (querystring) {
                querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
                var params = {}, pair, d = decodeURIComponent;
                for (var i = querystring.length - 1; i >= 0; i--) {
                    pair = querystring[i].split('=');
                    params[d(pair[0])] = d(pair[1]);
                }
                return params;
            };

            initialize();

            $scope.disableSearchButton = function () {
                return !$scope.searchParameters.name && !$scope.searchParameters.addressFieldValue && !$scope.searchParameters.customAttribute && !$scope.searchParameters.programAttributeFieldValue;
            };

            $scope.$watch(function () {
                return $location.search();
            }, function () {
                showSearchResults(searchBasedOnQueryParameters(0));
            });

            $scope.searchById = function () {
                if (!isUserPrivilegedForSearch()) {
                    showInsufficientPrivMessage();
                    return;
                }
                if (!$scope.searchParameters.registrationNumber) {
                    return;
                }
                $scope.results = [];

                var patientIdentifier = $scope.searchParameters.registrationNumber;

                $location.search({
                    registrationNumber: $scope.searchParameters.registrationNumber,
                    programAttributeFieldName: $scope.programAttributesSearchConfig.field,
                    patientAttributes: $scope.customAttributesSearchConfig.fields,
                    programAttributeFieldValue: $scope.searchParameters.programAttributeFieldValue,
                    addressSearchResultsConfig: $scope.addressSearchResultsConfig.fields,
                    personSearchResultsConfig: $scope.personSearchResultsConfig.fields
                });

                var searchPromise = patientService.search(undefined, patientIdentifier, $scope.addressSearchConfig.field,
                    undefined, undefined, undefined, $scope.customAttributesSearchConfig.fields,
                    $scope.programAttributesSearchConfig.field, $scope.searchParameters.programAttributeFieldValue,
                    $scope.addressSearchResultsConfig.fields, $scope.personSearchResultsConfig.fields,
                    $scope.isExtraIdentifierConfigured())
                    .then(function (data) {
                        mapExtraIdentifiers(data);
                        mapCustomAttributesSearchResults(data);
                        mapAddressAttributesSearchResults(data);
                        mapProgramAttributesSearchResults(data);
                        if (data.pageOfResults.length === 1) {
                            var patient = data.pageOfResults[0];
                            var forwardUrl = appService.getAppDescriptor().getConfigValue("searchByIdForwardUrl") || "/patient/{{patientUuid}}";
                            $location.url(appService.getAppDescriptor().formatUrl(forwardUrl, {'patientUuid': patient.uuid}));
                        } else if (data.pageOfResults.length > 1) {
                            $scope.results = data.pageOfResults;
                            $scope.noResultsMessage = null;
                        } else {
                            $scope.patientIdentifier = {'patientIdentifier': patientIdentifier};
                            $scope.noResultsMessage = 'REGISTRATION_LABEL_COULD_NOT_FIND_PATIENT';
                        }
                    });
                spinner.forPromise(searchPromise);
            };
            var isUserPrivilegedForSearch = function () {
                var applicablePrivs = [Bahmni.Common.Constants.viewPatientsPrivilege, Bahmni.Common.Constants.editPatientsPrivilege,
                    Bahmni.Common.Constants.addVisitsPrivilege, Bahmni.Common.Constants.deleteVisitsPrivilege];
                var userPrivs = _.map($rootScope.currentUser.privileges, function (privilege) {
                    return privilege.name;
                });
                var result = _.some(userPrivs, function (privName) {
                    return _.includes(applicablePrivs, privName);
                });
                return result;
            };

            var showInsufficientPrivMessage = function () {
                var message = $translate.instant("REGISTRATION_INSUFFICIENT_PRIVILEGE");
                messagingService.showMessage('error', message);
            };

            $scope.loadingMoreResults = function () {
                return searching && !$scope.noMoreResultsPresent;
            };

            $scope.searchPatients = function () {
                if (!isUserPrivilegedForSearch()) {
                    showInsufficientPrivMessage();
                    return;
                }
                var queryParams = {};
                $scope.results = [];
                if ($scope.searchParameters.name) {
                    queryParams.name = $scope.searchParameters.name;
                }
                if ($scope.searchParameters.addressFieldValue) {
                    queryParams.addressFieldValue = $scope.searchParameters.addressFieldValue;
                }
                if ($scope.searchParameters.customAttribute && $scope.customAttributesSearchConfig.show) {
                    queryParams.customAttribute = $scope.searchParameters.customAttribute;
                }
                if ($scope.searchParameters.programAttributeFieldValue && $scope.programAttributesSearchConfig.show) {
                    queryParams.programAttributeFieldName = $scope.programAttributesSearchConfig.field;
                    queryParams.programAttributeFieldValue = $scope.searchParameters.programAttributeFieldValue;
                }
                $location.search(queryParams);
            };

            $scope.resultsPresent = function () {
                return angular.isDefined($scope.results) && $scope.results.length > 0;
            };

            $scope.editPatientUrl = function (url, options) {
                var temp = url;
                for (var key in options) {
                    temp = temp.replace("{{" + key + "}}", options[key]);
                }
                return temp;
            };

            $scope.nextPage = function () {
                if ($scope.nextPageLoading) {
                    return;
                }
                $scope.nextPageLoading = true;
                var promise = searchBasedOnQueryParameters($scope.results.length);
                if (promise) {
                    promise.then(function (data) {
                        angular.forEach(data.pageOfResults, function (result) {
                            $scope.results.push(result);
                        });
                        $scope.noMoreResultsPresent = (data.pageOfResults.length === 0);
                        $scope.nextPageLoading = false;
                    }, function () {
                        $scope.nextPageLoading = false;
                    });
                }
            };

            $scope.forPatient = function (patient) {
                $scope.selectedPatient = patient;
                return $scope;
            };

            $scope.doExtensionAction = function (extension) {
                var forwardTo = appService.getAppDescriptor().formatUrl(extension.url, { 'patientUuid': $scope.selectedPatient.uuid });
                if (extension.label === 'Print') {
                    var params = identifyParams(forwardTo);
                    if (params.launch === 'dialog') {
                        var firstChar = forwardTo.charAt(0);
                        var prefix = firstChar === "/" ? "#" : "#/";
                        var hiddenFrame = $("#printPatientFrame")[0];
                        hiddenFrame.src = prefix + forwardTo;
                        hiddenFrame.contentWindow.print();
                    } else {
                        $location.url(forwardTo);
                    }
                } else {
                    $location.url(forwardTo);
                }
            };

            $scope.extensionActionText = function (extension) {
                return $filter('titleTranslate')(extension);
            };

            $scope.isExtraIdentifierConfigured = function () {
                return !_.isEmpty($scope.extraIdentifierTypes);
            };
        }]);

'use strict';

angular.module('bahmni.registration')
    .controller('PatientCommonController', ['$scope', '$rootScope', '$http', 'patientAttributeService', 'appService', 'spinner',
        function ($scope, $rootScope, $http, patientAttributeService, appService, spinner) {
            var autoCompleteFields = appService.getAppDescriptor().getConfigValue("autoCompleteFields", []);
            var showCasteSameAsLastNameCheckbox = appService.getAppDescriptor().getConfigValue("showCasteSameAsLastNameCheckbox");
            var personAttributes = [];
            var caste;
            $scope.showMiddleName = appService.getAppDescriptor().getConfigValue("showMiddleName");
            $scope.showBirthTime = appService.getAppDescriptor().getConfigValue("showBirthTime") != null
                ? appService.getAppDescriptor().getConfigValue("showBirthTime") : true;  // show birth time by default
            $scope.genderCodes = Object.keys($rootScope.genderMap);
            $scope.dobMandatory = appService.getAppDescriptor().getConfigValue("dobMandatory") || false;
            $scope.readOnlyExtraIdentifiers = appService.getAppDescriptor().getConfigValue("readOnlyExtraIdentifiers");

            $scope.getDeathConcepts = function () {
                return $http({
                    url: Bahmni.Common.Constants.globalPropertyUrl,
                    method: 'GET',
                    params: {
                        property: 'concept.reasonForDeath'
                    },
                    withCredentials: true,
                    transformResponse: [function (deathConcept) {
                        if (_.isEmpty(deathConcept)) {
                            $scope.deathConceptExists = false;
                        } else {
                            $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                                params: {
                                    name: deathConcept,
                                    v: "custom:(uuid,name,set,setMembers:(uuid,display,name:(uuid,name),retired))"
                                },
                                withCredentials: true
                            }).then(function (results) {
                                $scope.deathConceptExists = !!results.data.results.length;
                                $scope.deathConcepts = results.data.results[0] ? results.data.results[0].setMembers : [];
                                $scope.deathConcepts = filterRetireDeathConcepts($scope.deathConcepts);
                            });
                        }
                    }]
                });
            };
            spinner.forPromise($scope.getDeathConcepts());
            var filterRetireDeathConcepts = function (deathConcepts) {
                return _.filter(deathConcepts, function (concept) {
                    return !concept.retired;
                });
            };

            $scope.isAutoComplete = function (fieldName) {
                return !_.isEmpty(autoCompleteFields) ? autoCompleteFields.indexOf(fieldName) > -1 : false;
            };

            $scope.showCasteSameAsLastName = function () {
                personAttributes = _.map($rootScope.patientConfiguration.attributeTypes, function (attribute) {
                    return attribute.name.toLowerCase();
                });
                var personAttributeHasCaste = personAttributes.indexOf("caste") !== -1;
                caste = personAttributeHasCaste ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("caste")].name : undefined;
                return showCasteSameAsLastNameCheckbox && personAttributeHasCaste;
            };

            $scope.setCasteAsLastName = function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient[caste] = $scope.patient.familyName;
                }
            };

            var showSections = function (sectionsToShow, allSections) {
                _.each(sectionsToShow, function (sectionName) {
                    allSections[sectionName].canShow = true;
                    allSections[sectionName].expand = true;
                });
            };

            var hideSections = function (sectionsToHide, allSections) {
                _.each(sectionsToHide, function (sectionName) {
                    allSections[sectionName].canShow = false;
                });
            };

            var executeRule = function (ruleFunction) {
                var attributesShowOrHideMap = ruleFunction($scope.patient);
                var patientAttributesSections = $rootScope.patientConfiguration.getPatientAttributesSections();
                showSections(attributesShowOrHideMap.show, patientAttributesSections);
                hideSections(attributesShowOrHideMap.hide, patientAttributesSections);
            };

            $scope.handleUpdate = function (attribute) {
                var ruleFunction = Bahmni.Registration.AttributesConditions.rules && Bahmni.Registration.AttributesConditions.rules[attribute];
                if (ruleFunction) {
                    executeRule(ruleFunction);
                }
            };

            var executeShowOrHideRules = function () {
                _.each(Bahmni.Registration.AttributesConditions.rules, function (rule) {
                    executeRule(rule);
                });
            };

            $scope.$watch('patientLoaded', function () {
                if ($scope.patientLoaded) {
                    executeShowOrHideRules();
                }
            });

            $scope.getAutoCompleteList = function (attributeName, query, type) {
                return patientAttributeService.search(attributeName, query, type);
            };

            $scope.getDataResults = function (data) {
                return data.results;
            };

            $scope.$watch('patient.familyName', function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient[caste] = $scope.patient.familyName;
                }
            });

            $scope.$watch('patient.caste', function () {
                if ($scope.patient.sameAsLastName && ($scope.patient.familyName !== $scope.patient[caste])) {
                    $scope.patient.sameAsLastName = false;
                }
            });

            $scope.selectIsDead = function () {
                if ($scope.patient.causeOfDeath || $scope.patient.deathDate) {
                    $scope.patient.dead = true;
                }
            };

            $scope.disableIsDead = function () {
                return ($scope.patient.causeOfDeath || $scope.patient.deathDate) && $scope.patient.dead;
            };
        }]);


'use strict';

angular.module('bahmni.registration')
    .controller('CreatePatientController', ['$scope', '$rootScope', '$state', 'patientService', 'patient', 'spinner', 'appService', 'messagingService', 'ngDialog', '$q', 'offlineService',
        function ($scope, $rootScope, $state, patientService, patient, spinner, appService, messagingService, ngDialog, $q, offlineService) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            $scope.actions = {};
            var errorMessage;
            var configValueForEnterId = appService.getAppDescriptor().getConfigValue('showEnterID');
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.disablePhotoCapture = appService.getAppDescriptor().getConfigValue("disablePhotoCapture");
            $scope.showEnterID = configValueForEnterId === null ? true : configValueForEnterId;
            $scope.today = Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime(dateUtil.now());
            $scope.assumedBirthDay = appService.getAppDescriptor().getConfigValue("assumedBirthDay");

            var getPersonAttributeTypes = function () {
                return $rootScope.patientConfiguration.attributeTypes;
            };

            var prepopulateDefaultsInFields = function () {
                var personAttributeTypes = getPersonAttributeTypes();
                var patientInformation = appService.getAppDescriptor().getConfigValue("patientInformation");
                if (!patientInformation || !patientInformation.defaults) {
                    return;
                }
                var defaults = patientInformation.defaults;
                var defaultVariableNames = _.keys(defaults);

                var hasDefaultAnswer = function (personAttributeType) {
                    return _.includes(defaultVariableNames, personAttributeType.name);
                };

                var isConcept = function (personAttributeType) {
                    return personAttributeType.format === "org.openmrs.Concept";
                };

                var setDefaultAnswer = function (personAttributeType) {
                    $scope.patient[personAttributeType.name] = defaults[personAttributeType.name];
                };

                var setDefaultConcept = function (personAttributeType) {
                    var defaultAnswer = defaults[personAttributeType.name];
                    var isDefaultAnswer = function (answer) {
                        return answer.fullySpecifiedName === defaultAnswer;
                    };

                    _.chain(personAttributeType.answers).filter(isDefaultAnswer).each(function (answer) {
                        $scope.patient[personAttributeType.name] = {
                            conceptUuid: answer.conceptId,
                            value: answer.fullySpecifiedName
                        };
                    }).value();
                };

                _.chain(personAttributeTypes)
                    .filter(hasDefaultAnswer)
                    .each(setDefaultAnswer).filter(isConcept).each(setDefaultConcept).value();
            };

            var expandSectionsWithDefaultValue = function () {
                angular.forEach($rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections(), function (section) {
                    var notNullAttribute = _.find(section && section.attributes, function (attribute) {
                        return $scope.patient[attribute.name] !== undefined;
                    });
                    section.expand = section.expanded || (notNullAttribute ? true : false);
                });
            };

            var init = function () {
                $scope.patient = patient.create();
                prepopulateDefaultsInFields();
                expandSectionsWithDefaultValue();
                $scope.patientLoaded = true;
            };

            init();

            var prepopulateFields = function () {
                var fieldsToPopulate = appService.getAppDescriptor().getConfigValue("prepopulateFields");
                if (fieldsToPopulate) {
                    _.each(fieldsToPopulate, function (field) {
                        var addressLevel = _.find($scope.addressLevels, function (level) {
                            return level.name === field;
                        });
                        if (addressLevel) {
                            $scope.patient.address[addressLevel.addressField] = $rootScope.loggedInLocation[addressLevel.addressField];
                        }
                    });
                }
            };
            prepopulateFields();

            var addNewRelationships = function () {
                var newRelationships = _.filter($scope.patient.newlyAddedRelationships, function (relationship) {
                    return relationship.relationshipType && relationship.relationshipType.uuid;
                });
                newRelationships = _.each(newRelationships, function (relationship) {
                    delete relationship.patientIdentifier;
                    delete relationship.content;
                    delete relationship.providerName;
                });
                $scope.patient.relationships = newRelationships;
            };

            var getConfirmationViaNgDialog = function (config) {
                var ngDialogLocalScope = config.scope.$new();
                ngDialogLocalScope.yes = function () {
                    ngDialog.close();
                    config.yesCallback();
                };
                ngDialogLocalScope.no = function () {
                    ngDialog.close();
                };
                ngDialog.open({
                    template: config.template,
                    data: config.data,
                    scope: ngDialogLocalScope
                });
            };

            var copyPatientProfileDataToScope = function (response) {
                var patientProfileData = response.data;
                $scope.patient.uuid = patientProfileData.patient.uuid;
                $scope.patient.name = patientProfileData.patient.person.names[0].display;
                $scope.patient.isNew = true;
                $scope.patient.registrationDate = dateUtil.now();
                $scope.patient.newlyAddedRelationships = [{}];
                $scope.actions.followUpAction(patientProfileData);
            };

            var createPatient = function (jumpAccepted) {
                return patientService.create($scope.patient, jumpAccepted).then(function (response) {
                    copyPatientProfileDataToScope(response);
                }, function (response) {
                    if (response.status === 412) {
                        var data = _.map(response.data, function (data) {
                            return {
                                sizeOfTheJump: data.sizeOfJump,
                                identifierName: _.find($rootScope.patientConfiguration.identifierTypes, {uuid: data.identifierType}).name
                            };
                        });
                        getConfirmationViaNgDialog({
                            template: 'views/customIdentifierConfirmation.html',
                            data: data,
                            scope: $scope,
                            yesCallback: function () {
                                return createPatient(true);
                            }
                        });
                    }
                    if (response.isIdentifierDuplicate) {
                        errorMessage = response.message;
                    }
                });
            };

            var createPromise = function () {
                var deferred = $q.defer();
                createPatient().finally(function () {
                    return deferred.resolve({});
                });
                return deferred.promise;
            };

            $scope.isOffline = function () {
                return offlineService.isOfflineApp();
            };

            $scope.create = function () {
                addNewRelationships();
                var errorMessages = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
                if (errorMessages.length > 0) {
                    errorMessages.forEach(function (errorMessage) {
                        messagingService.showMessage('error', errorMessage);
                    });
                    return $q.when({});
                }
                return spinner.forPromise(createPromise()).then(function (response) {
                    if (errorMessage) {
                        messagingService.showMessage("error", errorMessage);
                        errorMessage = undefined;
                    }
                });
            };

            $scope.afterSave = function () {
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
                $state.go("patient.edit", {
                    patientUuid: $scope.patient.uuid
                });
            };
        }
    ]);

'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', 'patientService', 'encounterService', '$stateParams', 'openmrsPatientMapper', '$window', '$q', 'spinner', 'appService', 'messagingService', '$rootScope',
        function ($scope, patientService, encounterService, $stateParams, openmrsPatientMapper, $window, $q, spinner, appService, messagingService, $rootScope) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var uuid = $stateParams.patientUuid;
            $scope.patient = {};
            $scope.actions = {};
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.disablePhotoCapture = appService.getAppDescriptor().getConfigValue("disablePhotoCapture");

            $scope.today = dateUtil.getDateWithoutTime(dateUtil.now());

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

'use strict';

angular.module('bahmni.registration')
    .directive('patientAction', ['$window', '$location', '$state', 'spinner', '$rootScope', '$stateParams',
        '$bahmniCookieStore', 'appService', 'visitService', 'sessionService', 'encounterService',
        'messagingService', '$translate', 'offlineService',
        function ($window, $location, $state, spinner, $rootScope, $stateParams,
                  $bahmniCookieStore, appService, visitService, sessionService, encounterService,
                  messagingService, $translate, offlineService) {
            var controller = function ($scope) {
                var self = this;
                var uuid = $stateParams.patientUuid;
                var editActionsConfig = appService.getAppDescriptor().getExtensions(Bahmni.Registration.Constants.nextStepConfigId, "config") || [];
                var conceptSetExtensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.conceptSetGroup.observations", "config");
                var loginLocationUuid = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid;
                var defaultVisitType = $rootScope.regEncounterConfiguration.getDefaultVisitType(loginLocationUuid);
                defaultVisitType = defaultVisitType ? defaultVisitType : appService.getAppDescriptor().getConfigValue('defaultVisitType');
                var showStartVisitButton = appService.getAppDescriptor().getConfigValue("showStartVisitButton");
                var forwardUrlsForVisitTypes = appService.getAppDescriptor().getConfigValue("forwardUrlsForVisitTypes");
                showStartVisitButton = showStartVisitButton ? showStartVisitButton : true;
                var isOfflineApp = offlineService.isOfflineApp();
                var visitLocationUuid = $rootScope.visitLocation;
                var forwardUrls = forwardUrlsForVisitTypes ? forwardUrlsForVisitTypes : false;

                var getForwardUrlEntryForVisitFromTheConfig = function () {
                    var matchedEntry = _.find(forwardUrls, function (entry) {
                        if (self.hasActiveVisit) {
                            return entry.visitType === self.activeVisit.visitType.name;
                        }
                        return entry.visitType === $scope.visitControl.selectedVisitType.name;
                    });
                    return matchedEntry;
                };

                var keyForActiveVisitEntry = function () {
                    var matchedEntry = getForwardUrlEntryForVisitFromTheConfig();
                    if (matchedEntry) {
                        $scope.activeVisitConfig = matchedEntry;
                        if (_.isEmpty(_.get($scope.activeVisitConfig, 'translationKey'))) {
                            $scope.activeVisitConfig.translationKey = "REGISTRATION_LABEL_ENTER_VISIT";
                            $scope.activeVisitConfig.shortcutKey = "REGISTRATION_ENTER_VISIT_DETAILS_ACCESS_KEY";
                        }
                        return 'forwardAction';
                    }
                };

                function setForwardActionKey () {
                    if (editActionsConfig.length === 0 && isOfflineApp) {
                        $scope.forwardActionKey = conceptSetExtensions.length === 0 ? undefined : 'enterVisitDetails';
                    } else if (editActionsConfig.length === 0) {
                        $scope.forwardActionKey = self.hasActiveVisit ? (getForwardUrlEntryForVisitFromTheConfig() ? keyForActiveVisitEntry() : 'enterVisitDetails') : 'startVisit';
                    } else {
                        $scope.actionConfig = editActionsConfig[0];
                        $scope.forwardActionKey = 'configAction';
                    }
                }

                var init = function () {
                    if (_.isEmpty(uuid)) {
                        self.hasActiveVisit = false;
                        setForwardActionKey();
                        return;
                    }
                    var searchParams = {
                        patient: uuid,
                        includeInactive: false,
                        v: "custom:(uuid,visitType,location:(uuid))"
                    };
                    spinner.forPromise(visitService.search(searchParams).then(function (response) {
                        var results = response.data.results;
                        var activeVisitForCurrentLoginLocation;
                        if (results) {
                            activeVisitForCurrentLoginLocation = _.filter(results, function (result) {
                                return result.location.uuid === visitLocationUuid;
                            });
                        }
                        self.hasActiveVisit = activeVisitForCurrentLoginLocation && (activeVisitForCurrentLoginLocation.length > 0);
                        self.hasActiveVisit = self.hasActiveVisit ? self.hasActiveVisit : (isOfflineApp ? true : false);
                        if (self.hasActiveVisit) {
                            self.activeVisit = activeVisitForCurrentLoginLocation[0];
                        }
                        setForwardActionKey();
                    }));
                };

                $scope.visitControl = new Bahmni.Common.VisitControl(
                    $rootScope.regEncounterConfiguration.getVisitTypesAsArray(),
                    defaultVisitType, encounterService, $translate, visitService
                );

                $scope.visitControl.onStartVisit = function () {
                    $scope.setSubmitSource('startVisit');
                };

                $scope.setSubmitSource = function (source) {
                    $scope.actions.submitSource = source;
                };

                $scope.showStartVisitButton = function () {
                    return showStartVisitButton;
                };

                var goToForwardUrlPage = function (patientData) {
                    var forwardUrl = appService.getAppDescriptor().formatUrl($scope.activeVisitConfig.forwardUrl, {'patientUuid': patientData.patient.uuid});
                    $window.location.href = forwardUrl;
                };

                $scope.actions.followUpAction = function (patientProfileData) {
                    messagingService.clearAll();
                    switch ($scope.actions.submitSource) {
                    case 'startVisit':
                        var entry = getForwardUrlEntryForVisitFromTheConfig();
                        var forwardUrl = entry ? entry.forwardUrl : undefined;
                        return createVisit(patientProfileData, forwardUrl);
                    case 'forwardAction':
                        return goToForwardUrlPage(patientProfileData);
                    case 'enterVisitDetails':
                        return goToVisitPage(patientProfileData);
                    case 'configAction':
                        return handleConfigAction(patientProfileData);
                    case 'save':
                        $scope.afterSave();
                    }
                };

                var handleConfigAction = function (patientProfileData) {
                    var forwardUrl = appService.getAppDescriptor().formatUrl($scope.actionConfig.extensionParams.forwardUrl, {'patientUuid': patientProfileData.patient.uuid});
                    if (!self.hasActiveVisit) {
                        createVisit(patientProfileData, forwardUrl);
                    } else {
                        $window.location.href = forwardUrl;
                    }
                };

                var goToVisitPage = function (patientData) {
                    $scope.patient.uuid = patientData.patient.uuid;
                    $scope.patient.name = patientData.patient.person.names[0].display;
                    $location.path("/patient/" + patientData.patient.uuid + "/visit");
                };

                var isEmptyVisitLocation = function () {
                    return _.isEmpty($rootScope.visitLocation);
                };

                var createVisit = function (patientProfileData, forwardUrl) {
                    if (isEmptyVisitLocation()) {
                        $state.go('patient.edit', {patientUuid: $scope.patient.uuid}).then(function () {
                            messagingService.showMessage("error", "NO_LOCATION_TAGGED_TO_VISIT_LOCATION");
                        });
                        return;
                    }
                    spinner.forPromise($scope.visitControl.createVisitOnly(patientProfileData.patient.uuid, $rootScope.visitLocation).then(function () {
                        if (forwardUrl) {
                            var updatedForwardUrl = appService.getAppDescriptor().formatUrl(forwardUrl, {'patientUuid': patientProfileData.patient.uuid});
                            $window.location.href = updatedForwardUrl;
                        } else {
                            goToVisitPage(patientProfileData);
                        }
                    }, function () {
                        $state.go('patient.edit', {patientUuid: $scope.patient.uuid});
                    }));
                };

                init();
            };
            return {
                restrict: 'E',
                templateUrl: 'views/patientAction.html',
                controller: controller
            };
        }
    ]);

'use strict';

angular.module('bahmni.registration')
    .controller('VisitController', ['$window', '$scope', '$rootScope', '$state', '$bahmniCookieStore', 'patientService', 'encounterService', '$stateParams', 'spinner', '$timeout', '$q', 'appService', 'openmrsPatientMapper', 'contextChangeHandler', 'messagingService', 'sessionService', 'visitService', '$location', '$translate', 'offlineService',
        function ($window, $scope, $rootScope, $state, $bahmniCookieStore, patientService, encounterService, $stateParams, spinner, $timeout, $q, appService, openmrsPatientMapper, contextChangeHandler, messagingService, sessionService, visitService, $location, $translate, offlineService) {
            var vm = this;
            var patientUuid = $stateParams.patientUuid;
            var extensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.conceptSetGroup.observations", "config");
            var locationUuid = sessionService.getLoginLocationUuid();
            var selectedProvider = $rootScope.currentProvider;
            $scope.conceptSets = extensions.map(function (extension) {
                return new Bahmni.ConceptSet.ConceptSetSection(extension, $rootScope.currentUser, {}, [], {});
            });
            $scope.availableConceptSets = $scope.conceptSets.filter(function (conceptSet) {
                return conceptSet.isAvailable($scope.context);
            });
            var regEncounterTypeUuid = $rootScope.regEncounterConfiguration.encounterTypes[Bahmni.Registration.Constants.registrationEncounterType];
            var visitLocationUuid = $rootScope.visitLocation;

            var getPatient = function () {
                var deferred = $q.defer();
                patientService.get(patientUuid).then(function (openMRSPatient) {
                    deferred.resolve(openMRSPatient);
                    $scope.patient = openmrsPatientMapper.map(openMRSPatient);
                    $scope.patient.name = openMRSPatient.patient.person.names[0].display;
                    $scope.patient.uuid = openMRSPatient.patient.uuid;
                });
                return deferred.promise;
            };

            var getActiveEncounter = function () {
                var deferred = $q.defer();
                encounterService.find({
                    "patientUuid": patientUuid,
                    "providerUuids": !_.isEmpty($scope.currentProvider.uuid) ? [$scope.currentProvider.uuid] : null,
                    "includeAll": false,
                    locationUuid: locationUuid,
                    encounterTypeUuids: [regEncounterTypeUuid]
                }).then(function (response) {
                    deferred.resolve(response);
                    $scope.observations = response.data.observations;
                });
                return deferred.promise;
            };

            $scope.hideFields = appService.getAppDescriptor().getConfigValue("hideFields");

            $scope.back = function () {
                $state.go('patient.edit');
            };

            $scope.updatePatientImage = function (image) {
                var updateImagePromise = patientService.updateImage($scope.patient.uuid, image.replace("data:image/jpeg;base64,", ""));
                spinner.forPromise(updateImagePromise);
                return updateImagePromise;
            };

            var save = function () {
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

            var encounterPromise = function () {
                return getActiveEncounter().then(function (response) {
                    $scope.encounter.encounterUuid = response.data.encounterUuid;
                    $scope.encounter.encounterDateTime = response.data.encounterDateTime;
                }).then(function () {
                    return encounterService.create($scope.encounter);
                });
            };

            var isUserPrivilegedToCloseVisit = function () {
                var applicablePrivs = [Bahmni.Common.Constants.closeVisitPrivilege, Bahmni.Common.Constants.deleteVisitsPrivilege];
                var userPrivs = _.map($rootScope.currentUser.privileges, function (privilege) {
                    return privilege.name;
                });
                return _.some(userPrivs, function (privName) {
                    return _.includes(applicablePrivs, privName);
                });
            };

            var searchActiveVisitsPromise = function () {
                return visitService.search({
                    patient: patientUuid, includeInactive: false, v: "custom:(uuid,location:(uuid))"
                }).then(function (response) {
                    var results = response.data.results;
                    var activeVisitForCurrentLoginLocation;
                    if (results) {
                        activeVisitForCurrentLoginLocation = _.filter(results, function (result) {
                            return result.location.uuid === visitLocationUuid;
                        });
                    }

                    var hasActiveVisit = activeVisitForCurrentLoginLocation.length > 0;
                    vm.visitUuid = hasActiveVisit ? activeVisitForCurrentLoginLocation[0].uuid : "";
                    $scope.canCloseVisit = isUserPrivilegedToCloseVisit() && hasActiveVisit;
                });
            };

            $scope.closeVisitIfDischarged = function () {
                visitService.getVisitSummary(vm.visitUuid).then(function (response) {
                    var visitSummary = response.data;
                    if (visitSummary.admissionDetails && !visitSummary.dischargeDetails) {
                        messagingService.showMessage("error", 'REGISTRATION_VISIT_CANNOT_BE_CLOSED');
                    } else {
                        closeVisit();
                    }
                });
            };

            var closeVisit = function () {
                var confirmed = $window.confirm($translate.instant("REGISTRATION_CONFIRM_CLOSE_VISIT"));
                if (confirmed) {
                    visitService.endVisit(vm.visitUuid).then(function () {
                        $location.url(Bahmni.Registration.Constants.patientSearchURL);
                    });
                }
            };

            $scope.getMessage = function () {
                return $scope.message;
            };
            var validate = function () {
                mandatoryValidate();
                var deferred = $q.defer();
                var contxChange = contextChangeHandler.execute();
                var allowContextChange = contxChange["allow"];
                var errorMessage;
                if (!allowContextChange) {
                    errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"] : 'REGISTRATION_LABEL_CORRECT_ERRORS';
                    messagingService.showMessage('error', errorMessage);
                    deferred.reject("Some fields are not valid");
                    return deferred.promise;
                } else if (!mandatoryValidate()) { // This ELSE IF condition is to be deleted later.
                    errorMessage = "REGISTRATION_LABEL_ENTER_MANDATORY_FIELDS";
                    messagingService.showMessage('error', errorMessage);
                    deferred.reject("Some fields are not valid");
                    return deferred.promise;
                } else {
                    deferred.resolve();
                    return deferred.promise;
                }
            };

            // Start :: Registration Page validation
            // To be deleted later - Hacky fix only for Registration Page
            var mandatoryConceptGroup = [];
            var mandatoryValidate = function () {
                conceptGroupValidation($scope.observations);
                return isValid(mandatoryConceptGroup);
            };

            var conceptGroupValidation = function (observations) {
                var concepts = _.filter(observations, function (observationNode) {
                    return isMandatoryConcept(observationNode);
                });
                if (!_.isEmpty(concepts)) {
                    mandatoryConceptGroup = _.union(mandatoryConceptGroup, concepts);
                }
            };
            var isMandatoryConcept = function (observation) {
                if (!_.isEmpty(observation.groupMembers)) {
                    conceptGroupValidation(observation.groupMembers);
                } else {
                    return observation.conceptUIConfig && observation.conceptUIConfig.required;
                }
            };
            var isValid = function (mandatoryConcepts) {
                var concept = mandatoryConcepts.filter(function (mandatoryConcept) {
                    if (mandatoryConcept.isNumeric() && mandatoryConcept.value === 0) {
                        return false;
                    }
                    return !mandatoryConcept.value;
                });
                return _.isEmpty(concept);
            };
            // End :: Registration Page validation

            var afterSave = function () {
                var forwardUrl = appService.getAppDescriptor().getConfigValue("afterVisitSaveForwardUrl");
                if (forwardUrl != null) {
                    $window.location.href = appService.getAppDescriptor().formatUrl(forwardUrl, {'patientUuid': patientUuid});
                } else {
                    $state.transitionTo($state.current, $state.params, {
                        reload: true,
                        inherit: false,
                        notify: true
                    });
                }
                messagingService.showMessage('info', 'REGISTRATION_LABEL_SAVED');
            };

            $scope.submit = function () {
                return validate().then(save).then(afterSave);
            };

            $scope.today = function () {
                return new Date();
            };

            $scope.disableFormSubmitOnEnter = function () {
                $('.visit-patient').find('input').keypress(function (e) {
                    if (e.which === 13) { // Enter key = keycode 13
                        return false;
                    }
                });
            };

            var getConceptSet = function () {
                var visitType = $scope.encounterConfig.getVisitTypeByUuid($scope.visitTypeUuid);
                $scope.context = {visitType: visitType, patient: $scope.patient};
            };

            spinner.forPromise($q.all([getPatient(), getActiveEncounter(), searchActiveVisitsPromise()]).then(getConceptSet));
        }]);

'use strict';

angular.module('bahmni.registration')
    .factory('patientService', ['$http', '$rootScope', '$bahmniCookieStore', '$q', 'patientServiceStrategy', 'sessionService', function ($http, $rootScope, $bahmniCookieStore, $q, patientServiceStrategy, sessionService) {
        var openmrsUrl = Bahmni.Registration.Constants.openmrsUrl;
        var baseOpenMRSRESTURL = Bahmni.Registration.Constants.baseOpenMRSRESTURL;

        var search = function (query, identifier, addressFieldName, addressFieldValue, customAttributeValue,
                               offset, customAttributeFields, programAttributeFieldName, programAttributeFieldValue, addressSearchResultsConfig,
                               patientSearchResultsConfig, filterOnAllIdentifiers) {
            var config = {
                params: {
                    q: query,
                    identifier: identifier,
                    s: "byIdOrNameOrVillage",
                    addressFieldName: addressFieldName,
                    addressFieldValue: addressFieldValue,
                    customAttribute: customAttributeValue,
                    startIndex: offset || 0,
                    patientAttributes: customAttributeFields,
                    programAttributeFieldName: programAttributeFieldName,
                    programAttributeFieldValue: programAttributeFieldValue,
                    addressSearchResultsConfig: addressSearchResultsConfig,
                    patientSearchResultsConfig: patientSearchResultsConfig,
                    loginLocationUuid: sessionService.getLoginLocationUuid(),
                    filterOnAllIdentifiers: filterOnAllIdentifiers
                },
                withCredentials: true
            };
            return patientServiceStrategy.search(config);
        };

        var searchByIdentifier = function (identifier) {
            return $http.get(Bahmni.Common.Constants.bahmniSearchUrl + "/patient", {
                method: "GET",
                params: {
                    identifier: identifier,
                    loginLocationUuid: sessionService.getLoginLocationUuid()
                },
                withCredentials: true
            });
        };

        var get = function (uuid) {
            return patientServiceStrategy.get(uuid);
        };

        var create = function (patient, jumpAccepted) {
            return patientServiceStrategy.create(patient, jumpAccepted);
        };

        var update = function (patient, openMRSPatient) {
            return patientServiceStrategy.update(patient, openMRSPatient, $rootScope.patientConfiguration.attributeTypes);
        };

        var updateImage = function (uuid, image) {
            var url = baseOpenMRSRESTURL + "/personimage/";
            var data = {
                "person": {"uuid": uuid},
                "base64EncodedImage": image
            };
            var config = {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            };
            return $http.post(url, data, config);
        };

        return {
            search: search,
            searchByIdentifier: searchByIdentifier,
            create: create,
            update: update,
            get: get,
            updateImage: updateImage
        };
    }]);

'use strict';

angular.module('bahmni.registration')
    .factory('patientAttributeService', ['$http', 'offlineService', '$q', function ($http, offlineService, $q) {
        var urlMap;

        var init = function () {
            urlMap = {
                "personName": Bahmni.Common.Constants.bahmniSearchUrl + "/personname",
                "personAttribute": Bahmni.Common.Constants.bahmniSearchUrl + "/personattribute"
            };
        };
        init();

        var search = function (fieldName, query, type) {
            if (offlineService.isOfflineApp()) {
                return $q.when({ data: {} });
            }
            var url = urlMap[type];
            var queryWithoutTrailingSpaces = query.trimLeft();

            return $http.get(url, {
                method: "GET",
                params: {q: queryWithoutTrailingSpaces, key: fieldName },
                withCredentials: true
            });
        };

        return {
            search: search
        };
    }]);

'use strict';

angular.module('bahmni.registration')
    .factory('addressHierarchyService', ['$http', 'offlineService', 'offlineDbService', 'androidDbService',
        function ($http, offlineService, offlineDbService, androidDbService) {
            var parseSearchString = function (searchString) {
                searchString = searchString.replace(new RegExp("\\(", "g"), "\\(");
                searchString = searchString.replace(new RegExp("\\)", "g"), "\\)");
                return searchString;
            };

            var search = function (fieldName, query, parentUuid) {
                var params = {searchString: query, addressField: fieldName, parentUuid: parentUuid, limit: defaults.maxAutocompleteResults};
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        return androidDbService.searchAddress(params);
                    } else {
                        params.searchString = parseSearchString(query);
                        return offlineDbService.searchAddress(params);
                    }
                }
                var url = Bahmni.Registration.Constants.openmrsUrl + "/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form";

                return $http.get(url, {
                    method: "GET",
                    params: params,
                    withCredentials: true
                });
            };

            var getNextAvailableParentName = function (addressField) {
                var parent = addressField.parent;
                while (parent) {
                    if (parent.name) {
                        return parent.name;
                    } else {
                        parent = parent.parent;
                    }
                }
                return "";
            };

            var getAddressDataResults = function (data) {
                return data.data ? data.data.map(function (addressField) {
                    var parentName = getNextAvailableParentName(addressField);
                    return {
                        'value': addressField.name,
                        'label': addressField.name + (parentName ? ", " + parentName : ""),
                        addressField: addressField
                    };
                }) : [];
            };

            return {
                search: search,
                getNextAvailableParentName: getNextAvailableParentName,
                getAddressDataResults: getAddressDataResults
            };
        }]);

'use strict';

angular.module('bahmni.registration')
    .factory('registrationCardPrinter', ['printer', function (printer) {
        var print = function (templatePath, patient, obs, encounterDateTime) {
            templatePath = templatePath || "views/nolayoutfound.html";
            printer.print(templatePath, {patient: patient, today: new Date(), obs: obs || {}, encounterDateTime: encounterDateTime });
        };

        return {
            print: print
        };
    }]);

'use strict';

Bahmni.Common.Domain.AttributeTypeMapper = (function () {
    function AttributeTypeMapper () {
    }

    AttributeTypeMapper.prototype.mapFromOpenmrsAttributeTypes = function (mrsAttributeTypes, mandatoryAttributes, attributesConfig) {
        var attributeTypes = [];
        angular.forEach(mrsAttributeTypes, function (mrsAttributeType) {
            var isRequired = function () {
                var element = _.find(mandatoryAttributes, function (mandatoryAttribute) {
                    return mandatoryAttribute == mrsAttributeType.name;
                });
                return element ? true : false;
            };

            var attributeType = {
                uuid: mrsAttributeType.uuid,
                sortWeight: mrsAttributeType.sortWeight,
                name: mrsAttributeType.name,
                fullySpecifiedName: mrsAttributeType.name,
                description: mrsAttributeType.description || mrsAttributeType.name,
                format: mrsAttributeType.format || mrsAttributeType.datatypeClassname,
                answers: [],
                required: isRequired(),
                concept: mrsAttributeType.concept || {},
                excludeFrom: (attributesConfig && attributesConfig[mrsAttributeType.name] && attributesConfig[mrsAttributeType.name].excludeFrom) || []
            };
            attributeType.concept.dataType = attributeType.concept.datatype && attributeType.concept.datatype.name;

            if (mrsAttributeType.concept && mrsAttributeType.concept.answers) {
                angular.forEach(mrsAttributeType.concept.answers, function (mrsAnswer) {
                    var displayName = mrsAnswer.display;
                    var fullySpecifiedName = mrsAnswer.display;
                    if (mrsAnswer.names && mrsAnswer.names.length == 2) {
                        if (mrsAnswer.name.conceptNameType == 'FULLY_SPECIFIED') {
                            if (mrsAnswer.names[0].display == displayName) {
                                displayName = mrsAnswer.names[1].display;
                                fullySpecifiedName = mrsAnswer.names[0].display;
                            } else {
                                displayName = mrsAnswer.names[0].display;
                                fullySpecifiedName = mrsAnswer.names[1].display;
                            }
                        }
                    }
                    attributeType.answers.push({
                        fullySpecifiedName: fullySpecifiedName,
                        description: displayName,
                        conceptId: mrsAnswer.uuid
                    });
                });
            }
            if (attributeType.format == "org.openmrs.customdatatype.datatype.RegexValidatedTextDatatype") {
                attributeType.pattern = mrsAttributeType.datatypeConfig;
            }

            attributeTypes.push(attributeType);
        });
        return {
            attributeTypes: attributeTypes
        };
    };

    return AttributeTypeMapper;
})();

'use strict';

Bahmni.Common.Domain.AttributeFormatter = (function () {
    function AttributeFormatter () {
    }

    AttributeFormatter.prototype.getMrsAttributes = function (model, attributeTypes) {
        return attributeTypes.map(function (result) {
            var attribute = {
                attributeType: {
                    uuid: result.uuid
                }
            };
            if (!_.isEmpty(model)) {
                setAttributeValue(result, attribute, model[result.name]);
            }
            return attribute;
        });
    };

    AttributeFormatter.prototype.getMrsAttributesForUpdate = function (model, attributeTypes, attributes) {
        return _.filter(AttributeFormatter.prototype.getMrsAttributes(model, attributeTypes), function (mrsAttribute) {
            var attribute = _.find(attributes, function (attribute) {
                return mrsAttribute.attributeType.uuid === attribute.attributeType.uuid;
            });
            if (attribute && !attribute.voided) {
                mrsAttribute.uuid = attribute.uuid;
            }
            return isAttributeChanged(mrsAttribute);
        });
    };

    AttributeFormatter.prototype.removeUnfilledAttributes = function (formattedAttributes) {
        return _.filter(formattedAttributes, isAttributeChanged);
    };

    var isAttributeChanged = function (attribute) {
        return attribute.value || attribute.uuid;
    };

    var setAttributeValue = function setAttributeValue (attributeType, attr, value) {
        if (value === "" || value === null || value === undefined || value.conceptUuid === null) {
            attr.voided = true;
        } else if (attributeType.format === "org.openmrs.Concept") {
            var attrDescription = _.find(attributeType.answers, function (answer) {
                if (answer.conceptId === value.conceptUuid) {
                    return true;
                }
            });
            attr.value = attrDescription != undefined ? attrDescription.description : null;
            attr.hydratedObject = value.conceptUuid;
        } else if (attributeType.format == "org.openmrs.util.AttributableDate" || attributeType.format == "org.openmrs.customdatatype.datatype.DateDatatype") {
            var mnt = moment(value);
            attr.value = mnt.format('YYYY-MM-DD');
        } else {
            attr.value = value.toString();
        }
    };

    return AttributeFormatter;
})();

'use strict';

angular.module('bahmni.registration').factory('openmrsPatientMapper', ['patient', '$rootScope', 'age', 'identifiers',
    function (patient, $rootScope, age, identifiers) {
        var patientModel = patient;
        var whereAttributeTypeExists = function (attribute) {
                return $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
            },
            addAttributeToPatient = function (patient, attribute) {
                var attributeType = $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
                if (attributeType) {
                    if (attributeType.format === "org.openmrs.Concept" && attribute.value) {
                        patient[attributeType.name] = {conceptUuid: attribute.value.uuid, value: attribute.value.display};
                    } else if (attributeType.format === "org.openmrs.util.AttributableDate") {
                        patient[attributeType.name] = parseDate(attribute.value);
                    } else {
                        patient[attributeType.name] = attribute.value;
                    }
                }
            },
            mapAttributes = function (patient, attributes) {
                attributes.filter(whereAttributeTypeExists).forEach(function (attribute) {
                    addAttributeToPatient(patient, attribute);
                });
            },
            parseDate = function (dateStr) {
                return Bahmni.Common.Util.DateUtil.parseServerDateToDate(dateStr);
            },
            mapAddress = function (preferredAddress) {
                return preferredAddress || {};
            },
            mapRelationships = function (patient, relationships) {
                patient.relationships = relationships || [];
                patient.newlyAddedRelationships = [{}];
                patient.hasRelationships = patient.relationships.length > 0;
            },

            map = function (openmrsPatient) {
                var relationships = openmrsPatient.relationships;
                openmrsPatient = openmrsPatient.patient;
                var openmrsPerson = openmrsPatient.person;
                var patient = patientModel.create();
                var birthDate = parseDate(openmrsPerson.birthdate);
                patient.uuid = openmrsPatient.uuid;
                patient.givenName = openmrsPerson.preferredName.givenName;
                patient.middleName = openmrsPerson.preferredName.middleName;
                patient.familyName = openmrsPerson.preferredName.familyName;
                patient.birthdate = !birthDate ? null : birthDate;
                patient.age = birthDate ? age.fromBirthDate(birthDate) : null;
                patient.gender = openmrsPerson.gender;
                patient.address = mapAddress(openmrsPerson.preferredAddress);
                patient.birthtime = parseDate(openmrsPerson.birthtime);
                patient.image = Bahmni.Registration.Constants.patientImageUrlByPatientUuid + openmrsPatient.uuid + "&q=" + new Date().toISOString();
                patient.registrationDate = Bahmni.Common.Util.DateUtil.parse(openmrsPerson.auditInfo.dateCreated);
                patient.dead = openmrsPerson.dead;
                patient.isDead = patient.dead;
                patient.deathDate = parseDate(openmrsPerson.deathDate);
                patient.causeOfDeath = openmrsPerson.causeOfDeath;
                patient.birthdateEstimated = openmrsPerson.birthdateEstimated;
                patient.bloodGroup = openmrsPerson.bloodGroup;
                mapAttributes(patient, openmrsPerson.attributes);
                mapRelationships(patient, relationships);
                _.assign(patient, identifiers.mapIdentifiers(openmrsPatient.identifiers));

                return patient;
            };

        return {
            map: map
        };
    }]);

'use strict';

Bahmni.Registration.CreatePatientRequestMapper = (function () {
    function CreatePatientRequestMapper (currentDate) {
        this.currentDate = currentDate;
    }

    CreatePatientRequestMapper.prototype.mapFromPatient = function (patientAttributeTypes, patient) {
        var constants = Bahmni.Registration.Constants;
        var allIdentifiers = _.concat(patient.extraIdentifiers, patient.primaryIdentifier);
        var identifiers = _.filter(allIdentifiers, function (identifier) {
            return !_.isEmpty(identifier.selectedIdentifierSource) || (identifier.identifier !== undefined);
        });
        identifiers = _.map(identifiers, function (identifier) {
            return {
                identifier: identifier.identifier,
                identifierSourceUuid: identifier.selectedIdentifierSource ? identifier.selectedIdentifierSource.uuid : undefined,
                identifierPrefix: identifier.selectedIdentifierSource ? identifier.selectedIdentifierSource.prefix : undefined,
                identifierType: identifier.identifierType.uuid,
                preferred: identifier.preferred,
                voided: identifier.voided
            };
        });
        var openMRSPatient = {
            patient: {
                person: {
                    names: [
                        {
                            givenName: patient.givenName,
                            middleName: patient.middleName,
                            familyName: patient.familyName,
                            display: patient.givenName + " " + patient.familyName,
                            "preferred": false
                        }
                    ],
                    addresses: [_.pick(patient.address, constants.allAddressFileds)],
                    birthdate: this.getBirthdate(patient.birthdate, patient.age),
                    birthdateEstimated: patient.birthdateEstimated,
                    gender: patient.gender,
                    birthtime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(patient.birthtime),
                    personDateCreated: patient.registrationDate,
                    attributes: new Bahmni.Common.Domain.AttributeFormatter().getMrsAttributes(patient, patientAttributeTypes),
                    dead: patient.dead,
                    deathDate: Bahmni.Common.Util.DateUtil.getDateWithoutTime(patient.deathDate),
                    causeOfDeath: patient.causeOfDeath ? patient.causeOfDeath.uuid : '',
                    uuid: patient.uuid
                },
                identifiers: identifiers,
                uuid: patient.uuid
            }
        };

        this.setImage(patient, openMRSPatient);
        openMRSPatient.relationships = patient.relationships;
        return openMRSPatient;
    };

    CreatePatientRequestMapper.prototype.setImage = function (patient, openMRSPatient) {
        if (patient.getImageData()) {
            openMRSPatient.image = patient.getImageData();
        }
    };

    CreatePatientRequestMapper.prototype.getBirthdate = function (birthdate, age) {
        var mnt;
        if (birthdate) {
            mnt = moment(birthdate);
        } else if (age !== undefined) {
            mnt = moment(this.currentDate).subtract('days', age.days).subtract('months', age.months).subtract('years', age.years);
        }
        return mnt.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
    };

    return CreatePatientRequestMapper;
})();

'use strict';

Bahmni.Registration.UpdatePatientRequestMapper = (function () {
    var UpdatePatientRequestMapper = function (currentDate) {
        this.currentDate = currentDate;
    };

    UpdatePatientRequestMapper.prototype.currentDate = undefined;

    UpdatePatientRequestMapper.prototype.mapFromPatient = function (patientAttributeTypes, openMRSPatient, patient) {
        var openMRSPatientProfile = {
            patient: {
                person: {
                    names: [
                        {
                            uuid: openMRSPatient.person.names[0].uuid,
                            givenName: patient.givenName,
                            middleName: patient.middleName,
                            familyName: patient.familyName,
                            display: patient.givenName + " " + patient.familyName,
                            "preferred": true
                        }
                    ],
                    addresses: [_.pick(patient.address, Bahmni.Registration.Constants.allAddressFileds)],
                    birthdate: this.getBirthdate(patient.birthdate, patient.age),
                    birthdateEstimated: patient.birthdateEstimated,
                    birthtime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(patient.birthtime),
                    gender: patient.gender,
                    attributes: this.getMrsAttributes(openMRSPatient, patient, patientAttributeTypes),
                    dead: patient.dead,
                    deathDate: Bahmni.Common.Util.DateUtil.getDateWithoutTime(patient.deathDate),
                    causeOfDeath: patient.causeOfDeath ? patient.causeOfDeath.uuid : ''
                }
            }
        };

        var allIdentifiers = _.concat(patient.extraIdentifiers, patient.primaryIdentifier);
        var nonEmptyIdentifiers = _.filter(allIdentifiers, function (identifier) {
            return identifier.uuid || identifier.identifier;
        });

        openMRSPatientProfile.patient.identifiers = _.map(nonEmptyIdentifiers, function (identifier) {
            return {
                uuid: identifier.uuid,
                identifier: identifier.identifier,
                identifierType: identifier.identifierType.uuid,
                preferred: identifier.preferred,
                voided: identifier.voided
            };
        });

        this.setImage(patient, openMRSPatientProfile);

        if (patient.relationships) {
            openMRSPatientProfile.relationships = patient.relationships;
        }

        return openMRSPatientProfile;
    };

    UpdatePatientRequestMapper.prototype.setImage = function (patient, openMRSPatient) {
        if (patient.getImageData()) {
            openMRSPatient.image = patient.getImageData();
        }
    };

    UpdatePatientRequestMapper.prototype.getMrsAttributes = function (openMRSPatient, patient, patientAttributeTypes) {
        var attributes = [];
        patientAttributeTypes.forEach(function (attributeType) {
            var attr = {
                attributeType: {
                    uuid: attributeType.uuid
                }
            };
            var savedAttribute = openMRSPatient.person.attributes.filter(function (attribute) {
                return attributeType.uuid === attribute.attributeType.uuid;
            })[0];

            if (savedAttribute) {
                attr.uuid = savedAttribute.uuid;
                setAttributeValue(attributeType, attr, patient[savedAttribute.attributeType.display]);
            } else {
                setAttributeValue(attributeType, attr, patient[attributeType.name]);
            }
            attributes.push(attr);
        });
        return attributes;
    };

    var setAttributeValue = function (attributeType, attr, value) {
        if (value === "" || value === null || value === undefined || value.conceptUuid === null) {
            attr.voided = true;
        } else if (attributeType.format === "org.openmrs.Concept") {
            attr.hydratedObject = value.conceptUuid;
        } else if (attributeType.format === "org.openmrs.util.AttributableDate") {
            var mnt = moment(value);
            attr.value = mnt.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
        } else {
            attr.value = value.toString();
        }
    };

    UpdatePatientRequestMapper.prototype.getBirthdate = function (birthdate, age) {
        var mnt;
        if (birthdate) {
            mnt = moment(birthdate);
        } else if (age !== undefined) {
            mnt = moment(this.currentDate).subtract('days', age.days).subtract('months', age.months).subtract('years', age.years);
        }
        return mnt.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
    };

    return UpdatePatientRequestMapper;
})();

'use strict';

angular.module('bahmni.registration')
    .factory('patient', ['age', 'identifiers', function (age, identifiers) {
        var create = function () {
            var calculateAge = function () {
                if (this.birthdate) {
                    this.age = age.fromBirthDate(this.birthdate);
                } else {
                    this.age = age.create(null, null, null);
                }
            };

            var getFormattedBirthDay = function (assumedBirthDay) {
                var birthDate = assumedBirthDay.split("/");
                return { days: parseInt(birthDate[0]), months: parseInt(birthDate[1]) };
            };

            var isOnlyBirthYearPresent = function (age) {
                return age.years && !age.days && !age.months;
            };

            var getConfiguredBirthDate = function (configuredAssumedBirthDay, dob) {
                var formattedBirthDay = getFormattedBirthDay(configuredAssumedBirthDay);
                return moment(dob)
                    .date(formattedBirthDay.days)
                    .month(formattedBirthDay.months - 1)
                    .toDate();
            };

            var calculateBirthDate = function (configuredAssumedBirthDay) {
                this.birthdate = age.calculateBirthDate(this.age);
                if (configuredAssumedBirthDay && isOnlyBirthYearPresent(this.age)) {
                    this.birthdate = getConfiguredBirthDate(configuredAssumedBirthDay, this.birthdate);
                }
            };

            var fullNameLocal = function () {
                var givenNameLocal = this.givenNameLocal || this.givenName || "";
                var middleNameLocal = this.middleNameLocal || this.middleName || "";
                var familyNameLocal = this.familyNameLocal || this.familyName || "";
                return (givenNameLocal.trim() + " " + (middleNameLocal ? middleNameLocal + " " : "") + familyNameLocal.trim()).trim();
            };

            var getImageData = function () {
                return this.image && this.image.indexOf('data') === 0 ? this.image.replace("data:image/jpeg;base64,", "") : null;
            };

            var identifierDetails = identifiers.create();

            var patient = {
                address: {},
                age: age.create(),
                birthdate: null,
                calculateAge: calculateAge,
                image: '../images/blank-user.gif',
                fullNameLocal: fullNameLocal,
                getImageData: getImageData,
                relationships: [],
                newlyAddedRelationships: [{}],
                deletedRelationships: [],
                calculateBirthDate: calculateBirthDate
            };
            return _.assign(patient, identifierDetails);
        };

        return {
            create: create
        };
    }]);

'use strict';

Bahmni.Registration.Identifier = function (identifierType) {
    this.identifierType = identifierType;
    this.preferred = identifierType.primary;
    this.voided = false;
    return this;
};

var prototype = Bahmni.Registration.Identifier.prototype;
prototype.hasIdentifierSources = function () {
    return this.identifierType.identifierSources.length > 0;
};

prototype.isPrimary = function () {
    return this.identifierType.primary;
};
prototype.map = function (identifiers) {
    var savedIdentifier = _.find(identifiers, {identifierType: {uuid: this.identifierType.uuid}});
    if (savedIdentifier) {
        this.registrationNumber = savedIdentifier.identifier;
        this.identifier = savedIdentifier.identifier;
        this.preferred = savedIdentifier.preferred;
        this.voided = savedIdentifier.voided;
        this.uuid = savedIdentifier.uuid;
    }
    return this;
};

prototype.hasIdentifierSourceWithEmptyPrefix = function () {
    var identifierSources = this.identifierType.identifierSources;
    return identifierSources.length === 1 && identifierSources[0].prefix === "";
};

prototype.isIdentifierRequired = function () {
    if (this.hasOldIdentifier) {
        return true;
    } else if (this.identifierType.required) {
        return !this.hasIdentifierSources();
    }
    return false;
};

prototype.generate = function () {
    if (this.registrationNumber && this.registrationNumber.length > 0) {
        this.identifier = this.selectedIdentifierSource ? this.selectedIdentifierSource.prefix + this.registrationNumber : this.registrationNumber;
        this.voided = false;
    } else if (this.uuid) {
        this.voided = true;
    }
};

prototype.clearRegistrationNumber = function () {
    this.registrationNumber = null;
    this.identifier = null;
};


'use strict';

angular.module('bahmni.registration')
    .factory('identifiers', ['$rootScope', 'preferences', function ($rootScope, preferences) {
        var create = function () {
            var identifiers = [];
            _.each($rootScope.patientConfiguration.identifierTypes, function (identifierType) {
                var identifier = new Bahmni.Registration.Identifier(identifierType);
                if (identifier.isPrimary()) {
                    identifier.selectedIdentifierSource = _.find(identifier.identifierType.identifierSources, {prefix: preferences.identifierPrefix});
                    identifier.hasOldIdentifier = preferences.hasOldIdentifier;
                }
                identifier.selectedIdentifierSource = identifier.selectedIdentifierSource || identifier.identifierType.identifierSources[0];
                identifiers.push(identifier);
            });
            return {
                primaryIdentifier: getPrimaryIdentifier(identifiers),
                extraIdentifiers: getExtraIdentifiers(identifiers)
            };
        };

        var mapIdentifiers = function (identifiers) {
            var mappedIdentifiers = [];
            _.each($rootScope.patientConfiguration.identifierTypes, function (identifierType) {
                var mappedIdentifier = new Bahmni.Registration.Identifier(identifierType).map(identifiers);
                mappedIdentifiers.push(mappedIdentifier);
            });

            return {
                primaryIdentifier: getPrimaryIdentifier(mappedIdentifiers),
                extraIdentifiers: getExtraIdentifiers(mappedIdentifiers)
            };
        };

        var getPrimaryIdentifier = function (identifiers) {
            return _.find(identifiers, {identifierType: {primary: true}});
        };

        var getExtraIdentifiers = function (identifiers) {
            return _.filter(identifiers, {identifierType: {primary: false}});
        };

        return {
            create: create,
            mapIdentifiers: mapIdentifiers
        };
    }]);

'use strict';

angular.module('bahmni.registration')
    .factory('preferences', [function () {
        return {
            hasOldIdentifier: false
        };
    }]);

'use strict';

Bahmni.Registration.RegistrationEncounterConfig = (function () {
    function RegistrationEncounterConfig (conceptData, encounterTypes, visitTypes) {
        this.conceptData = conceptData;
        this.encounterTypes = encounterTypes;
        this.visitTypes = visitTypes;
    }

    RegistrationEncounterConfig.prototype = {
        getVisitTypesAsArray: function () {
            var visitTypesArray = [];
            for (var name in this.visitTypes) {
                visitTypesArray.push({name: name, uuid: this.visitTypes[name]});
            }
            return visitTypesArray;
        },
        getDefaultVisitType: function (locationUuid) {
            var visitType = null;
            _.each(this.loginLocationToVisitTypeMap.results, function (result) {
                if (result.entity.uuid === locationUuid) {
                    visitType = result.mappings[0].name;
                }
            });
            return visitType;
        }
    };
    return RegistrationEncounterConfig;
})();

'use strict';

Bahmni.Registration.PatientConfig = (function () {
    function PatientConfig (patientAttributeTypes, identifierTypes, patientInformation) {
        this.attributeTypes = patientAttributeTypes;
        this.identifierTypes = identifierTypes;
        var patientAttributesSections = {};
        // Avoiding multiple calls from angular code. Side effect of the way angular does dirty check. [Shruti/ Sush]
        if (!this.attributeRows && this.attributeTypes) {
            if (!patientInformation) {
                this.attributeRows = this.splitAsRows(this.attributeTypes);
                return;
            }

            var hiddenAttributes = patientInformation["hidden"] && patientInformation["hidden"].attributes;
            delete patientInformation["hidden"];

            var otherInformationAttributes = this.attributeTypes.filter(function (item) {
                return !isHiddenPatientAttribute(hiddenAttributes, item) &&
                    !isItemAMandatoryField(item) &&
                    !isAttributeInOtherSection(patientInformation, patientAttributesSections, item);
            });

            this.attributeRows = this.splitAsRows(otherInformationAttributes);
            this.patientAttributesSections = patientAttributesSections;
        }
    }

    function isHiddenPatientAttribute (hiddenAttributes, item) { // Ignore hidden fields from patientInformation configuration
        return hiddenAttributes && hiddenAttributes.indexOf(item.name) > -1;
    }

    function isAttributeInOtherSection (patientInformation, patientAttributesSections, item) {
        return _.find(patientInformation, function (section, key) {
            return _.find(section.attributes, function (attribute) {
                if (attribute === item.name) {
                    var sectionObject = patientAttributesSections[key];
                    if (!sectionObject) {
                        sectionObject = {
                            attributes: [],
                            title: section.title,
                            expanded: section.expanded,
                            translationKey: section.translationKey,
                            shortcutKey: section.shortcutKey,
                            order: section.order,
                            canShow: true
                        };
                    }
                    sectionObject.attributes.push(item);
                    patientAttributesSections[key] = sectionObject;
                    return true;
                }
                return false;
            });
        });
    }

    function isItemAMandatoryField (item) {
        var mandatoryPatientAttributes = ["healthCenter", "givenNameLocal", "middleNameLocal", "familyNameLocal"];
        return mandatoryPatientAttributes.indexOf(item.name) > -1;
    }

    PatientConfig.prototype = {
        get: function (attributeUuid) {
            return this.attributeTypes.filter(function (item) {
                return item.uuid === attributeUuid;
            })[0];
        },

        customAttributeRows: function () {
            return this.attributeRows;
        },

        getPatientAttributesSections: function () {
            return this.patientAttributesSections;
        },

        getOrderedPatientAttributesSections: function () {
            return _.sortBy(this.patientAttributesSections, 'order');
        },

        splitAsRows: function (attributes) {
            var attributeRows = [];
            var row = [];
            for (var i in attributes) {
                row.push(attributes[i]);
                if (i !== 0 && (i % 2) !== 0) {
                    attributeRows.push(row);
                    row = [];
                }
            }
            if (row.length > 0) {
                attributeRows.push(row);
            }

            return attributeRows;
        },

        heathCentreAttribute: function () {
            return this.attributeTypes.filter(function (item) {
                return item.name === "healthCenter";
            })[0];
        },

        local: function () {
            var givenName = this.attributeTypes.filter(function (item) {
                return item.name === "givenNameLocal";
            })[0];
            var middleName = this.attributeTypes.filter(function (item) {
                return item.name === "middleNameLocal";
            })[0];
            var familyName = this.attributeTypes.filter(function (item) {
                return item.name === "familyNameLocal";
            })[0];

            if (givenName && middleName && familyName) {
                return { "showNameField": true, "labelForNameField": givenName.description, "placeholderForGivenName": givenName.description, "placeholderForMiddleName": middleName.description, "placeholderForFamilyName": familyName.description};
            }
            return {"showNameField": false};
        }

    };
    return PatientConfig;
})();

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.PatientSearch = Bahmni.Common.PatientSearch || {};

Bahmni.Common.PatientSearch.Constants = {
    searchExtensionTileViewType: "tile",
    searchExtensionTabularViewType: "tabular",
    tabularViewIgnoreHeadingsList: ["display", "uuid", "image", "$$hashKey", "activeVisitUuid", "hasBeenAdmitted", "forwardUrl", "programUuid", "enrollment"],
    identifierHeading: ["ID", "Id", "id", "identifier", "DQ_COLUMN_TITLE_ACTION"],
    nameHeading: ["NAME", "Name", "name"],
    patientTileHeight: 100,
    patientTileWidth: 100,
    printIgnoreHeadingsList: ["DQ_COLUMN_TITLE_ACTION"],
    tileLoadRatio: 1 / 2
};

'use strict';

Bahmni.Common.PatientSearch.Search = function (searchTypes) {
    var self = this;
    self.searchTypes = searchTypes || [];
    self.searchType = this.searchTypes[0];
    self.searchParameter = '';
    self.noResultsMessage = null;
    self.searchResults = [];
    self.activePatients = [];
    self.navigated = false;
    self.searchColumns = self.searchType && self.searchType.searchColumns ? self.searchType.searchColumns : ["identifier", "name"];
    angular.forEach(searchTypes, function (searchType) {
        searchType.patientCount = "...";
    });

    self.switchSearchType = function (searchType) {
        self.noResultsMessage = null;
        if (!self.isSelectedSearch(searchType)) {
            self.searchParameter = '';
            self.navigated = true;
            self.searchType = searchType;
            self.activePatients = [];
            self.searchResults = [];
        }
        self.markPatientEntry();
    };

    self.markPatientEntry = function () {
        self.startPatientSearch = true;
        window.setTimeout(function () { // eslint-disable-line angular/timeout-service
            self.startPatientSearch = false;
        });
    };

    self.patientsCount = function () {
        return self.activePatients.length;
    };

    self.updatePatientList = function (patientList) {
        self.activePatients = patientList.map(mapPatient);
        self.searchResults = self.activePatients;
    };

    self.updateSearchResults = function (patientList) {
        self.updatePatientList(patientList);
        if (self.activePatients.length === 0 && self.searchParameter != '') {
            self.noResultsMessage = "No results found";
        } else {
            self.noResultsMessage = null;
        }
    };

    self.hasSingleActivePatient = function () {
        return self.activePatients.length === 1;
    };

    self.filterPatients = function (matchingCriteria) {
        matchingCriteria = matchingCriteria ? matchingCriteria : matchesNameOrId;
        self.searchResults = self.searchParameter ? self.activePatients.filter(matchingCriteria) : self.activePatients;
    };

    self.filterPatientsByIdentifier = function () {
        self.filterPatients(matchesId);
    };

    self.isSelectedSearch = function (searchType) {
        return self.searchType && self.searchType.id == searchType.id;
    };

    self.isCurrentSearchLookUp = function () {
        return self.searchType && self.searchType.handler;
    };

    self.isTileView = function () {
        return self.searchType && self.searchType.view === Bahmni.Common.PatientSearch.Constants.searchExtensionTileViewType;
    };

    self.isTabularView = function () {
        return self.searchType && self.searchType.view === Bahmni.Common.PatientSearch.Constants.searchExtensionTabularViewType;
    };

    self.showPatientCountOnSearchParameter = function (searchType) {
        return showPatientCount(searchType) && self.searchParameter;
    };

    function mapPatient (patient) {
        if (patient.name || patient.givenName || patient.familyName) {
            patient.name = patient.name || (patient.givenName + ' ' + patient.familyName);
        }
        patient.display = _.map(self.searchColumns, function (column) {
            return patient[column];
        }).join(" - ");

        patient.image = Bahmni.Common.Constants.patientImageUrlByPatientUuid + patient.uuid;
        return patient;
    }

    var matchesNameOrId = function (patient) {
        return patient.display.toLowerCase().indexOf(self.searchParameter.toLowerCase()) !== -1;
    };

    var matchesId = function (patient) {
        return patient.identifier.toLowerCase().indexOf(self.searchParameter.toLowerCase()) !== -1;
    };

    var showPatientCount = function (searchType) {
        return self.isSelectedSearch(searchType) && self.isCurrentSearchLookUp();
    };
};

angular.module('bahmni.common.patientSearch', ['bahmni.common.patient', 'infinite-scroll']);


'use strict';

angular.module('bahmni.common.patientSearch')
.controller('PatientsListController', ['$scope', '$window', 'patientService', '$rootScope', 'appService', 'spinner',
    '$stateParams', '$bahmniCookieStore', 'offlineService', 'printer', 'configurationService',
    function ($scope, $window, patientService, $rootScope, appService, spinner, $stateParams, $bahmniCookieStore, offlineService, printer, configurationService) {
        var initialize = function () {
            var searchTypes = appService.getAppDescriptor().getExtensions("org.bahmni.patient.search", "config").map(mapExtensionToSearchType);
            $scope.search = new Bahmni.Common.PatientSearch.Search(_.without(searchTypes, undefined));
            $scope.search.markPatientEntry();
            $scope.$watch('search.searchType', function (currentSearchType) {
                _.isEmpty(currentSearchType) || fetchPatients(currentSearchType);
            });
            _.each($scope.search.searchTypes, function (searchType) {
                _.isEmpty(searchType) || ($scope.search.searchType != searchType && getPatientCount(searchType));
            });
            if ($rootScope.currentSearchType != null) {
                $scope.search.switchSearchType($rootScope.currentSearchType);
            }
            configurationService.getConfigurations(['identifierTypesConfig']).then(function (response) {
                $scope.primaryIdentifier = _.find(response.identifierTypesConfig, {primary: true}).name;
            });
        };

        $scope.searchPatients = function () {
            return spinner.forPromise(patientService.search($scope.search.searchParameter)).then(function (response) {
                $scope.search.updateSearchResults(response.data.pageOfResults);
                if ($scope.search.hasSingleActivePatient()) {
                    $scope.forwardPatient($scope.search.activePatients[0]);
                }
            });
        };

        $scope.filterPatientsAndSubmit = function () {
            if ($scope.search.searchResults.length == 1) {
                $scope.forwardPatient($scope.search.searchResults[0]);
            }
        };
        var getPatientCount = function (searchType) {
            if (searchType.handler) {
                var params = { q: searchType.handler, v: "full",
                    location_uuid: $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid,
                    provider_uuid: $rootScope.currentProvider.uuid };
                if (searchType.additionalParams) {
                    params["additionalParams"] = searchType.additionalParams;
                }
                patientService.findPatients(params).then(function (response) {
                    searchType.patientCount = response.data.length;
                    if ($scope.search.isSelectedSearch(searchType)) {
                        $scope.search.updatePatientList(response.data);
                    }
                });
            }
        };

        $scope.getHeadings = function (patients) {
            if (patients && patients.length > 0) {
                var headings = _.chain(patients[0])
                    .keys()
                    .filter(function (heading) {
                        return _.indexOf(Bahmni.Common.PatientSearch.Constants.tabularViewIgnoreHeadingsList, heading) === -1;
                    })
                    .value();

                return headings;
            }
            return [];
        };

        $scope.isHeadingOfIdentifier = function (heading) {
            return _.includes(Bahmni.Common.PatientSearch.Constants.identifierHeading, heading);
        };

        $scope.isHeadingOfName = function (heading) {
            return _.includes(Bahmni.Common.PatientSearch.Constants.nameHeading, heading);
        };

        $scope.getPrintableHeadings = function (patients) {
            var headings = $scope.getHeadings(patients);
            var printableHeadings = headings.filter(function (heading) {
                return _.indexOf(Bahmni.Common.PatientSearch.Constants.printIgnoreHeadingsList, heading) === -1;
            });
            return printableHeadings;
        };

        $scope.printPage = function () {
            if ($scope.search.searchType.printHtmlLocation != null) {
                printer.printFromScope($scope.search.searchType.printHtmlLocation, $scope);
            }
        };

        var mapExtensionToSearchType = function (appExtn) {
            if (offlineService.isOfflineApp() && appExtn.offline == false) {
                return;
            }
            return {
                name: appExtn.label,
                display: appExtn.extensionParams.display,
                handler: appExtn.extensionParams.searchHandler,
                forwardUrl: appExtn.extensionParams.forwardUrl,
                id: appExtn.id,
                params: appExtn.extensionParams.searchParams,
                refreshTime: appExtn.extensionParams.refreshTime || 0,
                view: appExtn.extensionParams.view || Bahmni.Common.PatientSearch.Constants.searchExtensionTileViewType,
                showPrint: appExtn.extensionParams.showPrint || false,
                printHtmlLocation: appExtn.extensionParams.printHtmlLocation || null,
                additionalParams: appExtn.extensionParams.additionalParams,
                searchColumns: appExtn.extensionParams.searchColumns,
                translationKey: appExtn.extensionParams.translationKey
            };
        };

        var fetchPatients = function (currentSearchType) {
            $rootScope.currentSearchType = currentSearchType;
            if ($scope.search.isCurrentSearchLookUp()) {
                getPatientCount(currentSearchType);
            } else {
                if (offlineService.isOfflineApp()) {
                    var duration = appService.getAppDescriptor().getConfigValue('recentPatientsDuration');
                    patientService.getRecentPatients(duration).then(function (response) {
                        $scope.search.updatePatientList(response.data.pageOfResults);
                    });
                }
            }
        };

        $scope.forwardPatient = function (patient) {
            var options = $.extend({}, $stateParams);
            $.extend(options, {
                patientUuid: patient.uuid,
                visitUuid: patient.activeVisitUuid || null,
                encounterUuid: $stateParams.encounterUuid || 'active',
                programUuid: patient.programUuid || null,
                enrollment: patient.enrollment || null,
                forwardUrl: patient.forwardUrl || null
            });

            if (options.forwardUrl !== null) {
                $window.open(appService.getAppDescriptor().formatUrl(options.forwardUrl, options, true), '_blank');
            } else {
                $window.location = appService.getAppDescriptor().formatUrl($scope.search.searchType.forwardUrl, options, true);
            }
        };
        initialize();
    }
]);

'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineRegistrationInitialization', ['$q', 'offlineService', 'offlineSearchDbService',
        function ($q, offlineService, offlineSearchDbService) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlineSearchDbService.init(offlineDb);
                }
            };
        }
    ]);

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
    .service('appInfoStrategy', function () {
        var getVersion = function () {
            var manifest = chrome.app.getDetails();
            return manifest.version;
        };
        return {
            getVersion: getVersion
        };
    });
