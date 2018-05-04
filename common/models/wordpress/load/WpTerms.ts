import app  = require('../../../../server/server.js');
import config = require('config');

import {WorkflowModel} from "../../index";
import {annotationData, RnaiWellCollection} from "../../../types/wellData";
import {ExpPlateResultSet, WpTermsResultSet} from "../../../types/sdk/models";
import {PlateCollection, ScreenCollection} from "../../../types/wellData";
import {WpTermTaxonomyResultSet} from "../../../types/sdk/models";
import slug = require('slug');
import Promise = require('bluebird');
import * as _ from "lodash";

const WpTerms = app.models['WpTerms'] as (typeof WorkflowModel);

/**
 * This is the workflow that creates the initial annotation data records
 * This is WpTerms -> WpTermTaxonomy
 * Later, after the post is created, the WpTermTaxonomy gets associated to the postId in the WpTermRelations table
 * @param workflowData
 * @param {PlateCollection} screenData
 */
WpTerms.load.workflows.createAnnotationData = function (workflowData, screenData: PlateCollection) {
  app.winston.info('Begin: WpTerms.load.workflows.createAnnotationData');
  return new Promise((resolve, reject) => {
    WpTerms.load.prepareAnnotationData(workflowData, screenData)
      .then((taxTermsList: WpTermsResultSet) => {
        return app.models.WpTerms.load.createTerms(taxTermsList)
      })
      .then((results: WpTermsResultSet[]) => {
        return app.models.WpTermTaxonomy.load.createTaxTerms(results);
      })
      .then((results: WpTermTaxonomyResultSet[]) => {
        app.winston.info(JSON.stringify(results[0]));
        screenData.annotationData = new annotationData({taxTerms : results});
        app.winston.info('Complete: WpTerms.load.workflows.createAnnotationData');
        // screenData.annotationData.taxTerms = results;
        resolve(screenData);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

/**
 * The taxTerms declarations get really clunky
 * Instead of making a million calls to WpTerms.createTerms
 * Instead first get all unique taxTerms - then make slightly less than 1 million calls
 * @param workflowData
 * @param {ScreenCollection} screenData
 */
WpTerms.load.prepareAnnotationData = function (workflowData, screenData: ScreenCollection) {
  return new Promise((resolve) => {
    let taxTermsTotal = [];
    screenData.plateDataList.map((plateData: PlateCollection) =>{
      plateData.wellDataList.map(function (wellData) {
        wellData.annotationData.taxTerms.map(function (taxTerm) {
          taxTermsTotal.push(taxTerm);
        });
      });
    });

    const uniqTaxTerms = _.uniqWith(taxTermsTotal, _.isEqual);
    resolve(uniqTaxTerms);
  });
};



/**
 * TODO Add in Library / Primary/Secondary
 * For primary add in library_plate, library_chrom, library_quadrant
 * WP Uses what it calls a taxonomy to relate posts to stuff
 * A Post has 1 or more taxonomies, and a taxonomy has 1 or more terms
 * The envira-tags are a taxonomy for creating custom galleries based on tags
 * SI - ScreenId
 * BS - BiosampleID
 * PI - ExpPlateId
 * TT - TaxTerm (gene, chemical, etc - this comes from the library and may not be the preferred name of the team)
 * W - Well
 * B - Barcode
 * A1 - ExpAssayId
 * R - Row
 * C - Column
 * EGI - ExpGroupId (This gets added later, after the expgroup is created)
 * EGT - ExpGroupType (This gets added later, after the expgroup is created)
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param {RnaiWellCollection} wellData
 * @returns {({taxonomy: string; taxTerm: Date} | {taxonomy: string; taxTerm: string} | {taxonomy: string; taxTerm: number} | {taxonomy: string; taxTerm})[]}
 */
WpTerms.load.genWellTaxTerms = function (workflowData: any, expPlate: ExpPlateResultSet, wellData: RnaiWellCollection) {
  //TODO Upto barcode are for the plate
  let regexp = /([a-zA-Z]+)(\d+)/g;
  let groups = regexp.exec(wellData.stockLibraryData.well);
  return [{
    taxonomy: 'image_date',
    taxTerm: expPlate.plateImageDate,
  }, {
    taxonomy: 'screen_type',
    taxTerm: workflowData.screenType,
  }, {
    taxonomy: 'screen_stage',
    taxTerm: workflowData.screenStage,
  }, {
    taxonomy: 'exp_plate_id',
    taxTerm: expPlate.plateId,
  }, {
    taxonomy: 'instrument_plate_id',
    taxTerm: expPlate.instrumentPlateId,
  }, {
    taxonomy: 'barcode',
    taxTerm: expPlate.barcode,
  },
    {
      taxonomy: 'envira-tag',
      taxTerm: slug([
        `SI-${workflowData.screenId}`,
        `_SS-${workflowData.screenStage}`,
        `_BS-${wellData.expGroup.biosampleId}`,
        `_TT-${wellData.annotationData.taxTerm}`,
        `_W-${wellData.stockLibraryData.well}`,
      ].join('')),
    },
    {
      taxonomy: 'envira-tag',
      taxTerm: slug([
        `AI-${wellData.expAssay.assayId}`,
      ].join('')),
    },
  ];

};

WpTerms.load.createTerms = function (taxTermsList: Array<Object>) {
  return new Promise((resolve, reject) => {
    //Concurrency is set to 1 to ensure we don't hit the DB multiple times
    Promise.map(taxTermsList, (createTermObj) => {
      //This is just a sanity check, but probably shouldn't ever happen
      if (_.isEmpty(createTermObj) || ! _.get(createTermObj, 'taxTerm')) {
        return {};
      }
      else {
        let createObj = {
          name: createTermObj.taxTerm,
          slug: slug(createTermObj.taxTerm) || '',
          termGroup: 0,
        };

        return WpTerms
          .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(createObj)}, createObj)
          .then((results) => {
            //This is technically not ok, but will save some processing time later
            results[0].taxonomy = createTermObj.taxonomy;
            results[0].term = createTermObj.taxTerm;
            results[0].taxTerm = createTermObj.taxTerm;
            return results[0];
          });
      }
    })
      .then((results: WpTermsResultSet[]) => {
        let nonEmptyResults = results.filter((row) => {
          return !_.isEmpty(row);
        });
        resolve(nonEmptyResults);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};


WpTerms.load.genTermTable = function(taxTermList) {
  var table = '';
  var seen = {};
  taxTermList.map(function(createTerm) {
    if (createTerm.taxonomy.match('envira')) {
      return;
    } else if (!createTerm.taxTerm) {
      return;
    } else if (seen.hasOwnProperty(createTerm.taxTerm)) {
      return;
    }
    seen[createTerm.taxTerm] = 1;
    table = table + '<tr>';
    let taxTerm = createTerm.taxTerm;
    let taxTermUrl = '<a href="' + config.get('wpUrl') + '/' + createTerm.taxonomy + '/' +
      slug(taxTerm) + '/">' + taxTerm + '</a>';

    table = table + '<td><b>';
    table = table + createTerm.taxonomy.replace(/\b\w/g, function(l) {
      return l.toUpperCase();
    });
    table = table + '</b></td><td>' + taxTermUrl + '</td>';
    table = table + '</tr>';
  });
  return table;
};
