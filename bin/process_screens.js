#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
// .find({where: {name: {like: '2018%'}}})
//Can also search with various finds...
app.agenda.on('ready', function () {
    console.log('app started!');
    ExpScreenUploadWorkflow.count()
        .then(function (count) {
        var count_per_batch = 50;
        var batches = count / count_per_batch;
        var rangeBatches = lodash_1.range(0, batches - 1);
        return Promise.map(rangeBatches, function (batch) {
            // return batch * count_per_batch;
            var skip = batch * count_per_batch;
            var scheduledTime = batch * 10 + 1;
            return ExpScreenUploadWorkflow
                .find({ limit: count_per_batch, skip: skip })
                .then(function (results) {
                console.log("Got Results " + results.length);
                results.map(function (workflowData) {
                    //TODO ensure there are only unique instances of each job
                    // app.agenda.create('ExpScreenUploadWorkflow.doWork')
                    //   .unique(workflowData, {insertOnly: true})
                    app.agenda.schedule("in " + scheduledTime + " minutes", 'ExpScreenUploadWorkflow.doWork', { workflowData: workflowData });
                });
                return batch;
            })
                .catch(function (error) {
                console.log(JSON.stringify(error));
            });
        });
    })
        .then(function (results) {
        app.winston.info(JSON.stringify(results));
        // results = shuffle(results);
        // results.map((workflowData) => {
        //   workflowData = JSON.parse(JSON.stringify(workflowData));
        //   console.log(`Submitting ${workflowData.name}`);
        //   delete workflowData.id;
        //   delete workflowData['_id'];
        //   app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: workflowData});
        // });
    })
        .catch(function (error) {
        console.error('new error!');
        console.error(error);
    });
});
//# sourceMappingURL=process_screens.js.map