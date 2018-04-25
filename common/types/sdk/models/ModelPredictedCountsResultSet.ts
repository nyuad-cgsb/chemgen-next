/* tslint:disable */
import {
  ExpAssay2reagentResultSet,
  ExpAssayResultSet,
  ExpPlateResultSet,
  ExpScreenResultSet
} from '../index';

/* Jillian */
declare var Object: any;
export interface ModelPredictedCountsResultSetInterface {
  "id"?: number;
  "modelId"?: number;
  "screenId"?: number;
  "plateId"?: number;
  "assayId"?: number;
  "reagentId"?: number;
  "assayImagePath"?: string;
  "wormCount"?: number;
  "larvaCount"?: number;
  "eggCount"?: number;
  "percEmbLeth"?: number;
  expAssay2reagents?: ExpAssay2reagentResultSet[];
  expAssays?: ExpAssayResultSet[];
  expPlates?: ExpPlateResultSet[];
  expScreens?: ExpScreenResultSet[];
}

export class ModelPredictedCountsResultSet implements ModelPredictedCountsResultSetInterface {
  "id": number;
  "modelId": number;
  "screenId": number;
  "plateId": number;
  "assayId": number;
  "reagentId": number;
  "assayImagePath": string;
  "wormCount": number;
  "larvaCount": number;
  "eggCount": number;
  "percEmbLeth": number;
  expAssay2reagents: ExpAssay2reagentResultSet[];
  expAssays: ExpAssayResultSet[];
  expPlates: ExpPlateResultSet[];
  expScreens: ExpScreenResultSet[];
  constructor(data?: ModelPredictedCountsResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ModelPredictedCountsResultSet`.
   */
  public static getModelName() {
    return "ModelPredictedCounts";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ModelPredictedCountsResultSet for dynamic purposes.
  **/
  public static factory(data: ModelPredictedCountsResultSetInterface): ModelPredictedCountsResultSet{
    return new ModelPredictedCountsResultSet(data);
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
      name: 'ModelPredictedCountsResultSet',
      plural: 'ModelPredictedCountsResultSets',
      path: 'ModelPredictedCounts',
      idName: 'id',
      properties: {
        "id": {
          name: 'id',
          type: 'number'
        },
        "modelId": {
          name: 'modelId',
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
        "reagentId": {
          name: 'reagentId',
          type: 'number'
        },
        "assayImagePath": {
          name: 'assayImagePath',
          type: 'string'
        },
        "wormCount": {
          name: 'wormCount',
          type: 'number'
        },
        "larvaCount": {
          name: 'larvaCount',
          type: 'number'
        },
        "eggCount": {
          name: 'eggCount',
          type: 'number'
        },
        "percEmbLeth": {
          name: 'percEmbLeth',
          type: 'number'
        },
      },
      relations: {
        expAssay2reagents: {
          name: 'expAssay2reagents',
          type: 'ExpAssay2reagentResultSet[]',
          model: 'ExpAssay2reagent',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'assayId'
        },
        expAssays: {
          name: 'expAssays',
          type: 'ExpAssayResultSet[]',
          model: 'ExpAssay',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'assayId'
        },
        expPlates: {
          name: 'expPlates',
          type: 'ExpPlateResultSet[]',
          model: 'ExpPlate',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'plateId'
        },
        expScreens: {
          name: 'expScreens',
          type: 'ExpScreenResultSet[]',
          model: 'ExpScreen',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'screenId'
        },
      }
    }
  }
}
