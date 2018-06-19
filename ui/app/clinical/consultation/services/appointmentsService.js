'use strict';

angular.module('bahmni.clinical')
    .service('appointmentsService', ['$http', 'appService',
        function ($http, appService) {
            this.save = function (appointment) {
                return $http.post(Bahmni.Clinical.Constants.createAppointmentUrl, appointment, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };
            this.search = function (appointment) {
                return $http.post(Bahmni.Appointments.Constants.searchAppointmentUrl, appointment, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.getAppointmentsForServiceType = function (serviceTypeUuid) {
                var params = {"appointmentServiceTypeUuid": serviceTypeUuid};
                return $http.get(Bahmni.Appointments.Constants.getAppointmentsForServiceTypeUrl, {
                    params: params,
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.getAllAppointments = function (params) {
                return $http.get(Bahmni.Clinical.Constants.getAllAppointmentsUrl, {
                    params: params,
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.getAppointmentByUuid = function (appointmentUuid) {
                var params = {uuid: appointmentUuid};
                return $http.get(Bahmni.Appointments.Constants.getAppointmentByUuid, {
                    params: params,
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.getAppointmentsSummary = function (params) {
                return $http.get(Bahmni.Appointments.Constants.getAppointmentsSummaryUrl, {
                    params: params,
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

     this.getServiceLoad = function (serviceUuid, startDateTime, endDateTime) {
                  var params = {uuid: serviceUuid, startDateTime: startDateTime, endDateTime: endDateTime};
                  return $http.get(Bahmni.Clinical.Constants.getServiceLoad, {
                      params: params,
                      withCredentials: true,
                      headers: {"Accept": "application/json", "Content-Type": "application/json"}
                  });
              };

           this.getService = function (uuid) {
                return $http.get(Bahmni.Common.Constants.appointmentServiceUrl + "?uuid=" + uuid, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.getAllServicesWithServiceTypes = function () {
                            return $http.get(Bahmni.Common.Constants.appointmentServiceUrl + "/all/default", {
                                withCredentials: true,
                                headers: {"Accept": "application/json", "Content-Type": "application/json"}
                            });
                        };

            this.changeStatus = function (appointmentUuid, toStatus, onDate) {
                var params = {toStatus: toStatus, onDate: onDate};
                var changeStatusUrl = appService.getAppDescriptor().formatUrl(Bahmni.Appointments.Constants.changeAppointmentStatusUrl, {appointmentUuid: appointmentUuid});
                return $http.post(changeStatusUrl, params, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.undoCheckIn = function (appointmentUuid) {
                return $http.post(Bahmni.Appointments.Constants.undoCheckInUrl + appointmentUuid, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };
        }]);
