import app  = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import { get} from 'lodash';
import decamelize = require('decamelize');

const ChemicalXrefs = app.models['ChemicalXrefs'] as (typeof WorkflowModel);

ChemicalXrefs.extract.genTaxTerms = function(where) {
  let idRefs = ['cidId', 'smiles'];
  return new Promise(function(resolve, reject) {
    ChemicalXrefs
      .find(where)
      .then((results)  => {
        let taxTerms = [];
        results = JSON.stringify(results);
        results = JSON.parse(results);
        results.map((result) =>{
          idRefs.map((idRef) =>{
            if(get(result, [idRef])){
              taxTerms.push({
                taxonomy: decamelize(idRef),
                taxTerm: result[idRef],
              });
            }
          })
        });
        resolve({
          xrefs: results,
          taxTerms: taxTerms,
        });
      })
      .catch(function(error) {
        app.winston.error(error.stack);
        reject(new Error(error));
      });
  });
};

