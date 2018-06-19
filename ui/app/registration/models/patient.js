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
