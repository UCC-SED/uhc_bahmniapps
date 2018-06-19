'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .service('programAttributesHelper', ['appService', function (appService) {
        var self = this;
        var attributeTypeConfiguration = appService.getAppDescriptor()
            .getConfigValue("program")
            .programSpecificAttributeTypesDefinition;

        var isAttributePresent = function (attributeTypes, attributeTypeName) {
            return fetchAttributeType(attributeTypes, attributeTypeName).length > 0;
        };
        var fetchAttributeType = function (attributeTypes, attributeTypeName) {
            var isAttributePresentInList = function (attributeType) {
                return attributeType.name === attributeTypeName;
            };
            return _.find(attributeTypes, isAttributePresentInList) || [];
        };

        var getConceptValue = function (programAttributeTypeName, programAttributeValue, attributeTypes) {
            var getConceptAnswerValue = function (programAttribute, patientProgramAttributeValue) {
                if (programAttribute.answers.length === 0) {
                    return patientProgramAttributeValue;
                }
                var answer = _.find(programAttribute.answers, function (answer) {
                    return answer.conceptId === patientProgramAttributeValue;
                });
                return answer.description;
            };

            var programAttribute = fetchAttributeType(attributeTypes, programAttributeTypeName);
            return getConceptAnswerValue(programAttribute, programAttributeValue);
        };

        this.getAttributeTypesConfigurationForProgram = function (programName) {
            var findCurrentProgramConfig = function (programConfig) {
                return programName === programConfig.programName;
            };
            return _.find(attributeTypeConfiguration, findCurrentProgramConfig);
        };

        this.sortBasedOnConfiguration = function (programAttributeTypes, programName) {
            var sortProgramAttributeTypes = function (programAttributeType) {
                return _.find(programAttributeTypes, function (attributeType) {
                    return attributeType.name === programAttributeType;
                });
            };

            var programConfig = this.getAttributeTypesConfigurationForProgram(programName);
            if (programConfig.attributeTypes.length === 0) {
                return programAttributeTypes;
            } else {
                return _.map(programConfig.attributeTypes, sortProgramAttributeTypes);
            }
        };

        this.showAttributes = function (attributeList, presentAttributeTypes, allAttributeTypes) {
            var fetchShownAttributes = function (attributeTypes, shownAttributeName) {
                if (!isAttributePresent(attributeTypes, shownAttributeName)) {
                    var retrieveAttributeType = fetchAttributeType(allAttributeTypes, shownAttributeName);
                    attributeTypes.push(retrieveAttributeType);
                    return attributeTypes;
                } else {
                    return attributeTypes;
                }
            };

            attributeList = attributeList || attributeTypeConfiguration;
            if (!attributeList) {
                return allAttributeTypes;
            }
            return _.reduce(attributeList, fetchShownAttributes, presentAttributeTypes);
        };

        this.filterOnHide = function (attributeList, attributeTypes) {
            var fetchOnlyShow = function (attributeType) {
         //   console.log(attributeType);
                if (attributeList.indexOf(attributeType.name) >= 0) {
                    return false;
                } else {
                    return true;
                }
            };
            if (!attributeList) {
                return attributeTypes;
            }
            return _.filter(attributeTypes, fetchOnlyShow);
        };

        this.mapFieldWithConceptValue = function (patientProgramAttributes, attributeTypes) {
            var programAttributeForms = {};
            _.keys(patientProgramAttributes).forEach(function (programAttributeTypeName) {
                programAttributeForms[programAttributeTypeName] = getConceptValue(programAttributeTypeName, patientProgramAttributes[programAttributeTypeName], attributeTypes);
            });
            return programAttributeForms;
        };
    }]);
