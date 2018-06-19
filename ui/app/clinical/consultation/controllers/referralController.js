'use strict';

angular.module('bahmni.clinical')
    .controller('ReferralController',['$scope', '$rootScope', '$stateParams','$window','$http','contextChangeHandler', 'spinner', 'conceptSetService',
        'messagingService', 'referralConceptSet', 'appService','$state','locationService','$location', 'visitConfig','sessionService','configurations', 'visitService','retrospectiveEntryService',
        function ($scope, $rootScope,$stateParams,$window, $http,contextChangeHandler, spinner, conceptSetService, messagingService, referralConceptSet,
                  appService,$state,locationService,$location,visitConfig,sessionService,configurations, visitService,retrospectiveEntryService) {

			 var vm = this;
			 var loginLocationUuid = this;
			 var visitLocationUuid = this;
			 $scope.room = {};


        // $scope.configName = $stateParams.configName;
          $scope.consultation.extensions = $scope.consultation.extensions ? $scope.consultation.extensions : {mdrtbSpecimen: []};
            var initializeReferralScopes = function () {
               $scope.newSpecimens = $scope.consultation.newlyAddedSpecimens || [];
            };

            locationService.getAllByTag('Doctors Room').then(function(data)
            					{
            					console.log("Doctors Room");
            					$scope.rooms=[];
            					data.data.results.forEach(function(result)
                                				{
                                				$scope.rooms.push(result.display);
                                				})
                                				console.log($scope.rooms);

            					//getLocationuuid(data.data.results);
            					});
           
			//initializeReferralScopes();
         
            $scope.isRetrospectiveMode = function () {
                return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
            };
			
			
            var init = function () {

                var results = _.find(referralConceptSet.setMembers, function (member) {
                    return member.conceptClass.name === "Transfer_Referrals";
                });
               
                $scope.resultsConceptName = results && results.name.name;
                $scope.referObservation=$scope.consultation.observations;

            };

            $scope.gotToPrint = function () {
               $state.go('patient.dashboard.show.printPriv');
            };

            $scope.SelectedRow = function() {
                  $scope.count++;
                                   };

            var postSaveReferral = function()
            {
      console.log("-sasa-"+$scope.room.selected);
				console.log("Post Save");
				if($scope.room.selected){

         $http.get("https://192.168.33.10/openmrs/ws/rest/v1/SaveDoctorRoom/DoctorRoom?room="+$scope.room.selected+"&patientuuid="+$scope.patient.uuid+"",  {
                                                                                 withCredentials: true
                                                                              });

                                             }
				
				findTransferType($scope.consultation.observations[0].groupMembers);
				if($scope.TransferIn===true)
				{
					
					
					locationService.getAllByTag('Login Location').then(function(data)
					{
					console.log("login location");
					console.log(data);
					getLocationuuid(data.data.results);
					changeVisit($scope.consultation.observations[0].groupMembers);
					});
					
					
				}
			
				
				
            }
            
            var getLocationuuid = function (locations)
            { 
				locations.forEach(function(location)
				{
					if(location.display==$scope.choseenVisit)
					{
						console.log("Location Uuid");
						$scope.locationUuid=location.uuid;
					}
					
				});
				
			}
            
            
           var findTransferType = function (dataTrans)
            {
				$scope.TransferIn=false;
				dataTrans.forEach(function(data)
				{  
					if(data.conceptNameToDisplay=="Type of Transfer/Referral")
					{	
						
						
						if(data.valueAsString=="Transfer Within")
						{

						$scope.TransferIn= true;
						
						}
					}
					if(data.conceptNameToDisplay=="Referral Programs")
					{	
						
						$scope.choseenVisit = data.valueAsString;
						
					}
					
					
				});
				
				
				
			};
			
			var changeVisit = function(dataTrans)
			{
				
				var encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
				var visitTypes = encounterConfig.getVisitTypes();
				console.log("visit types");
				console.log(encounterConfig.getVisitTypes());
				 
			
				
			//get Uuuid of the selectedVisit	
				visitTypes.forEach(function(visitType)
				{
						
					if(visitType.name==$scope.choseenVisit)
					{	
						$scope.visitUuid = visitType.uuid;
					}
					
				});
				
				openVisit($scope.patient.uuid,$scope.visitUuid,$scope.locationUuid);
				
			}

			
	 var openVisit = function (patientUuid,visitType,location)
         {

          var params = {
                         patient: patientUuid,
                         location: location,
                         visitType: visitType
                     };



          var visitUuid = $state.$current.locals.globals.visitHistory.activeVisit.uuid;
           /*$http.post(Bahmni.Common.Constants.endVisitUrl + '?visitUuid=' + visitUuid, {
                          withCredentials: true
                      });*/

            $http.post(Bahmni.Common.Constants.visitUrl, params, {
                                     withCredentials: true
                                  });
            


        };

            $scope.consultation.preSaveHandler.register("referralSaveHandlerKey", postSaveReferral);
          //   $scope.consultation.postSaveHandler.register("referralPostSaveHandlerKey", postSaveReferral);

            init();

        }
    ])
;
