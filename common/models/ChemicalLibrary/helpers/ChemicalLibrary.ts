import app  = require('../../../../server/server.js');
import * as _ from "lodash";
import {ChemicalLibraryResultSet} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";

const ChemicalLibrary = app.models['ChemicalLibrary'] as (typeof WorkflowModel);

ChemicalLibrary.helpers.genLibraryResult = function (barcode: string, libraryResults: ChemicalLibraryResultSet[], well: string) {
  let libraryResult: ChemicalLibraryResultSet = _.find(libraryResults, {
    well: well,
  });
  libraryResult = ChemicalLibrary.helpers.checkLibraryResult(libraryResult);
  return libraryResult;
};

/**
 * Library is undef for empty wells
 * Add in a name and a taxTerm
 * @param  {Object | Undefined} libraryResult [Library record for that well]
 * @return {Object}               [Create a library result if it doesn't exist]
 */
ChemicalLibrary.helpers.checkLibraryResult = function (libraryResult: ChemicalLibraryResultSet) {
  if (!libraryResult) {
    libraryResult = {};
    libraryResult.name = 'empty';
    libraryResult.chemicalName = 'empty';
  }
  return libraryResult;
};

