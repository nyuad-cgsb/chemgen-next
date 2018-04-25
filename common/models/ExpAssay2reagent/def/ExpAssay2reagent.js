'use strict'

module.exports = function (ExpAssay2reagent) {
  ExpAssay2reagent.helpers = {}
  ExpAssay2reagent.load = {}
  ExpAssay2reagent.load.primary = {}
  ExpAssay2reagent.load.secondary = {}
  ExpAssay2reagent.load.workflows = {}
  ExpAssay2reagent.extract = {}
  ExpAssay2reagent.extract.workflows = {}
  ExpAssay2reagent.transform = {}
  ExpAssay2reagent.transform.workflows = {}

  //EntryPoint for worm/cell/site/screenStage specific logic
  ExpAssay2reagent.load.resolveImagePath = {}
  ExpAssay2reagent.load.workflows.imageConversionPipeline = {}

  ExpAssay2reagent.on('attached', function () {
    require('../load/ExpAssay2reagent')
  })
}
