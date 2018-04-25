"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server");
var assert = require("assert");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
var ExpDesign = app.models.ExpDesign;
var instrumentPlates = require('../../../../test/data/rnai_instrument_plate_data_list.json');
var workflowData = require('../../../../test/data/rnai_workflow_data.json');
var shared = require("../../../../test/shared");
shared.makeMemoryDb();
describe('ExpDesign.load', function () {
    shared.prepareRnai();
    it('ExpDesign.load.workflows.createExpDesigns', function (done) {
        this.timeout(5000);
        //This test fails when run in the test suite
        ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
            .then(function (results) {
            var expDesignRows = ExpDesign.transform.workflows.screenDataToExpSets(workflowData, results);
            return ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows);
        })
            .then(function (results) {
            assert.equal(results.length, 9);
            // assert.equal(ExpDesign.extract.isTreatmentId(1, results), false);
            // assert.equal(ExpDesign.extract.isTreatmentId(6, results), true);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});
