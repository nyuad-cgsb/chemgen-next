import app  = require('../../../../server/server.js');

import {ExpPlateResultSet} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');

import {PlateCollection, RnaiWellCollection} from "../../../types/wellData";

const RnaiLibrary = app.models['RnaiLibrary'] as (typeof WorkflowModel);

//TODO This should be moved ot the stock - I am not actually creating anything in the rnai_library table
// Or Put this in 'extract'

RnaiLibrary.load.workflows.processExpPlates = function (workflowData: any, expPlates: ExpPlateResultSet[]) {
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

RnaiLibrary.load.workflows.processExpPlate = function (workflowData: any, expPlate: ExpPlateResultSet) {
  return new Promise(function (resolve, reject) {
    RnaiLibrary['extract'][workflowData.screenStage].getParentLibrary(workflowData, expPlate.barcode)
      .then(function (libraryResults) {
        return RnaiLibrary.extract.parseLibraryResults(workflowData, expPlate, libraryResults);
      })
      .then(function (libraryDataList) {
        let plateData: PlateCollection = new PlateCollection({expPlate: expPlate, wellDataList: libraryDataList});
        resolve(plateData);
      })
      .catch(function (error) {
        // app.winston.warn(error.stack);
        reject(new Error(error));
      });
  });
};

//TODO Thsi should be primary
RnaiLibrary.load.createWorkflowSearchObj = function (workflowData: any) {
  return RnaiLibrary.load[workflowData.screenStage].createWorkflowSearchObj(workflowData);
};

RnaiLibrary.load.primary.createWorkflowSearchObj = function (workflowData: any) {
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
      {
        'replicates.1.0': workflowData.replicates[1][0],
      }
    ]
  };
};

RnaiLibrary.load.secondary.createWorkflowSearchObj = function (workflowData: any) {
  // I was also searching by the platePlan Id
  // But for some reason that is not recognized properly
  // It is encoded as a string here and in mongodb
  // TODO Check into changing into an embedded relationship
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

RnaiLibrary.load.primary.genTaxTerms = function (workflowData) {
  return [
    {taxonomy: 'rnai_plate', taxTerm: workflowData.search.rnaiLibrary.plate},
    {taxonomy: 'rnai_chrom', taxTerm: workflowData.search.rnaiLibrary.chrom},
    {taxonomy: 'rnai_quadrant', taxTerm: workflowData.search.rnaiLibrary.quadrant},
  ]
};

RnaiLibrary.load.secondary.genTaxTerms = function (workflowData) {
  return []
};

