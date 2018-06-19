'use strict';

angular.module('bahmni.clinical')
    .controller('appointmentController', ['$scope', '$q', '$window', '$state', '$translate', 'spinner', 'appointmentsService', 'patientService',
        'messagingService', 'ngDialog', 'appService', '$stateParams', '$rootScope', 'appointmentsFilter',
        function ($scope, $q, $window, $state, $translate, spinner, appointmentsService, patientService,
            messagingService, ngDialog, appService, $stateParams, $rootScope, appointmentsFilter) {

            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
            $scope.allowedActions = appService.getAppDescriptor().getConfigValue('allowedActions') || [];
            $scope.allowedActionsByStatus = appService.getAppDescriptor().getConfigValue('allowedActionsByStatus') || {};
            $scope.manageAppointmentPrivilege = Bahmni.Clinical.Constants.privilegeManageAppointments;
            $scope.searchedPatient = false;
            $scope.appointmentService;
            $scope.appointments;
            var oldPatientData = [];
            $state.params.filterParams = {
                serviceUuids: [],
                serviceTypeUuids: [],
                providerUuids: [],
                statusList: []
            };
            $scope.$on('filterClosedOpen', function (event, args) {
                $scope.isFilterOpen = args.filterViewStatus;
            });
            $scope.tableInfo = [{
                heading: 'APPOINTMENT_PATIENT_ID',
                sortInfo: 'patient.identifier',
                enable: true
            }, {
                heading: 'APPOINTMENT_PATIENT_NAME',
                sortInfo: 'patient.name',
                class: true,
                enable: true
            }, {
                heading: 'APPOINTMENT_DATE',
                sortInfo: 'date',
                enable: true
            }, {
                heading: 'APPOINTMENT_START_TIME_KEY',
                sortInfo: 'startDateTime',
                enable: true
            }, {
                heading: 'APPOINTMENT_END_TIME_KEY',
                sortInfo: 'endDateTime',
                enable: true
            }, {
                heading: 'APPOINTMENT_SERVICE_SPECIALITY_KEY',
                sortInfo: 'service.speciality.name',
                enable: $scope.enableSpecialities
            }, {
                heading: 'APPOINTMENT_SERVICE',
                sortInfo: 'service.name',
                class: true,
                enable: true
            }, {
                heading: 'APPOINTMENT_STATUS',
                sortInfo: 'status',
                enable: true
            }, {
                heading: 'APPOINTMENT_CREATE_NOTES',
                sortInfo: 'comments',
                enable: true
            }];
            $scope.showStartTimes = [];
            $scope.warning = {};

            var init = function () {
                var promises = [];
                var config = {};
                promises.push(getAllAppointmentService());
                spinner.forPromise($q.all(promises).then(function (results) {
                    config.services = results[0].data;
                    $scope.appointmentService = results[0].data;
                }));
                ///  $scope.appointment = Bahmni.Clinical.AppointmentViewModel.create({appointmentKind: 'Scheduled'}, appointmentCreateConfig);
                //ListView
                $scope.searchedPatient = $stateParams.isSearchEnabled && $stateParams.patient;
                $scope.startDate = $stateParams.viewDate || moment().startOf('day').toDate();
                $scope.isFilterOpen = $stateParams.isFilterOpen;
                if (!$scope.searchedPatient) {
                    $scope.getAppointmentsForDate($scope.startDate);
                }
            };

            $scope.hasNoAppointments = function () {
                return _.isEmpty($scope.filteredAppointments);
            };

            $scope.getAppointmentsForDate = function (viewDate) {
                $stateParams.viewDate = viewDate;
                $scope.selectedAppointment = undefined;
                var params = {
                    forDate: viewDate
                };
                spinner.forPromise(appointmentsService.getAllAppointments(params).then(function (response) {
                    $scope.appointments = response.data;
                    $state.params.filterParams.providerUuids = $rootScope.currentProvider.uuid;
                    $scope.filteredAppointments = appointmentsFilter($scope.appointments, $state.params.filterParams);
                }));
            };

            $scope.searchByDate = function () {
                $scope.getAppointmentsForDate($scope.searchDate);
            }
            var getAllAppointmentService = function () {
                return appointmentsService.getAllServicesWithServiceTypes()
            };

            var filterTimingsBasedOnInput = function (enteredNumber, allowedList) {
                var showTimes = [];

                _.each(allowedList, function (time) {

                    (time.startsWith(enteredNumber) || (time.indexOf(enteredNumber) === 1 && (time.indexOf(0) === 0))) && showTimes.push(time);
                });

                return showTimes.length === 0 ? allowedList : showTimes;
            };


            $scope.checkAvailability = function () {
                $scope.warning.appointmentDate = false;
                if ($scope.appointment.date) {
                    setServiceAvailableTimesForADate($scope.appointment.date);
                    var dayOfWeek = moment($scope.appointment.date).format('dddd').toUpperCase();
                    var allSlots;
                    if (!_.isEmpty($scope.selectedService.weeklyAvailability)) {
                        allSlots = getSlotsForWeeklyAvailability(dayOfWeek, $scope.selectedService.weeklyAvailability, $scope.minDuration);
                        $scope.warning.appointmentDate = !isServiceAvailableOnWeekDate(dayOfWeek, $scope.selectedService.weeklyAvailability);
                    } else {
                        allSlots = getAllSlots($scope.selectedService.startTime, $scope.selectedService.endTime, $scope.minDuration);
                    }
                    $scope.startTimes = allSlots.startTime;
                    $scope.endTimes = allSlots.endTime;
                    $scope.warning.endTime = !isAppointmentTimeWithinServiceAvailability($scope.appointment.endTime);
                    $scope.warning.startTime = !isAppointmentTimeWithinServiceAvailability($scope.appointment.startTime);
                    $scope.warning.outOfRange = isSelectedSlotOutOfRange();
                    triggerSlotCalculation();
                }
            };


            var setServiceAvailableTimesForADate = function (date) {
                $scope.allowedStartTime = $scope.selectedService.startTime || '12:00 am';
                $scope.allowedEndTime = $scope.selectedService.endTime || '11:59 pm';

                if ($scope.selectedService.weeklyAvailability && $scope.selectedService.weeklyAvailability.length > 0) {
                    $scope.weeklyAvailabilityOnSelectedDate = getWeeklyAvailabilityOnADate(date, $scope.selectedService.weeklyAvailability);
                    if ($scope.weeklyAvailabilityOnSelectedDate && $scope.weeklyAvailabilityOnSelectedDate.length === 0) {
                        $scope.allowedStartTime = undefined;
                        $scope.allowedEndTime = undefined;
                    }
                }
            };


            $scope.timeSource = function () {
                return $q(function (resolve) {
                    resolve($scope.showStartTimes);
                });
            };


            $scope.onKeyDownOnStartTime = function () {
                $scope.showStartTimes = filterTimingsBasedOnInput($scope.appointment.startTime, $scope.startTimes);
            };

            var getSlotsForWeeklyAvailability = function (dayOfWeek, weeklyAvailability, durationInMin) {
                var slots = {
                    startTime: [],
                    endTime: []
                };
                var dayAvailability = _.filter(weeklyAvailability, function (o) {
                    return o.dayOfWeek === dayOfWeek;
                });
                dayAvailability = _.sortBy(dayAvailability, 'startTime');
                _.each(dayAvailability, function (day) {
                    var allSlots = getAllSlots(day.startTime, day.endTime, durationInMin);

                    slots.startTime = _.concat(slots.startTime, allSlots.startTime);
                    slots.endTime = _.concat(slots.endTime, allSlots.endTime);
                });
                return slots;
            };

            var getAllSlots = function (startTimeString, endTimeString, durationInMin) {
                startTimeString = _.isEmpty(startTimeString) ? '00:00' : startTimeString;
                endTimeString = _.isEmpty(endTimeString) ? '23:59' : endTimeString;

                var startTime = getFormattedTime(startTimeString);
                var endTime = getFormattedTime(endTimeString);

                var result = [];
                var slots = {
                    startTime: [],
                    endTime: []
                };
                var current = moment(startTime);

                while (current.valueOf() <= endTime.valueOf()) {
                    result.push(current.format('hh:mm a'));
                    current.add(durationInMin, 'minutes');
                }

                slots.startTime = _.slice(result, 0, result.length - 1);
                slots.endTime = _.slice(result, 1);

                return slots;
            };

            $scope.onServiceChange = function () {
                clearAvailabilityInfo();
                delete $scope.weeklyAvailabilityOnSelectedDate;
                if ($scope.appointment.service) {
                    setServiceDetails($scope.appointment.service).then(function () {
                        $scope.onSelectStartTime();
                    });
                }
            };

            var clearAvailabilityInfo = function () {
                $scope.warning.appointmentDate = false;
                $scope.warning.startTime = false;
                $scope.warning.endTime = false;
                $scope.warning.outOfRange = false;
                clearSlotsInfo();
            };

            var clearSlotsInfo = function () {
                delete $scope.currentLoad;
                delete $scope.maxAppointmentsLimit;
            };

            var setServiceDetails = function (service) {
                return appointmentsService.getService(service.uuid).then(
                    function (response) {
                        $scope.selectedService = response.data;
                        // $scope.appointment.location = _.find(appointmentCreateConfig.locations, {uuid: $scope.selectedService.location.uuid});
                        $scope.minDuration = response.data.durationMins || Bahmni.Clinical.Constants.minDurationForAppointment;
                    });
            };

            $scope.onSelectStartTime = function (data) {
                $scope.warning.startTime = !isAppointmentTimeWithinServiceAvailability($scope.appointment.startTime);
                if (moment($scope.appointment.startTime, 'hh:mm a', true).isValid()) {
                    $scope.appointment.endTime = moment($scope.appointment.startTime, 'hh:mm a').add($scope.minDuration, 'm').format('hh:mm a');
                    $scope.onSelectEndTime();
                }
            };

            var isAppointmentTimeWithinServiceAvailability = function (appointmentTime) {
                if ($scope.weeklyAvailabilityOnSelectedDate && $scope.weeklyAvailabilityOnSelectedDate.length) {
                    return _.find($scope.weeklyAvailabilityOnSelectedDate, function (availability) {
                        return !(moment(appointmentTime, 'hh:mm a').isBefore(moment(availability.startTime, 'hh:mm a')) ||
                            moment(availability.endTime, 'hh:mm a').isBefore(moment(appointmentTime, 'hh:mm a')));
                    });
                } else if ($scope.allowedStartTime || $scope.allowedEndTime) {
                    return !(moment(appointmentTime, 'hh:mm a').isBefore(moment($scope.allowedStartTime, 'hh:mm a')) ||
                        moment($scope.allowedEndTime, 'hh:mm a').isBefore(moment(appointmentTime, 'hh:mm a')));
                }
                return true;
            };

            var getFormattedTime = function (time) {
                return moment(time, 'hh:mm a');
            };

            var isSelectedSlotOutOfRange = function () {
                if ($scope.appointment.startTime && !($scope.warning.appointmentDate || $scope.warning.startTime || $scope.warning.endTime)) {
                    return !isAppointmentStartTimeAndEndTimeWithinServiceAvailability();
                }
                return false;
            };

            var triggerSlotCalculation = function () {
                if ($scope.appointment &&
                    $scope.appointment.service &&
                    $scope.appointment.date &&
                    $scope.appointment.startTime &&
                    $scope.appointment.endTime &&
                    _.isEmpty($scope.selectedService.serviceTypes)
                ) {
                    getSlotsInfo();
                }
            };

            $scope.onSelectEndTime = function (data) {
                $scope.warning.endTime = false;
                $scope.checkAvailability();
                $scope.warning.endTime = !isAppointmentTimeWithinServiceAvailability($scope.appointment.endTime);
                $scope.warning.outOfRange = isSelectedSlotOutOfRange();
            };
            var isAppointmentStartTimeAndEndTimeWithinServiceAvailability = function () {
                var appointmentStartTime = $scope.appointment.startTime;
                var appointmentEndTime = $scope.appointment.endTime;

                if ($scope.weeklyAvailabilityOnSelectedDate && $scope.weeklyAvailabilityOnSelectedDate.length) {
                    return _.find($scope.weeklyAvailabilityOnSelectedDate, function (availability) {
                        return (moment(availability.startTime, 'hh:mm a') <= moment(appointmentStartTime, 'hh:mm a')) &&
                            (moment(appointmentEndTime, 'hh:mm a') <= moment(availability.endTime, 'hh:mm a'));
                    });
                }
                return true;
            };

            var getSlotsInfo = function () {
                var daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                var selectedService = $scope.selectedService;
                var appointment = $scope.appointment;
                var startDateTime, endDateTime;
                var availabilityObject;
                clearSlotsInfo();
                if (!_.isEmpty(selectedService.weeklyAvailability)) {
                    var availability = _.find(selectedService.weeklyAvailability, function (avb) {
                        return daysOfWeek[appointment.date.getDay()] === avb.dayOfWeek &&
                            moment(avb.startTime, 'hh:mm a') <= moment(appointment.startTime, 'hh:mm a') &&
                            moment(appointment.endTime, 'hh:mm a') <= moment(avb.endTime, 'hh:mm a');
                    });
                    if (availability) {
                        availabilityObject = availability;
                        availabilityObject.durationMins = selectedService.durationMins || $scope.minDuration;
                    }
                } else {
                    if (moment(selectedService.startTime || "00:00", 'hh:mm a') <= moment(appointment.startTime, 'hh:mm a') &&
                        moment(appointment.endTime, 'hh:mm a') <= moment(selectedService.endTime || "23:59", 'hh:mm a')) {
                        availabilityObject = selectedService;
                    }
                }
                if (availabilityObject) {
                    $scope.maxAppointmentsLimit = availabilityObject.maxAppointmentsLimit || calculateMaxLoadFromDuration(availabilityObject);
                    startDateTime = getDateTime(appointment.date, availabilityObject.startTime || "00:00");
                    endDateTime = getDateTime(appointment.date, availabilityObject.endTime || "23:59");
                    appointmentsService.getServiceLoad(selectedService.uuid, startDateTime, endDateTime).then(function (response) {
                        $scope.currentLoad = response.data;
                    });
                }
            };

            var dateUtil = Bahmni.Common.Util.DateUtil;
            var calculateMaxLoadFromDuration = function (avb) {
                if (avb.durationMins && avb.startTime && avb.endTime) {
                    var startTime = moment(avb.startTime, ["hh:mm a"]);
                    var endTime = moment(avb.endTime, ["hh:mm a"]);
                    return Math.round((dateUtil.diffInMinutes(startTime, endTime)) / avb.durationMins);
                }
            };

            var getDateTime = function (date, time) {
                var formattedTime = moment(time, ["hh:mm a"]).format("HH:mm");
                return dateUtil.parseServerDateToDate(dateUtil.getDateWithoutTime(date) + ' ' + formattedTime);
            };


            $scope.save = function () {
                var message;
                if ($scope.createAppointmentForm.$invalid) {
                    message = $scope.createAppointmentForm.$error.pattern ?
                        'INVALID_TIME_ERROR_MESSAGE' : 'INVALID_SERVICE_FORM_ERROR_MESSAGE';
                } else if (!moment($scope.appointment.startTime, 'hh:mm a')
                    .isBefore(moment($scope.appointment.endTime, 'hh:mm a'), 'minutes')) {
                    message = 'TIME_SEQUENCE_ERROR_MESSAGE';
                }
                if (message) {
                    messagingService.showMessage('error', message);
                    return;
                }

                $scope.validatedAppointment = Bahmni.Clinical.Appointment.create($scope.appointment, $scope.patient.uuid, $rootScope.currentProvider.uuid);
                var conflictingAppointments = getConflictingAppointments($scope.validatedAppointment);
                if (conflictingAppointments.length === 0) {
                    saveAppointment($scope.validatedAppointment);
                } else {
                    $scope.displayConflictConfirmationDialog();
                }
            };
            var getConflictingAppointments = function (appointment) {
                return _.filter($scope.patientAppointments, function (bookedAppointment) {
                    return checkForConflict(bookedAppointment, appointment);
                });
            };
            var saveAppointment = function (appointment) {
                appointmentsService.save(appointment).then(function () {
                    messagingService.showMessage('info', 'APPOINTMENT_SAVE_SUCCESS');
                    $scope.showConfirmationPopUp = false;
                    var params = $state.params;
                    params.viewDate = moment($scope.appointment.date).startOf('day').toDate();
                    params.isFilterOpen = true;
                    params.isSearchEnabled = params.isSearchEnabled && $scope.isEditMode();
                    $state.go('^', params, {
                        reload: true
                    });
                });
            };
            init();
        }
    ]);