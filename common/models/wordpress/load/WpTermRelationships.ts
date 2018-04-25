import app  = require('../../../../server/server.js');

import {WorkflowModel} from "../../index";
import {WpTermTaxonomyResultSet} from "../../../types/sdk/models";
import Promise = require('bluebird');

const WpTermRelationships = app.models['WpTermRelationships'] as (typeof WorkflowModel);

/**
 * Given a postId and a list of WpTermTaxonomyResultSets, relate each post back its taxonomies
 * @param postId
 * @param {WpTermTaxonomyResult} taxTermObj
 */
WpTermRelationships.load.createRelationships = function (postId, taxTermObjList: WpTermTaxonomyResultSet[]) {
  return new Promise((resolve, reject) => {
    Promise.map(taxTermObjList, (taxTermObj) => {
      let createObj = {
        termTaxonomyId: taxTermObj.termTaxonomyId,
        termOrder: 0,
        objectId: postId,
      };
      return WpTermRelationships
        .findOrCreate({
          where: app.etlWorkflow.helpers.findOrCreateObj(createObj)
        }, createObj);
    })
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

