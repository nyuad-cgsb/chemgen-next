import app  = require('../../../../../server/server.js');

import {ChemicalLibraryResultSet} from "../../../../types/sdk/models";
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');

const ChemicalLibrary = app.models.ChemicalLibrary as (typeof WorkflowModel);

//TODO Change this get plateplan
ChemicalLibrary.extract.primary.getParentLibrary = function(workflowData, barcode) {
  return new Promise(function(resolve, reject) {
    ChemicalLibrary.extract.primary.getLibraryInfo(workflowData, barcode)
      .then(function(results) {
        resolve(results);
      })
      .catch(function(error) {
        reject(new Error(error));
      });
  });
};


/**
 * Get the vendor/parent library data for a particular screen
 * In the secondary screen genes are cherry picked, and can come from any location
 * In the chemical screens there is a 1-1 map between stock plates and library plates
 * In the RNAi they are rearrayed and get weird
 * @param workflowData
 * @param {string} barcode
 */
ChemicalLibrary.extract.primary.getLibraryInfo = function(workflowData : any , barcode : string) {
  const where =  {
    plate: workflowData.search.chemicalLibrary.plate,
    libraryId: workflowData.libraryId,
  };

  return new Promise(function(resolve, reject) {
    ChemicalLibrary.find({
      where: where,
    })
      .then(function(results : ChemicalLibraryResultSet[]) {
        resolve(results);
      })
      .catch(function(error) {
        reject(new Error(error));
      });
  });
};
