"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var _ = require("lodash");
var ExpDesign = app.models.ExpDesign;
ExpDesign.load.workflows.createExpDesigns = function (workflowData, expDesignRows) {
    expDesignRows = _.uniqWith(expDesignRows, _.isEqual);
    return new Promise(function (resolve, reject) {
        Promise.map(expDesignRows, function (expDesignRow) {
            return ExpDesign
                .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(expDesignRow) }, expDesignRow)
                .then(function (results) {
                return results[0];
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
