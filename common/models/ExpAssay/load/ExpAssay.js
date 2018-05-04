"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var config = require("config");
var wellData_1 = require("../../../types/wellData");
var Promise = require("bluebird");
var _ = require("lodash");
var fs = require("fs");
var request = require('request-promise');
var ExpAssay = app.models['ExpAssay'];
/**
 * Workflows for loading data into the Exp*Tables
 */
/**
 * ExpAssay.load.workflows.processExpPlates
 * Loop through the plates of a given Exp Set
 * Exp Set is a List of Plates with 1 Grouping
 * For primary this looks like:
 * treat_rnai - RNAiI.3A1E_M
 * ctrl_rnai - RNAiI.3A1E
 * ctrl_strain - L4440E_M
 * ctrl_null - L4440E
 * Exp Set has two different groupings
 * Treatment Vs Controls
 * {treat_rnai: ['ctrl_strain', 'ctrl_null', 'ctrl_rnai']
 * ExpBiosample vs ControlBiosample (There are places in the code where this may be referred to as Mutant vs Wildtype)
 * {treat_rnai: ctrl_rnai}
 * {ctrl_strain: ctrl_null}
 * For the secondary screens this looks similar, except there are no L4440 Plates
 * Instead there are L4440 wells
 * Plate Plan is developed in the RnaiLibrary.getParentLibrary functions
 * IMPORTANT - Using a plate per condition is a handy designation, but actual experiment groups are assigned per WELL, NOT per plate
 * @param workflowData
 * @param {ExpPlateResultSet[]} expPlates
 */
ExpAssay.load.workflows.processExpPlates = function (workflowData, expPlates) {
    return new Promise(function (resolve, reject) {
        Promise.map(expPlates, function (expPlate) {
            app.winston.info("Begin Exp Plate: " + expPlate.barcode + " load experiment data");
            return ExpAssay.load.workflows.processExpPlate(workflowData, expPlate)
                .then(function (results) {
                //This should probably be done at the expGroups stage
                app.winston.info("Begin Exp Plate: " + expPlate.barcode + " load annotation data");
                return ExpAssay.load.prepareAnnotationData(workflowData, results);
            });
        }, { concurrency: 1 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 * ExpAssay.load.workflows.processExpPlate
 * This workflow populates the experimental database in the chemgenDB
 * 1. Library Based - generate the plan plan
 * 2. Create the Exp Groups
 * 3. Create the Assays (Exp Group inline)
 * 4. Create the Stocks
 * It does not create interfaces
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 */
ExpAssay.load.workflows.processExpPlate = function (workflowData, expPlate) {
    return new Promise(function (resolve, reject) {
        app.models[workflowData.libraryModel].load.workflows.processExpPlate(workflowData, expPlate)
            .then(function (results) {
            return ExpAssay.load.createExpGroups(workflowData, results);
        })
            .then(function (results) {
            return ExpAssay.load.createExpAssays(workflowData, { expPlate: expPlate, wellDataList: results });
        })
            .then(function (results) {
            //TODO Clean this up - shouldn't be creating new objects all over the place
            // let plateData = new PlateCollection({expPlate: expPlate, wellDataList: results});
            return app.models[workflowData.libraryStockModel].load.createStocks(workflowData, {
                expPlate: expPlate,
                wellDataList: results
            });
        })
            .then(function (results) {
            return app.models.ExpAssay2reagent.load.createAssayStock(workflowData, {
                expPlate: expPlate,
                wellDataList: results
            });
        })
            .then(function (results) {
            var plateData = new wellData_1.PlateCollection({ expPlate: expPlate, wellDataList: results });
            return ExpAssay.load.workflows.imageConversionPipeline.all(workflowData, plateData);
        })
            .then(function (results) {
            // let plateData = new PlateCollection({expPlate: expPlate, wellDataList: results});
            // resolve({expPlate: expPlate, wellDataList: results});
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * TODO Do this in the beginning of the workflow when the platePlan is gathered
 * ExpGroup is a grouping that is used later to match wells their matching conditions
 * Match ExpBiosample (mel-28) to CtrlBiosample (N2) with some particular gene
 * Match ExpBiosample (mel-28) to its L4440 (L4440E_M) controls
 * Match CtrlBiosample (N2) to its L4440 (L4440E) controls
 * @param workflowData
 * @param {PlateCollection} expPlateData
 */
ExpAssay.load.createExpGroups = function (workflowData, expPlateData) {
    return new Promise(function (resolve, reject) {
        var expGroupData;
        try {
            expGroupData = ExpAssay.load.getExpGroup(workflowData, expPlateData.expPlate);
        }
        catch (error) {
            app.winston.error(error);
            reject(new Error(error));
        }
        Promise.map(expPlateData.wellDataList, function (wellData) {
            /*
            Check status of well
            1. Its a well with a reagent
            2. Its a well that is a control (For both primary and secondary screens)
            3. Its an empty well
             */
            if (wellData.parentLibraryData[workflowData.reagentLookUp]) {
                ///Well has a reagent associated to it
                var createObj = {
                    reagentId: wellData.parentLibraryData[workflowData.reagentLookUp],
                    screenId: workflowData.screenId,
                    libraryId: workflowData.libraryId,
                    biosampleId: expGroupData.biosampleId,
                    expGroupType: expGroupData.expGroupType,
                    well: wellData.stockLibraryData.well,
                    expWorkflowId: workflowData.id,
                };
                return app.models.ExpGroup
                    .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(createObj) }, createObj)
                    .then(function (results) {
                    wellData.expGroup = results[0];
                    wellData.annotationData.taxTerms.push({ taxonomy: 'exp_group_id', taxTerm: results[0].expGroupId });
                    wellData.annotationData.taxTerms.push({ taxonomy: 'envira-tag', taxTerm: "EGI-" + results[0].expGroupId });
                    wellData.annotationData.taxTerms.push({
                        taxonomy: 'envira-tag',
                        taxTerm: "EGT-" + results[0].expGroupType + "-EGI-" + results[0].expGroupId
                    });
                    return wellData;
                });
            }
            else if (wellData.annotationData.taxTerm.match('L4440') || wellData.annotationData.taxTerm.match('DMSO')) {
                /*
                TODO Add L4440/DMSO as controlLookUp to workflowData
                Well is a control well
                If the biosample is an expBiosample get the corresponding ctrl for that biosample
                 */
                var expGroupType = void 0;
                try {
                    expGroupType = ExpAssay.load[workflowData.screenStage].getControlCondition(workflowData, expPlateData.expPlate, expGroupData);
                }
                catch (error) {
                    app.winston.error(error);
                    reject(new Error(error));
                }
                var createObj = {
                    screenId: workflowData.screenId,
                    libraryId: workflowData.libraryId,
                    biosampleId: expGroupData.biosampleId,
                    expWorkflowId: workflowData.id,
                    expGroupType: expGroupType,
                };
                return app.models.ExpGroup
                    .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(createObj) }, createObj)
                    .then(function (results) {
                    wellData.expGroup = results[0];
                    //TODO This should be a function
                    wellData.annotationData.taxTerms.push({ taxonomy: 'exp_group_id', taxTerm: results[0].expGroupId });
                    wellData.annotationData.taxTerms.push({ taxonomy: 'envira-tag', taxTerm: "EGI-" + results[0].expGroupId });
                    wellData.annotationData.taxTerms.push({
                        taxonomy: 'envira-tag',
                        taxTerm: "EGT-" + results[0].expGroupType + "-EGI-" + results[0].expGroupId
                    });
                    return wellData;
                });
            }
            else {
                //Well is an empty well
                wellData.expGroup = {
                    screenId: workflowData.screenId,
                    libraryId: workflowData.libraryId,
                    biosampleId: expGroupData.biosampleId,
                    well: wellData.stockLibraryData.well,
                    expWorkflowId: workflowData.id,
                };
                return wellData;
            }
        }, { concurrency: 1 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * ExpAssay.load.createExpAssays
 * @param workflowData
 * @param {PlateCollection} expPlateData
 */
ExpAssay.load.createExpAssays = function (workflowData, expPlateData) {
    return new Promise(function (resolve, reject) {
        Promise.map(expPlateData.wellDataList, function (wellData) {
            var createObj;
            var assayCodeName = expPlateData.expPlate.barcode + "_" + wellData.stockLibraryData.well;
            createObj = {
                assayImagePath: ExpAssay.load.resolveImagePath[workflowData.instrumentLookUp](workflowData, expPlateData.expPlate, wellData),
                screenId: workflowData.screenId,
                plateId: expPlateData.expPlate.plateId,
                biosampleId: wellData.expGroup.biosampleId,
                assayCodeName: assayCodeName,
                assayWell: wellData.stockLibraryData.well,
                assayExpGroup: wellData.expGroup.expGroupId,
                assayReplicateNum: ExpAssay.load.getExpGroupReplicate(workflowData, expPlateData.expPlate),
                expWorkflowId: workflowData.id,
            };
            return ExpAssay
                .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(createObj) }, createObj)
                .then(function (results) {
                wellData.expAssay = results[0];
                return wellData;
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * ExpAssay.load.resolveImagePath.default
 * This is the default logic for NYUAD  - images are just named instrumentPlateId/barcode_well
 * In NY there is a weird tile lookup thing
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param {RnaiWellCollection} wellData
 * @returns {string}
 */
ExpAssay.load.resolveImagePath.default = function (workflowData, expPlate, wellData) {
    return expPlate.plateImagePath + "/" + expPlate.barcode + "_" + wellData.stockLibraryData.well;
};
/**
 * This is the logic for resolving the image path from the arrayscan instruments
 * its instrumentPlateId/barcode_well
 * Base path is not put in here, but in AD its /mnt/image/PlateData/
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param {RnaiWellCollection} wellData
 */
ExpAssay.load.resolveImagePath.arrayScan = function (workflowData, expPlate, wellData) {
    return ExpAssay.load.resolveImagePath.default(workflowData, expPlate, wellData);
};
/**
 * ExpAssay.load.resolveImagePath.nyu
 * This is not complete! The default is only in there as a placeholder
 * TODO Get a mapping of Tile000N -> Well (A01)
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param {RnaiWellCollection} wellData
 */
ExpAssay.load.resolveImagePath.nyu = function (workflowData, expPlate, wellData) {
    return ExpAssay.load.resolveImagePath.default(workflowData, expPlate, wellData);
};
/**
 * Get the exp Group from the workflow Data and the instrumentPlateId
 * ExpDesign is a bit different for primary/secondary screens
 * primary each condition is its own plate
 * secondary the control wells are on the same plate
 * Weird things happen when saving the workflow as a mongodb object that do not happen on an in memory object
 * The deeply nested things are saved as strings instead of integers, which is a huge pain
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @returns {{expGroupType: string; biosampleId: any}}
 */
ExpAssay.load.getExpGroup = function (workflowData, expPlate) {
    //TODO need to return the index here
    var expGroupType;
    try {
        expGroupType = Object.keys(workflowData.experimentGroups).filter(function (condition) {
            return _.find(workflowData.experimentGroups[condition]['plates'], ['instrumentPlateId', String(expPlate.instrumentPlateId)]) || _.find(workflowData.experimentGroups[condition]['plates'], ['instrumentPlateId', expPlate.instrumentPlateId]);
        })[0];
    }
    catch (error) {
        return new Error(error);
    }
    var biosample = workflowData.experimentGroups[expGroupType]['biosampleId'];
    return { expGroupType: expGroupType, biosampleId: biosample };
};
/**
 * Get the replicate number from the workflowData
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @returns {number}
 */
ExpAssay.load.getExpGroupReplicate = function (workflowData, expPlate) {
    return Object.keys(workflowData.replicates).filter(function (replicate) {
        return _.includes(workflowData.replicates[replicate], expPlate.instrumentPlateId);
    })[0];
};
/**
 * This gets the control condition for the primary screen
 * In the primary screen the controls are on a separate plate with barcode L4440 or L4440M
 * For the secondary they are on the same plate
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param expGroup
 * @returns {any | string | {name: string; type: string} | {name; type} | string}
 */
ExpAssay.load.primary.getControlCondition = function (workflowData, expPlate, expGroup) {
    return expGroup.expGroupType;
};
ExpAssay.load.secondary.getControlCondition = function (workflowData, expPlate, expGroup) {
    return workflowData.biosampleMatchConditions[expGroup.expGroupType];
};
/**
 * TODO This should get moved to after the screen , in the same spot as ExperimentDesign
 * This is the workflow that creates the initial annotation data records
 * This is WpTerms -> WpTermTaxonomy
 * Later, after the post is created, the WpTermTaxonomy gets associated to the postId in the WpTermRelations table
 * @param {Array<Object>} taxTermsList
 */
ExpAssay.load.workflows.createAnnotationData = function (workflowData, plateData) {
    return new Promise(function (resolve, reject) {
        ExpAssay.load.prepareAnnotationData(workflowData, plateData)
            .then(function (taxTermsList) {
            return app.models.WpTerms.load.createTerms(taxTermsList);
        })
            .then(function (results) {
            return app.models.WpTermTaxonomy.load.createTaxTerms(results);
        })
            .then(function (results) {
            plateData.annotationData = new wellData_1.annotationData({ taxTerms: results });
            resolve(plateData);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * The taxTerms declarations get really clunky
 * Instead of making a million calls to WpTerms.createTerms
 * Instead first get all unique taxTerms - then make slightly less than 1 million calls
 * @param workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.prepareAnnotationData = function (workflowData, plateData) {
    return new Promise(function (resolve) {
        plateData.wellDataList.map(function (wellData) {
            var wellTerms = app.models.WpTerms.load
                .genWellTaxTerms(workflowData, plateData.expPlate, wellData);
            wellTerms.map(function (taxTerm) {
                wellData.annotationData.taxTerms.push(taxTerm);
            });
        });
        resolve(plateData);
    });
};
/**
 * ExpAssay.load.workflows.imageConversionPipeline.all
 * This is a wrapper around the actual imageConversion pipeline, in order to keep that function isolated
 * We may at some point need to know what gets returned from the request to the image processing service, but we need the experimental data
 * to carry on with the workflow
 * @param workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.workflows.imageConversionPipeline.all = function (workflowData, plateData) {
    return new Promise(function (resolve, reject) {
        ExpAssay.load.workflows.imageConversionPipeline[workflowData.instrumentLookUp](workflowData, plateData)
            .then(function () {
            resolve(plateData);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * This workflow converts the image from the arrayscan properiary format to tiff, bmp, png, and jpeg
 * Jpegs are for wordpress/web interfaces, pngs and bmps are for machine learning / stats models
 * This is a separate service that gets called out, that sits on a different machine
 * The service has to be run by a more privileged user in order to have write access to the mounted filesystem
 * Which we don't give to 'this' user
 * @param workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.workflows.imageConversionPipeline.arrayScan = function (workflowData, plateData) {
    return new Promise(function (resolve, reject) {
        Promise.map(plateData.wellDataList, function (wellData) {
            var images = ExpAssay.helpers.genImageFileNames(plateData.expPlate, wellData.stockLibraryData.well);
            return ExpAssay.helpers.genConvertImageCommands(images)
                .then(function (commands) {
                var imageJob = {
                    title: "convertImage-" + plateData.expPlate.instrumentPlateId + "-" + wellData.expAssay.assayCodeName,
                    commands: commands,
                    plateId: plateData.expPlate.instrumentPlateId,
                };
                if (!fs.existsSync(images.baseImage + "-autolevel.png")) {
                    //TODO Make this a parameter somewhere
                    return request({
                        uri: "http://" + config.get('imageConversionHost') + ":" + config.get('imageConversionPort'),
                        body: imageJob,
                        method: 'POST',
                        json: true,
                    })
                        .then(function (response) {
                        return {
                            baseImage: images.baseImage,
                            script: imageJob.title,
                            convert: 1
                        };
                    })
                        .catch(function (error) {
                        return {
                            baseImage: images.baseImage,
                            script: imageJob.title,
                            convert: 0
                        };
                    });
                }
                else {
                    return {
                        baseImage: images.baseImage,
                        script: imageJob.title,
                        convert: 0
                    };
                }
            });
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpAssay.js.map