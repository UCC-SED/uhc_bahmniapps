'use strict';

angular.module('bahmni.clinical')
    .controller('printPrivController', ['$scope','$rootScope', '$q','printer','diagnosisService','providerService','labOrderResultService','treatmentService', 'dispositionService', 'printPrivService','retrospectiveEntryService', 'spinner','$state',
    function ($scope,$rootScope, $q,printer,diagnosisService,providerService,labOrderResultService,treatmentService, dispositionService, printPrivService,retrospectiveEntryService, spinner,$state) {
        var consultation = $scope.consultation;
        console.log($scope);
        //console.log($rootScope.currentUser.uuid);
        var allDispositions = [];
		$scope.gender=null;

		$scope.tb_other=null;
		$scope.tb_lung=null;
		$scope.HIVstatus=null;
		$scope.CurrentDate = new Date();
		$scope.hospitalName = Bahmni.Common.Constants.hospital_details.name;
		$scope.district = Bahmni.Common.Constants.hospital_details.district;
		if($scope.patient.gender=='F')
		$scope.gender="Female";
		else
		$scope.gender="Male";

        $scope.printCTCreferal = function(){

             var printScope = $scope.$new();
                                printScope.isDashboardPrinting = true;
                               // printScope.tabBeingPrinted = tab || clinicalDashboardConfig.currentTab;
                               // var dashboardModel = Bahmni.Common.DisplayControl.Dashboard.create(printScope.tabBeingPrinted, $filter);
                                //printScope.diseaseTemplates = '';

           if($scope.repotType =="CTC"){
        printer.printFromScope('consultation/views/printCTCreferal.html', printScope);
        }
        if($scope.repotType == "vct"){
         printer.printFromScope('consultation/views/vctferralPrint.html', printScope);

        }

        }


		
		$scope.selectReport = function () {
			
	printPrivService.getTransferData($scope.patient.uuid,"Facility Transfers").then(function(data){
    $scope.transferData = data;
     if(data.data.length>0){
            retriveTransferData($scope.transferData.data[0].groupMembers);
		}
        });

        treatmentService.getActiveDrugOrders($scope.patient.uuid).then(function(data){
             $scope.trets = "";
                    var x =0;
             data.forEach(function (tret){

              if(x<4){
               $scope.trets= $scope.trets + tret.drug.name+ " | ";
                    }
                    x++;
                      });
                });
        diagnosisService.getDiagnoses($scope.patient.uuid).then(function(data){

        $scope.diagnos = "";
        var x =0;
        data.data.forEach(function (diagnosis){
        if(x<4){
        $scope.diagnos= $scope.diagnos + diagnosis.codedAnswer.name+"("+diagnosis.order+ ")" + " | ";
        }
        x++;
            });
                });

        printPrivService.searchProviderByUuid($rootScope.currentUser.uuid).then(function (resp){

			resp.data.results.forEach(function (res){
			if(res.attributes.length > 1){
			var providerData = res.attributes;
			$scope.docFullName = res.person.display;
			providerData.forEach(function (prov){
				if(prov.attributeType.display=="Phone Number")
				$scope.PhoneNumber = prov.value;
				
				if(prov.attributeType.display=="Title")
				$scope.title = prov.value;
				
			});
			}
			});
			
		});
        if($scope.repotType == "vct"){
        if($scope.patient.gender=='F')
        		$scope.gender="Kike";
        		else
        		$scope.gender="Kiume";

        }
        
	if($scope.repotType == "gRef"){
    		  printPrivService.getTB($scope.patient.uuid).then(function(data)
            {
    			$scope.tbData=data;

                if(data.data.results.length>0){

    			$scope.tbData.data.results.forEach(function (result){

    		if(result.display=="HIV Care and Treatment"){
                 getHIVData(result.attributes);
    		}
    		if(result.display=="NATIONAL TB AND LEPROSY PROGRAM"){
               if(result.attributes.length>0){
    					$scope.tbYes="Yes";
                $scope.dateEnrollTB = result.dateEnrolled;

    		}else{
    			$scope.tbYes="No";

    		}
    			}
    		if(result.display=="Antenatal Care"){
    			if(result.attributes.length>0){
    					$scope.preg="Yes";
               // console.log(result.attributes);

    		}else{
    			$scope.preg="No";

    		}


    			}
    		});
    			}
    		});

    		printPrivService.getTransferData($scope.patient.uuid,"WHO Stage").then(function(data){
    			 if(data.data.length>0){
           $scope.clinical_stage = data.data[0].valueAsString;
    		}
            });

            printPrivService.getTransferData($scope.patient.uuid,"CTC - CD4 Count").then(function(data){
    		 if(data.data.length>0){
           $scope.cd4_count = data.data[0].value;
    		}
            });


    	};
			
	if($scope.repotType == "CTC"){
		  printPrivService.getTB($scope.patient.uuid).then(function(data)
        {
			$scope.tbData=data;
			
            if(data.data.results.length>0){

			$scope.tbData.data.results.forEach(function (result){
				
		if(result.display=="HIV Care and Treatment"){
             getHIVData(result.attributes);
		}
		if(result.display=="NATIONAL TB AND LEPROSY PROGRAM"){
           if(result.attributes.length>0){
					$scope.tbYes="Yes";
            $scope.dateEnrollTB = result.dateEnrolled;
            
		}else{
			$scope.tbYes="No";
			
		}
			}
		if(result.display=="Antenatal Care"){
			if(result.attributes.length>0){
					$scope.preg="Yes";
           // console.log(result.attributes);
            
		}else{
			$scope.preg="No";
			
		}
            
            
			}	
		});
			}
		});
		
		printPrivService.getTransferData($scope.patient.uuid,"WHO Stage").then(function(data){
			 if(data.data.length>0){
       $scope.clinical_stage = data.data[0].valueAsString;
		}
        });
        
        printPrivService.getTransferData($scope.patient.uuid,"CTC - CD4 Count").then(function(data){
		 if(data.data.length>0){	
       $scope.cd4_count = data.data[0].value;
		}
        });
		
		
	};			
			
			
	 if($scope.repotType == "TB")
	 {
		get_TB_LabData();
		get_TB_meds("All TB Drugs");
		get_HIV_meds("All HIV Drugs");
		
		
        
        printPrivService.getTB($scope.patient.uuid).then(function(data)
        {
			$scope.tbData=data;
			
            if(data.data.results.length>0){
			
			$scope.tbData.data.results.forEach(function (result){
		   if(result.display=="NATIONAL TB AND LEPROSY PROGRAM"){
            tbStartdate(result.dateEnrolled);
            getTbData(result.attributes);
			}
		if(result.display=="HIV Care and Treatment"){
             getHIVData(result.attributes);
		}
		});
			}
		});
		
		printPrivService.getTransferData($scope.patient.uuid,"TB - DOT - startDate").then(function(data){
           $scope.dotStart = data;

           if($scope.dotStart.data.length>0)
           {
           var oldestData=$scope.dotStart.data.length-1;

           $scope.dotStart=$scope.dotStart.data[oldestData].value;

			}
        });

        printPrivService.getTransferData($scope.patient.uuid,"TB - DOT - EndDate").then(function(data){
           $scope.dotEnd = data;

           if($scope.dotEnd.data.length>0)
           {

           $scope.dotEnd=$scope.dotEnd.data[0].value;

			}
        });

      /*  var getTBmedsNames = function (data){
			var names = null;
			data.forEach(function(obj){
				if(obj.concept.shortName)
				{
					names = names+","+obj.concept.shortName;
				}else{
				names = names+","+obj.concept.name;
			}


			});


			while(names.charAt(0) == ',')
			{
			names = names.substr(1);
			}
			$scope.medName=names;
		}*/



		function tbStartdate(data)
		{
			$scope.startDate=data;

		};


	}
			
		}
		//end of report
		
		var getHIVData = function (HIVdata)
		{
			console.log(HIVdata);
			HIVdata.forEach(function(data){
			if(data.attributeType.display=="ID_Number"){
				$scope.HIVnO = data.value;
			}	
			if(data.attributeType.display=="Date Enrolled In Care"){
				$scope.HIVdATE = data.value;
			}
			if(data.attributeType.display=="Date Confirmed HIV+"){
				$scope.verifiedHiv = data.value;
			}
			if(data.attributeType.display=="Date Medically Eligible"){
				$scope.date_readyMeds = data.value;
			}
			if(data.attributeType.display=="Date Start ART"){
				$scope.date_startMeds = data.value;
			}
			if(data.attributeType.display=="Weight"){
				$scope.weight = data.value;
			}
			if(data.attributeType.display=="Functional Status"){
				$scope.functional_Status = data.value.display;
			}
			
			
		});
		};
		
		var getTbData= function (objz)
		{
			objz.forEach(function(obj)
			{
				console.log(obj.attributeType.display);
			if(obj.attributeType.display=="Classification by site")	
			{

				
				if(obj.value.display=="TB - Pulmonary")
				{
				
				$scope.tb_lung="✔";
				}
				if(obj.value.display=="TB - Extra-pulmonary")
				{
				$scope.tb_other="✔";
				
				}
			}
				
				if(obj.attributeType.display=="HIV Status")	
			{
				
				
				if(obj.value.display=="TB - HIV Status - Positive")
				{
				
				$scope.HIVstatus="✔";
				}
				
			}
				
			});
		};
		
		var retriveTransferData = function(newObs)
		{

		newObs.forEach(function(obs)
			{
			if(obs.conceptNameToDisplay=="Name of Facility To be Transfer")
			{	
			
			$scope.hospital_name=obs.valueAsString;
			
			
			}
			if( obs.conceptNameToDisplay == "Address of Referred Facility" ){
			$scope.address=obs.valueAsString;

			}
			if( obs.conceptNameToDisplay == "Address of Referred Facility 2" ){
            			$scope.address2=obs.valueAsString;

            			}
			if(obs.conceptNameToDisplay=="Clinical Notes/Findings")
			{
				$scope.clinical_notes=obs.valueAsString;
				
			}
			if(obs.conceptNameToDisplay=="Facility District")
			{
				$scope.FacilityToBeDistrict=obs.valueAsString;
				
			}
			
			if(obs.conceptNameToDisplay=="Remarks/Reasons")
			{
			$scope.remarks=obs.valueAsString;
			}
			
			if(obs.conceptNameToDisplay=="Makazi ya Sasa")
			{
			var currentLoc = obs.groupMembers;
			
			currentLoc.forEach(function (curr){
			if(curr.conceptNameToDisplay=="Makaz")
			{
				$scope.MakazSasa = curr.valueAsString;
			}
			
			if(curr.conceptNameToDisplay=="Namba ya Wilaya")
			{
			$scope.nambaWilayaSasa = curr.valueAsString;
			}
				
			});
			
			} 
			//new location
			if(obs.conceptNameToDisplay=="Makazi Mapya")
			{
			var currentLoc = obs.groupMembers;
			
			currentLoc.forEach(function (curr){
			if(curr.conceptNameToDisplay=="Makaz")
			{
				$scope.Makazmapya = curr.valueAsString;
			}
			
			if(curr.conceptNameToDisplay=="Namba ya Wilaya")
			{
			$scope.nambaWilayamapya = curr.valueAsString;
			}
				
			});
			
			} 
			
				
			});
		};
		
		
		
        var get_TB_LabData = function (){
			
			var params = {
		patientUuid: $scope.patient.uuid
		}
		
		labOrderResultService.getAllForPatient(params).then(function (response){
			

			var labresults= response.tabular.tabularResult.values;
			var Laborders = response.tabular.tabularResult.orders;
			Laborders.forEach(function (order){
			if(order.testName=="CD4 COUNT"){
			labresults.forEach(function(labresult){
				if(labresult.testOrderIndex==order.index){
					$scope.cd4 = labresult.result;
					$scope.cd4Date = labresult.accessionDateTime;

			 }
			});	
				
			}
			
			if(order.testName=="Smear"){
			labresults.forEach(function(labresult){
				if(labresult.testOrderIndex==order.index){
					$scope.Smear = labresult.result;
					$scope.SmearDate = labresult.accessionDateTime;
				
			 }
			});	
				
			}
			
			if(order.testName=="Smear Test (Slit Skin)"){
			labresults.forEach(function(labresult){
				if(labresult.testOrderIndex==order.index){
					$scope.slitskin = labresult.result;
					$scope.slitskinDate = labresult.accessionDateTime;
				
			 }
			});	
				
			}
			
		});
			
		});
			
			
			
		}
		
		var get_TB_meds = function (meds_name){
		treatmentService.getAllDrugOrdersFor($scope.patient.uuid,meds_name).then(function(response){

			 if(response.length>0)
           {
           
           var tbDrugs="";
			var smallDate=1;
			var BigDate=1;
			var currentDate = new Date();
            response.forEach(function (resp){
				   var stopDate = new Date(resp.effectiveStopDate);
					if(currentDate.getTime()<=stopDate.getTime()){
						
					tbDrugs = tbDrugs + resp.concept.name+",";	
					if(smallDate < resp.effectiveStartDate)	
						smallDate = resp.effectiveStartDate;
						
					if(BigDate < resp.effectiveStopDate)	
						BigDate = resp.effectiveStopDate;	
					}
            
			});
			 $scope.dotStart = smallDate;
			  $scope.dotEnd = BigDate;
			
			}
			
		
		});	
			
			
			
			
		}
		
		var get_HIV_meds = function (hiv_data){
			treatmentService.getAllDrugOrdersFor($scope.patient.uuid,hiv_data).then(function(response){
			

			var hivDrugs="";
			var smallDate=1;
			var BigDate=1;
			var currentDate = new Date();
			 if(response.length > 0)
           {
			   response.forEach(function (resp){
				   var stopDate = new Date(resp.effectiveStopDate);
					if(currentDate.getTime()<=stopDate.getTime()){
						
					hivDrugs = hivDrugs + resp.concept.name+",";	
					if(smallDate < resp.effectiveStartDate)	
						smallDate = resp.effectiveStartDate;
						
					if(BigDate < resp.effectiveStopDate)	
						BigDate = resp.effectiveStopDate;	
					}
           
           
											});
           
			}
			$scope.hivDrugs = hivDrugs;
			$scope.smallDate = smallDate;
			$scope.BigDate = BigDate;
			
			
		});
			
			
			
		}
        
        $scope.gotTotransfer = function () {
               $state.go('patient.dashboard.show.referral', {}, { reload: true });
            };

     
    }]);
