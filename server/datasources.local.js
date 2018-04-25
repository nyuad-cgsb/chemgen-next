'use strict'

module.exports = {
  db: {
    name: 'db',
    connector: 'memory'
  },
  arrayscanDS: {
    name: 'arrayscanDS',
    connector: 'mssql',
    port: 1433,
    database: process.env.ARRAYSCAN_DB,
    password: process.env.ARRAYSCAN_PASS,
    host: process.env.ARRAYSCAN_HOST,
    user: process.env.ARRAYSCAN_USER
  },
  chemgenDS: {
    name: 'chemgenDS',
    connector: 'mysql',
    host: 'onyx.abudhabi.nyu.edu',
    port: 3306,
    url: process.env.CHEMGEN_URL,
    database: process.env.CHEMGEN_DB,
    password: process.env.CHEMGEN_PASS,
    user: process.env.CHEMGEN_USER
  },
  wordpressDS: {
    name: 'wordpressDS',
    connector: 'mysql',
    host: 'onyx.abudhabi.nyu.edu',
    port: 3306,
    database: process.env.WP_DB,
    password: process.env.WP_PASS,
    user: process.env.WP_USER
  },
  mongoDB: {
    name: 'mongoDB',
    connector: 'mongodb',
    port: 27017,
    url: process.env.MONGO_URL,
    database: process.env.MONGO_DB,
    password: process.env.MONGO_PASS,
    user: process.env.MONGO_USER
  }
}
