"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpAssayResultSet = /** @class */ (function () {
    function ExpAssayResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpAssayResultSet`.
     */
    ExpAssayResultSet.getModelName = function () {
        return "ExpAssay";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpAssayResultSet for dynamic purposes.
    **/
    ExpAssayResultSet.factory = function (data) {
        return new ExpAssayResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpAssayResultSet.getModelDefinition = function () {
        return {
            name: 'ExpAssayResultSet',
            plural: 'ExpAssaysResultSets',
            path: 'ExpAssays',
            idName: 'assayId',
            properties: {
                "assayId": {
                    name: 'assayId',
                    type: 'number'
                },
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "plateId": {
                    name: 'plateId',
                    type: 'number'
                },
                "biosampleId": {
                    name: 'biosampleId',
                    type: 'number'
                },
                "assayCodeName": {
                    name: 'assayCodeName',
                    type: 'string'
                },
                "assayWell": {
                    name: 'assayWell',
                    type: 'string'
                },
                "assayExpGroup": {
                    name: 'assayExpGroup',
                    type: 'number'
                },
                "assayReplicateNum": {
                    name: 'assayReplicateNum',
                    type: 'number'
                },
                "assayImagePath": {
                    name: 'assayImagePath',
                    type: 'string'
                },
                "assayWpAssayPostId": {
                    name: 'assayWpAssayPostId',
                    type: 'number'
                },
                "assayMeta": {
                    name: 'assayMeta',
                    type: 'string'
                },
                "expWorkflowId": {
                    name: 'expWorkflowId',
                    type: 'string'
                },
            },
            relations: {
                expBiosamples: {
                    name: 'expBiosamples',
                    type: 'ExpBiosampleResultSet[]',
                    model: 'ExpBiosample',
                    relationType: 'hasMany',
                    keyFrom: 'assayId',
                    keyTo: 'biosampleId'
                },
                expPlates: {
                    name: 'expPlates',
                    type: 'ExpPlateResultSet[]',
                    model: 'ExpPlate',
                    relationType: 'hasMany',
                    keyFrom: 'assayId',
                    keyTo: 'plateId'
                },
                expScreens: {
                    name: 'expScreens',
                    type: 'ExpScreenResultSet[]',
                    model: 'ExpScreen',
                    relationType: 'hasMany',
                    keyFrom: 'assayId',
                    keyTo: 'screenId'
                },
            }
        };
    };
    return ExpAssayResultSet;
}());
exports.ExpAssayResultSet = ExpAssayResultSet;
//# sourceMappingURL=ExpAssayResultSet.js.map