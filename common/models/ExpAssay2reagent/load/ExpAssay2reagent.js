"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var ExpAssay2reagent = app.models['ExpAssay2reagent'];
ExpAssay2reagent.load.createAssayStock = function (workflowData, expPlateData) {
    return new Promise(function (resolve, reject) {
        Promise.map(expPlateData.wellDataList, function (wellData) {
            wellData.stockLibraryData.assayId = wellData.expAssay.assayId;
            var createObj = {
                assayId: wellData.expAssay.assayId,
                plateId: expPlateData.expPlate.plateId,
                screenId: workflowData.screenId,
                stockId: wellData.stockLibraryData.stockId,
                reagentId: wellData.stockLibraryData[workflowData.reagentLookUp],
                parentLibraryPlate: wellData.parentLibraryData.plate,
                parentLibraryWell: wellData.parentLibraryData.well,
                stockLibraryWell: wellData.expAssay.assayWell,
                reagentName: wellData.annotationData.taxTerm,
                reagentTable: workflowData.libraryStockModel,
                reagentType: wellData.expGroup.expGroupType,
            };
            return app.models.ExpAssay2reagent
                .findOrCreate({
                where: app.etlWorkflow.helpers.findOrCreateObj(createObj),
            }, createObj)
                .then(function (results) {
                wellData.expAssay2reagent = results[0];
                return wellData;
            });
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
