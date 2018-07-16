#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
var lodash_1 = require("lodash");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
// .find({where: {name: {like: '2018%'}}})
//Can also search with various finds...
//MongoDB Filter is weird
app.agenda.on('ready', function () {
    ExpScreenUploadWorkflow
        .find({
        where: { and: [{ name: /mip/ }, { screenStage: 'primary' }] },
    })
        .then(function (results) {
        results = lodash_1.shuffle(results);
        console.log("Results length " + results.length);
        results.map(function (result) {
            console.log(JSON.stringify(result.name));
            app.agenda.now('ExpScreenUploadWorkflow.doWork', { workflowData: result });
        });
    })
        .catch(function (error) {
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
//# sourceMappingURL=process_screens.js.map