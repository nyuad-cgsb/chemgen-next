"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpDesign = app.models.ExpDesign;
ExpDesign.load.workflows.createExpDesigns = function (workflowData, expDesignRows) {
    expDesignRows = lodash_1.uniqWith(expDesignRows, lodash_1.isEqual);
    return new Promise(function (resolve, reject) {
        Promise.map(lodash_1.shuffle(expDesignRows), function (expDesignRow) {
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