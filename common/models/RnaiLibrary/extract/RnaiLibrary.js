"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var wellData_1 = require("../../../types/wellData");
var Promise = require("bluebird");
var RnaiLibrary = app.models['RnaiLibrary'];
//TODO This should have specific logic per instrument
//TODO This also has different logic per library
//RNAi only has 1 (so far), but chemical has at least 2
//Here we can map A01 -> A01
//But in NY its TileThing -> Well
RnaiLibrary.extract.parseLibraryResults = function (workflowData, expPlate, libraryResults) {
    app.winston.info('extract parseLibraryResults');
    return new Promise(function (resolve, reject) {
        var allWells = workflowData.wells;
        var barcode = expPlate.barcode;
        var plateId = expPlate.plateId;
        //TODO This will go into workflowData
        // let condition = RnaiLibrary.helpers
        //   .parseCond(expPlate.barcode);
        // let taxID = 'geneName';
        // let strain = RnaiLibrary.helpers.wormStrain(barcode);
        Promise.map(allWells, function (well) {
            var libraryResult = RnaiLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
            return app.models.RnaiWormbaseXrefs.extract.genTaxTerms({
                where: {
                    wbGeneSequenceId: libraryResult.geneName,
                },
            })
                .then(function (wormTaxTerms) {
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
                var createStock = {
                    plateId: plateId,
                    libraryId: workflowData.libraryId,
                    rnaiId: libraryResult.rnaiId,
                    well: well,
                    //These should be in the workflowData
                    location: '',
                    datePrepared: workflowData.stockPrepDate,
                    preparedBy: '',
                };
                var wellData = new wellData_1.RnaiWellCollection({
                    stockLibraryData: createStock,
                    parentLibraryData: libraryResult,
                    annotationData: { geneName: libraryResult.geneName, taxTerm: libraryResult.geneName, taxTerms: taxTerms }
                });
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
