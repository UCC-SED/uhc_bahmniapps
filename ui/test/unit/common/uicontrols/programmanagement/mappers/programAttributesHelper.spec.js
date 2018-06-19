describe("Program Attribute Helper", function () {
    var rootScope, appService, programAttributesHelper;

    var mockBackend;

    var programSpecificAttributeTypesDefinition = [{
        "programName": "TB Treatment",
        "attributeTypes": [
            "ID_Number",
            "Place of Work",
            "Reffered by"
        ]
    }];

    var attributeTypes = [
        {
            concept: null,
            answers: [],
            description: "ID_Number",
            name: "ID_Number",
            uuid: "0fe67814-6f9a-11e7-92a2-00155dca3503"
        },
        {
            concept: null,
            answers: [],
            description: "Reffered by",
            name: "Reffered by",
            uuid: "89196f4d-6f9a-11e7-92a2-00155dca3503",
        },
        {
            description: "Place of Work",
            name: "Place of Work",
            uuid: "88b7d49b-6f9a-11e7-92a2-00155dca350",
            answers: [
                { conceptId: 'b3da691b-b54b-44ac-b238-cf191b6dd724', description: 'Mines'},
                { conceptId: 'af7644dd-f88a-406d-bba0-0d18962d2417', description: 'TB - Hfacility'}
            ]
        }
    ];

    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var mockAppDescriptor = jasmine.createSpyObj('appService', ['getConfigValue']);
    mockAppDescriptor.getConfigValue.and.returnValue(programSpecificAttributeTypesDefinition);

    var mockAppService = jasmine.createSpyObj('appDescriptor', ['getAppDescriptor']);
    mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

    beforeEach(function () {
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return {programSpecificAttributeTypesDefinition: programSpecificAttributeTypesDefinition};
            }
        });

        module('bahmni.common.uicontrols.programmanagment');
        module(function ($provide) {
            $provide.value('appService', appService);
        });

        inject(function (_$rootScope_, _programAttributesHelper_, $httpBackend) {
            rootScope = _$rootScope_;
            mockBackend = $httpBackend;
            programAttributesHelper = _programAttributesHelper_;
        });
    });

    describe('get attributeTypes configuration for a specific program', function () {
        it('should get attribute types configuration for TB program', function () {
            var program = programAttributesHelper.getAttributeTypesConfigurationForProgram('TB Treatment');
            expect(program.programName).toBe('TB Treatment');
            expect(program.attributeTypes.length).toBe(3);
        });

        it('should get empty result for HIV program', function () {
            var program = programAttributesHelper.getAttributeTypesConfigurationForProgram('HIV program');
            expect(program).toBeUndefined();
        });
    });
    describe('map attribute value with concept', function () {
        it('should get concept value for patient program attributes', function () {
            var patientProgramAttributes = {
                "ID_Number": 1234,
                "Place of Work": "af7644dd-f88a-406d-bba0-0d18962d2417"
            };
            var form = programAttributesHelper.mapFieldWithConceptValue(patientProgramAttributes, attributeTypes);
            expect(form['Place of Work']).toBe('TB - Hfacility');
            expect(form['ID_Number']).toBe(1234);
        });
    });

    describe('filter hide', function () {
       it('should remove hidden attribute types from attribute type list', function () {
           var hide = [ 'Place of Work' ];
           var shownAttributeTypes = programAttributesHelper.filterOnHide(hide, attributeTypes);
           expect(attributeTypes.length).toBe(3);
           expect(shownAttributeTypes.length).toBe(2);
       });
       it('should show all attributes when hidden list is not provided', function () {
           var shownAttributeTypes = programAttributesHelper.filterOnHide(null, attributeTypes);
           expect(shownAttributeTypes.length).toBe(3);
       });
    });

    describe('show attributes', function () {
        var presentAttributeTypes = [
            {
                concept: null,
                answers: [],
                description: "ID_Number",
                name: "ID_Number",
                uuid: "0fe67814-6f9a-11e7-92a2-00155dca3503"
            }
        ];
       it('should show all shown attributes', function () {
           var show = [ 'Place of Work' ];
           var shownAttributeTypes = programAttributesHelper.showAttributes(show, presentAttributeTypes, attributeTypes);
           expect(shownAttributeTypes.length).toBe(2);
       });

       it('should show all attributes when show condition is not defined', function () {
           var shownAttributeTypes = programAttributesHelper.showAttributes(null, presentAttributeTypes, attributeTypes);
           expect(shownAttributeTypes.length).toBe(3);
       });
    });
    describe('sort', function () {
       it('should sort the program attribute types based on configuration setup', function () {
           var programName = 'TB Treatment';
           var sorttedProgramAttributeType = programAttributesHelper.sortBasedOnConfiguration(attributeTypes, programName);
           expect(sorttedProgramAttributeType[0].name).toBe('ID_Number');
           expect(sorttedProgramAttributeType[1].name).toBe('Place of Work');
           expect(sorttedProgramAttributeType[2].name).toBe('Reffered by');
       });
    });
});