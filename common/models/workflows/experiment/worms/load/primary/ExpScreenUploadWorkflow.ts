import app = require('../../../../../../../server/server.js');
import Promise = require('bluebird');
import {ExpPlateResultSet, ExpScreenUploadWorkflowResultSet, PlateResultSet} from "../../../../../../types/sdk/models";
import {WorkflowModel} from "../../../../../index";
import {PlateCollection, RnaiWellCollection, ScreenCollection} from "../../../../../../types/wellData";

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);

ExpScreenUploadWorkflow.load.workflows.worms.primary = {};

/**
 * This workflow goes from the upload screenData to building the interfaces
 * TODO Name this something more informative
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 */
ExpScreenUploadWorkflow.load.workflows.worms.primary.doWork = function (workflowData: ExpScreenUploadWorkflowResultSet | ExpScreenUploadWorkflowResultSet[]) {
  return new Promise((resolve, reject) => {
    if (workflowData instanceof Array) {
      Promise.map(workflowData, (data: ExpScreenUploadWorkflowResultSet) => {
        return ExpScreenUploadWorkflow.load.workflows.worms.primary.processWorkflow(data);
      }, {concurrency: 1})
        .then(() => {
          resolve();
        })
        .catch((error) => {
          app.winston.error(error.stack);
          reject(new Error(error));
        });
    }
    else {
      ExpScreenUploadWorkflow.load.workflows.worms.primary.processWorkflow(workflowData)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          app.winston.error(error.stack);
          reject(new Error(error));
        });
    }
  });
};

ExpScreenUploadWorkflow.load.getInstrumentPlates = function (workflowData: PlateResultSet) {
  let instrumentPlates: PlateResultSet[] = [];
  Object.keys(workflowData.experimentGroups).map((expGroup) => {
    workflowData.experimentGroups[expGroup].plates.map((plate: PlateResultSet) => {
      instrumentPlates.push(plate);
    });
  });
  return instrumentPlates;
};

ExpScreenUploadWorkflow.load.workflows.worms.primary.processWorkflow = function (workflowData: ExpScreenUploadWorkflowResultSet) {
  app.winston.info('Processing workflow');
  return new Promise((resolve, reject) => {
    let instrumentPlates = ExpScreenUploadWorkflow.load.getInstrumentPlates(workflowData);
    ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData(workflowData, instrumentPlates)
      .then((screenData: ScreenCollection) => {
        return ExpScreenUploadWorkflow.load.workflows.worms.createExpInterfaces(workflowData, screenData)
      })
      .then((screenData: ScreenCollection) => {
        app.winston.info('RETURNING Scores');
        return app.models.ModelPredictedPheno.load.workflows.parseScreen(workflowData, screenData)
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        app.winston.error(error.stack);
        reject(new Error(error));
      });
  });
};

/**
 * ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData
 * @param workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData = function (workflowData: any, instrumentPlates: PlateResultSet[]) {
  app.winston.info('Populating Experiment Data');
  return new Promise((resolve, reject) => {
    let search = app.models[workflowData.libraryModel].load.createWorkflowSearchObj(workflowData);
    ExpScreenUploadWorkflow
      .findOrCreate({
        where: search,
      }, workflowData)
      .then((results) => {
        //TODO Update the results with the current workflow
        app.winston.info('Populating Experiment Plate');
        results = JSON.parse(JSON.stringify(results));
        return ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(results[0], instrumentPlates);
      })
      .then((results: PlateCollection[]) => {
        app.winston.info('Populating Experiment Design');
        return ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExpDesignData(workflowData, results);
      })
      .then((results: ScreenCollection) => {
        resolve(results);
      })
      .catch((error) => {
        app.winston.error(error.stack);
        reject(new Error(error));
      });
  })
};

/**
 * This workflow populates:
 * 1. ExpPlate
 * 2. Gets the plate plan -> mapping of library to exp plate wells
 * 3. Creates the stock
 * 4. Creates the experiment groups - set of experiment condition (treat_rnai,ctrl_null,ctrL_strain,ctrl_rnai)
 * 5. Creates the ExpAssays (expGroupId is inline)
 * 6. Fires off a request to the service that converts images to non proprietary and web format
 * For all plates in an ExperimentSet
 * For the primary Screen this is a single plate from a library plus its controls
 * Barcodes Replicate 1: RNAiI.3A1E_M, RNAiI.3AE, L4440E_M, L4440E
 * Barcodes Replicate 2: RNAiI.3A1E_D_M, RNAiI.3AE_D, L4440E_D_M, L4440E_D
 * A single workflow (workflowData) maps to a SINGLE Experiment Set
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData = function (workflowData: ExpScreenUploadWorkflowResultSet, instrumentPlates: PlateResultSet[]) {
  return new Promise((resolve, reject) => {
    app.models.ExpPlate.load.workflows.processInstrumentPlates(workflowData, instrumentPlates)
      .then((expPlatesList: ExpPlateResultSet[]) => {
        app.winston.info('Processing Exp Assays');
        return app.models.ExpAssay.load.workflows.processExpPlates(workflowData, expPlatesList);
      })
      .then((results) => {
        app.winston.info('Completed ExpAssays');
        resolve(results);
      })
      .catch((error) => {
        app.winston.error(error.stack);
        reject(new Error(error));
      });
  });
};

/**
 * ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExpDesignData
 * This workflow creates the linking between the different wells to conditions, and conditions to other conditions
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ScreenCollection} screenData
 */
ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExpDesignData = function (workflowData: ExpScreenUploadWorkflowResultSet, plateDataList: PlateCollection[]) {
  return new Promise((resolve, reject) => {
    let expDesignRows = app.models.ExpDesign.transform.workflows.screenDataToExpSets(workflowData, plateDataList);
    app.models.ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows)
      .then((results) => {
        let screenData = new ScreenCollection({plateDataList: plateDataList, expDesignList: results});
        resolve(screenData);
      })
      .catch((error) => {
        app.winston.error(error.stack);
        reject(new Error(error));
      });
  });
};

/**
 *
 * Once the ExperimentData has been populated its time to make some interfaces
 * This is the part of the workflow that creates teh interfaces
 * It wires up to the wordpressDB to create actual interfaces
 * This is done after all the experiment plates in the set are finished
 * @param workflowData
 * @param {ScreenCollection} screenData
 */
ExpScreenUploadWorkflow.load.workflows.worms.createExpInterfaces = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection) {
  app.winston.info('Creating Experiment Interfaces');
  return new Promise((resolve, reject) => {
    Promise.map(screenData.plateDataList, (plateData: PlateCollection) => {
      app.winston.info('Creating Exp Plate Interfaces');
      return app.models.ExpPlate.load.workflows.createExpPlateInterface(workflowData, screenData, plateData)
        .then(() => {
          //TODO Make sure to have plateUrl
          app.winston.info('Creating Exp Assay Interfaces');
          return app.models.ExpAssay.load.workflows.createExpAssayInterfaces(workflowData, screenData, plateData);
        })
        .catch((error) => {
          app.winston.error(error.stack);
          // reject(new Error(error));
          return (new Error(error));
        });
    }, {concurrency: 1})
      .then(() => {
        // I don't actually do anything with the results from the interfaces
        // They are just there to look pretty
        resolve(screenData);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};
