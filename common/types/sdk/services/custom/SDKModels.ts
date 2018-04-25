/* tslint:disable */
import { Injectable } from '@angular/core';
import { BiosampleStockResultSet } from '../../models/BiosampleStockResultSet';
import { ChemicalLibraryResultSet } from '../../models/ChemicalLibraryResultSet';
import { ExpDesignResultSet } from '../../models/ExpDesignResultSet';
import { ExpGroupResultSet } from '../../models/ExpGroupResultSet';
import { ExpAssay2reagentResultSet } from '../../models/ExpAssay2reagentResultSet';
import { ExpScreenResultSet } from '../../models/ExpScreenResultSet';
import { ExpBiosampleResultSet } from '../../models/ExpBiosampleResultSet';
import { ExpPlateResultSet } from '../../models/ExpPlateResultSet';
import { ExpAssayResultSet } from '../../models/ExpAssayResultSet';
import { ReagentLibraryResultSet } from '../../models/ReagentLibraryResultSet';
import { RnaiLibraryResultSet } from '../../models/RnaiLibraryResultSet';
import { ChemicalLibraryStockResultSet } from '../../models/ChemicalLibraryStockResultSet';
import { RnaiLibraryStockResultSet } from '../../models/RnaiLibraryStockResultSet';
import { RnaiWormbaseXrefsResultSet } from '../../models/RnaiWormbaseXrefsResultSet';
import { PlateResultSet } from '../../models/PlateResultSet';
import { ExpScreenUploadWorkflowResultSet } from '../../models/ExpScreenUploadWorkflowResultSet';
import { WpTermsResultSet } from '../../models/WpTermsResultSet';
import { WpPostsResultSet } from '../../models/WpPostsResultSet';
import { WpPostmetaResultSet } from '../../models/WpPostmetaResultSet';
import { WpTermRelationshipsResultSet } from '../../models/WpTermRelationshipsResultSet';
import { WpTermTaxonomyResultSet } from '../../models/WpTermTaxonomyResultSet';
import { RnaiScreenUploadWorkflowResultSet } from '../../models/RnaiScreenUploadWorkflowResultSet';
import { ModelPredictedPhenoResultSet } from '../../models/ModelPredictedPhenoResultSet';
import { ModelPredictedCountsResultSet } from '../../models/ModelPredictedCountsResultSet';
import { PlatePlan96ResultSet } from '../../models/PlatePlan96ResultSet';

export interface Models { [name: string]: any }

@Injectable()
export class SDKModels {

  private models: Models = {
    BiosampleStockResultSet: BiosampleStockResultSet,
    ChemicalLibraryResultSet: ChemicalLibraryResultSet,
    ExpDesignResultSet: ExpDesignResultSet,
    ExpGroupResultSet: ExpGroupResultSet,
    ExpAssay2reagentResultSet: ExpAssay2reagentResultSet,
    ExpScreenResultSet: ExpScreenResultSet,
    ExpBiosampleResultSet: ExpBiosampleResultSet,
    ExpPlateResultSet: ExpPlateResultSet,
    ExpAssayResultSet: ExpAssayResultSet,
    ReagentLibraryResultSet: ReagentLibraryResultSet,
    RnaiLibraryResultSet: RnaiLibraryResultSet,
    ChemicalLibraryStockResultSet: ChemicalLibraryStockResultSet,
    RnaiLibraryStockResultSet: RnaiLibraryStockResultSet,
    RnaiWormbaseXrefsResultSet: RnaiWormbaseXrefsResultSet,
    PlateResultSet: PlateResultSet,
    ExpScreenUploadWorkflowResultSet: ExpScreenUploadWorkflowResultSet,
    WpTermsResultSet: WpTermsResultSet,
    WpPostsResultSet: WpPostsResultSet,
    WpPostmetaResultSet: WpPostmetaResultSet,
    WpTermRelationshipsResultSet: WpTermRelationshipsResultSet,
    WpTermTaxonomyResultSet: WpTermTaxonomyResultSet,
    RnaiScreenUploadWorkflowResultSet: RnaiScreenUploadWorkflowResultSet,
    ModelPredictedPhenoResultSet: ModelPredictedPhenoResultSet,
    ModelPredictedCountsResultSet: ModelPredictedCountsResultSet,
    PlatePlan96ResultSet: PlatePlan96ResultSet,
    
  };

  public get(modelName: string): any {
    return this.models[modelName];
  }

  public getAll(): Models {
    return this.models;
  }

  public getModelNames(): string[] {
    return Object.keys(this.models);
  }
}
