"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var path = require("path");
var wellData_1 = require("../../../../types/wellData");
var slug = require("slug");
var Promise = require("bluebird");
var Mustache = require("mustache");
var _ = require("lodash");
var readFile = Promise.promisify(require('fs').readFile);
var ExpAssay = app.models['ExpAssay'];
/**
 * Workflows for creating web interfaces for the ExpAssays (Assays are a single well)
 */
/**
 *
 * This is the part of the workflow that creates teh interfaces
 * It wires up to the wordpressDB to create actual interfaces
 * This is done after all the experiment plates in the set are finished
 * @param workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.workflows.createExpAssayInterfaces = function (workflowData, screenData, plateData) {
    return new Promise(function (resolve, reject) {
        Promise.map(plateData.wellDataList, function (wellData) {
            return ExpAssay.load.workflows.getAssayRelations(workflowData, screenData, plateData, wellData)
                .then(function (expSet) {
                var annotationData = ExpAssay.load.mapAssayRelations(workflowData, expSet);
                return ExpAssay.load.genHtmlView(workflowData, screenData, plateData, wellData, annotationData);
            })
                .then(function (postContent) {
                //Create the html and image posts
                return ExpAssay.load.workflows.createWpPosts(workflowData, plateData, wellData, postContent);
            })
                .then(function (results) {
                //Then associate taxTerms to posts
                return ExpAssay.load.workflows.createPostTaxRels(workflowData, plateData, wellData, results);
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
 * For each Assay we need to oet the associated Experiment Data with it (Called the ExpSet)
 * 1. Get Exp Design
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.workflows.getAssayRelations = function (workflowData, screenData, plateData, wellData) {
    return new Promise(function (resolve, reject) {
        app.models.ExpDesign.extract.workflows.getExpSetByExpGroupId(wellData.expGroup.expGroupId, screenData.expDesignList)
            .then(function (expDesignList) {
            var expGroups = [];
            if (_.isEmpty(expDesignList)) {
                //Its an empty well
                resolve(null);
            }
            else {
                //The treatmentGroupIds are always the same
                expGroups.push(app.models.ExpGroup.extract.getExpGroupFromScreenData(expDesignList[0].treatmentGroupId, screenData));
                _.map(expDesignList, function (expDesign) {
                    expGroups.push(app.models.ExpGroup.extract.getExpGroupFromScreenData(expDesign.controlGroupId, screenData));
                });
                var expSet = new wellData_1.ExpSet({ expDesignList: expDesignList, expGroupList: expGroups });
                resolve(expSet);
            }
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * ExpAssay.load.mapAssayRelations
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ExpSet} expSet
 */
ExpAssay.load.mapAssayRelations = function (workflowData, expSet) {
    if (_.isEmpty(expSet) || _.isNull(expSet)) {
        return {};
    }
    else {
        var annotationData = _.keyBy(expSet.expGroupList, 'expGroupType');
        return annotationData;
    }
};
/**
 * ExpAssay.load.createBaseExpAssayView
 * Create the default html view for the Exp Assay
 * TODO - Create a file resolver to allow for customized templates
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param {RnaiWellCollection} wellData
 * /common/views/exp/assay/worm/RnaiLibrary/expAssay-rnailibrary-ahringer2-primary-permissive.mustache
 */
// return ExpAssay.load.genHtmlView(workflowData, screenData, plateData, wellData, annotationData);
ExpAssay.load.genHtmlView = function (workflowData, screenData, plateData, wellData, annotationData) {
    var templateName = workflowData.librarycode + "-" + workflowData.screenStage + "-" + workflowData.screenType + ".mustache";
    var templateFile = path.join(path.dirname(__filename), "../../../../../common/views/exp/assay/" + workflowData.biosampleType + "/" + workflowData.libraryModel + "/expAssay-" + templateName);
    //TODO Generate WpUrl for Plate
    var table = app.models.WpTerms.load.genTermTable(wellData.annotationData.taxTerms);
    return new Promise(function (resolve, reject) {
        readFile(templateFile, 'utf8')
            .then(function (contents) {
            var assayView = Mustache.render(contents, {
                wellData: wellData,
                expPlate: plateData.expPlate,
                workflowData: workflowData,
                annotationData: annotationData,
                table: table,
                hasTaxTerm: !wellData.annotationData.taxTerm.match('L4440') || wellData.annotationData.taxTerm.match('empty'),
            });
            resolve(assayView);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Here is where the content is actually loaded into the Wordpress WpPosts table
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection} plateData
 * @param {RnaiWellCollection} wellData
 * @param {string} postContent
 */
ExpAssay.load.workflows.createWpPosts = function (workflowData, plateData, wellData, postContent) {
    return new Promise(function (resolve, reject) {
        var plateId = plateData.expPlate.plateId;
        var title = plateId + "-" + wellData.expAssay.assayCodeName;
        var assayImagePath = wellData.expAssay.assayImagePath || plateData.expPlate.plateImagePath + "/" + plateData.expPlate.barcode + "_" + wellData.stockLibraryData.well;
        var postData = {
            viewType: workflowData.assayViewType,
            title: title,
            titleSlug: slug(title),
            postContent: postContent,
            imagePath: assayImagePath + ".jpeg",
        };
        app.models.WpPosts.load.workflows.createPost(workflowData, postData)
            .then(function (result) {
            //genImagePost resolves both the assayPost and the imagePost
            //Need to associate tax terms to each of them
            return app.models.WpPosts.load.workflows.genImagePost(result, postData);
        })
            .then(function (postData) {
            return ExpAssay.load.updateExpAssay(wellData, postData);
        })
            .then(function (postData) {
            resolve(postData);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Once we have the created the expAssay interface, update the ResultSet with the post Id
 * @param {RnaiWellCollection} wellData
 * @param postData
 */
ExpAssay.load.updateExpAssay = function (wellData, postData) {
    return new Promise(function (resolve, reject) {
        wellData.expAssay.assayWpAssayPostId = postData.postData.id;
        ExpAssay.upsert(wellData.expAssay)
            .then(function (results) {
            wellData.expAssay = results;
            resolve(postData);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Annotation data gets preprocessed at the end of each plate
 * plateData.annotationData is an array of taxonomy -> termIds relationships
 * In Annotation Data it looks like this
 * {
    "termTaxonomyId": 106,
    "termId": 52,
    "taxonomy": "envira-tag",
    "description": "",
    "parent": 0,
    "count": 1,
    "term": "SI-1_SS-primary_BS-1_TT-empty_W-A12"
  },
 * It gets related to the post in a WpTermRelationshipsResultSet
 {
     termTaxonomyId: termTax.termTaxonomyId,
     termOrder: 0,
     objectId: termTax.postId,
 };
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection} plateData
 * @param {RnaiWellCollection} wellData
 * @param postsResults
 */
ExpAssay.load.relateTaxToPost = function (workflowData, plateData, wellData) {
    var results = _.map(wellData.annotationData.taxTerms, function (taxTerm) {
        return _.filter(plateData.annotationData.taxTerms, function (taxTermResultSet) {
            return _.isEqual(String(taxTermResultSet.term), String(taxTerm.taxTerm)) && _.isEqual(String(taxTermResultSet.taxonomy), String(taxTerm.taxonomy));
        });
    });
    var flat = _.flatten(results);
    return _.filter(flat, function (res) {
        return !_.isEmpty(res);
    });
};
/**
 * This associates the post to the taxonomy terms
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection} plateData
 * @param {RnaiWellCollection} wellData
 * @param postData
 */
ExpAssay.load.workflows.createPostTaxRels = function (workflowData, plateData, wellData, postData) {
    return new Promise(function (resolve, reject) {
        var taxTerms = ExpAssay.load.relateTaxToPost(workflowData, plateData, wellData);
        Promise.map(Object.keys(postData), function (postType) {
            return app.models.WpTermRelationships.load
                .createRelationships(postData[postType].id, taxTerms);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
