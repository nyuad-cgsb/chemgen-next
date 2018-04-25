#!/usr/bin/env node


const program = require('commander');
const app = require('../server/server');
const Promise = require('bluebird');
const jsonfile = require('jsonfile');
import {WorkflowModel} from "../common/models";
const path = require('path');

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);


program
  .version('0.1.0')
  .option('-w, --workflow [value]', 'Workflow file is JSON format. File should be a single workflow or an array of workflows')
  .parse(process.argv);

let workflow = path.resolve(process.cwd(), program.workflow);
console.log('Beginning workflow upload...');
console.log(`Found workflow ${workflow}`);

let workflowData = jsonfile.readFileSync(workflow);

ExpScreenUploadWorkflow.load.workflows.doWork(workflowData)
  .then(() =>{
    app.winston.info('Workflow complete');
    process.exit(0);
  })
  .catch((error) =>{
    app.winston.error('Workflow did not complete successfully!');
    app.winston.error(error);
    process.exit(1);
  });
