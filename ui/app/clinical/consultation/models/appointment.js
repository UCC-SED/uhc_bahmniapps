'use strict';

Bahmni.Clinical.Appointment = (function () {
    var Appointment = function (appointmentDetails) {
        angular.extend(this, appointmentDetails);
    };

    Appointment.create = function (appointmentDetails, patientUuid, providerUuid) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        var getDateTime = function (appointmentDate, givenTime) {
            if (!appointmentDate && !givenTime) return appointmentDate;
            var formattedTime = moment(givenTime, ["hh:mm a"]).format("HH:mm");
            return dateUtil.parseServerDateToDate(dateUtil.getDateWithoutTime(appointmentDate) + ' ' + formattedTime);
        };
        var appointment = new Appointment({
            uuid: appointmentDetails.uuid,
            patientUuid: patientUuid,
            serviceUuid: appointmentDetails.service.uuid,
            serviceTypeUuid: appointmentDetails.serviceType && appointmentDetails.serviceType.uuid,
            startDateTime: getDateTime(appointmentDetails.date, appointmentDetails.startTime),
            endDateTime: getDateTime(appointmentDetails.date, appointmentDetails.endTime),
            providerUuid: providerUuid,
            locationUuid: appointmentDetails.location && appointmentDetails.location.uuid,
            appointmentKind: "Scheduled",
            comments: appointmentDetails.comments
        });
        return appointment;
    };

    return Appointment;
})();

