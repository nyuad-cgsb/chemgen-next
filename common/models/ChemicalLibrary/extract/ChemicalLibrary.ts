import app  = require('../../../../server/server.js');
import {WellCollection} from "../../../types/wellData";
import {
  ExpPlateResultSet, ChemicalLibraryResultSet, ChemicalLibraryStockResultSet,
  ChemicalXrefsResultSet
} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import {isEqual, get} from 'lodash';
import decamelize = require('decamelize');

const ChemicalLibrary = app.models['ChemicalLibrary'] as (typeof WorkflowModel);

ChemicalLibrary.extract.parseLibraryResults = function (workflowData, expPlate: ExpPlateResultSet, libraryResults: ChemicalLibraryResultSet[]) {
  return new Promise((resolve, reject) => {
    let allWells = workflowData.wells;
    let barcode = expPlate.barcode;
    let plateId = expPlate.plateId;

    //TODO Move this to extract library
    //And then add it to the platePlan
    let platedbXrefSearch = [];
    allWells.map((well) => {
      let libraryResult: ChemicalLibraryResultSet = ChemicalLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
      if (get(libraryResult, 'compoundLibraryId')) {
        let where = {
          libraryId: workflowData.libraryId,
          chemicalLibraryId: libraryResult.compoundLibraryId,
        };
        platedbXrefSearch.push(where);
      }
    });

    let taxTermRefs = ['compoundSystematicName', 'compoundMw', 'compoundFormula'];
    app.models.ChemicalXrefs.find({where: {or: platedbXrefSearch}})
      .then((dbXrefs) => {
        return Promise.map(allWells, function (well) {
          //TODO Add Helpers
          let libraryResult: ChemicalLibraryResultSet = ChemicalLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
          let where = {
            libraryId: workflowData.libraryId,
            chemicalLibraryId: libraryResult.compoundLibraryId,
          };
          //TODO Change this to OR so there aren't 80 million calls to the DB
          return app.models.ChemicalXrefs.extract.genTaxTerms(dbXrefs, where)
            .then(function (chemicalTaxTerms: ChemicalXrefsResultSet) {
              let taxTerms = [];

              // For secondary plates we need to add an additional taxTerm for control wells
              chemicalTaxTerms.taxTerms.forEach(function (chemicalTaxTerm) {
                taxTerms.push(chemicalTaxTerm);
              });

              if (isEqual(workflowData.screenStage, 'primary')) {
                if (well.match('01') || well.match('12')) {
                  taxTerms.push({
                    taxonomy: 'compound_systematic_name',
                    taxTerm: 'DMS0'
                  });
                  libraryResult.compoundSystematicName = 'DMSO';
                }
              }

              //Also get the formula, weight, and name from the libraryResult
              taxTermRefs.map((taxTermRef) => {
                if (get(libraryResult, taxTermRef)) {
                  taxTerms.push({
                    taxonomy: decamelize(taxTermRef),
                    taxTerm: libraryResult[taxTermRef]
                  });
                }
              });

              // app.winston.info(libraryResult);
              // app.winston.info('Creating the stock...');
              let createStock: ChemicalLibraryStockResultSet = new ChemicalLibraryStockResultSet({
                plateId: plateId,
                libraryId: workflowData.libraryId,
                compoundId: libraryResult.compoundId,
                well: well,
                location: '',
                datePrepared: workflowData.stockPrepDate,
                preparedBy: '',
              });

              return new WellCollection({
                well: well,
                stockLibraryData: createStock,
                parentLibraryData: libraryResult,
                annotationData: {
                  chemicalName: libraryResult.compoundSystematicName,
                  taxTerm: String(libraryResult.compoundId),
                  taxTerms: taxTerms,
                  dbXRefs: chemicalTaxTerms.xrefs,
                }
              });
            });
        })
      })
      .then(function (results) {
        // app.winston.info('returning results...');
        resolve(results);
      })
      .catch(function (error) {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};
