const loopback = require('loopback')
const boot = require('loopback-boot')
let cluster = require('express-cluster')

const app = module.exports = loopback()
const instances = 5

app.agenda = require('../agenda/agenda')

/**
 * This starts the server in multiprocess mode, one instance per count
 */
cluster(function (worker) {
  app.start = function () {
    // start the web server
    return app.listen(() => {
      app.emit('started')
      const baseUrl = app.get('url').replace(/\/$/, '')
      console.log('Web server listening at: %s', baseUrl)
      if (app.get('loopback-component-explorer')) {
        const explorerPath = app.get('loopback-component-explorer').mountPath
        console.log('Browse your REST API at %s%s', baseUrl, explorerPath)
      }

      app.agenda.on('ready', function () {
        console.log('Agenda cluster ready!')
        //TODO set this up as a separate worker script
        app.agenda.processEvery('2 seconds')
        app.agenda.maxConcurrency(100)
        app.agenda.defaultConcurrency(20)
        app.agenda.start()
      })

    })
  }
  // Bootstrap the application, configure models, datasources and middleware.
  // Sub-apps like REST API are mounted via boot scripts.
  boot(app, __dirname, (err) => {
    if (err) throw err

    // start the server if `$ node server.js`
    if (require.main === module) { app.start() }
  })
}, {count: instances})
