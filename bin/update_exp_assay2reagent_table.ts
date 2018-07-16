#!/usr/bin/env node

const app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
import Promise = require('bluebird');
import {
  ExpAssay2reagentResultSet,
  ExpAssayResultSet,
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpScreenResultSet, ModelPredictedCountsResultSet, RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../common/types/sdk/models";
import {range, isEqual, shuffle} from 'lodash';

const path = require('path');
const fs = require('fs');

/**
 * Decided to add the expGroupId/assayExpGroup to the expAssay2reagent table
 * This script just pulls the assayExpGroup from the expAssay table,
 * and updates the corresponding expAssay2reagent table with the correct expGroupId
 */
countExpAssays()
  .then((paginationResults) => {
    return getPagedExpAssays(paginationResults)
  })
  .then(() => {
    console.log('finished!');
    process.exit(0)
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

function getPagedExpAssays(paginationResults) {
  return new Promise((resolve, reject) => {
    Promise.map(paginationResults.pages, (page) => {
      let skip = Number(page) * Number(paginationResults.limit);
      console.log(`Page: ${page} Skip: ${skip}`);
      return app.models.ExpAssay
        .find({
          limit: paginationResults.limit,
          skip: skip,
        })
        .then((results: ExpAssayResultSet[]) => {
          console.log(`Results Len : ${results.length}`);
          // console.log(JSON.stringify(results));
          return getExpAssay2reagent(results);
        })
        .catch((error) => {
          return new Error(error);
        })
    }, {concurrency: 1})
      .then(() => {
        // console.log(JSON.stringify(paginationResults.count));
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function getExpAssay2reagent(expAssays: ExpAssayResultSet[]) {
  console.log('In getExpAssay2reagent');
  return new Promise((resolve, reject) => {
    Promise.map(expAssays, (expAssay: ExpAssayResultSet) => {
      // console.log(JSON.stringify(expAssay));
      return app.models.ExpAssay2reagent
        .find({
          where: {
            assayId: expAssay.assayId
          }
        })
        .then((expAssay2reagentRows: ExpAssay2reagentResultSet[]) => {
          return updateExpAssay2reagent(expAssay, expAssay2reagentRows);
        })
        .catch((error) => {
          console.log(error);
          return new Error(error);
        });
    }, {concurrency: 1})
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function updateExpAssay2reagent(expAssay: ExpAssayResultSet, expAssay2reagents: ExpAssay2reagentResultSet[]) {
  return new Promise((resolve, reject) => {
    Promise.map(expAssay2reagents, (expAssay2reagent: ExpAssay2reagentResultSet) => {
      expAssay2reagent.assayExpGroup = expAssay.assayExpGroup;
      return app.models.ExpAssay2reagent.upsert(expAssay2reagent)
        .then((results) => {
          console.log(JSON.stringify(expAssay));
          console.log(JSON.stringify(results));
          return;
        })
        .catch((error) => {
          console.log(error);
          reject(new Error(error));
        });
    }, {concurrency: 1})
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function countExpAssays() {
  return new Promise((resolve, reject) => {
    app.models.ExpAssay
      .count({})
      .then((count) => {
        let limit = 100;
        let numPages = Math.round(count / limit);
        let pages = range(0, numPages + 2);
        pages = shuffle(pages);
        console.log(`count is ${count}`);
        // pagination(1, count, 50);
        // console.log(`Pages: ${Math.round(count / 50)}`);
        // console.log(JSON.stringify(pages));
        resolve({count: count, pages: pages, limit: limit});
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      })
  })
}

