"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var WpTermTaxonomy = app.models['WpTermTaxonomy'];
WpTermTaxonomy.load.createTaxTerms = function (taxTermsList) {
    return new Promise(function (resolve, reject) {
        Promise.map(taxTermsList, function (taxTermObj) {
            var createObj = {
                termId: taxTermObj.termId,
                //taxTerm from original object
                //Name, not the slug
                term: taxTermObj.name,
                taxonomy: taxTermObj.taxonomy,
                description: '',
                parent: 0,
                count: 1,
            };
            return WpTermTaxonomy
                .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(createObj) }, createObj)
                .then(function (results) {
                return results[0];
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
