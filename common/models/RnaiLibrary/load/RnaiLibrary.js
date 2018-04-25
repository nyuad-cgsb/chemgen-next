"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var wellData_1 = require("../../../types/wellData");
var RnaiLibrary = app.models['RnaiLibrary'];
//TODO This should be moved ot the stock - I am not actually creating anything in the rnai_library table
// Or Put this in 'extract'
RnaiLibrary.load.workflows.processExpPlates = function (workflowData, expPlates) {
    return new Promise(function (resolve, reject) {
        Promise.map(expPlates, function (plateInfo) {
            return RnaiLibrary.load.workflows.processExpPlate(workflowData, plateInfo);
        }, {
            concurrency: 6,
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
RnaiLibrary.load.workflows.processExpPlate = function (workflowData, expPlate) {
    return new Promise(function (resolve, reject) {
        app.winston.info('Getting Parent Plate');
        RnaiLibrary['extract'][workflowData.screenStage].getParentLibrary(workflowData, expPlate.barcode)
            .then(function (libraryResults) {
            app.winston.info('Parsing Library Results');
            return RnaiLibrary.extract.parseLibraryResults(workflowData, expPlate, libraryResults);
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
//TODO Thsi should be primary
RnaiLibrary.load.createWorkflowSearchObj = function (workflowData) {
    return {
        and: [
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
                'search.rnaiLibrary.plate': workflowData.search.rnaiLibrary.plate,
            },
            {
                'search.rnaiLibrary.chrom': workflowData.search.rnaiLibrary.chrom,
            },
            {
                'search.rnaiLibrary.quadrant': workflowData.search.rnaiLibrary.quadrant,
            },
            {
                stockPrepDate: workflowData.stockPrepDate,
            },
        ]
    };
};
