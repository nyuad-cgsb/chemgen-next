const app = require('../server/server')
const Promise = require('bluebird')
const db = app.dataSources.db

const RnaiLibrary = app.models.RnaiLibrary
const rnaiLibraries = require('../test/data/rnai_library')

/**
 * These are just some behaviors that are shared among the tests
 * Empty the DB, initialize the DB, mock out some api calls etc
 */

exports.makeMemoryDb = function () {
  Object.keys(app.models).map(function (modelName) {
    app.models[modelName].attachTo(db)
  })
}

exports.sharedAfter = function () {
  after(function (done) {
    Promise.map(Object.keys(app.models), (modelName) => {
      return app.models[modelName].destroyAll()
    })
      .then(() => {
        done()
      })
      .catch((error) => {
        done(new Error(error))
      })
  })
}

exports.sharedBefore = function () {
  beforeEach(function (done) {
    Promise.map(Object.keys(app.models), (modelName) => {
      return app.models[modelName].destroyAll()
    })
      .then(() => {
        return app.dataSources.db.automigrate()
      })
      .then(() => {
        done()
      })
      .catch((error) => {
        done(new Error(error))
      })
  })
}

let resetDb = function () {
  return new Promise((resolve, reject) => {
    Promise.map(Object.keys(app.models), (modelName) => {
      return app.models[modelName].destroyAll()
    })
      .then(() => {
        return app.dataSources.db.automigrate()
      })
      .then(() => {
        resolve()
      })
      .catch((error) => {
        reject(new Error(error))
      })
  })
}
exports.resetDb = resetDb

exports.convertToJSON = function (input) {
  return JSON.parse(JSON.stringify(input))
}

/**
 * Prepare the Rnai Libraries for Rnai Tests
 */
exports.prepareRnai = function () {
  beforeEach(function (done) {
    resetDb()
      .then(() => {
        return Promise.map(rnaiLibraries, function (row) {
          return RnaiLibrary.create(row)
        })
      })
      .then(() => {
        done()
      })
      .catch((error) => {
        console.log(error.stack)
        done(new Error(error))
      })
  })
}

exports.rnaiData = {};
exports.rnaiData.workflowData = require('../test/data/rnai_workflow_data');
exports.rnaiData.instrumentPlates = require('../test/data/rnai_instrument_plate_data_list');
exports.rnaiData.screenData = require('../test/data/rnai_primary_results_screen_data');
