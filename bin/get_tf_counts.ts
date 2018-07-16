#!/usr/bin/env node

const app = require('../server/server');
import {WorkflowModel} from "../common/models";
import Promise = require('bluebird');
import {ExpAssayResultSet, ModelPredictedCountsResultSet} from "../common/types/sdk/models";
import {isFinite, isNaN, isNull, find, shuffle, isEqual, isUndefined} from 'lodash';
import {round, add, divide} from 'lodash';

let glob = require("glob-promise");
import Papa = require('papaparse');
// import {filter, uniq, isEqual, find, isNull, isEmpty, slice} from 'lodash';

const path = require('path');
const fs = require('fs');

let genesFile = path.resolve(__dirname, 'complete_gene_list.csv');

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);

// Head of tfcounts files looks like:
// egg,egg_clump,image_path,larva,worm
// 30,1,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A01-autolevel.bmp,94,3
// 5,0,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A02-autolevel.bmp,80,12
// 4,0,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A03-autolevel.bmp,99,4

let globPatterns = [
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
  .then(() => {
    console.log('Finished no errors!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('Finished with errors!');
    console.log(error);
    process.exit(1);
  });

function globAllTheThings(globs) {
  console.log('Promise API!');
  return new Promise((resolve, reject) => {
    Promise.map(globs, (globPattern) => {
      console.log(`Glob Pattern: ${globPattern}`);
      return globOneThing(globPattern);
    }, {concurrency: 1})
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function globOneThing(globPattern) {
  return new Promise((resolve, reject) => {
    glob(globPattern)
      .then((files) => {
        console.log(`Processing ${files.length} counts`);
        files = shuffle(files);
        // console.log(JSON.stringify(files));
        resolve(getCounts(files));
        // return getCounts(files)
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });

  });
}

function getCounts(files) {
  return new Promise((resolve, reject) => {
    Promise.map(files, (file) => {
      console.log(`Parsing ${file}`);
      return parseCountsFile(file)
    }, {concurrency: 1})
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function parseCountsFile(countsFile) {
  return new Promise((resolve, reject) => {
    let orig = [];
    Papa.parse(fs.createReadStream(countsFile), {
      header: true,
      step: function (results, parser) {
        // parser.pause();
        let imagePath = results.data[0].image_path;
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
          .then(() => {
            console.log('Finished parsing file!');
            resolve();
          })
          .catch((error) => {
            console.log(error);
            reject(new Error(error));
          })
      },
    });
  });
}

function getAssays(counts) {
  // console.log('In get assays!');
  return new Promise((resolve, reject) => {
    let or = [];
    counts.map((count) => {
      or.push({assayImagePath: count.imagePathModified});
    });
    app.models.ExpAssay
      .find({where: {or: or}})
      .then((results: ExpAssayResultSet[]) => {
        // console.log(JSON.stringify(results[0]));
        return assignCountsToAssay(results, counts)
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function assignCountsToAssay(assays, counts) {
  console.log('In assignCountsToAssay');
  return new Promise((resolve, reject) => {
    Promise.map(assays, (assay) => {
      let countRow = find(counts, (count) => {
        if (!isNull(count) && !isUndefined(count)) {
          return isEqual(String(count.imagePathModified), String(assay.assayImagePath));
        }
      });
      // console.log(JSON.stringify(countRow));
      // Lethality as [ embryos / (embryos + larvae) ] ]
      // let percEmbLeth = 0;
      if (isNull(countRow) || isUndefined(countRow)) {
        return {};
      } else {
        // let percEmbLeth = 0;
        let percEmbLeth = divide(Number(countRow.egg), add(Number(countRow.egg), Number(countRow.larva)));
        //Do not know why this wasn't caught by isNan
        if (!isFinite(percEmbLeth) || isNull(percEmbLeth) || isUndefined(percEmbLeth) || isNaN(percEmbLeth)) {
          percEmbLeth = 0;
        }
        percEmbLeth = percEmbLeth * 100;
        percEmbLeth = round(percEmbLeth, 4);
        // larvae / ( embryos + larvae)
        // let percSter = 0;
        let percSter = divide(Number(countRow.larva) , add(Number(countRow.egg), Number(countRow.larva)));
        if (!isFinite(percSter) || isNull(percSter) || isUndefined(percSter) || isNaN(percSter)) {
          percSter = 0;
        }
        percSter = percSter * 100;
        percSter = round(percSter, 4);
        // Brood size is calculated as [ (embryos + larvae) / worm ].
        let broodSize = divide(Number(countRow.larva), (add(Number(countRow.egg), Number(countRow.worm))));
        if (!isFinite(broodSize) || isNull(broodSize) || isUndefined(broodSize) || isNaN(broodSize)) {
          broodSize = 0;
        }
        broodSize = round(broodSize, 4);

        let newCounts = new ModelPredictedCountsResultSet({
          modelId: 3,
          assayId: assay.assayId,
          screenId: assay.screenId,
          plateId: assay.plateId,
          assayImagePath: assay.assayImagePath,
          wormCount: countRow.worm,
          larvaCount: countRow.larva,
          eggCount: countRow.egg,
          percEmbLeth: percEmbLeth,
          percSter: percSter,
          broodSize: broodSize
        });
        console.log(JSON.stringify(newCounts));

        //Using the entire findOrCreate Object did not work - possibly because of rhe percEmbLeth?
        // let findOrCreate = app.etlWorkflow.helpers.findOrCreateObj(newCounts);
        // console.log(`FindOrCreate: ${JSON.stringify(findOrCreate)}`);

        return app.models.ModelPredictedCounts
          .findOrCreate({
            where: {
              and: [
                {assayId: newCounts.assayId},
                {modelId: newCounts.modelId}
              ]
            }
          }, newCounts)
          .then((results) => {
            results[0].broodSize = broodSize;
            results[0].percSter = percSter;
            results[0].percEmbLeth = percEmbLeth;
            return app.models.ModelPredictedCounts.upsert(results[0]);
          })
          .then(() => {
            // console.log(JSON.stringify(results));
            return {}
          })
          .catch((error) => {
            console.log(JSON.stringify(error));
            return new Error(error);
          });
      }
    })
      .then(() => {
        console.log('Complete');
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}
