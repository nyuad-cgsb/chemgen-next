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

    let taxTermRefs = ['compoundSystematicName', 'compoundMw', 'compoundFormula'];
    Promise.map(allWells, function (well) {
      //TODO Add Helpers
      let libraryResult: ChemicalLibraryResultSet = ChemicalLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
      let where = {
        libraryId: workflowData.libraryId,
        chemicalLibraryId: libraryResult.compoundLibraryId,
      };
      // TODO add ChemicalXrefs extract
      return app.models.ChemicalXrefs.extract.genTaxTerms(where)
        .then(function (chemicalTaxTerms: ChemicalXrefsResultSet) {
          let taxTerms = [];

          // For secondary plates we need to add an additional taxTerm for control wells
          chemicalTaxTerms.taxTerms.forEach(function (chemicalTaxTerm) {
            taxTerms.push(chemicalTaxTerm);
          });

          if(isEqual(workflowData.screenStage, 'primary')){
            if(well.match('01') || well.match('12')){
              taxTerms.push({
                taxonomy: 'compound_systematic_name',
                taxTerm: 'DMS0'
              });
              libraryResult.compoundSystematicName = 'DMSO';
            }
          }

          //Also get the formula, weight, and name from the libraryResult
          taxTermRefs.map((taxTermRef) =>{
            if(get(libraryResult, taxTermRef)){
              taxTerms.push({
                taxonomy: decamelize(taxTermRef),
                taxTerm: libraryResult[taxTermRef]
              });

            }
          });

          //TODO If the screen is primary all 01 and 12 wells are DMSO
          let createStock: ChemicalLibraryStockResultSet = new ChemicalLibraryStockResultSet({
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

          return new WellCollection({
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
