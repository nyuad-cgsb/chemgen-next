#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
var Promise = require("bluebird");
var models_1 = require("../common/types/sdk/models");
var lodash_1 = require("lodash");
var lodash_2 = require("lodash");
var glob = require("glob-promise");
var Papa = require("papaparse");
// import {filter, uniq, isEqual, find, isNull, isEmpty, slice} from 'lodash';
var path = require('path');
var fs = require('fs');
var genesFile = path.resolve(__dirname, 'complete_gene_list.csv');
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
// Head of tfcounts files looks like:
// egg,egg_clump,image_path,larva,worm
// 30,1,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A01-autolevel.bmp,94,3
// 5,0,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A02-autolevel.bmp,80,12
// 4,0,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A03-autolevel.bmp,99,4
var globPatterns = [
    // "/mnt/image/2017Dec11/915*/*tf*.csv",
    // "/mnt/image/2018Jan29/9509/*tf*.csv",
    "/mnt/image/2017*/*/*tf*.csv",
    "/mnt/image/2018*/*/*tf*.csv",
    "/mnt/image/2014*/*/*tf*.csv",
    "/mnt/image/2015*/*/*tf*.csv",
    "/mnt/image/2016*/*/*tf*.csv",
];
// let globPattern = "/mnt/image/2018*/*/*tf*.csv";
// console.log(`Glob Pattern: ${globPattern}`);
globAllTheThings(globPatterns)
    .then(function () {
    console.log('Finished no errors!');
    process.exit(0);
})
    .catch(function (error) {
    console.log('Finished with errors!');
    console.log(error);
    process.exit(1);
});
function globAllTheThings(globs) {
    console.log('Promise API!');
    return new Promise(function (resolve, reject) {
        Promise.map(globs, function (globPattern) {
            console.log("Glob Pattern: " + globPattern);
            return globOneThing(globPattern);
        }, { concurrency: 1 })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function globOneThing(globPattern) {
    return new Promise(function (resolve, reject) {
        glob(globPattern)
            .then(function (files) {
            console.log("Processing " + files.length + " counts");
            files = lodash_1.shuffle(files);
            // console.log(JSON.stringify(files));
            resolve(getCounts(files));
            // return getCounts(files)
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function getCounts(files) {
    return new Promise(function (resolve, reject) {
        Promise.map(files, function (file) {
            console.log("Parsing " + file);
            return parseCountsFile(file);
        }, { concurrency: 1 })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function parseCountsFile(countsFile) {
    return new Promise(function (resolve, reject) {
        var orig = [];
        Papa.parse(fs.createReadStream(countsFile), {
            header: true,
            step: function (results, parser) {
                // parser.pause();
                var imagePath = results.data[0].image_path;
                imagePath = imagePath.replace('/mnt/image/', '');
                imagePath = imagePath.replace('-autolevel.bmp', '');
                imagePath = imagePath.replace('-autolevel.png', '');
                results.data[0].imagePathModified = imagePath;
                orig.push(results.data[0]);
                // console.log(JSON.stringify(results.data));
                // parser.resume();
            },
            complete: function () {
                // getGeneXRefs(genes);
                // console.log(JSON.stringify(orig[0]));
                getAssays(orig)
                    .then(function () {
                    console.log('Finished parsing file!');
                    resolve();
                })
                    .catch(function (error) {
                    console.log(error);
                    reject(new Error(error));
                });
            },
        });
    });
}
function getAssays(counts) {
    // console.log('In get assays!');
    return new Promise(function (resolve, reject) {
        var or = [];
        counts.map(function (count) {
            or.push({ assayImagePath: count.imagePathModified });
        });
        app.models.ExpAssay
            .find({ where: { or: or } })
            .then(function (results) {
            // console.log(JSON.stringify(results[0]));
            return assignCountsToAssay(results, counts);
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function assignCountsToAssay(assays, counts) {
    console.log('In assignCountsToAssay');
    return new Promise(function (resolve, reject) {
        Promise.map(assays, function (assay) {
            var countRow = lodash_1.find(counts, function (count) {
                if (!lodash_1.isNull(count) && !lodash_1.isUndefined(count)) {
                    return lodash_1.isEqual(String(count.imagePathModified), String(assay.assayImagePath));
                }
            });
            // console.log(JSON.stringify(countRow));
            // Lethality as [ embryos / (embryos + larvae) ] ]
            // let percEmbLeth = 0;
            if (lodash_1.isNull(countRow) || lodash_1.isUndefined(countRow)) {
                return {};
            }
            else {
                // let percEmbLeth = 0;
                var percEmbLeth_1 = lodash_2.divide(Number(countRow.egg), lodash_2.add(Number(countRow.egg), Number(countRow.larva)));
                //Do not know why this wasn't caught by isNan
                if (!lodash_1.isFinite(percEmbLeth_1) || lodash_1.isNull(percEmbLeth_1) || lodash_1.isUndefined(percEmbLeth_1) || lodash_1.isNaN(percEmbLeth_1)) {
                    percEmbLeth_1 = 0;
                }
                percEmbLeth_1 = percEmbLeth_1 * 100;
                percEmbLeth_1 = lodash_2.round(percEmbLeth_1, 4);
                // larvae / ( embryos + larvae)
                // let percSter = 0;
                var percSter_1 = lodash_2.divide(Number(countRow.larva), lodash_2.add(Number(countRow.egg), Number(countRow.larva)));
                if (!lodash_1.isFinite(percSter_1) || lodash_1.isNull(percSter_1) || lodash_1.isUndefined(percSter_1) || lodash_1.isNaN(percSter_1)) {
                    percSter_1 = 0;
                }
                percSter_1 = percSter_1 * 100;
                percSter_1 = lodash_2.round(percSter_1, 4);
                // Brood size is calculated as [ (embryos + larvae) / worm ].
                var broodSize_1 = lodash_2.divide(Number(countRow.larva), (lodash_2.add(Number(countRow.egg), Number(countRow.worm))));
                if (!lodash_1.isFinite(broodSize_1) || lodash_1.isNull(broodSize_1) || lodash_1.isUndefined(broodSize_1) || lodash_1.isNaN(broodSize_1)) {
                    broodSize_1 = 0;
                }
                broodSize_1 = lodash_2.round(broodSize_1, 4);
                var newCounts = new models_1.ModelPredictedCountsResultSet({
                    modelId: 3,
                    assayId: assay.assayId,
                    screenId: assay.screenId,
                    plateId: assay.plateId,
                    assayImagePath: assay.assayImagePath,
                    wormCount: countRow.worm,
                    larvaCount: countRow.larva,
                    eggCount: countRow.egg,
                    percEmbLeth: percEmbLeth_1,
                    percSter: percSter_1,
                    broodSize: broodSize_1
                });
                console.log(JSON.stringify(newCounts));
                //Using the entire findOrCreate Object did not work - possibly because of rhe percEmbLeth?
                // let findOrCreate = app.etlWorkflow.helpers.findOrCreateObj(newCounts);
                // console.log(`FindOrCreate: ${JSON.stringify(findOrCreate)}`);
                return app.models.ModelPredictedCounts
                    .findOrCreate({
                    where: {
                        and: [
                            { assayId: newCounts.assayId },
                            { modelId: newCounts.modelId }
                        ]
                    }
                }, newCounts)
                    .then(function (results) {
                    results[0].broodSize = broodSize_1;
                    results[0].percSter = percSter_1;
                    results[0].percEmbLeth = percEmbLeth_1;
                    return app.models.ModelPredictedCounts.upsert(results[0]);
                })
                    .then(function () {
                    // console.log(JSON.stringify(results));
                    return {};
                })
                    .catch(function (error) {
                    console.log(JSON.stringify(error));
                    return new Error(error);
                });
            }
        })
            .then(function () {
            console.log('Complete');
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
//# sourceMappingURL=get_tf_counts.js.map