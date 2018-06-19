'use strict';

angular.module('bahmni.reports')
    .controller('ReportsByDepartmentController', ['$scope', '$state', 'appService', 'reportService','messagingService', '$rootScope', function($scope, $state, appService, reportService, messagingService, $rootScope) {
        $scope.reports = appService.getAppDescriptor().getExtensions('org.bahmni.report.' + $rootScope.dept) || [];
        var facilityName = appService.getAppDescriptor().getConfigValue("facilityName");
        var HFRID = appService.getAppDescriptor().getConfigValue("HFRID");
        var facilityOwnership = appService.getAppDescriptor().getConfigValue("facilityOwnership");
        var council = appService.getAppDescriptor().getConfigValue("council");
        var region = appService.getAppDescriptor().getConfigValue("region");
        var CTCID = appService.getAppDescriptor().getConfigValue("CTCID");
        $scope.datesFilterSection = false;
        $scope.yearFilterSection = false;
        $scope.quarterFilterSection = false;
        $scope.formatSection = false;
        $scope.cohortSection = false;


        var init = function() {
            initializeFormats();
        };

        $scope.periodFilterContent = function(periodFilter) {

            if (periodFilter == 'Dates') {
                $scope.datesFilterSection = true;
                $scope.formatSection = true;

                $scope.yearFilterSection = false;
                $scope.quarterFilterSection = false;
                $scope.cohortSection = false;
            } else if (periodFilter == 'Quarterly') {
                $scope.quarterFilterSection = true;
                $scope.formatSection = true;

                $scope.datesFilterSection = false;
                $scope.yearFilterSection = false;
                $scope.cohortSection = false;
            } else if (periodFilter == 'Yearly') {
                $scope.yearFilterSection = true;
                $scope.formatSection = true;

                $scope.quarterFilterSection = false;
                $scope.datesFilterSection = false;
                $scope.cohortSection = false;
            }else if (periodFilter == 'Cohort') {
                $scope.cohortSection = true;
                $scope.formatSection = true;

                $scope.quarterFilterSection = false;
                $scope.datesFilterSection = false;
            } else {
                $scope.datesFilterSection = false;
                $scope.formatSection = false;
                $scope.cohortSection = false;
                $scope.yearFilterSection = false;
                $scope.quarterFilterSection = false;
            }
        };

        var initializeFormats = function() {
            var supportedFormats = appService.getAppDescriptor().getConfigValue("supportedFormats") || _.keys(reportService.getAvailableFormats());
            console.log(supportedFormats);
            supportedFormats = _.map(supportedFormats, function(format) {
                return format.toUpperCase();
            });
            $scope.formats = _.pick(reportService.getAvailableFormats(), supportedFormats);
        };


        $scope.downloadReport = function(report) {
            console.log(report);
            report = generateDates(report);
            report.name=report.name.name;
            console.log(report);
            if (validateReport(report)) {
                reportService.newGenerateReport(report);
                if (report.responseType === 'application/vnd.ms-excel-custom') {
                    report.reportTemplateLocation = undefined;
                    report.responseType = _.values($scope.formats)[0];
                }
            }
        };


        var generateDates = function(report) {
            if (report.periodFilter == 'Quarterly' || report.periodFilter == 'Cohort') {
                if (report.quarter == 'Jan - March') {
                    report.startDate = report.year + '/01/01';
                    report.stopDate = report.year + '/03/01';
                } else if (report.quarter == 'Apr - June') {
                    report.startDate = report.year + '/03/01';
                    report.stopDate = report.year + '/06/01';
                } else if (report.quarter == 'Jul - Sept') {
                    report.startDate = report.year + '/06/01';
                    report.stopDate = report.year + '/09/01';
                } else if (report.quarter == 'Oct - Dec') {
                    report.startDate = report.year + '/09/01';
                    report.stopDate = report.year + '/12/01';
                }

            } else if (report.periodFilter == 'Yearly') {

                report.startDate = report.startYear + '/01/01';
                report.stopDate = report.endYear + '/01/01';

            }

            return report;

        }

         var validateReport = function (report) {
            console.log(report);
                    if (!report.responseType) {
                        messagingService.showMessage("error", "Select format for the report: " + report.name);
                        return false;
                    }
                    if (report.responseType === 'application/vnd.ms-excel-custom' && !report.reportTemplateLocation) {
                        if (!report.config.macroTemplatePath) {
                            messagingService.showMessage("error", "Workbook template should be selected for generating report: " + report.name);
                            return false;
                        }
                        report.reportTemplateLocation = report.config.macroTemplatePath;
                    }
                    report.startDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.startDate);
                    report.stopDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.stopDate);
                    if (isDateRangeRequiredFor(report) && (!report.startDate || !report.stopDate)) {
                        var msg = [];
                        if (!report.startDate) {
                            msg.push("start date");
                        }
                        if (!report.stopDate) {
                            msg.push("end date");
                        }
                        messagingService.showMessage("error", "Please select the " + msg.join(" and "));
                        return false;
                    }
                    if (report.type == 'concatenated' && report.responseType == reportService.getMimeTypeForFormat('CSV')) {
                        messagingService.showMessage('error', 'CSV format is not supported for concatenated reports');
                        return false;
                    }
                  report.facilityName=facilityName;
                  report.HFRID=HFRID;
                  report.facilityOwnership=facilityOwnership;
                  report.council=council;
                  report.region=region;
                  report.CTCID=CTCID;
                  return true;
                };

        var isDateRangeRequiredFor = function (report) {
            return _.find($rootScope.reportsRequiringDateRange, {name: report.name});
        };
        init();
    }]);