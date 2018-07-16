import app  = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {ExpDesignResultSet, ExpGroupResultSet, ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import {PlateCollection, WellCollection} from "../../../types/wellData";

import Promise = require('bluebird');
import * as _ from "lodash";

const ExpDesign = app.models.ExpDesign as (typeof WorkflowModel);

/**
 * Here lie a few transformations to go from
 * List of Plates
 *  Each plate has an associated list of wells
 *    Each well has several associated pieces of experimental data - such as the experimental group (treat_rnai, ctrl_rnai, ctrl_null, ctrl_strain)
 *      If applicable (treat_rnai, ctrl_rnai) also the reagentId, which is the main grouping platform
 *  The end of this workflow gives an array of objects, {treatment_group_id: int, control_group_id: int}. A group of treatment_group_ids is an ExpSet
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection[]} plateDataList
 * @returns {any}
 */
ExpDesign.transform.workflows.screenDataToExpSets = function (workflowData: ExpScreenUploadWorkflowResultSet, plateDataList: PlateCollection[]) {
  let groups = ExpDesign.transform.groupExpConditions(workflowData, plateDataList);
  let matchedGroups = ExpDesign.transform.createExpSets(workflowData, groups);
  let expDesignRows = ExpDesign.transform.prepareExpDesign(workflowData, groups, matchedGroups);
  return expDesignRows;
};

/**
 * Each Experiment Set is a the grouping of conditions marked by workflowData.expDesign
 * For the RNAi its {treat_rnai: ['ctrL_strain', 'ctrl_null', 'ctrl_rnai']}
 * First get a list of uniq expGroups per condition (treat_rnai, ctrl_strain, ctrl_null, ctrl_rnai)
 * {treat_rnai: [expGroup, expGroup], ctrl_strain: [expGroup, expGroup], ctrl_null: [expGroup, expGroup]}
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection[]} plateDataList
 */
ExpDesign.transform.groupExpConditions = function (workflowData: ExpScreenUploadWorkflowResultSet, plateDataList: PlateCollection[]) {
  let groupsData = {};
  _.map(plateDataList, (plateData: PlateCollection) => {
    return _.map(plateData.wellDataList, (wellData) => {
      if (!_.isEmpty(wellData.expGroup.expGroupType)) {
        if (!_.has(groupsData, wellData.expGroup.expGroupType)) {
          groupsData[wellData.expGroup.expGroupType] = [];
        }
        groupsData[wellData.expGroup.expGroupType].push(wellData.expGroup);
      }
    });
  });

  _.map(Object.keys(groupsData), (expGroupType) => {
    groupsData[expGroupType] = _.uniqWith(groupsData[expGroupType], _.isEqual);
  });
  return groupsData;
};

/**
 * Get the biosampleControlConditions keys, which have the treatments that have 'stuff' (rnai, chemical)
 * The other conditions are L4440/DMSO that have no stuff
 * Return a list of matched experimental conditions where matches have the same reagentID
 * [{expGroup: {}, ctrlGroup: {}]
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param groupsData
 */
ExpDesign.transform.createExpSets = function (workflowData: ExpScreenUploadWorkflowResultSet, groupsData: any) {
  let exp = Object.keys(workflowData.experimentMatchConditions)[0];
  let control = workflowData.experimentMatchConditions[exp];

  if(_.get(groupsData, exp)){
    return groupsData[exp].map((expGroup: ExpGroupResultSet) => {
      let reagentId = expGroup.reagentId;
      let well = expGroup.well;
      let controlGroup: ExpGroupResultSet = _.find(groupsData[control], {reagentId: reagentId, well: well});
      return {expGroup: expGroup, controlGroup: controlGroup};
    });
  }
  else{
    return [];
  }
};

ExpDesign.transform.prepareExpDesign = function (workflowData: ExpScreenUploadWorkflowResultSet, groups: any, matchedExpGroups: any) {

  let expDesignRows: ExpDesignResultSet[] = [];
  _.map(matchedExpGroups, (matchedExpGroup) => {
    expDesignRows.push({
      treatmentGroupId: matchedExpGroup.expGroup.expGroupId,
      controlGroupId: matchedExpGroup.controlGroup.expGroupId
    });
    _.map(workflowData.controlConditions, (condition) => {
      _.map(groups[condition], (group: ExpGroupResultSet) => {
        expDesignRows.push({treatmentGroupId: matchedExpGroup.expGroup.expGroupId, controlGroupId: group.expGroupId});
      });
    });
  });
  expDesignRows = _.uniqWith(expDesignRows, _.isEqual);

  return expDesignRows;
};
