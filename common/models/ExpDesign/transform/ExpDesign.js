"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var _ = require("lodash");
var ExpDesign = app.models.ExpDesign;
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
ExpDesign.transform.workflows.screenDataToExpSets = function (workflowData, plateDataList) {
    var groups = ExpDesign.transform.groupExpConditions(workflowData, plateDataList);
    var matchedGroups = ExpDesign.transform.createExpSets(workflowData, groups);
    var expDesignRows = ExpDesign.transform.prepareExpDesign(workflowData, groups, matchedGroups);
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
ExpDesign.transform.groupExpConditions = function (workflowData, plateDataList) {
    var groupsData = {};
    _.map(plateDataList, function (plateData) {
        return _.map(plateData.wellDataList, function (wellData) {
            if (!_.isEmpty(wellData.expGroup.expGroupType)) {
                if (!_.has(groupsData, wellData.expGroup.expGroupType)) {
                    groupsData[wellData.expGroup.expGroupType] = [];
                }
                groupsData[wellData.expGroup.expGroupType].push(wellData.expGroup);
            }
        });
    });
    _.map(Object.keys(groupsData), function (expGroupType) {
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
ExpDesign.transform.createExpSets = function (workflowData, groupsData) {
    var exp = Object.keys(workflowData.experimentMatchConditions)[0];
    var control = workflowData.experimentMatchConditions[exp];
    if (_.get(groupsData, exp)) {
        return groupsData[exp].map(function (expGroup) {
            var reagentId = expGroup.reagentId;
            var well = expGroup.well;
            var controlGroup = _.find(groupsData[control], { reagentId: reagentId, well: well });
            return { expGroup: expGroup, controlGroup: controlGroup };
        });
    }
    else {
        return [];
    }
};
ExpDesign.transform.prepareExpDesign = function (workflowData, groups, matchedExpGroups) {
    var expDesignRows = [];
    _.map(matchedExpGroups, function (matchedExpGroup) {
        expDesignRows.push({
            treatmentGroupId: matchedExpGroup.expGroup.expGroupId,
            controlGroupId: matchedExpGroup.controlGroup.expGroupId
        });
        _.map(workflowData.controlConditions, function (condition) {
            _.map(groups[condition], function (group) {
                expDesignRows.push({ treatmentGroupId: matchedExpGroup.expGroup.expGroupId, controlGroupId: group.expGroupId });
            });
        });
    });
    expDesignRows = _.uniqWith(expDesignRows, _.isEqual);
    return expDesignRows;
};
//# sourceMappingURL=ExpDesign.js.map