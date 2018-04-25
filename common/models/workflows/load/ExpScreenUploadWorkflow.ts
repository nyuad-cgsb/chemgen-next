import app  = require('../../../../server/server.js');
import Promise = require('bluebird');
import {ExpPlateResultSet, ExpScreenUploadWorkflowResultSet, PlateResultSet} from "../../../../../../types/sdk/models";
import {WorkflowModel} from "../../../../../index";
import {PlateCollection, RnaiWellCollection, ScreenCollection} from "../../../../../../types/wellData";

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);

ExpScreenUploadWorkflow.load.workflows.worms.primary = {};

ExpScreenUploadWorkflow.load.workflows.doWork = function (workflowData: ExpScreenUploadWorkflowResultSet | ExpScreenUploadWorkflowResultSet[]) {
  return new Promise((resolve, reject) => {
    if (workflowData instanceof Array) {
      Promise.map(workflowData, (data: ExpScreenUploadWorkflowResultSet) => {
        let biosampleType = `${data.biosampleType}s`;
        return ExpScreenUploadWorkflow.load.workflows[biosampleType][data.screenStage].processWorkflow(data);
      })
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
          reject(new Error(error));
        });
    }
  });
};

