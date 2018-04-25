'use strict';

var path = require('path');
var Promise = require('bluebird');
// const fs = Promise.promisifyAll(require('fs'))
var writeFile = Promise.promisify(require('fs').writeFile);
var app = require('../server/server');
var mkdirp = require('mkdirp-promise');
var camelCase = require('camelcase');
var upperCamelCase = require('uppercamelcase');

// const capitalize = require('lodash.capitalize')
var datasource = app.datasources.chemgenDS;

var outputDir = path.resolve(__dirname, '_chemgenModels');
var modelConfig = require('../server/model-config.json');
console.log(JSON.stringify(modelConfig));

var modelDir = path.resolve(__dirname, '..', 'common', 'models');

datasource.discoverModelDefinitions().then(function (models) {
  return createModels(models);
}).then(function () {
  process.exit(0);
}).catch(function (error) {
  console.error(error.stack);
  process.exit(1);
});

function createModels(models) {
  return new Promise(function (resolve, reject) {
    return Promise.map(models, function (model) {
      return datasource.discoverSchema(model.name).then(function (results) {
        var table = model.name;
        return getForiegnKeys(datasource, model, results);
        // const outputFile = path.resolve(outputDir, `${table}.json`)
        // const fileContents = JSON.stringify(results, null, 2)
      });
    })
    // .then(() => {
    //   return writeFile(path.resolve(__dirname, '..', 'server', 'model-config.json' ), JSON.stringify(modelConfig, null, 2))
    // })
    .then(function () {
      resolve();
    }).catch(function (error) {
      console.log(error.stack);
      reject(new Error(error));
    });
  });
}

function getForiegnKeys(datasource, model, modelData) {
  return new Promise(function (resolve, reject) {
    datasource.discoverForeignKeys(model.name).then(function (fKeyData) {
      return addForiegnKeys(model, modelData, fKeyData);
      // const outputFile = path.resolve(outputDir, `${model.name}-relations.json`)
      // const fileContents = JSON.stringify(fKeyData, null, 2)
    }).then(function (modelDataWithKeys) {
      return writeModelFile(modelDataWithKeys);
    }).then(function (results) {
      resolve(results);
    }).catch(function (error) {
      console.error(error.stack);
      reject(new Error(error));
    });
  });
}

function addForiegnKeys(model, modelData, fKeyData) {
  return new Promise(function (resolve, reject) {
    var relations = {};
    fKeyData.map(function (data) {
      var relationName = String(camelCase(data.pkTableName));
      var modelName = upperCamelCase(data.pkTableName);
      relations[relationName + 's'] = { type: 'hasMany', model: modelName, foreignKey: camelCase(data.pkColumnName) };
    });
    modelData.relations = relations;
    resolve(modelData);
  });
}

function writeModelFile(modelData) {
  return new Promise(function (resolve, reject) {
    var modelPath = path.resolve(modelDir, modelData.name, 'def');
    path.join('..', 'common', 'models', modelData.name, 'defs');
    modelConfig['_meta']['sources'].push(modelPath);
    modelConfig[modelData.name] = { 'datasource': 'chemgenDS', 'public': true };
    mkdirp(modelPath).then(function () {
      var fileContents = JSON.stringify(modelData, null, 2);
      return writeFile(path.resolve(modelPath, modelData.name + '.json'), fileContents);
    }).then(function () {
      resolve();
    }).catch(function (error) {
      reject(new Error(error));
    });
  });
}
//# sourceMappingURL=generate_models.js.map