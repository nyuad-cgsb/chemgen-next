"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var core_1 = require("@angular/core");
var BiosampleStockResultSet_1 = require("../../models/BiosampleStockResultSet");
var ChemicalLibraryResultSet_1 = require("../../models/ChemicalLibraryResultSet");
var ExpDesignResultSet_1 = require("../../models/ExpDesignResultSet");
var ExpGroupResultSet_1 = require("../../models/ExpGroupResultSet");
var ExpAssay2reagentResultSet_1 = require("../../models/ExpAssay2reagentResultSet");
var ExpScreenResultSet_1 = require("../../models/ExpScreenResultSet");
var ExpBiosampleResultSet_1 = require("../../models/ExpBiosampleResultSet");
var ExpPlateResultSet_1 = require("../../models/ExpPlateResultSet");
var ExpAssayResultSet_1 = require("../../models/ExpAssayResultSet");
var ReagentLibraryResultSet_1 = require("../../models/ReagentLibraryResultSet");
var RnaiLibraryResultSet_1 = require("../../models/RnaiLibraryResultSet");
var ChemicalLibraryStockResultSet_1 = require("../../models/ChemicalLibraryStockResultSet");
var RnaiLibraryStockResultSet_1 = require("../../models/RnaiLibraryStockResultSet");
var RnaiWormbaseXrefsResultSet_1 = require("../../models/RnaiWormbaseXrefsResultSet");
var PlateResultSet_1 = require("../../models/PlateResultSet");
var ExpScreenUploadWorkflowResultSet_1 = require("../../models/ExpScreenUploadWorkflowResultSet");
var WpTermsResultSet_1 = require("../../models/WpTermsResultSet");
var WpPostsResultSet_1 = require("../../models/WpPostsResultSet");
var WpPostmetaResultSet_1 = require("../../models/WpPostmetaResultSet");
var WpTermRelationshipsResultSet_1 = require("../../models/WpTermRelationshipsResultSet");
var WpTermTaxonomyResultSet_1 = require("../../models/WpTermTaxonomyResultSet");
var RnaiScreenUploadWorkflowResultSet_1 = require("../../models/RnaiScreenUploadWorkflowResultSet");
var ModelPredictedPhenoResultSet_1 = require("../../models/ModelPredictedPhenoResultSet");
var ModelPredictedCountsResultSet_1 = require("../../models/ModelPredictedCountsResultSet");
var PlatePlan96ResultSet_1 = require("../../models/PlatePlan96ResultSet");
var SDKModels = /** @class */ (function () {
    function SDKModels() {
        this.models = {
            BiosampleStockResultSet: BiosampleStockResultSet_1.BiosampleStockResultSet,
            ChemicalLibraryResultSet: ChemicalLibraryResultSet_1.ChemicalLibraryResultSet,
            ExpDesignResultSet: ExpDesignResultSet_1.ExpDesignResultSet,
            ExpGroupResultSet: ExpGroupResultSet_1.ExpGroupResultSet,
            ExpAssay2reagentResultSet: ExpAssay2reagentResultSet_1.ExpAssay2reagentResultSet,
            ExpScreenResultSet: ExpScreenResultSet_1.ExpScreenResultSet,
            ExpBiosampleResultSet: ExpBiosampleResultSet_1.ExpBiosampleResultSet,
            ExpPlateResultSet: ExpPlateResultSet_1.ExpPlateResultSet,
            ExpAssayResultSet: ExpAssayResultSet_1.ExpAssayResultSet,
            ReagentLibraryResultSet: ReagentLibraryResultSet_1.ReagentLibraryResultSet,
            RnaiLibraryResultSet: RnaiLibraryResultSet_1.RnaiLibraryResultSet,
            ChemicalLibraryStockResultSet: ChemicalLibraryStockResultSet_1.ChemicalLibraryStockResultSet,
            RnaiLibraryStockResultSet: RnaiLibraryStockResultSet_1.RnaiLibraryStockResultSet,
            RnaiWormbaseXrefsResultSet: RnaiWormbaseXrefsResultSet_1.RnaiWormbaseXrefsResultSet,
            PlateResultSet: PlateResultSet_1.PlateResultSet,
            ExpScreenUploadWorkflowResultSet: ExpScreenUploadWorkflowResultSet_1.ExpScreenUploadWorkflowResultSet,
            WpTermsResultSet: WpTermsResultSet_1.WpTermsResultSet,
            WpPostsResultSet: WpPostsResultSet_1.WpPostsResultSet,
            WpPostmetaResultSet: WpPostmetaResultSet_1.WpPostmetaResultSet,
            WpTermRelationshipsResultSet: WpTermRelationshipsResultSet_1.WpTermRelationshipsResultSet,
            WpTermTaxonomyResultSet: WpTermTaxonomyResultSet_1.WpTermTaxonomyResultSet,
            RnaiScreenUploadWorkflowResultSet: RnaiScreenUploadWorkflowResultSet_1.RnaiScreenUploadWorkflowResultSet,
            ModelPredictedPhenoResultSet: ModelPredictedPhenoResultSet_1.ModelPredictedPhenoResultSet,
            ModelPredictedCountsResultSet: ModelPredictedCountsResultSet_1.ModelPredictedCountsResultSet,
            PlatePlan96ResultSet: PlatePlan96ResultSet_1.PlatePlan96ResultSet,
        };
    }
    SDKModels.prototype.get = function (modelName) {
        return this.models[modelName];
    };
    SDKModels.prototype.getAll = function () {
        return this.models;
    };
    SDKModels.prototype.getModelNames = function () {
        return Object.keys(this.models);
    };
    SDKModels = __decorate([
        core_1.Injectable()
    ], SDKModels);
    return SDKModels;
}());
exports.SDKModels = SDKModels;
