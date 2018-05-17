"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var wellData_1 = require("../../../types/wellData");
var models_1 = require("../../../types/sdk/models");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var decamelize = require("decamelize");
var ChemicalLibrary = app.models['ChemicalLibrary'];
ChemicalLibrary.extract.parseLibraryResults = function (workflowData, expPlate, libraryResults) {
    return new Promise(function (resolve, reject) {
        var allWells = workflowData.wells;
        var barcode = expPlate.barcode;
        var plateId = expPlate.plateId;
        var taxTermRefs = ['compoundSystematicName', 'compoundMw', 'compoundFormula'];
        Promise.map(allWells, function (well) {
            //TODO Add Helpers
            var libraryResult = ChemicalLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
            var where = {
                libraryId: workflowData.libraryId,
                chemicalLibraryId: libraryResult.compoundLibraryId,
            };
            // TODO add ChemicalXrefs extract
            return app.models.ChemicalXrefs.extract.genTaxTerms(where)
                .then(function (chemicalTaxTerms) {
                var taxTerms = [];
                // For secondary plates we need to add an additional taxTerm for control wells
                chemicalTaxTerms.taxTerms.forEach(function (chemicalTaxTerm) {
                    taxTerms.push(chemicalTaxTerm);
                });
                if (lodash_1.isEqual(workflowData.screenStage, 'primary')) {
                    if (well.match('01') || well.match('12')) {
                        taxTerms.push({
                            taxonomy: 'compound_systematic_name',
                            taxTerm: 'DMS0'
                        });
                        libraryResult.compoundSystematicName = 'DMSO';
                    }
                }
                //Also get the formula, weight, and name from the libraryResult
                taxTermRefs.map(function (taxTermRef) {
                    if (lodash_1.get(libraryResult, taxTermRef)) {
                        taxTerms.push({
                            taxonomy: decamelize(taxTermRef),
                            taxTerm: libraryResult[taxTermRef]
                        });
                    }
                });
                //TODO If the screen is primary all 01 and 12 wells are DMSO
                var createStock = new models_1.ChemicalLibraryStockResultSet({
                    plateId: plateId,
                    libraryId: workflowData.libraryId,
                    compoundId: libraryResult.compoundId,
                    well: well,
                    location: '',
                    datePrepared: workflowData.stockPrepDate,
                    preparedBy: '',
                });
                // taxTerms: taxTerms,
                // taxTerm: libraryResult.chembridgelibraryId || 'chembridge_empty',
                // chembridgelibraryId: libraryResult.chembridgelibraryId || 'chembridge_empty',
                return new wellData_1.WellCollection({
                    well: well,
                    stockLibraryData: createStock,
                    parentLibraryData: libraryResult,
                    annotationData: {
                        chemicalName: libraryResult.compoundSystematicName,
                        taxTerm: String(libraryResult.compoundId),
                        taxTerms: taxTerms, dbXRefs: []
                    }
                });
            });
            // return data;
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ChemicalLibrary.js.map