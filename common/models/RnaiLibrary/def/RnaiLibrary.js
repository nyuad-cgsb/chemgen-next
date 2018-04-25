'use strict'

module.exports = function (RnaiLibrary) {
  RnaiLibrary.helpers = {}
  RnaiLibrary.helpers.primary = {}
  RnaiLibrary.helpers.secondary = {}
  RnaiLibrary.load = {}
  RnaiLibrary.load.workflows = {}
  RnaiLibrary.extract = {}
  RnaiLibrary.extract.primary = {}
  RnaiLibrary.extract.workflows = {}
  RnaiLibrary.transform = {}
  RnaiLibrary.transform.workflows = {}

  RnaiLibrary.on('attached', function () {
    require('../load/RnaiLibrary')
    require('../extract/RnaiLibrary')
    require('../extract/primary/RnaiLibrary')
    require('../helpers/RnaiLibrary')
  })
}
