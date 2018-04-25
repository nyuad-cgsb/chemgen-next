import app  = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import * as _ from "lodash";
import {ExpDesignResultSet, ExpGroupResultSet} from "../../../types/sdk/models";

const ExpDesign = app.models.ExpDesign as (typeof WorkflowModel);

/**
 * An Experiment Set is the treatment + conditions
 * 3 rows - treat_rnai/ctrl_rnai, ctrl_rnai/ctrl_strain, treat_rnai/ctrl_null
 * Given a single expGroupId, get the set
 * If this is a part of the initial load workflow, these will probably be passed in as a parameter
 * Otherwise fetch them from the DB
 * TODO Add in some more error handling
 * TODO Add in more entrypoints to this method - ExpPlateId, ExpAssayId, reagentID
 * @param {number} expGroupId
 * @param {ExpDesignResultSet} expDesignRows
 */
ExpDesign.extract.workflows.getExpSetByExpGroupId = function (expGroupId: number, expDesignRows?: ExpDesignResultSet) {
  return new Promise((resolve, reject) => {
    if (_.isEmpty(expDesignRows)) {
      ExpDesign.extract.workflows.getExpSetByExpGroupIdDB(expGroupId)
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
          reject(new Error(error));
        })
    } else {
      ExpDesign.extract.workflows.getExpSetByExpGroupIdMem(expGroupId, expDesignRows)
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
          reject(new Error(error));
        })
    }
  });
};

ExpDesign.extract.workflows.getExpSetByExpGroupIdMem = function (expGroupId: number, expDesignRows: ExpDesignResultSet[]) {
  return new Promise((resolve) => {
    let rows = _.filter(expDesignRows, (expDesignRow) => {
      return _.isEqual(expDesignRow.treatmentGroupId, expGroupId) || _.isEqual(expDesignRow.controlGroupId, expGroupId);
    });

    if (_.isEmpty(rows) || _.isNull(rows)) {
      resolve(null);
    }
    else {
      let treatmentId = rows[0].treatmentGroupId;
      let expSet = _.filter(expDesignRows, (expDesignRow) => {
        return _.isEqual(expDesignRow.treatmentGroupId, treatmentId);
      });
      resolve(expSet);
    }
  });
};

ExpDesign.extract.workflows.getExpSetByExpGroupIdDB = function (expGroupId: number) {
  return new Promise((resolve, reject) => {
    ExpDesign
      .find({
        where:
          {or: [{treatmentGroupId: expGroupId}, {controlGroupId: expGroupId}]}
      })
      .then((results: ExpDesignResultSet[]) => {
        return ExpDesign.extract.getTreatmentIdsDB(expGroupId, results);
      })
      .then((results: ExpDesignResultSet[]) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

ExpDesign.extract.getTreatmentIdsDB = function (expGroupId: number, expDesignRows: ExpDesignResultSet[]) {
  return new Promise((resolve, reject) => {
    if (ExpDesign.extract.isTreatmentId(expGroupId, expDesignRows)) {
      resolve(expDesignRows);
    }
    else {
      ExpDesign.find({where: {treatmentGroupId: expDesignRows[0].treatmentGroupId}})
        .then((results: ExpDesignResultSet) => {
          resolve(results);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    }
  });
};

ExpDesign.extract.isTreatmentId = function (expGroupId: number, expDesignRows: ExpDesignResultSet[]) {
  if (_.isEmpty(expDesignRows)) {
    return null;
  } else {
    return !_.isEmpty(_.find(expDesignRows, (expDesignRow: ExpDesignResultSet) => {
      return _.isEqual(expDesignRow.treatmentGroupId, expGroupId)
    }));
  }
};

/**
 * Given an array of ExpDesignResultSets, get the ExpGroups
 * TODO Add condition to get this from PlateCollection
 * @param {ExpDesignResultSet[]} expDesignRows
 */
ExpDesign.extract.workflows.getExpGroup = function (expDesignRows: ExpDesignResultSet[]) {
  return new Promise((resolve, reject) => {

    let orCondition = [];
    _.map(expDesignRows, (expDesignRow) => {
      orCondition.push({expGroupId: expDesignRow.treatmentGroupId}, {expGroupId: expDesignRow.controlGroupId});
    });

    app.models.ExpGroup
      .find({where: {or: orCondition}})
      .then((results: ExpGroupResultSet[]) =>{
        results = _.uniqBy(results, 'expGroupId');
        resolve({expDesignList: expDesignRows, expGroupList: results});
      })
      .catch((error) =>{
        reject(new Error(error));
      })
  });
};
