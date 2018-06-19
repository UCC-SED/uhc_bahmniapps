'use strict';

angular.module('bahmni.clinical')
    .controller('programPrintController',['$scope', '$rootScope', '$window','$http','contextChangeHandler', 'spinner', 'conceptSetService',
        'messagingService', 'appService','$state','locationService','$location','labOrderResultService','treatmentService', 'visitConfig','sessionService','configurations', 'retrospectiveEntryService',
        function ($scope, $rootScope,$window, $http,contextChangeHandler, spinner, conceptSetService, messagingService,
                  appService,$state,locationService,$location,labOrderResultService,treatmentService,visitConfig,sessionService,configurations, retrospectiveEntryService) {
		   var init = function (){
		var tb_tables = Bahmni.Common.Constants.tb_tablesConfig;  
			tb_tables.forEach(function (tb_table){	
				if(tb_table.load_table === true){
				if(tb_table.data_type.obs === true)
				    obs_table(tb_table);
				if (tb_table.data_type.drug === true)
					drug_table(tb_table);
				if (tb_table.data_type.lab === true)
					lab_table(tb_table);
			  }
		   });
     };
     
     var lab_table = function (tableConfig){
		 var concept_names = tableConfig.data.concept_names;
		 var params = {
		patientUuid: $scope.patient.uuid
		}
			
		labOrderResultService.getAllForPatient(params).then(function (response){
			console.log("lab cehck");
			console.log(response.tabular.tabularResult);
			var labresults= response.tabular.tabularResult.values;
			var Laborders = response.tabular.tabularResult.orders;
			$scope.data=[];
			$scope.dataDate = [];
			
			concept_names.forEach(function (concept_name)
			{
					if(concept_name != ""){
				Laborders.forEach(function (order){
				var x =0;
				if(order.testName==concept_name){
				if($scope.data[concept_name][0] === undefined)
				$scope.data[concept_name]=[];
				
				labresults.forEach(function(labresult){
				if(labresult.testOrderIndex==order.index){
				$scope.data[concept_name][x]= labresult.result;
				console.log(labresult.result);
														  }
														});	
			
												}
			
			
			
													});
											}
			}); 
			
			}); 
	 
		 
	 };
	 
	 var createTable = function (tableConfig){
		 var headerStart = "<tr>";
		 var headerTd = "";
		 tableConfig.data.title_names.forEach(function (title_name){
			headerTd = headerTd + "<th>"+title_names+"</th>";
		 });
		var header = headerStart + headerTd + "</tr>";
		
		//create table body row
		
		
		
		
	 }
	 
	 var drug_table = function (tableConfig){
		 
		 
		 
	 };
	 
	 var obs_table = function (tableConfig){
		 
		 
		 
	 };
     
	init();			 
       
        }
    ])
;
