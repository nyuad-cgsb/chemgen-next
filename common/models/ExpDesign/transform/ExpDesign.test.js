"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server");
var assert = require("assert");
var _ = require("lodash");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
var ExpDesign = app.models.ExpDesign;
var RnaiLibrary = app.models.RnaiLibrary;
var rnaiLibraries = require('../../../../test/data/rnai_library.json');
var instrumentPlates = require('../../../../test/data/rnai_instrument_plate_data_list.json');
var workflowData = require('../../../../test/data/rnai_workflow_data.json');
var shared = require("../../../../test/shared");
shared.makeMemoryDb();
describe('ExpDesign.transform', function () {
    shared.prepareRnai();
    it('ExpDesign.transform.prepareExpDesign', function (done) {
        this.timeout(5000);
        ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
            .then(function (results) {
            //TODO Add tests to ensure wells with same reagent get grouped separately
            var groups = ExpDesign.transform.groupExpConditions(workflowData, results);
            var matchedGroups = ExpDesign.transform.createExpSets(workflowData, groups);
            var expDesignRows = ExpDesign.transform.prepareExpDesign(workflowData, groups, matchedGroups);
            expDesignRows = _.sortBy(expDesignRows, 'treatmentGroupId');
            //TODO Add some more tests here
            assert.equal(groups['ctrl_null'].length, 1);
            assert.equal(groups['ctrl_strain'].length, 1);
            assert.equal(groups['ctrl_rnai'].length, 3);
            assert.equal(groups['treat_rnai'].length, 3);
            assert.equal(matchedGroups.length, 3);
            assert.deepEqual(expDesignRows[0], { treatmentGroupId: 2, controlGroupId: 5 });
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});