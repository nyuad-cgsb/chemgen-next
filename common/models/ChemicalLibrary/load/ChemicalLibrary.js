"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var wellData_1 = require("../../../types/wellData");
var ChemicalLibrary = app.models['ChemicalLibrary'];
ChemicalLibrary.load.workflows.processExpPlates = function (workflowData, expPlates) {
    return new Promise(function (resolve, reject) {
        Promise.map(expPlates, function (plateInfo) {
            return ChemicalLibrary.load.workflows.processExpPlate(workflowData, plateInfo);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.warn(error.stack);
            reject(new Error(error));
        });
    });
};
ChemicalLibrary.load.workflows.processExpPlate = function (workflowData, expPlate) {
    return new Promise(function (resolve, reject) {
        ChemicalLibrary['extract'][workflowData.screenStage].getParentLibrary(workflowData, expPlate.barcode)
            .then(function (libraryResults) {
            return ChemicalLibrary.extract.parseLibraryResults(workflowData, expPlate, libraryResults);
        })
            .then(function (libraryDataList) {
            var plateData = new wellData_1.PlateCollection({ expPlate: expPlate, wellDataList: libraryDataList });
            resolve(plateData);
        })
            .catch(function (error) {
            // app.winston.warn(error.stack);
            reject(new Error(error));
        });
    });
};
ChemicalLibrary.load.createWorkflowSearchObj = function (workflowData) {
    return ChemicalLibrary.load[workflowData.screenStage].createWorkflowSearchObj(workflowData);
};
//TODO These are the same for all screens - only search terms are different
ChemicalLibrary.load.primary.createWorkflowSearchObj = function (workflowData) {
    return {
        and: [
            {
                libraryId: workflowData.libraryId,
            },
            {
                screenId: workflowData.screenId,
            },
            {
                instrumentId: workflowData.instrumentId,
            },
            {
                screenStage: workflowData.screenStage,
            },
            {
                stockPrepDate: workflowData.stockPrepDate,
            },
            {
                'replicates.1.0': workflowData.replicates[1][0],
            },
            {
                'search.chemicalLibrary.plate': workflowData.search.chemicalLibrary.plate,
            },
        ]
    };
};
//TODO This is the same as the RNAi
ChemicalLibrary.load.secondary.createWorkflowSearchObj = function (workflowData) {
    return {
        and: [
            {
                libraryId: workflowData.libraryId,
            },
            {
                screenId: workflowData.screenId,
            },
            {
                instrumentId: workflowData.instrumentId,
            },
            {
                screenStage: workflowData.screenStage,
            },
            {
                stockPrepDate: workflowData.stockPrepDate,
            },
            {
                'platePlan.platePlanName': workflowData.platePlan.platePlanName,
            },
            {
                'replicates.1.0': workflowData.replicates[1][0],
            }
        ]
    };
};
ChemicalLibrary.load.primary.genTaxTerms = function (workflowData) {
    return [
        { taxonomy: 'chemical_plate', taxTerm: workflowData.search.chemicalLibrary.plate },
    ];
};
ChemicalLibrary.load.secondary.genTaxTerms = function (workflowData) {
    return [];
};
ChemicalLibrary.load.genLibraryViewData = function (workflowData, wellData) {
    return {};
};
//# sourceMappingURL=ChemicalLibrary.js.map