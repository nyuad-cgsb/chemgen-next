/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface PlatePlan96ResultSetInterface {
  "platePlanName"?: string;
  "platePlanUploadDate"?: Date;
  "libraryId"?: number;
  "A01"?: any;
  "A02"?: any;
  "A03"?: any;
  "A04"?: any;
  "A05"?: any;
  "A06"?: any;
  "A07"?: any;
  "A08"?: any;
  "A09"?: any;
  "A10"?: any;
  "A11"?: any;
  "A12"?: any;
  "B01"?: any;
  "B02"?: any;
  "B03"?: any;
  "B04"?: any;
  "B05"?: any;
  "B06"?: any;
  "B07"?: any;
  "B08"?: any;
  "B09"?: any;
  "B10"?: any;
  "B11"?: any;
  "B12"?: any;
  "C01"?: any;
  "C02"?: any;
  "C03"?: any;
  "C04"?: any;
  "C05"?: any;
  "C06"?: any;
  "C07"?: any;
  "C08"?: any;
  "C09"?: any;
  "C10"?: any;
  "C11"?: any;
  "C12"?: any;
  "D01"?: any;
  "D02"?: any;
  "D03"?: any;
  "D04"?: any;
  "D05"?: any;
  "D06"?: any;
  "D07"?: any;
  "D08"?: any;
  "D09"?: any;
  "D10"?: any;
  "D11"?: any;
  "D12"?: any;
  "E01"?: any;
  "E02"?: any;
  "E03"?: any;
  "E04"?: any;
  "E05"?: any;
  "E06"?: any;
  "E07"?: any;
  "E08"?: any;
  "E09"?: any;
  "E10"?: any;
  "E11"?: any;
  "E12"?: any;
  "F01"?: any;
  "F02"?: any;
  "F03"?: any;
  "F04"?: any;
  "F05"?: any;
  "F06"?: any;
  "F07"?: any;
  "F08"?: any;
  "F09"?: any;
  "F10"?: any;
  "F11"?: any;
  "F12"?: any;
  "G01"?: any;
  "G02"?: any;
  "G03"?: any;
  "G04"?: any;
  "G05"?: any;
  "G06"?: any;
  "G07"?: any;
  "G08"?: any;
  "G09"?: any;
  "G10"?: any;
  "G11"?: any;
  "G12"?: any;
  "H01"?: any;
  "H02"?: any;
  "H03"?: any;
  "H04"?: any;
  "H05"?: any;
  "H06"?: any;
  "H07"?: any;
  "H08"?: any;
  "H09"?: any;
  "H10"?: any;
  "H11"?: any;
  "H12"?: any;
  "id"?: any;
}

export class PlatePlan96ResultSet implements PlatePlan96ResultSetInterface {
  "platePlanName": string;
  "platePlanUploadDate": Date;
  "libraryId": number;
  "A01": any;
  "A02": any;
  "A03": any;
  "A04": any;
  "A05": any;
  "A06": any;
  "A07": any;
  "A08": any;
  "A09": any;
  "A10": any;
  "A11": any;
  "A12": any;
  "B01": any;
  "B02": any;
  "B03": any;
  "B04": any;
  "B05": any;
  "B06": any;
  "B07": any;
  "B08": any;
  "B09": any;
  "B10": any;
  "B11": any;
  "B12": any;
  "C01": any;
  "C02": any;
  "C03": any;
  "C04": any;
  "C05": any;
  "C06": any;
  "C07": any;
  "C08": any;
  "C09": any;
  "C10": any;
  "C11": any;
  "C12": any;
  "D01": any;
  "D02": any;
  "D03": any;
  "D04": any;
  "D05": any;
  "D06": any;
  "D07": any;
  "D08": any;
  "D09": any;
  "D10": any;
  "D11": any;
  "D12": any;
  "E01": any;
  "E02": any;
  "E03": any;
  "E04": any;
  "E05": any;
  "E06": any;
  "E07": any;
  "E08": any;
  "E09": any;
  "E10": any;
  "E11": any;
  "E12": any;
  "F01": any;
  "F02": any;
  "F03": any;
  "F04": any;
  "F05": any;
  "F06": any;
  "F07": any;
  "F08": any;
  "F09": any;
  "F10": any;
  "F11": any;
  "F12": any;
  "G01": any;
  "G02": any;
  "G03": any;
  "G04": any;
  "G05": any;
  "G06": any;
  "G07": any;
  "G08": any;
  "G09": any;
  "G10": any;
  "G11": any;
  "G12": any;
  "H01": any;
  "H02": any;
  "H03": any;
  "H04": any;
  "H05": any;
  "H06": any;
  "H07": any;
  "H08": any;
  "H09": any;
  "H10": any;
  "H11": any;
  "H12": any;
  "id": any;
  constructor(data?: PlatePlan96ResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `PlatePlan96ResultSet`.
   */
  public static getModelName() {
    return "PlatePlan96";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of PlatePlan96ResultSet for dynamic purposes.
  **/
  public static factory(data: PlatePlan96ResultSetInterface): PlatePlan96ResultSet{
    return new PlatePlan96ResultSet(data);
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
      name: 'PlatePlan96ResultSet',
      plural: 'PlatePlan96sResultSets',
      path: 'PlatePlan96s',
      idName: 'id',
      properties: {
        "platePlanName": {
          name: 'platePlanName',
          type: 'string'
        },
        "platePlanUploadDate": {
          name: 'platePlanUploadDate',
          type: 'Date'
        },
        "libraryId": {
          name: 'libraryId',
          type: 'number'
        },
        "A01": {
          name: 'A01',
          type: 'any'
        },
        "A02": {
          name: 'A02',
          type: 'any'
        },
        "A03": {
          name: 'A03',
          type: 'any'
        },
        "A04": {
          name: 'A04',
          type: 'any'
        },
        "A05": {
          name: 'A05',
          type: 'any'
        },
        "A06": {
          name: 'A06',
          type: 'any'
        },
        "A07": {
          name: 'A07',
          type: 'any'
        },
        "A08": {
          name: 'A08',
          type: 'any'
        },
        "A09": {
          name: 'A09',
          type: 'any'
        },
        "A10": {
          name: 'A10',
          type: 'any'
        },
        "A11": {
          name: 'A11',
          type: 'any'
        },
        "A12": {
          name: 'A12',
          type: 'any'
        },
        "B01": {
          name: 'B01',
          type: 'any'
        },
        "B02": {
          name: 'B02',
          type: 'any'
        },
        "B03": {
          name: 'B03',
          type: 'any'
        },
        "B04": {
          name: 'B04',
          type: 'any'
        },
        "B05": {
          name: 'B05',
          type: 'any'
        },
        "B06": {
          name: 'B06',
          type: 'any'
        },
        "B07": {
          name: 'B07',
          type: 'any'
        },
        "B08": {
          name: 'B08',
          type: 'any'
        },
        "B09": {
          name: 'B09',
          type: 'any'
        },
        "B10": {
          name: 'B10',
          type: 'any'
        },
        "B11": {
          name: 'B11',
          type: 'any'
        },
        "B12": {
          name: 'B12',
          type: 'any'
        },
        "C01": {
          name: 'C01',
          type: 'any'
        },
        "C02": {
          name: 'C02',
          type: 'any'
        },
        "C03": {
          name: 'C03',
          type: 'any'
        },
        "C04": {
          name: 'C04',
          type: 'any'
        },
        "C05": {
          name: 'C05',
          type: 'any'
        },
        "C06": {
          name: 'C06',
          type: 'any'
        },
        "C07": {
          name: 'C07',
          type: 'any'
        },
        "C08": {
          name: 'C08',
          type: 'any'
        },
        "C09": {
          name: 'C09',
          type: 'any'
        },
        "C10": {
          name: 'C10',
          type: 'any'
        },
        "C11": {
          name: 'C11',
          type: 'any'
        },
        "C12": {
          name: 'C12',
          type: 'any'
        },
        "D01": {
          name: 'D01',
          type: 'any'
        },
        "D02": {
          name: 'D02',
          type: 'any'
        },
        "D03": {
          name: 'D03',
          type: 'any'
        },
        "D04": {
          name: 'D04',
          type: 'any'
        },
        "D05": {
          name: 'D05',
          type: 'any'
        },
        "D06": {
          name: 'D06',
          type: 'any'
        },
        "D07": {
          name: 'D07',
          type: 'any'
        },
        "D08": {
          name: 'D08',
          type: 'any'
        },
        "D09": {
          name: 'D09',
          type: 'any'
        },
        "D10": {
          name: 'D10',
          type: 'any'
        },
        "D11": {
          name: 'D11',
          type: 'any'
        },
        "D12": {
          name: 'D12',
          type: 'any'
        },
        "E01": {
          name: 'E01',
          type: 'any'
        },
        "E02": {
          name: 'E02',
          type: 'any'
        },
        "E03": {
          name: 'E03',
          type: 'any'
        },
        "E04": {
          name: 'E04',
          type: 'any'
        },
        "E05": {
          name: 'E05',
          type: 'any'
        },
        "E06": {
          name: 'E06',
          type: 'any'
        },
        "E07": {
          name: 'E07',
          type: 'any'
        },
        "E08": {
          name: 'E08',
          type: 'any'
        },
        "E09": {
          name: 'E09',
          type: 'any'
        },
        "E10": {
          name: 'E10',
          type: 'any'
        },
        "E11": {
          name: 'E11',
          type: 'any'
        },
        "E12": {
          name: 'E12',
          type: 'any'
        },
        "F01": {
          name: 'F01',
          type: 'any'
        },
        "F02": {
          name: 'F02',
          type: 'any'
        },
        "F03": {
          name: 'F03',
          type: 'any'
        },
        "F04": {
          name: 'F04',
          type: 'any'
        },
        "F05": {
          name: 'F05',
          type: 'any'
        },
        "F06": {
          name: 'F06',
          type: 'any'
        },
        "F07": {
          name: 'F07',
          type: 'any'
        },
        "F08": {
          name: 'F08',
          type: 'any'
        },
        "F09": {
          name: 'F09',
          type: 'any'
        },
        "F10": {
          name: 'F10',
          type: 'any'
        },
        "F11": {
          name: 'F11',
          type: 'any'
        },
        "F12": {
          name: 'F12',
          type: 'any'
        },
        "G01": {
          name: 'G01',
          type: 'any'
        },
        "G02": {
          name: 'G02',
          type: 'any'
        },
        "G03": {
          name: 'G03',
          type: 'any'
        },
        "G04": {
          name: 'G04',
          type: 'any'
        },
        "G05": {
          name: 'G05',
          type: 'any'
        },
        "G06": {
          name: 'G06',
          type: 'any'
        },
        "G07": {
          name: 'G07',
          type: 'any'
        },
        "G08": {
          name: 'G08',
          type: 'any'
        },
        "G09": {
          name: 'G09',
          type: 'any'
        },
        "G10": {
          name: 'G10',
          type: 'any'
        },
        "G11": {
          name: 'G11',
          type: 'any'
        },
        "G12": {
          name: 'G12',
          type: 'any'
        },
        "H01": {
          name: 'H01',
          type: 'any'
        },
        "H02": {
          name: 'H02',
          type: 'any'
        },
        "H03": {
          name: 'H03',
          type: 'any'
        },
        "H04": {
          name: 'H04',
          type: 'any'
        },
        "H05": {
          name: 'H05',
          type: 'any'
        },
        "H06": {
          name: 'H06',
          type: 'any'
        },
        "H07": {
          name: 'H07',
          type: 'any'
        },
        "H08": {
          name: 'H08',
          type: 'any'
        },
        "H09": {
          name: 'H09',
          type: 'any'
        },
        "H10": {
          name: 'H10',
          type: 'any'
        },
        "H11": {
          name: 'H11',
          type: 'any'
        },
        "H12": {
          name: 'H12',
          type: 'any'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
      },
      relations: {
      }
    }
  }
}
