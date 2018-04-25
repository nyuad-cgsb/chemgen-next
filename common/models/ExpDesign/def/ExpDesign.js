'use strict'

module.exports = function (ExpDesign) {
  ExpDesign.helpers = {}
  ExpDesign.load = {}
  ExpDesign.load.primary = {}
  ExpDesign.load.secondary = {}
  ExpDesign.load.workflows = {}
  ExpDesign.extract = {}
  ExpDesign.extract.workflows = {}
  ExpDesign.transform = {}
  ExpDesign.transform.workflows = {}


  ExpDesign.on('attached', function () {
    require('../load/ExpDesign')
    require('../transform/ExpDesign')
    require('../extract/ExpDesign')
  })
}
