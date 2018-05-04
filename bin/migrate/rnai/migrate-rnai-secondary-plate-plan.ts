import Promise = require('bluebird');
import app = require('../../../server/server');
import {find, isEqual, get, isEmpty} from 'lodash';
import {RnaiScreenUploadWorkflowResultSet} from "../../../common/types/sdk/models";


const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const cols = ['01', '02', '03', '04', '05',
  '06', '07', '08', '09', '10', '11', '12'
];
let wells96 = [];

rows.map(function (row) {
  cols.map(function (col) {
    wells96.push(row + col)
  })
});

let getParentLibrary = function (workflowData) {
  return new Promise(function (resolve, reject) {
    parseCustomPlate(workflowData)
      .then(function (results) {
        return parseRows(workflowData, results);
      })
      .then(function (results) {
        return migrateToNewFormat(results);
      })
      .then((results) => {
        resolve(results);
      })
      .catch(function (error) {
        console.log(JSON.stringify(error));
        reject(new Error(error));
      });
  });
};

let migrateToNewFormat = function (wellData) {
  let workflowData: any  = {};

  return new Promise((resolve, reject) => {
    wells96.map((well) => {
      try {
        let wellRow = find(wellData, (wellRow) => {
          return isEqual(wellRow.well, well);
        });
        workflowData[well] = {};
        workflowData[well].isValid = true;
        workflowData[well].well = well;
        if (wellRow) {
          try {
            workflowData[well].taxTerm = wellRow.geneName;
            workflowData[well].geneName = wellRow.geneName;
            workflowData[well].lookUp = wellRow.lookUp;
          }
          catch (error) {
            console.log(error);
            reject(new Error(error));
          }
          if (get(wellRow, 'rnaiId')) {
            try {
              //   "rnaiId": 73,
              //   "libraryId": 1,
              //   "rnaiType": "clone",
              //   "plate": "1",
              //   "well": "A02",
              //   "chrom": "I",
              //   "geneName": "K12C11.2",
              //   "fwdPrimer": "GAGAAACCGAGTATCTCAGTGGA",
              //   "revPrimer": "GCGATGCGTTTAATTAAGTTTTG",
              //   "bioloc": "I-1O13",
              //   "stocktitle": "I-1--A1",
              //   "stockloc": "A1-H07"
              workflowData[well].parentLibrary = {};
              workflowData[well].parentLibrary.rnaiId = wellRow.rnaiId;
              workflowData[well].parentLibrary.libraryId = wellRow.libraryId;
              workflowData[well].parentLibrary.rnaiType = wellRow.rnaiType;
              workflowData[well].parentLibrary.plate = wellRow.plate;
              workflowData[well].parentLibrary.well = wellRow.well;
              workflowData[well].parentLibrary.chrom = wellRow.chrom;
              workflowData[well].parentLibrary.geneName = wellRow.geneName;
              workflowData[well].parentLibrary.fwdPrimer = wellRow.fwdPrimer;
              workflowData[well].parentLibrary.revPrimer = wellRow.revPrimer;
              workflowData[well].parentLibrary.bioloc = wellRow.bioloc;
              workflowData[well].parentLibrary.stocktitle = wellRow.stocktitle;
              workflowData[well].parentLibrary.stockloc = wellRow.stockloc;
            }
            catch (error) {
              console.log(error);
              reject(new Error(error));
            }
          }
        }
      }
      catch (error) {
        console.log(error);
        reject(new Error(error));
      }
    });
    // console.log('should be getting some workflow data');
    // console.log(JSON.stringify(workflowData));
    resolve(workflowData);
  });
};

let buildRnaiLibraryWhere = function (lookUp) {
  let where = {};
  let chrom = lookUp[0];
  let plateNo = lookUp[1];
  let well = '';

  // The well listed is from the parent library - not the stock
  if (lookUp.length === 3) {
    well = lookUp[2];
    let bioLoc = chrom + '-' + plateNo + well;
    where = {
      bioloc: bioLoc,
    };
    // The well is from the stock - it has a quadrant
  } else if (lookUp.length === 4) {
    let quad = lookUp[2];
    well = lookUp[3];
    where = {
      and: [{
        stocktitle: chrom + '-' + plateNo + '--' + quad,
      },
        {
          stockloc: quad + '-' + well,
        },
        {
          well: well,
        },
        {
          libraryId: 1,
        }
      ],
    };
  } else {
    return;
  }
  return where;
};

const parseWell = function (workflowData, wellData) {
  let lookUpIndex = workflowData.search.library.rnai.ahringer.lookUpIndex;
  let commentIndex = workflowData.search.library.rnai.ahringer.commentIndex;

  return new Promise(function (resolve, reject) {
    let obj: any = {
      wellData: wellData,
    };
    // If its a control just return right here
    if (wellData.splitLookUp[0].match('L4440')) {
      obj.geneName = 'L4440';
      obj.lookUp = 'L4440';
      obj.well = wellData.assayWell;
      resolve(obj);
    } else {
      let data,
        comment;
      data = wellData.splitLookUp[lookUpIndex];
      comment = wellData.splitLookUp[commentIndex];
      let lookUp = data.split('-');
      let where = buildRnaiLibraryWhere(lookUp);

      if (!where) {
        reject(new Error('Not able to find a corresponding library well!'));
      } else {
        app.models.RnaiLibrary.find({
          where: where,
        })
          .then(function (tresults) {
            if (!tresults[0]) {
              resolve();
            } else {
              let results = tresults[0];
              results.wellData = wellData;
              results.origWell = results.well;
              results.well = wellData.assayWell;
              results.comment = comment;
              results.lookUp = data;
              resolve(results);
            }
          })
          .catch(function (error) {
            reject(new Error(error.stack));
          });
      }
    }
  });
};

const parseRows = function (workflowData, lists) {
  return new Promise(function (resolve, reject) {
    Promise.map(lists, function (wellData) {
      return parseWell(workflowData, wellData);
    })
      .then(function (results) {
        resolve(results);
      })
      .catch(function (error) {
        reject(new Error(error));
      });
  });
};

// This parses the custom Plate
// That exists as a json file the library data directory
// This is Ahringer Library Specific
const parseCustomPlate = function (workflowData) {
  let wellData = workflowData.data.library.wellData;
  let rows = app.etlWorkflow.helpers.rows;
  let list = [];

  rows.map(function (row) {
    let obj = wellData[row];
    for (let key in obj) {
      let dataObj = {};
      let lookUp = obj[key];
      let newKey = ('00' + key)
        .slice(-2);
      if (lookUp) {
        let splitLookUp = lookUp.split('\n');
        dataObj['splitLookUp'] = splitLookUp;
        dataObj['row'] = row;
        dataObj['origKey'] = key;
        dataObj['assayWell'] = row + newKey;
        list.push(dataObj);
      }
    }
  });

  return new Promise(function (resolve) {
    resolve(list);
  });
};

module.exports.getParentLibrary = getParentLibrary;
