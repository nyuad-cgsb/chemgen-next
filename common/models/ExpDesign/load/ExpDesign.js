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
                .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(expDesignRow) }, expDesignRow);
        })
            .then(function (results) {
            var expDesignRows = results.map(function (result) {
                return result[0];
            });
            resolve(expDesignRows);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpDesign.js.map