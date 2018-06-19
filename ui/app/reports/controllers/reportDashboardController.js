'use strict';

angular.module('bahmni.reports')
    .controller('ReportDashboardController', ['$scope', '$state', 'appService', function ($scope, $state, appService) {
        $scope.appExtensions = appService.getAppDescriptor().getExtensions('org.bahmni.reports.dashboard', "link") || [];
    }]);
