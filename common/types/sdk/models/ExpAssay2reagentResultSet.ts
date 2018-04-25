/* tslint:disable */
import {
  ExpScreenResultSet,
  ExpPlateResultSet,
  ExpAssayResultSet
} from '../index';

/* Jillian */
declare var Object: any;
export interface ExpAssay2reagentResultSetInterface {
  "assay2reagentId"?: number;
  "screenId"?: number;
  "plateId"?: number;
  "assayId"?: number;
  "stockId"?: number;
  "reagentId"?: number;
  "parentLibraryPlate"?: string;
  "parentLibraryWell"?: string;
  "stockLibraryWell"?: string;
  "reagentName"?: string;
  "reagentType"?: string;
  "reagentTable"?: string;
  "assay2reagentMeta"?: string;
  expScreens?: ExpScreenResultSet[];
  expPlates?: ExpPlateResultSet[];
  expAssays?: ExpAssayResultSet[];
}

export class ExpAssay2reagentResultSet implements ExpAssay2reagentResultSetInterface {
  "assay2reagentId": number;
  "screenId": number;
  "plateId": number;
  "assayId": number;
  "stockId": number;
  "reagentId": number;
  "parentLibraryPlate": string;
  "parentLibraryWell": string;
  "stockLibraryWell": string;
  "reagentName": string;
  "reagentType": string;
  "reagentTable": string;
  "assay2reagentMeta": string;
  expScreens: ExpScreenResultSet[];
  expPlates: ExpPlateResultSet[];
  expAssays: ExpAssayResultSet[];
  constructor(data?: ExpAssay2reagentResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpAssay2reagentResultSet`.
   */
  public static getModelName() {
    return "ExpAssay2reagent";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpAssay2reagentResultSet for dynamic purposes.
  **/
  public static factory(data: ExpAssay2reagentResultSetInterface): ExpAssay2reagentResultSet{
    return new ExpAssay2reagentResultSet(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
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
      }
    }
  }
}
