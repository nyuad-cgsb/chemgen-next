/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ExpDesignResultSetInterface {
  "expDesignId"?: number;
  "treatmentGroupId": number;
  "controlGroupId"?: number;
}

export class ExpDesignResultSet implements ExpDesignResultSetInterface {
  "expDesignId": number;
  "treatmentGroupId": number;
  "controlGroupId": number;
  constructor(data?: ExpDesignResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpDesignResultSet`.
   */
  public static getModelName() {
    return "ExpDesign";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpDesignResultSet for dynamic purposes.
  **/
  public static factory(data: ExpDesignResultSetInterface): ExpDesignResultSet{
    return new ExpDesignResultSet(data);
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
      name: 'ExpDesignResultSet',
      plural: 'ExpDesignsResultSets',
      path: 'ExpDesigns',
      idName: 'expDesignId',
      properties: {
        "expDesignId": {
          name: 'expDesignId',
          type: 'number'
        },
        "treatmentGroupId": {
          name: 'treatmentGroupId',
          type: 'number'
        },
        "controlGroupId": {
          name: 'controlGroupId',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
