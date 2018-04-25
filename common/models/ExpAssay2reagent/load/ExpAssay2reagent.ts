import app  = require('../../../../server/server.js');
import {ExpPlateResultSet} from "../../";
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');

import {PlateCollection, RnaiWellCollection} from "../../../types/wellData";
import {ExpAssay2reagentResultSet} from "../../../types/sdk/models";

const ExpAssay2reagent = app.models['ExpAssay2reagent'] as (typeof WorkflowModel);

ExpAssay2reagent.load.createAssayStock = function (workflowData: any, expPlateData: PlateCollection) {
  return new Promise(function (resolve, reject) {
    Promise.map(expPlateData.wellDataList, function (wellData) {
      wellData.stockLibraryData.assayId = wellData.expAssay.assayId;
      let createObj : ExpAssay2reagentResultSet= {
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

