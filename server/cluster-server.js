let loopback = require('loopback')
const boot = require('loopback-boot')
const cluster = require('cluster')

const app = module.exports = loopback()
const instances = 2
const numCPUs = require('os').cpus().length

/**
 * This starts the server in multiprocess mode, one instance per count
 */

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)
  for (let i = 0; i < instances; i++) {
    cluster.fork()
    startAgenda()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`)
  })
} else {
  startApp();
  console.log(`Worker ${process.pid} started`)
}

function startApp () {
  app.start = function () {
    // start the web server
    startAgenda()
    return app.listen(() => {
      app.emit('started')
      const baseUrl = app.get('url').replace(/\/$/, '')
      console.log('Web server listening at: %s', baseUrl)
      if (app.get('loopback-component-explorer')) {
        const explorerPath = app.get('loopback-component-explorer').mountPath
        console.log('Browse your REST API at %s%s', baseUrl, explorerPath)
      }

    })
  }
  // Bootstrap the application, configure models, datasources and middleware.
  // Sub-apps like REST API are mounted via boot scripts.
  boot(app, __dirname, (err) => {
    if (err) throw err

    // start the server if `$ node server.js`
    if (require.main === module) {
      app.start()
    }
  })

}

function startAgenda () {
  app.agenda = require('../agenda/agenda')
  app.agenda.on('ready', function () {
    console.log('Agenda cluster ready!')
    //TODO set this up as a separate worker script
    app.agenda.processEvery('2 seconds')
    app.agenda.maxConcurrency(100)
    app.agenda.defaultConcurrency(20)
    app.agenda.start()
    //This just ensures the agenda cluster started
    app.agenda.now('testJob', {'hello': 'world'})
  })
}
