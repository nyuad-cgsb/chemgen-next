#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var path = require('path');
var fs = require('fs');
/**
 * Decided to add the expGroupId/assayExpGroup to the expAssay2reagent table
 * This script just pulls the assayExpGroup from the expAssay table,
 * and updates the corresponding expAssay2reagent table with the correct expGroupId
 */
countExpAssays()
    .then(function (paginationResults) {
    return getPagedExpAssays(paginationResults);
})
    .then(function () {
    console.log('finished!');
    process.exit(0);
})
    .catch(function (error) {
    console.log(error);
    process.exit(1);
});
function getPagedExpAssays(paginationResults) {
    return new Promise(function (resolve, reject) {
        Promise.map(paginationResults.pages, function (page) {
            var skip = Number(page) * Number(paginationResults.limit);
            console.log("Page: " + page + " Skip: " + skip);
            return app.models.ExpAssay
                .find({
                limit: paginationResults.limit,
                skip: skip,
            })
                .then(function (results) {
                console.log("Results Len : " + results.length);
                // console.log(JSON.stringify(results));
                return getExpAssay2reagent(results);
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function () {
            // console.log(JSON.stringify(paginationResults.count));
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function getExpAssay2reagent(expAssays) {
    console.log('In getExpAssay2reagent');
    return new Promise(function (resolve, reject) {
        Promise.map(expAssays, function (expAssay) {
            // console.log(JSON.stringify(expAssay));
            return app.models.ExpAssay2reagent
                .find({
                where: {
                    assayId: expAssay.assayId
                }
            })
                .then(function (expAssay2reagentRows) {
                return updateExpAssay2reagent(expAssay, expAssay2reagentRows);
            })
                .catch(function (error) {
                console.log(error);
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function updateExpAssay2reagent(expAssay, expAssay2reagents) {
    return new Promise(function (resolve, reject) {
        Promise.map(expAssay2reagents, function (expAssay2reagent) {
            expAssay2reagent.assayExpGroup = expAssay.assayExpGroup;
            return app.models.ExpAssay2reagent.upsert(expAssay2reagent)
                .then(function (results) {
                console.log(JSON.stringify(expAssay));
                console.log(JSON.stringify(results));
                return;
            })
                .catch(function (error) {
                console.log(error);
                reject(new Error(error));
            });
        }, { concurrency: 1 })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function countExpAssays() {
    return new Promise(function (resolve, reject) {
        app.models.ExpAssay
            .count({})
            .then(function (count) {
            var limit = 100;
            var numPages = Math.round(count / limit);
            var pages = lodash_1.range(0, numPages + 2);
            pages = lodash_1.shuffle(pages);
            console.log("count is " + count);
            // pagination(1, count, 50);
            // console.log(`Pages: ${Math.round(count / 50)}`);
            // console.log(JSON.stringify(pages));
            resolve({ count: count, pages: pages, limit: limit });
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
//# sourceMappingURL=update_exp_assay2reagent_table.js.map