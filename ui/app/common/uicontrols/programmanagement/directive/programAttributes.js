'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .controller('ProgramAttributesController', ['$scope', 'appService', function ($scope, appService) {
        $scope.getProgramAttributesMap = function () {
            var programAttributesMap = {};
            var programAttributes = $scope.patientProgram.attributes;
            _.forEach($scope.programAttributeTypes, function (programAttributeType) {
                var programAttribute = getProgramAttributeByType(programAttributes, programAttributeType);

                if (programAttribute != undefined && !programAttribute.voided) {
                    programAttributesMap[programAttributeType.name] = programAttribute.value;
                    if (isCodedConceptFormat(programAttributeType.format)) {
                        programAttributesMap[programAttributeType.name] = programAttribute.value && programAttribute.value.uuid;
                    } else if (isDateFormat(programAttributeType.format)) {
                        programAttributesMap[programAttributeType.name] = Bahmni.Common.Util.DateUtil.parseServerDateToDate(programAttributesMap[programAttributeType.name]);
                    }
                }
            });
            return programAttributesMap;
        };

        $scope.getValueForAttributeType = function (attributeType) {
            var programAttributesMap = $scope.patientProgram.patientProgramAttributes;

            if (isDateFormat(attributeType.format)) {
                return programAttributesMap[attributeType.name] ? Bahmni.Common.Util.DateUtil.formatDateWithoutTime(programAttributesMap[attributeType.name]) : "";
            } else if (isCodedConceptFormat(attributeType.format)) {
                var mrsAnswer = _.find(attributeType.answers, function (answer) {
                    return answer.conceptId == programAttributesMap[attributeType.name];
                });
                return mrsAnswer ? mrsAnswer.description : "";
            } else {
                return programAttributesMap[attributeType.name];
            }
        };

        var getProgramAttributeByType = function (programAttributes, attributeType) {
            return _.find(programAttributes, function (programAttribute) {
                return programAttribute.attributeType.uuid == attributeType.uuid;
            });
        };

        var isDateFormat = function (format) {
            return format == "org.openmrs.util.AttributableDate" || format == "org.openmrs.customdatatype.datatype.DateDatatype";
        };

        var isCodedConceptFormat = function (format) {
            return format == "org.bahmni.module.bahmnicore.customdatatype.datatype.CodedConceptDatatype";
        };

        var sortProgramAttributeTypesBasedOnConfiguration = function (availableProgramAttributeTypesForProgram, currentProgramMapConfig) {
            var sortProgramAttributeTypes = function (programAttributeType) {
                return _.find(availableProgramAttributeTypesForProgram, function (attributeType) {
                    return attributeType.name === programAttributeType;
                });
            };
            return _.map(currentProgramMapConfig.attributeTypes, sortProgramAttributeTypes);
        };

        var getProgramAttributeTypeAssignedToProgram = function (currentProgram, programAttributeTypes, programAttributeTypeMapConfig) {
            var findCurrentProgramConfig = function (programConfig) {
                return currentProgram.name === programConfig.programName;
            };
            var filterProgramAttributes = function (programAttributeType) {
                if (!currentProgramMapConfig) {
                    return true;
                }
                return _.indexOf(currentProgramMapConfig.attributeTypes, programAttributeType.name) >= 0;
            };
            if (!programAttributeTypeMapConfig) {
                return programAttributeTypes;
            }
            var currentProgramMapConfig = _.find(programAttributeTypeMapConfig, findCurrentProgramConfig);
            var availableProgramAttributeTypesForProgram = _.filter(programAttributeTypes, filterProgramAttributes);
            if (!currentProgramMapConfig) {
                return availableProgramAttributeTypesForProgram;
            } else {
                return sortProgramAttributeTypesBasedOnConfiguration(availableProgramAttributeTypesForProgram, currentProgramMapConfig);
            }
        };

        var init = function () {
            var programSpecificAttributeTypesDefinition = appService
                .getAppDescriptor()
                .getConfigValue("program").programSpecificAttributeTypesDefinition;

            $scope.programAttributeTypes = getProgramAttributeTypeAssignedToProgram($scope.patientProgram.program, $scope.programAttributeTypes, programSpecificAttributeTypesDefinition);
        };

        $scope.patientProgram.patientProgramAttributes = $scope.getProgramAttributesMap();
        init();
    }])
    .directive('programAttributes', function () {
        return {
            controller: 'ProgramAttributesController',
            templateUrl: "../common/uicontrols/programmanagement/views/programAttributes.html",
            scope: {
                patientProgram: "=",
                programAttributeTypes: "="
            }
        };
    });

