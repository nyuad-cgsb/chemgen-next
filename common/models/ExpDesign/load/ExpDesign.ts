import app  = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {ExpDesignResultSet, ExpGroupResultSet, ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import {PlateCollection, RnaiWellCollection} from "../../../types/wellData";

import Promise = require('bluebird');
import * as _ from "lodash";

const ExpDesign = app.models.ExpDesign as (typeof WorkflowModel);

ExpDesign.load.workflows.createExpDesigns = function (workflowData: ExpScreenUploadWorkflowResultSet, expDesignRows: ExpDesignResultSet[]) {
  expDesignRows = _.uniqWith(expDesignRows, _.isEqual);
  return new Promise((resolve, reject) => {
    Promise.map(expDesignRows, (expDesignRow) => {
      return ExpDesign
        .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(expDesignRow)}, expDesignRow)
    })
      .then((results: ExpDesignResultSet[]) => {
        let expDesignRows = results.map((result) => {
          return result[0];
        });
        resolve(expDesignRows);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};
