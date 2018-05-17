"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var decamelize = require("decamelize");
var ChemicalXrefs = app.models['ChemicalXrefs'];
ChemicalXrefs.extract.genTaxTerms = function (where) {
    var idRefs = ['cidId', 'smiles'];
    return new Promise(function (resolve, reject) {
        ChemicalXrefs
            .find(where)
            .then(function (results) {
            var taxTerms = [];
            results = JSON.stringify(results);
            results = JSON.parse(results);
            results.map(function (result) {
                idRefs.map(function (idRef) {
                    if (lodash_1.get(result, [idRef])) {
                        taxTerms.push({
                            taxonomy: decamelize(idRef),
                            taxTerm: result[idRef],
                        });
                    }
                });
            });
            resolve({
                xrefs: results,
                taxTerms: taxTerms,
            });
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ChemicalXrefs.js.map