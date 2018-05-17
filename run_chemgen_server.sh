#!/usr/bin/env bash

### ArrayScan MSSQL DB
export ARRAYSCAN_DB="store"
export ARRAYSCAN_USER="mysqluser"
export ARRAYSCAN_HOST="10.230.9.202"
export ARRAYSCAN_PASS="password"

### ChemgenDB Mysql - Main Experimental DB
export CHEMGEN_HOST="onyx.abudhabi.nyu.edu"
export CHEMGEN_URL="mysql://chemgen_proto:chemGen123@onyx.abudhabi.nyu.edu/chemgen_proto"
export CHEMGEN_DB="chemgen_proto"
export CHEMGEN_USER="chemgen_proto"
export CHEMGEN_PASS="chemGen123"

## Wordpress DB Mysql
export WP_HOST="onyx.abudhabi.nyu.edu"
export WP_PASS="chemGen123"
export WP_SITE="http://onyx.abudhabi.nyu.edu/wordpress"
export WP_DB="chemgen_wp_dev"
export WP_USER="chemgen_wp_dev"
#export WP_SITE="http://onyx.abudhabi.nyu.edu/chemgen-next"
#export WP_DB="chemgen_next_wp"
#export WP_USER="chemgen_next_wp"

## MongoDB - miscalleneous things!
export MONGO_HOST="onyx.abudhabi.nyu.edu"
export MONGO_URL="mongodb://admin:admin123@10.230.9.222/chemgen"
export MONGO_DB="chemgen"
export MONGO_USER="chemgen"
export MONGO_PASS="chemGen123"
