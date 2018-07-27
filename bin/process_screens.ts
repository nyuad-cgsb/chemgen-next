#!/usr/bin/env node

const app = require('../server/server');
import {WorkflowModel} from "../common/models";
import Promise = require('bluebird');
import {shuffle, range} from 'lodash';

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);

// .find({where: {name: {like: '2018%'}}})
//Can also search with various finds...

//MongoDB Filter is weird
app.agenda.on('ready', function () {
  ExpScreenUploadWorkflow
    .find({
      where: {and: [{name: /FDA/}, {screenStage: 'secondary'}]},
    })
    .then((results) => {
      results = shuffle(results);
      console.log(`Results length ${results.length}`);
      results.map((result) => {
        console.log(JSON.stringify(result.name));
        app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: result});
      });
    })
    .catch((error) => {
      process.exit(1);
    });
});

// app.agenda.on('ready', function () {
//   console.log('app started!');
//   ExpScreenUploadWorkflow.count()
//     .then((count) => {
//       let count_per_batch = 50;
//       const batches = count / count_per_batch;
//       let rangeBatches = range(1, batches - 1 );
//       return Promise.map(rangeBatches, (batch) => {
//         // return batch * count_per_batch;
//         let skip = batch * count_per_batch;
//         let scheduledTime = batch * 10 + 1;
//         return ExpScreenUploadWorkflow
//           .find({limit: count_per_batch, skip: skip})
//           .then((results) =>{
//             console.log(`Got Results ${results.length}`);
//             results.map((workflowData) =>{
//               //TODO ensure there are only unique instances of each job
//               // app.agenda.create('ExpScreenUploadWorkflow.doWork')
//               //   .unique(workflowData, {insertOnly: true})
//               app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: workflowData });
//             });
//             return batch;
//           })
//           .catch((error) =>{
//            console.log(JSON.stringify(error));
//           });
//       });
//     })
//     .then((results) => {
//       app.winston.info(JSON.stringify(results));
//       // results = shuffle(results);
//       // results.map((workflowData) => {
//       //   workflowData = JSON.parse(JSON.stringify(workflowData));
//       //   console.log(`Submitting ${workflowData.name}`);
//       //   delete workflowData.id;
//       //   delete workflowData['_id'];
//       //   app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: workflowData});
//       // });
//     })
//     .catch((error) => {
//       console.error('new error!');
//       console.error(error);
//     });
// });
