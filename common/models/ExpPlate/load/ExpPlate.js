"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var path = require("path");
var Mustache = require("mustache");
var _ = require("lodash");
var readFile = Promise.promisify(require('fs').readFile);
var ExpPlate = app.models.ExpPlate;
//TODO Consider moving these to worm/cell specific logic
/**
 *
 * @param workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpPlate.load.workflows.processInstrumentPlates = function (workflowData, instrumentPlates) {
    return new Promise(function (resolve, reject) {
        Promise.map(instrumentPlates, function (plate) {
            return ExpPlate.load.createExperimentPlate(workflowData, plate);
        }, {
            concurrency: 1,
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.warn(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 * Create the experiment plate
 * Carry around an object that has instrumentPlate data and ExpPlate data
 * @param workflowData
 * @param {PlateResultSet} instrumentPlate
 */
ExpPlate.load.createExperimentPlate = function (workflowData, instrumentPlate) {
    return new Promise(function (resolve, reject) {
        var createObjList;
        try {
            createObjList = ExpPlate.load.transformInstrumentPlate(workflowData, instrumentPlate);
        }
        catch (error) {
            reject(new Error("Unable to parse instrument plate " + workflowData.screenName + " " + workflowData.name + " " + instrumentPlate.csPlateid));
        }
        ExpPlate
            .findOrCreate({
            where: app.etlWorkflow.helpers.findOrCreateObj(createObjList[1]),
        }, createObjList[0])
            .then(function (result) {
            resolve(result[0]);
        })
            .catch(function (error) {
            app.winston.warn('ERROR ' + JSON.stringify(error));
            reject(new Error(error));
        });
    });
};
/**
 * Given the experimentalData (workflowData) transform the instrument plate to a expPlate
 * @param workflowData
 * @param instrumentPlate
 * @returns [ExpPlateResultSet, ExpPlateResultSet]
 */
ExpPlate.load.transformInstrumentPlate = function (workflowData, instrumentPlate) {
    var csPlateid = instrumentPlate.csPlateid;
    var imagepath = instrumentPlate.imagepath;
    var barcode = instrumentPlate.name;
    var creationdate = instrumentPlate.creationdate;
    //path.normalize does not work the same on osx as on linux
    //because of course it doesn't
    var imagePath = imagepath.split('\\');
    imagePath = _.compact(imagePath);
    if (!imagePath[2] || _.isNull(imagePath[2])) {
        app.winston.error('Image Path is Null!!');
        throw new Error('Plate Path is invalid');
    }
    /*
    For some reason if I searched on the whole plate object it was always returning not found
    So I just search for a subset of the plate object
     */
    var lookUpPlateObj = {
        //Screen Info
        screenId: workflowData.screenId,
        expWorkflowId: workflowData.id,
        //Instrument Plate Things
        instrumentId: workflowData.instrumentId,
        instrumentPlateId: csPlateid,
    };
    var plateObj = {
        //Screen Info
        screenId: workflowData.screenId,
        screenStage: workflowData.screenStage,
        screenType: workflowData.screenType,
        expWorkflowId: workflowData.id,
        //Instrument Plate Things
        instrumentId: workflowData.instrumentId,
        instrumentPlateId: csPlateid,
        instrumentPlateImagePath: imagepath,
        //Plate Data
        plateImagePath: imagePath[2] + "/" + csPlateid,
        barcode: barcode,
        plateAssayDate: workflowData.stockPrepDate,
        plateImageDate: creationdate,
        plateTemperature: workflowData.temperature,
    };
    return [plateObj, lookUpPlateObj];
};
/**
 * WIP
 * TODO MAKE THIS A REAL FUNCTION
 * ExpPlate.load.workflows.createExpPlateInterface
 * Create the ExpPlate interface in WP
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ScreenCollection} screenData
 * @param plateData
 */
ExpPlate.load.workflows.createExpPlateInterface = function (workflowData, screenData, plateData) {
    var templateName = workflowData.librarycode + "-" + workflowData.screenStage + ".mustache";
    var templateFile = path.join(path.dirname(__filename), "../../../../common/views/exp/assay/" + workflowData.biosampleType + "/" + workflowData.libraryModel + "/expPlate-" + templateName);
    return new Promise(function (resolve, reject) {
        readFile(templateFile, 'utf8')
            .then(function (contents) {
            var assayView = Mustache.render(contents, {
                expPlate: plateData.expPlate,
                workflowData: workflowData,
            });
            resolve(assayView);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpPlate.js.map