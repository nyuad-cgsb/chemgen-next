'use strict'

module.exports = function (app) {
  const Agendash = require('agendash')
  const agenda = app.agenda

  agenda.on('ready', function () {
    app.use('/agendash', Agendash(agenda))
  })
}
