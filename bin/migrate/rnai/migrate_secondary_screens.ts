'use strict';

import app = require('../../../server/server');

const Promise = require('bluebird');
const fs = require('fs');
const readFile = Promise.promisify(require('fs')
  .readFile);
const jsonfile = require('jsonfile');
const path = require('path');
const migrate = require('./migrate-rnai-secondary-plate-plan');
let basePath = '/Users/jillian/Dropbox/projects/NY/chemgen/chemgen-loopback-new/common/workflows/library/rnai/ahringer/secondary/data';

let platePlanUploadDate = new Date();
let libraryId = 1;

let secondaryScreens = [
  {
    wellDataFile: `${basePath}/assay_2016-12-11.json`,
    assayDate: '2016-12-11',
    platePlanName: 'RNAi-AHR2-2016-12-11',
    imageDates: [{
      creationdate: '2017-01-16',
    },
      {
        creationdate: '2017-01-17',
      },
    ],
  },
  {
    wellDataFile: `${basePath}/2017-09-25-Secondary_Plate001_001.json`,
    assayDate: '2017-09-20',
    platePlanName: 'RNAi-AHR2-2017-09-20',
    imageDates: [{
      creationdate: '2017-09-25',
    },
      {
        creationdate: '2017-09-26',
      },
    ],
  },
  {
    wellDataFile: `${basePath}/2017-08-02--Secondary_Plate001_001.json`,
    assayDate: ' 2017-08-02',
    platePlanName: 'RNAi-AHR2-2017-08-02',
    imageDates: [{
      creationdate: '2017-08-07',
    },
      {
        creationdate: '2017-08-08',
      },
    ],
  },
  {
    wellDataFile: `${basePath}/2017-04-03--Secondary_Plate001_001.json`,
    assayDate: '2017-04-03',
    platePlanName: 'RNAi-AHR2-2017-04-03',
    imageDates: [{
      creationdate: '2017-04-08',
    },
      {
        creationdate: '2017-04-09',
      },
    ],
  },
  {
    wellDataFile: `${basePath}/2017-03-08--Secondary_Plate002_002.json`,
    platePlanName: 'RNAi-AHR2-2017-03-08-Plate2',
    assayDate: '2017-03-08',
    imageDates: [{
      creationdate: '2017-03-14',
    },
      {
        creationdate: '2017-03-13',
      },
    ],
  },
  {
    wellDataFile: `${basePath}/2017-03-08--Secondary_Plate001_002.json`,
    platePlanName: 'RNAi-AHR2-2017-03-08-Plate1',
    assayDate: '2017-03-08',
    imageDates: [{
      creationdate: '2017-03-14',
    },
      {
        creationdate: '2017-03-13',
      },
    ],
  }
];

// secondaryScreens = [secondaryScreens[3]];

createPlatePlans(secondaryScreens);

function createPlatePlans(secondaryScreens) {
  return new Promise((resolve, reject) => {
    Promise.map(secondaryScreens, (secondaryScreen) => {
      console.log(`Mapping secondary screen: ${secondaryScreen.platePlanName}`);
      const wellData = jsonfile.readFileSync(secondaryScreen.wellDataFile);
      let workflowData = {
        platePlanName: secondaryScreen.platePlanName,
        wellData: wellData,
        data: {library: {wellData: wellData}},
      };
      console.log('should be doing stuff');
      return migrate.getParentLibrary(workflowData)
        .then((results) =>{
          results.platePlanUploadDate = new Date();
          results.platePlanName =  secondaryScreen.platePlanName;
          results.libraryId = 1;
          jsonfile.writeFileSync(path.resolve(__dirname, 'data', 'secondary', `${secondaryScreen.platePlanName}.json`), results, {spaces: 2});
          return app.models.PlatePlan96.create(results);
          // return results;
        });
    }, {concurrency: 1})
      .then((results) => {
        // console.log(JSON.stringify(results));
        // return app.models.PlatePlan96.create(results);
        process.exit(0);
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        process.exit(0);
      });
  });
}