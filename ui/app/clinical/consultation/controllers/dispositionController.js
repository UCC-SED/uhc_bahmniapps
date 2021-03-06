'use strict';

angular.module('bahmni.clinical')
    .controller('DispositionController', ['$scope', '$q', 'dispositionService', 'retrospectiveEntryService', 'spinner', function ($scope, $q, dispositionService, retrospectiveEntryService, spinner) {
        var consultation = $scope.consultation;
        var allDispositions = [];
        $scope.wardSave = {};

        var getPreviousDispositionNote = function () {
            if (consultation.disposition && (!consultation.disposition.voided)) {
                return _.find(consultation.disposition.additionalObs, function (obs) {
                    return obs.concept.uuid === $scope.dispositionNoteConceptUuid;
                });
            }
        };

        var getDispositionNotes = function () {
            var previousDispositionNotes = getPreviousDispositionNote();
            if (getSelectedConceptName($scope.dispositionCode, $scope.dispositionActions)) {
                return _.cloneDeep(previousDispositionNotes) || {
                    concept: {
                        uuid: $scope.dispositionNoteConceptUuid
                    }
                };
            } else {
                return {
                    concept: {
                        uuid: $scope.dispositionNoteConceptUuid
                    }
                };
            }
        };



        var getDispositionActionsPromise = function () {
            return dispositionService.getDispositionActions().then(function (response) {
                getProposedWards();
                getWardsavePromise();
                allDispositions = new Bahmni.Clinical.DispostionActionMapper().map(response.data.results[0].answers);
                $scope.dispositionActions = filterDispositionActions(allDispositions, $scope.$parent.visitSummary);
                $scope.dispositionCode = consultation.disposition && (!consultation.disposition.voided) ? consultation.disposition.code : null;
                $scope.dispositionNote = getDispositionNotes();

            });
        };

        var findAction = function (dispositions, action) {
            var undoDischarge = _.find(dispositions, action);
            return undoDischarge || {
                'name': ''
            };
        };

        var filterDispositionActions = function (dispositions, visitSummary) {
            var defaultDispositions = ["Undo Discharge", "Admit Patient", "Transfer Patient", "Discharge Patient"];
            var finalDispositionActions = _.filter(dispositions, function (disposition) {
                return defaultDispositions.indexOf(disposition.name) < 0;
            });
            var isVisitOpen = visitSummary ? _.isEmpty(visitSummary.stopDateTime) : false;

            if (visitSummary && visitSummary.isDischarged() && isVisitOpen) {
                finalDispositionActions.push(findAction(dispositions, {
                    name: "Undo Discharge"
                }));
            } else if (visitSummary && visitSummary.isAdmitted() && isVisitOpen) {
                finalDispositionActions.push(findAction(dispositions, {
                    name: "Transfer Patient"
                }));
                finalDispositionActions.push(findAction(dispositions, {
                    name: "Discharge Patient"
                }));
            } else {
                finalDispositionActions.push(findAction(dispositions, {
                    name: "Admit Patient"
                }));
            }
            return finalDispositionActions;
        };

        $scope.isRetrospectiveMode = function () {
            return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
        };

        $scope.showWarningForEarlierDispositionNote = function () {
            return !$scope.dispositionCode && consultation.disposition;
        };

        var getDispositionNotePromise = function () {
            return dispositionService.getDispositionNoteConcept().then(function (response) {
                $scope.dispositionNoteConceptUuid = response.data.results[0].uuid;
            });
        };
        var getWardsavePromise = function () {
            return dispositionService.getward_saveConcept().then(function (response) {
                $scope.wardSaveConceptUuid = response.data.results[0].uuid;
                $scope.wardSave = {
                    concept: {
                        uuid: $scope.wardSaveConceptUuid
                    }
                };
                dispositionService.getWardData($scope.patient.uuid, Bahmni.Common.Constants.ward_saveConcept).then(function (response) {

                    if (response.data.results.length > 0)
                        $scope.wardProposed = response.data.results[0].value;
                });
            });
        };

        var getProposedWards = function () {
            return dispositionService.getproposedWards().then(function (response) {
            
                $scope.wards = response.data.results[0].answers;

            });
        };

        var loadDispositionActions = function () {
            return getDispositionNotePromise().then(getDispositionActionsPromise);
        };

        $scope.clearDispositionNote = function () {
            $scope.dispositionNote.value = null;
        };

        var getSelectedConceptName = function (dispositionCode, dispositions) {
            var selectedDispositionConceptName = _.findLast(dispositions, {
                code: dispositionCode
            }) || {};
            return selectedDispositionConceptName.name;
        };

        var savewardObs = function () {
            $scope.wardObs = {
                person: $scope.patient.uuid,
                obsDatetime: new Date(),
                concept: $scope.wardSaveConceptUuid,
                value: $scope.wardProposed
            }

            return dispositionService.postWard($scope.wardObs).then(function (response) {

            });
        };

        var getSelectedDisposition = function () {
            if ($scope.dispositionCode) {
                $scope.wardSave.value = $scope.wardProposed;
                $scope.wardSave.uuid = $scope.wardSaveConceptUuid;
                $scope.wardSave.voided = !$scope.wardSave.value;
                if ($scope.wardProposed) {
                    savewardObs();
                }
                $scope.dispositionNote.voided = !$scope.dispositionNote.value;
                var disposition = {
                    additionalObs: [],
                    dispositionDateTime: consultation.disposition && consultation.disposition.dispositionDateTime,
                    code: $scope.dispositionCode,
                    conceptName: getSelectedConceptName($scope.dispositionCode, allDispositions)
                };


                if ($scope.dispositionNote.value || $scope.dispositionNote.uuid) {
                    disposition.additionalObs = [_.clone($scope.dispositionNote)];
                }

                return disposition;
            }
        };

        spinner.forPromise(loadDispositionActions(), '#disposition');

        var saveDispositions = function () {
            var selectedDisposition = getSelectedDisposition();
            if (selectedDisposition) {
                consultation.disposition = selectedDisposition;
            } else {
                if (consultation.disposition) {
                    consultation.disposition.voided = true;
                    consultation.disposition.voidReason = "Cancelled during encounter";
                }
            }
        };

        $scope.consultation.preSaveHandler.register("dispositionSaveHandlerKey", saveDispositions);
        $scope.$on('$destroy', saveDispositions);
    }]);
