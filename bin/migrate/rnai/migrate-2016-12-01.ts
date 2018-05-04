'use strict';

import app = require('../../../server/server');
const Promise = require('bluebird');
const fs = require('fs');
const readFile = Promise.promisify(require('fs')
  .readFile);
const jsonfile = require('jsonfile');
const path = require('path');
const migrate = require('./migrate-rnai-secondary-plate-plan');

// 1. Assign Screen Data - name, stage, wells, etc.
// 2. Read in data file corresponding to the screen - its a json file in ./data
// 3. Get Plates
// 4. Iterate over Plates
// 5. Process Plate
// 6. Process Well

/// ////////////////////////////////
// BEGIN DECEMBER SCREEN
/// ////////////////////////////////
const wellDataFile = path.resolve(__dirname, 'data', 'assay_2016-12-11.json');
const wellData = jsonfile.readFileSync(wellDataFile);
const assayDate = '2016-12-11';
const screenName = 'AHR2-2016-12-11--Sec';
const like = 'rnai%';
const loopUpIndex = 0;
const commentIndex = 1;
const imageDates = [{
  creationdate: '2017-01-16',
},
  {
    creationdate: '2017-01-17',
  },
];

const wells = [
  'A01', 'A02', 'A03', 'A04', 'A05', 'A06',
  'A07', 'A08', 'A09', 'A10', 'A11', 'A12',
  'B01', 'B02', 'B03', 'B04', 'B05', 'B06',
  'B07', 'B08', 'B09', 'B12',
  'C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07',
  'C08', 'C09', 'C10', 'C11', 'C12',
  'D01', 'D02', 'D03', 'D04', 'D05', 'D12',
  'E01', 'E02', 'E03', 'E04', 'E05', 'E06',
  'E07', 'E12',
  'F01', 'F02', 'F03', 'F04', 'F05', 'F12',
  'G01', 'G02', 'G03', 'G12',
  'H01', 'H12',
];

// The condition needs to be set throughout the workflow
// The arrayscan search denotes the search function we use to get plates
var workflowData = {
  library: 'ahringer',
  libraryModel: 'RnaiLibrary',
  libraryStockModel: 'RnaiLibrarystock',
  condition: 'Permissive',
  assayDate: '2017-12-11',
  imageDates: imageDates,
  wells: wells,
  wellData: wellData,
  screenStage: 'Secondary',
  permissiveTemp: 30,
  restrictiveTemp: 30,
  screenName: screenName,
  instrumentId: 1,
  isJunk: 0,
  search: {
    instrument: {
      arrayscan: {
        and: [{
          or: [{
            name: {
              like: '%' + like,
            },
          }, {
            name: {
              like: 'L4440%',
            },
          }],
        }, {
          or: imageDates,
        }],
      },
    },
    library: {
      rnai: {
        ahringer: {
          lookUpIndex: loopUpIndex,
          commentIndex: commentIndex,
        },
      },
    },
  },
  data: {library: {wellData: wellData}},
  screenId: 1,
};

migrate.getParentLibrary(workflowData, wellDataFile)
  .then((results) => {
    console.log('Got some results!!');
    results.platePlanUploadDate = new Date();
    results.libraryId = 1;
    results.platePlanName = 'rnai-ahringer2-2016-12-11';
    return app.models.PlatePlan96.create(results);
  })
  .then((results) =>{
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.log(JSON.stringify(error));
    process.exit(1);
  });
