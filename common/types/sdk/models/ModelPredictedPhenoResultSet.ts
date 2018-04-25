/* tslint:disable */
import {
  ExpAssay2reagentResultSet,
  ExpAssayResultSet,
  ExpPlateResultSet,
  ExpScreenResultSet
} from '../index';

/* Jillian */
declare var Object: any;
export interface ModelPredictedPhenoResultSetInterface {
  "id"?: number;
  "modelId"?: number;
  "screenId"?: number;
  "plateId"?: number;
  "assayId"?: number;
  "reagentId"?: number;
  "assayImagePath"?: string;
  "conclusion"?: string;
  "modelPredictedPhenoMeta"?: string;
  expAssay2reagents?: ExpAssay2reagentResultSet[];
  expAssays?: ExpAssayResultSet[];
  expPlates?: ExpPlateResultSet[];
  expScreens?: ExpScreenResultSet[];
}

export class ModelPredictedPhenoResultSet implements ModelPredictedPhenoResultSetInterface {
  "id": number;
  "modelId": number;
  "screenId": number;
  "plateId": number;
  "assayId": number;
  "reagentId": number;
  "assayImagePath": string;
  "conclusion": string;
  "modelPredictedPhenoMeta": string;
  expAssay2reagents: ExpAssay2reagentResultSet[];
  expAssays: ExpAssayResultSet[];
  expPlates: ExpPlateResultSet[];
  expScreens: ExpScreenResultSet[];
  constructor(data?: ModelPredictedPhenoResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ModelPredictedPhenoResultSet`.
   */
  public static getModelName() {
    return "ModelPredictedPheno";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ModelPredictedPhenoResultSet for dynamic purposes.
  **/
  public static factory(data: ModelPredictedPhenoResultSetInterface): ModelPredictedPhenoResultSet{
    return new ModelPredictedPhenoResultSet(data);
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
      name: 'ModelPredictedPhenoResultSet',
      plural: 'ModelPredictedPhenosResultSets',
      path: 'ModelPredictedPhenos',
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
        "conclusion": {
          name: 'conclusion',
          type: 'string'
        },
        "modelPredictedPhenoMeta": {
          name: 'modelPredictedPhenoMeta',
          type: 'string'
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
