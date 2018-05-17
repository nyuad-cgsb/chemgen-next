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
var workflowData;
try {
    workflowData = jsonfile.readFileSync(workflow);
}
catch (error) {
    console.log("Could not read file " + workflow);
    process.exit(1);
}
app.agenda.on('ready', function () {
    try {
        app.agenda.now('ExpScreenUploadWorkflow.doWork', { workflowData: workflowData });
    }
    catch (error) {
        console.log("Received error: " + error);
        process.exit(1);
    }
    process.exit(0);
    //
    // ExpScreenUploadWorkflow.load.workflows.worms.doWork(workflowData)
    //   .then(() => {
    //     process.exit(0);
    //   })
    //   .catch((error) => {
    //     process.exit(1);
    //   });
});
//# sourceMappingURL=upload_screens.js.map