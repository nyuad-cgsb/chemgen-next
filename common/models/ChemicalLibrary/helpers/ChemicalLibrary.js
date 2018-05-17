"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var _ = require("lodash");
var ChemicalLibrary = app.models['ChemicalLibrary'];
ChemicalLibrary.helpers.genLibraryResult = function (barcode, libraryResults, well) {
    var libraryResult = _.find(libraryResults, {
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
ChemicalLibrary.helpers.checkLibraryResult = function (libraryResult) {
    if (!libraryResult) {
        libraryResult = {};
        libraryResult.name = 'empty';
        libraryResult.chemicalName = 'empty';
    }
    return libraryResult;
};
//# sourceMappingURL=ChemicalLibrary.js.map