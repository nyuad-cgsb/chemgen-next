"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpAssay2reagentResultSet = /** @class */ (function () {
    function ExpAssay2reagentResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpAssay2reagentResultSet`.
     */
    ExpAssay2reagentResultSet.getModelName = function () {
        return "ExpAssay2reagent";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpAssay2reagentResultSet for dynamic purposes.
    **/
    ExpAssay2reagentResultSet.factory = function (data) {
        return new ExpAssay2reagentResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpAssay2reagentResultSet.getModelDefinition = function () {
        return {
            name: 'ExpAssay2reagentResultSet',
            plural: 'ExpAssay2reagentsResultSets',
            path: 'ExpAssay2reagents',
            idName: 'assay2reagentId',
            properties: {
                "assay2reagentId": {
                    name: 'assay2reagentId',
                    type: 'number'
                },
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "libraryId": {
                    name: 'libraryId',
                    type: 'number'
                },
                "plateId": {
                    name: 'plateId',
                    type: 'number'
                },
                "assayId": {
                    name: 'assayId',
                    type: 'number'
                },
                "stockId": {
                    name: 'stockId',
                    type: 'number'
                },
                "reagentId": {
                    name: 'reagentId',
                    type: 'number'
                },
                "parentLibraryPlate": {
                    name: 'parentLibraryPlate',
                    type: 'string'
                },
                "parentLibraryWell": {
                    name: 'parentLibraryWell',
                    type: 'string'
                },
                "stockLibraryWell": {
                    name: 'stockLibraryWell',
                    type: 'string'
                },
                "reagentName": {
                    name: 'reagentName',
                    type: 'string'
                },
                "reagentType": {
                    name: 'reagentType',
                    type: 'string'
                },
                "reagentTable": {
                    name: 'reagentTable',
                    type: 'string'
                },
                "assay2reagentMeta": {
                    name: 'assay2reagentMeta',
                    type: 'string'
                },
            },
            relations: {
                expScreens: {
                    name: 'expScreens',
                    type: 'ExpScreenResultSet[]',
                    model: 'ExpScreen',
                    relationType: 'hasMany',
                    keyFrom: 'assay2reagentId',
                    keyTo: 'screenId'
                },
                expPlates: {
                    name: 'expPlates',
                    type: 'ExpPlateResultSet[]',
                    model: 'ExpPlate',
                    relationType: 'hasMany',
                    keyFrom: 'assay2reagentId',
                    keyTo: 'plateId'
                },
                expAssays: {
                    name: 'expAssays',
                    type: 'ExpAssayResultSet[]',
                    model: 'ExpAssay',
                    relationType: 'hasMany',
                    keyFrom: 'assay2reagentId',
                    keyTo: 'assayId'
                },
                reagentLibrarys: {
                    name: 'reagentLibrarys',
                    type: 'ReagentLibraryResultSet[]',
                    model: 'ReagentLibrary',
                    relationType: 'hasMany',
                    keyFrom: 'assay2reagentId',
                    keyTo: 'libraryId'
                },
            }
        };
    };
    return ExpAssay2reagentResultSet;
}());
exports.ExpAssay2reagentResultSet = ExpAssay2reagentResultSet;
//# sourceMappingURL=ExpAssay2reagentResultSet.js.map