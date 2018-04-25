#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require('commander');
var app = require('../server/server');
var Promise = require('bluebird');
var jsonfile = require('jsonfile');
var path = require('path');
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
program
    .version('0.1.0')
    .option('-w, --workflow [value]', 'Workflow file is JSON format. File should be a single workflow or an array of workflows')
    .parse(process.argv);
var workflow = path.resolve(process.cwd(), program.workflow);
console.log('Beginning workflow upload...');
console.log("Found workflow " + workflow);
var workflowData = jsonfile.readFileSync(workflow);
ExpScreenUploadWorkflow.load.workflows.doWork(workflowData)
    .then(function () {
    app.winston.info('Workflow complete');
    process.exit(0);
})
    .catch(function (error) {
    app.winston.error('Workflow did not complete successfully!');
    app.winston.error(error);
    process.exit(1);
});
