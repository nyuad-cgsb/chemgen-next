import app  = require('../../../../server/server.js');
import {ExpPlateResultSet} from "../../";
import {PlateResultSet} from "../../";
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import path = require('path');
import {ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import {ScreenCollection} from "../../../types/wellData";
import Mustache = require('mustache');
import deepclone = require('deepclone');

const readFile = Promise.promisify(require('fs').readFile);

const ExpPlate = app.models.ExpPlate as (typeof WorkflowModel);

//TODO Consider moving these to worm/cell specific logic

/**
 *
 * @param workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpPlate.load.workflows.processInstrumentPlates = function (workflowData, instrumentPlates: PlateResultSet[]) {
  return new Promise(function (resolve, reject) {
    Promise.map(instrumentPlates, function (plate) {
      return ExpPlate.load.createExperimentPlate(workflowData, plate);
    }, {
      concurrency: 1,
    })
      .then(function (results: ExpPlateResultSet[]) {
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
ExpPlate.load.createExperimentPlate = function (workflowData, instrumentPlate: PlateResultSet) {

  const createObjList: PlateResultSet[] = ExpPlate.load.transformInstrumentPlate(workflowData, instrumentPlate);

  return new Promise(function (resolve, reject) {
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
 * @returns {{plateImagePath: string; screenId: any | number | {name: string; type: string} | {name; type}; barcode; screenStage: any | string | {name: string; type: string} | {name; type} | number; instrumentId: any | number; instrumentPlateId: number | {name: string; type: string} | {name; type}; plateStartTime: string | Date | {name: string; type: string} | {name; type}; plateCreationDate: Date | {name: string; type: string} | {name; type} | string}}
 */
ExpPlate.load.transformInstrumentPlate = function (workflowData: ExpScreenUploadWorkflowResultSet, instrumentPlate: PlateResultSet) {
  let imagePath = path.normalize(instrumentPlate.imagepath).split('\\');

  /*
  For some reason if I searched on the whole plate object it was always returning not found
  So I just search for a subset of the plate object
   */
  let lookUpPlateObj: ExpPlateResultSet = {
    //Screen Info
    screenId: workflowData.screenId,
    expWorkflowId: workflowData.id,
    //Instrument Plate Things
    instrumentId: workflowData.instrumentId,
    instrumentPlateId: instrumentPlate.csPlateid,
  };
  let plateObj: ExpPlateResultSet = {
    //Screen Info
    screenId: workflowData.screenId,
    screenStage: workflowData.screenStage,
    screenType: workflowData.screenType,
    expWorkflowId: workflowData.id,
    //Instrument Plate Things
    instrumentId: workflowData.instrumentId,
    instrumentPlateId: instrumentPlate.csPlateid,
    instrumentPlateImagePath: instrumentPlate.imagepath,
    //Plate Data
    plateImagePath: `${imagePath[4]}/${instrumentPlate.csPlateid}`,
    barcode: instrumentPlate.name,
    plateAssayDate: workflowData.stockPrepDate,
    plateImageDate: instrumentPlate.creationdate,
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
ExpPlate.load.workflows.createExpPlateInterface = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection, plateData) {
  const templateName = `${workflowData.librarycode}-${workflowData.screenStage}-${workflowData.screenType}.mustache`;
  let templateFile = path.join(path.dirname(__filename), `../../../../common/views/exp/assay/${workflowData.biosampleType}/${workflowData.libraryModel}/expPlate-${templateName}`);

  return new Promise((resolve, reject) => {
    readFile(templateFile, 'utf8')
      .then((contents) => {
        let assayView = Mustache.render(contents, {
          expPlate: plateData.expPlate,
          workflowData: workflowData,
        });
        resolve();
      })
      .catch(function (error) {
        reject(new Error(error));
      });
  })

};

