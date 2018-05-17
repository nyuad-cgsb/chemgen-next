"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../../server/server.js");
var Promise = require("bluebird");
var wellData_1 = require("../../../../../types/wellData");
var lodash_1 = require("lodash");
var deepcopy = require("deepcopy");
var chalk = require("chalk");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
/**
 * This workflow goes from the upload screenData to building the interfaces
 * TODO Name this something more informative
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 */
ExpScreenUploadWorkflow.load.workflows.worms.doWork = function (workflowData) {
    return new Promise(function (resolve, reject) {
        if (workflowData instanceof Array) {
            Promise.map(workflowData, function (data) {
                return ExpScreenUploadWorkflow.load.workflows.worms.processWorkflow(data);
            }, { concurrency: 1 })
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                app.winston.error(error.stack);
                reject(new Error(error));
            });
        }
        else {
            ExpScreenUploadWorkflow.load.workflows.worms.processWorkflow(workflowData)
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                app.winston.error(error.stack);
                reject(new Error(error));
            });
        }
    });
};
ExpScreenUploadWorkflow.load.getInstrumentPlates = function (workflowData) {
    var instrumentPlates = [];
    Object.keys(workflowData.experimentGroups).map(function (expGroup) {
        if (lodash_1.get(workflowData, ['experimentGroups', expGroup, 'plates'])) {
            workflowData.experimentGroups[expGroup].plates.map(function (plate) {
                instrumentPlates.push(plate);
            });
        }
    });
    return instrumentPlates;
};
ExpScreenUploadWorkflow.load.workflows.worms.processWorkflow = function (workflowData) {
    return new Promise(function (resolve, reject) {
        console.log(chalk.magenta("ExpScreenUploadWorkflow.doWork " + workflowData.name));
        console.time("ExpScreenUploadWorkflow.doWork " + workflowData.name);
        var instrumentPlates = ExpScreenUploadWorkflow.load.getInstrumentPlates(workflowData);
        ExpScreenUploadWorkflow.load[workflowData.screenStage].createWorkflowInstance(workflowData)
            .then(function (workflowData) {
            return ExpScreenUploadWorkflow.load.workflows.worms.populateExperimentData(workflowData, instrumentPlates);
        })
            .then(function (screenData) {
            //Export to file
            return ExpScreenUploadWorkflow.load.workflows.worms.createExpInterfaces(workflowData, screenData);
        })
            .then(function () {
            console.log(chalk.cyan("Time: ExpScreenUploadWorkflow.doWork " + workflowData.name));
            console.timeEnd("ExpScreenUploadWorkflow.doWork " + workflowData.name);
            resolve();
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 * TODO Move the workflow creation to its own function
 * ExpScreenUploadWorkflow.load.workflows.worms.populateExperimentData
 * @param workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpScreenUploadWorkflow.load.workflows.worms.populateExperimentData = function (workflowData, instrumentPlates) {
    return new Promise(function (resolve, reject) {
        ExpScreenUploadWorkflow.load.workflows.worms.populatePlateData(workflowData, instrumentPlates)
            .then(function (results) {
            app.winston.info("Begin: Populate ExpDesignData " + workflowData.name);
            return ExpScreenUploadWorkflow.load.workflows.worms.populateExpDesignData(workflowData, results);
        })
            .then(function (results) {
            app.winston.info("Complete: Populate ExpDesignData " + workflowData.name);
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 * For some reason when these get read in through a web request deeply nested keys have a '[' around them
 * I have no idea why this is
 * In the future I will just store the ID to the plates and then have a process that finds them, which is probably a better idea anyways
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @returns {ExpScreenUploadWorkflowResultSet}
 */
ExpScreenUploadWorkflow.load.fixPlates = function (workflowData) {
    Object.keys(workflowData.experimentGroups).map(function (expGroup) {
        if (lodash_1.get(workflowData, ['experimentGroups', expGroup, 'plates'])) {
            workflowData.experimentGroups[expGroup].plates.map(function (plate, index) {
                Object.keys(plate).map(function (key) {
                    var origKey = key;
                    key = key.replace('[', '');
                    key = key.replace(']', '');
                    plate[key] = deepcopy(plate[origKey]);
                    plate['instrumentPlateId'] = Number(plate.csPlateid);
                    if (!lodash_1.isEqual(key, origKey)) {
                        delete plate[origKey];
                    }
                });
                workflowData.experimentGroups[expGroup].plates[index] = plate;
            });
        }
        else {
            workflowData.experimentGroups[expGroup].plates = [];
        }
    });
    return workflowData;
};
/*
In the primary screen just create the workflow instance
 */
ExpScreenUploadWorkflow.load.primary.createWorkflowInstance = function (workflowData) {
    return new Promise(function (resolve, reject) {
        ExpScreenUploadWorkflow.load.createWorkflowInstance(workflowData)
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Secondary screens require a plate plan ID
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 */
ExpScreenUploadWorkflow.load.secondary.createWorkflowInstance = function (workflowData) {
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(workflowData, 'platePlanId')) {
            reject(new Error('Secondary screens must have a platePlan!'));
        }
        else {
            app.models.PlatePlan96.findOne({ where: { 'id': workflowData.platePlanId } })
                .then(function (platePlan) {
                workflowData.platePlan = platePlan;
                return ExpScreenUploadWorkflow.load.createWorkflowInstance(workflowData);
            })
                .then(function (results) {
                resolve(results);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
};
ExpScreenUploadWorkflow.load.createWorkflowInstance = function (workflowData) {
    return new Promise(function (resolve, reject) {
        workflowData = ExpScreenUploadWorkflow.load.fixPlates(workflowData);
        var search = app.models[workflowData.libraryModel].load[workflowData.screenStage].createWorkflowSearchObj(workflowData);
        ExpScreenUploadWorkflow
            .findOne({
            where: search,
        })
            .then(function (results) {
            //TODO Update the results with the current workflow
            if (!lodash_1.isEmpty(results)) {
                app.winston.info('ExpScreen Upload Workflow found!');
                resolve(results);
            }
            else {
                app.winston.info('ExpScreen Upload Workflow NOT found!');
                return ExpScreenUploadWorkflow
                    .findOrCreate({
                    where: search,
                }, workflowData)
                    .then(function (results) {
                    resolve(results[0]);
                })
                    .catch(function (error) {
                    reject(new Error(error));
                });
            }
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * This workflow populates:
 * 1. ExpPlate
 * 2. Gets the plate plan -> mapping of library to exp plate wells
 * 3. Creates the stock
 * 4. Creates the experiment groups - set of experiment condition (treat_rnai,ctrl_null,ctrL_strain,ctrl_rnai)
 * 5. Creates the ExpAssays (expGroupId is inline)
 * 6. Fires off a request to the service that converts images to non proprietary and web format
 * For all plates in an ExperimentSet
 * For the primary Screen this is a single plate from a library plus its controls
 * Barcodes Replicate 1: RNAiI.3A1E_M, RNAiI.3AE, L4440E_M, L4440E
 * Barcodes Replicate 2: RNAiI.3A1E_D_M, RNAiI.3AE_D, L4440E_D_M, L4440E_D
 * A single workflow (workflowData) maps to a SINGLE Experiment Set
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpScreenUploadWorkflow.load.workflows.worms.populatePlateData = function (workflowData, instrumentPlates) {
    app.winston.info("Begin: Populating Plate Data " + workflowData.name);
    return new Promise(function (resolve, reject) {
        app.models.ExpPlate.load.workflows.processInstrumentPlates(workflowData, instrumentPlates)
            .then(function (expPlatesList) {
            app.winston.info("Begin: ExpAssay.load.workflows.processExpPlates " + workflowData.name);
            return app.models.ExpAssay.load.workflows.processExpPlates(workflowData, expPlatesList);
        })
            .then(function (results) {
            app.winston.info("Complete: Populating Plate Data " + workflowData.name);
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 * ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExpDesignData
 * This workflow creates the linking between the different wells to conditions, and conditions to other conditions
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ScreenCollection} screenData
 */
ExpScreenUploadWorkflow.load.workflows.worms.populateExpDesignData = function (workflowData, plateDataList) {
    return new Promise(function (resolve, reject) {
        var expDesignRows = app.models.ExpDesign.transform.workflows.screenDataToExpSets(workflowData, plateDataList);
        app.models.ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows)
            .then(function (results) {
            var screenData = new wellData_1.ScreenCollection({ plateDataList: plateDataList, expDesignList: results });
            resolve(screenData);
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 *
 * Once the ExperimentData has been populated its time to make some interfaces
 * This is the part of the workflow that creates teh interfaces
 * It wires up to the wordpressDB to create actual interfaces
 * This is done after all the experiment plates in the set are finished
 * @param workflowData
 * @param {ScreenCollection} screenData
 */
ExpScreenUploadWorkflow.load.workflows.worms.createExpInterfaces = function (workflowData, screenData) {
    app.winston.info("Creating Experiment Interfaces: " + workflowData.name);
    return new Promise(function (resolve, reject) {
        //TODO Add in create exp terms here
        return app.models.WpTerms.load.workflows.createAnnotationData(workflowData, screenData)
            .then(function (screenData) {
            Promise.map(screenData.plateDataList, function (plateData) {
                app.winston.info("Begin Exp Plate: " + plateData.expPlate.barcode + " create interfaces");
                return app.models.ExpPlate.load.workflows.createExpPlateInterface(workflowData, screenData, plateData)
                    .then(function () {
                    //TODO Make sure to have plateUrl
                    return app.models.ExpAssay.load.workflows.createExpAssayInterfaces(workflowData, screenData, plateData);
                })
                    .catch(function (error) {
                    app.winston.error(error.stack);
                    return (new Error(error));
                });
            }, { concurrency: 1 });
        })
            .then(function () {
            app.winston.info("Complete Experiment Interfaces! " + workflowData.name);
            // I don't actually do anything with the results from the interfaces
            // They are just there to look pretty
            resolve(screenData);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpScreenUploadWorkflow.js.map