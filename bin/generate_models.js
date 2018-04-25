'use strict'

const path = require('path')
const Promise = require('bluebird')
const writeFile = Promise.promisify(require('fs').writeFile)
const app = require('../server/server')
const mkdirp = require('mkdirp-promise')
const camelCase = require('camelcase')
const upperCamelCase = require('uppercamelcase')

const datasource = app.datasources.chemgenDS

const modelConfig = require('../server/model-config.json')

const modelDir = path.resolve(__dirname, '..', 'common', 'models')

datasource.discoverModelDefinitions()
  .then(models => createModels(models))
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error.stack)
    process.exit(1)
  })

function createModels (models) {
  return new Promise((resolve, reject) => Promise.map(models, model => datasource.discoverSchema(model.name)
    .then((results) => {
      const table = model.name
      console.log(`Creating Model for : ${table}`)
      return getForiegnKeys(datasource, model, results)
      // const outputFile = path.resolve(outputDir, `${table}.json`)
      // const fileContents = JSON.stringify(results, null, 2)
    })
  )
  // .then(() => {
  //   return writeFile(path.resolve(__dirname, '..', 'server', 'model-config.json' ), JSON.stringify(modelConfig, null, 2))
  // })
    .then(() => {
      resolve()
    })
    .catch((error) => {
      console.log(error.stack)
      reject(new Error(error))
    }))
}

function getForiegnKeys (datasource, model, modelData) {
  return new Promise((resolve, reject) => {
    datasource.discoverForeignKeys(model.name)
      .then((fKeyData) => {
        return addForiegnKeys(model, modelData, fKeyData)
        // const outputFile = path.resolve(outputDir, `${model.name}-relations.json`)
        // const fileContents = JSON.stringify(fKeyData, null, 2)
      })
      .then((modelDataWithKeys) => {
        return checkForId(modelDataWithKeys)
      })
      .then((modelDataWithKeys) => {
        return writeModelFile(modelDataWithKeys)
      })
      .then((results) => {
        resolve(results)
      })
      .catch((error) => {
        console.error(error.stack)
        reject(new Error(error))
      })
  })
}

// TODO This only adds hasMany, not belongsTo
function addForiegnKeys (model, modelData, fKeyData) {
  return new Promise((resolve, reject) => {
    var relations = {}
    fKeyData.map(data => {
      let relationName = String(camelCase(data.pkTableName))
      let modelName = upperCamelCase(data.pkTableName)
      relations[`${relationName}s`] = {type: 'hasMany', model: modelName, foreignKey: camelCase(data.fkColumnName), propertyId: camelCase(data.pkColumnName)}
    })
    modelData.relations = relations
    resolve(modelData)
  })
}

// This is some very specific logic that accounts for the fact that all of our ids are autoincrements
function checkForId (modelData) {
  return new Promise((resolve) => {
    Object.keys(modelData.properties).map(function (property) {
      if (modelData.properties[property].hasOwnProperty('id')) {
        if (modelData.properties[property].id === 1) {
          modelData.properties[property].required = false
        }
      }
    })
    resolve(modelData)
  })
}

function writeModelFile (modelData) {
  return new Promise((resolve, reject) => {
    const modelPath = path.resolve(modelDir, modelData.name, 'def')
    path.join('..', 'common', 'models', modelData.name, 'defs')
    modelConfig['_meta']['sources'].push(modelPath)
    modelConfig[modelData.name] = {'datasource': 'chemgenDS', 'public': true}
    mkdirp(modelPath)
      .then(() => {
        const fileContents = JSON.stringify(modelData, null, 2)
        return writeFile(path.resolve(modelPath, `${modelData.name}.json`), fileContents)
      })
      .then(() => {
        resolve()
      })
      .catch((error) => {
        reject(new Error(error))
      })
  })
}
