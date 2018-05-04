"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var app = require("../../../server/server");
var lodash_1 = require("lodash");
var rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
var cols = ['01', '02', '03', '04', '05',
    '06', '07', '08', '09', '10', '11', '12'
];
var wells96 = [];
rows.map(function (row) {
    cols.map(function (col) {
        wells96.push(row + col);
    });
});
var getParentLibrary = function (workflowData) {
    return new Promise(function (resolve, reject) {
        parseCustomPlate(workflowData)
            .then(function (results) {
            return parseRows(workflowData, results);
        })
            .then(function (results) {
            return migrateToNewFormat(results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            console.log(JSON.stringify(error));
            reject(new Error(error));
        });
    });
};
var migrateToNewFormat = function (wellData) {
    var workflowData = {};
    return new Promise(function (resolve, reject) {
        wells96.map(function (well) {
            try {
                var wellRow = lodash_1.find(wellData, function (wellRow) {
                    return lodash_1.isEqual(wellRow.well, well);
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
                    if (lodash_1.get(wellRow, 'rnaiId')) {
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
var buildRnaiLibraryWhere = function (lookUp) {
    var where = {};
    var chrom = lookUp[0];
    var plateNo = lookUp[1];
    var well = '';
    // The well listed is from the parent library - not the stock
    if (lookUp.length === 3) {
        well = lookUp[2];
        var bioLoc = chrom + '-' + plateNo + well;
        where = {
            bioloc: bioLoc,
        };
        // The well is from the stock - it has a quadrant
    }
    else if (lookUp.length === 4) {
        var quad = lookUp[2];
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
    }
    else {
        return;
    }
    return where;
};
var parseWell = function (workflowData, wellData) {
    var lookUpIndex = workflowData.search.library.rnai.ahringer.lookUpIndex;
    var commentIndex = workflowData.search.library.rnai.ahringer.commentIndex;
    return new Promise(function (resolve, reject) {
        var obj = {
            wellData: wellData,
        };
        // If its a control just return right here
        if (wellData.splitLookUp[0].match('L4440')) {
            obj.geneName = 'L4440';
            obj.lookUp = 'L4440';
            obj.well = wellData.assayWell;
            resolve(obj);
        }
        else {
            var data_1, comment_1;
            data_1 = wellData.splitLookUp[lookUpIndex];
            comment_1 = wellData.splitLookUp[commentIndex];
            var lookUp = data_1.split('-');
            var where = buildRnaiLibraryWhere(lookUp);
            if (!where) {
                reject(new Error('Not able to find a corresponding library well!'));
            }
            else {
                app.models.RnaiLibrary.find({
                    where: where,
                })
                    .then(function (tresults) {
                    if (!tresults[0]) {
                        resolve();
                    }
                    else {
                        var results = tresults[0];
                        results.wellData = wellData;
                        results.origWell = results.well;
                        results.well = wellData.assayWell;
                        results.comment = comment_1;
                        results.lookUp = data_1;
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
var parseRows = function (workflowData, lists) {
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
var parseCustomPlate = function (workflowData) {
    var wellData = workflowData.data.library.wellData;
    var rows = app.etlWorkflow.helpers.rows;
    var list = [];
    rows.map(function (row) {
        var obj = wellData[row];
        for (var key in obj) {
            var dataObj = {};
            var lookUp = obj[key];
            var newKey = ('00' + key)
                .slice(-2);
            if (lookUp) {
                var splitLookUp = lookUp.split('\n');
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
//# sourceMappingURL=migrate-rnai-secondary-plate-plan.js.map