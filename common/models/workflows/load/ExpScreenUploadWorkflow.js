"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
ExpScreenUploadWorkflow.load.workflows.worms.primary = {};
ExpScreenUploadWorkflow.load.workflows.doWork = function (workflowData) {
    return new Promise(function (resolve, reject) {
        if (workflowData instanceof Array) {
            Promise.map(workflowData, function (data) {
                var biosampleType = data.biosampleType + "s";
                return ExpScreenUploadWorkflow.load.workflows[biosampleType][data.screenStage].processWorkflow(data);
            })
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                app.winston.error(error.stack);
                reject(new Error(error));
            });
        }
        else {
            ExpScreenUploadWorkflow.load.workflows.worms.primary.processWorkflow(workflowData)
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
};
