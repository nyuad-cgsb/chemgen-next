import app = require('../../../../server/server');
import Promise = require('bluebird');
import assert = require('assert');
import loopback = require('loopback');
import {WorkflowModel} from "../../index";
import {PlateResultSet} from "../../../types/sdk/models";
import {PlateCollection} from "../../../types/wellData";

import * as _ from "lodash";

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);
const ExpDesign = app.models.ExpDesign as (typeof WorkflowModel);
const RnaiLibrary = app.models.RnaiLibrary as (typeof WorkflowModel);

const rnaiLibraries = require('../../../../test/data/rnai_library.json');
const instrumentPlates: PlateResultSet[] = require('../../../../test/data/rnai_instrument_plate_data_list.json');
const workflowData: any = require('../../../../test/data/rnai_workflow_data.json');

import shared = require('../../../../test/shared');

shared.makeMemoryDb();

describe('ExpDesign.transform', function () {
  shared.prepareRnai();

  it('ExpDesign.transform.prepareExpDesign', function (done) {
    this.timeout(5000);
    ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
      .then((results: PlateCollection[]) => {
        //TODO Add tests to ensure wells with same reagent get grouped separately
        let groups = ExpDesign.transform.groupExpConditions(workflowData, results);
        let matchedGroups = ExpDesign.transform.createExpSets(workflowData, groups);
        let expDesignRows = ExpDesign.transform.prepareExpDesign(workflowData, groups, matchedGroups);
        expDesignRows = _.sortBy(expDesignRows, 'treatmentGroupId');

        //TODO Add some more tests here
        assert.equal(groups['ctrl_null'].length, 1);
        assert.equal(groups['ctrl_strain'].length, 1);
        assert.equal(groups['ctrl_rnai'].length, 3);
        assert.equal(groups['treat_rnai'].length, 3);
        assert.equal(matchedGroups.length, 3);
        assert.deepEqual(expDesignRows[0], {treatmentGroupId: 2, controlGroupId: 5});
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });

  shared.sharedAfter();
});
