"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var assert = require("assert");
var _ = require("lodash");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
var ExpAssay = app.models.ExpAssay;
var shared = require("../../../../../test/shared");
var instrumentPlates = shared.rnaiData.instrumentPlates;
var workflowData = shared.rnaiData.workflowData;
var screenData = shared.rnaiData.screenData;
shared.makeMemoryDb();
describe('ExpAssay.interfaces.load', function (done) {
    shared.prepareRnai();
    it('ExpAssay.load.workflows.getAssayRelations', function (done) {
        this.timeout(5000);
        // delete workflowData['id'];
        ExpAssay.load.workflows.getAssayRelations(workflowData, screenData, screenData.plateDataList[4], screenData.plateDataList[4].wellDataList[2])
            .then(function (results) {
            //Map does not guarantee order, so we need to sort
            results.expDesignList = _.sortBy(results.expDesignList, function (o) { return o.expDesignId; });
            results.expGroupList = _.sortBy(results.expGroupList, function (o) { return o.expGroupId; });
            assert.equal(results.expDesignList.length, 3);
            assert.equal(results.expGroupList.length, 4);
            assert.deepEqual(shared.convertToJSON(results), {
                "expDesignList": [
                    {
                        "expDesignId": 2,
                        "treatmentGroupId": 8,
                        "controlGroupId": 1
                    },
                    {
                        "expDesignId": 3,
                        "treatmentGroupId": 8,
                        "controlGroupId": 2
                    },
                    {
                        "expDesignId": 4,
                        "treatmentGroupId": 8,
                        "controlGroupId": 5
                    }
                ],
                "expGroupList": [
                    {
                        "expGroupId": 1,
                        "expGroupType": "ctrl_null",
                        "screenId": 1,
                        "libraryId": 1,
                        "biosampleId": 2,
                        "expWorkflowId": 1
                    },
                    {
                        "expGroupId": 2,
                        "expGroupType": "ctrl_strain",
                        "screenId": 1,
                        "libraryId": 1,
                        "biosampleId": 2,
                        "expWorkflowId": 1
                    },
                    {
                        "expGroupId": 5,
                        "expGroupType": "ctrl_rnai",
                        "screenId": 1,
                        "libraryId": 1,
                        "reagentId": 703,
                        "biosampleId": 1,
                        "well": "A03",
                        "expWorkflowId": 1
                    },
                    {
                        "expGroupId": 8,
                        "expGroupType": "treat_rnai",
                        "screenId": 1,
                        "libraryId": 1,
                        "reagentId": 703,
                        "biosampleId": 1,
                        "well": "A03",
                        "expWorkflowId": 1
                    }
                ]
            });
            var annotationData = ExpAssay.load.mapAssayRelations(workflowData, results);
            assert.deepEqual(shared.convertToJSON(annotationData), {
                "ctrl_null": {
                    "expGroupId": 1,
                    "expGroupType": "ctrl_null",
                    "screenId": 1,
                    "libraryId": 1,
                    "biosampleId": 2,
                    "expWorkflowId": 1
                },
                "ctrl_strain": {
                    "expGroupId": 2,
                    "expGroupType": "ctrl_strain",
                    "screenId": 1,
                    "libraryId": 1,
                    "biosampleId": 2,
                    "expWorkflowId": 1
                },
                "ctrl_rnai": {
                    "expGroupId": 5,
                    "expGroupType": "ctrl_rnai",
                    "screenId": 1,
                    "libraryId": 1,
                    "reagentId": 703,
                    "biosampleId": 1,
                    "well": "A03",
                    "expWorkflowId": 1
                },
                "treat_rnai": {
                    "expGroupId": 8,
                    "expGroupType": "treat_rnai",
                    "screenId": 1,
                    "libraryId": 1,
                    "reagentId": 703,
                    "biosampleId": 1,
                    "well": "A03",
                    "expWorkflowId": 1
                }
            });
            done();
        })
            .catch(function (error) {
            console.log(JSON.stringify(error.stack));
            done(new Error(error));
        });
    });
    it('ExpAssay.load.relateTaxToPost', function () {
        var sorted = _.sortBy(screenData.plateDataList[4].wellDataList[0].annotationData.taxTerms, ['term']);
        var results = ExpAssay.load.relateTaxToPost(workflowData, screenData.plateDataList[4], screenData.plateDataList[4].wellDataList[0]);
        assert.equal(results.length, sorted.length);
        assert.equal(results[0].taxonomy, 'wb_gene_sequence_id');
        assert.equal(results[0].term, 'C48E7.5');
        assert.equal(sorted[0].taxonomy, 'wb_gene_sequence_id');
        assert.equal(sorted[0].taxTerm, 'C48E7.5');
    });
    it('ExpAssay.load.workflows.createPostTaxRels', function (done) {
        var postData = {
            'assayPost': { id: 1 },
            'imagePost': { id: 2 }
        };
        ExpAssay.load.workflows.createPostTaxRels(workflowData, screenData.plateDataList[4], screenData.plateDataList[4].wellDataList[0], postData)
            .then(function (results) {
            assert.equal(results.length, 2);
            assert.equal(results[0].length, results[1].length);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('ExpAssay.load.workflows.createExpAssayInterface', function (done) {
        ExpAssay.load.workflows
            .createExpAssayInterfaces(workflowData, screenData, screenData.plateDataList[4])
            .then(function (results) {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});