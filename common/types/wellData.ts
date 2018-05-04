import {
  ExpAssay2reagentResultSet,
  ExpAssayResultSet, ExpDesignResultSet, ExpGroupResultSet, ModelPredictedPhenoResultSet,
  RnaiLibraryResultSet, WpTermTaxonomyResultSet
} from "./sdk/models";
import {RnaiLibraryStockResultSet} from "./sdk/models";
import {ChemicalLibraryResultSet, ChemicalLibraryStockResultSet, ExpPlateResultSet} from "./sdk/models";

declare var Object: any;
export interface annotationDataInterface {
 geneName?: string;
 taxTerm?: string;
 taxTerms: Array<any> | WpTermTaxonomyResultSet[];
}

export class annotationData {
  geneName?: string;
  taxTerm?: string;
  taxTerms: Array<any> ;
  constructor(data?: annotationDataInterface) {
    Object.assign(this, data);
  }
}

export interface RnaiWellDataInterface {
  well?: string;
  parentLibraryData?: RnaiLibraryResultSet | ChemicalLibraryResultSet;
  stockLibraryData?: RnaiLibraryStockResultSet | ChemicalLibraryStockResultSet;
  annotationData?: annotationDataInterface;
  expGroup?: ExpGroupResultSet;
  expAssay?: ExpAssayResultSet;
  expAssay2reagent?: ExpAssay2reagentResultSet;
  modelPredictedPheno?: ModelPredictedPhenoResultSet;
}

export class RnaiWellCollection {
  well?: string;
  parentLibraryData: RnaiLibraryResultSet | ChemicalLibraryResultSet;
  stockLibraryData: RnaiLibraryStockResultSet | ChemicalLibraryStockResultSet;
  expGroup?: ExpGroupResultSet;
  annotationData?: annotationDataInterface;
  expAssay?: ExpAssayResultSet;
  expAssay2reagent?: ExpAssay2reagentResultSet;
  modelPredictedPheno?: ModelPredictedPhenoResultSet;
  constructor(data?: RnaiWellDataInterface) {
    Object.assign(this, data);
  }
}

export interface PlateDataInterface {
  wellDataList: RnaiWellCollection[];
  expPlate: ExpPlateResultSet;
  annotationData?: annotationDataInterface;
}

export class PlateCollection {
  wellDataList: RnaiWellCollection[];
  expPlate: ExpPlateResultSet;
  annotationData?: annotationDataInterface;
  constructor(data?: PlateDataInterface) {
    Object.assign(this, data);
  }
}

export interface ScreenCollectionInterface{
  plateDataList: PlateCollection[];
  expDesignList?: ExpDesignResultSet[];
  expGroupList?: ExpGroupResultSet[];
  annotationData?: annotationDataInterface;
}

export class ScreenCollection {
  plateDataList: PlateCollection[];
  expDesignList?: ExpDesignResultSet[];
  expGroupList?: ExpGroupResultSet[];
  annotationData?: annotationDataInterface;
  constructor(data?: ScreenCollectionInterface) {
    Object.assign(this, data);
  }
}

export interface ExpSetInterface{
  expDesignList: ExpDesignResultSet[];
  expGroupList: ExpGroupResultSet[];
}

export class ExpSet {
  expDesignList: ExpDesignResultSet[];
  expGroupList: ExpGroupResultSet[];
  constructor(data?: ExpSetInterface){
    Object.assign(this, data);
  }
}

