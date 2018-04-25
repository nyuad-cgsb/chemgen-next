'use strict'
const Promise = require('bluebird')

module.exports = function (ExpScreenUploadWorkflow) {
  ExpScreenUploadWorkflow.load = {}
  ExpScreenUploadWorkflow.load.workflows = {}
  ExpScreenUploadWorkflow.load.workflows.worms = {}
  ExpScreenUploadWorkflow.load.workflows.worms.primary = {}
  ExpScreenUploadWorkflow.load.workflows.worms.primary = {}
  ExpScreenUploadWorkflow.load = {}
  ExpScreenUploadWorkflow.load.workflows = {}
  ExpScreenUploadWorkflow.load.workflows.worms = {}
  ExpScreenUploadWorkflow.load.workflows.worms.secondary = {}

  ExpScreenUploadWorkflow.on('attached', function () {
    require('../load/ExpScreenUploadWorkflow')
    require('../experiment/worms/load/primary/ExpScreenUploadWorkflow')
  })

  ExpScreenUploadWorkflow.doWork = function (workflowData) {
    return new Promise((resolve, reject) => {
      // ExpScreenUploadWorkflow.load.workflows.worms.primary.doWork
      resolve({'status': 'ok'})
    })
  }

  ExpScreenUploadWorkflow.remoteMethod(
    'doWork', {
      http: {path: '/dowork', verb: 'post'},
      accepts: {arg: 'workflowData', type: 'any', http: {source: 'query'}},
      returns: {arg: 'status', type: 'string'}
    }
  )
}
