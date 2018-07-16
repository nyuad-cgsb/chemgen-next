"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var wellData_1 = require("../../../types/wellData");
var models_1 = require("../../../types/sdk/models");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var RnaiLibrary = app.models['RnaiLibrary'];
//TODO This should have specific logic per instrument
//TODO This also has different logic per library
//RNAi only has 1 (so far), but chemical has at least 2
//Here we can map A01 -> A01
//But in NY its TileThing -> Well
RnaiLibrary.extract.parseLibraryResults = function (workflowData, expPlate, libraryResults) {
    return new Promise(function (resolve, reject) {
        var allWells = workflowData.wells;
        var barcode = expPlate.barcode;
        var plateId = expPlate.plateId;
        var platedbXrefSearch = [];
        allWells.map(function (well) {
            var libraryResult = RnaiLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
            if (lodash_1.get(libraryResult, 'compoundLibraryId')) {
                var where = {
                    wbGeneSequenceId: libraryResult.geneName,
                };
                platedbXrefSearch.push(where);
            }
        });
        //TODO Need to incorporate multiple wells
        app.models.RnaiWormbaseXrefs.find({ where: { or: platedbXrefSearch } })
            .then(function (dbXrefs) {
            return Promise.map(allWells, function (well) {
                var createStocks = [];
                var parentLibraryResults = [];
                var libraryResult = RnaiLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
                return app.models.RnaiWormbaseXrefs.extract.genTaxTerms(dbXrefs, {
                    where: {
                        wbGeneSequenceId: libraryResult.geneName,
                    },
                })
                    .then(function (wormTaxTerms) {
                    // TODO Add taxTerms per library / screenStage
                    var taxTerms = [];
                    // For secondary plates we need to add an additional taxTerm for control wells
                    wormTaxTerms.taxTerms.forEach(function (wormTaxTerm) {
                        taxTerms.push(wormTaxTerm);
                    });
                    //In the primary screen we have an entire barcode with L4440s
                    if (barcode.match('L4440')) {
                        taxTerms.push({
                            taxonomy: 'wb_gene_sequence_id',
                            taxTerm: 'L4440'
                        });
                        libraryResult.geneName = 'L4440';
                    }
                    else if (libraryResult.geneName === 'empty') {
                        taxTerms.push({
                            taxonomy: 'wb_gene_sequence_id',
                            taxTerm: 'empty'
                        });
                        libraryResult.geneName = 'empty';
                    }
                    if (wormTaxTerms.taxTerms.length === 0) {
                        taxTerms.push({
                            taxonomy: 'wb_gene_sequence_id',
                            taxTerm: libraryResult.geneName,
                        });
                    }
                    //This is the skeleton for the stock creator
                    //But it does not actually get created until
                    //The assay is created
                    var createStock = new models_1.RnaiLibraryStockResultSet({
                        plateId: plateId,
                        libraryId: workflowData.libraryId,
                        rnaiId: libraryResult.rnaiId,
                        well: well,
                        //These should be in the workflowData
                        location: '',
                        datePrepared: workflowData.stockPrepDate,
                        preparedBy: '',
                    });
                    return new wellData_1.WellCollection({
                        well: well,
                        stockLibraryData: createStock,
                        parentLibraryData: libraryResult,
                        annotationData: {
                            geneName: libraryResult.geneName,
                            taxTerm: libraryResult.geneName,
                            taxTerms: taxTerms,
                            dbXRefs: wormTaxTerms.xrefs
                        }
                    });
                });
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
//# sourceMappingURL=RnaiLibrary.js.map