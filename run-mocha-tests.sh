#!/usr/bin/env bash

export NODE_ENV='test'

## Ports
export SERVER_PORT=3000

export wpUrl="http://onyx.abudhabi.nyu.edu/wordpress"

#PROJECTDIR=/home/jillian/Dropbox/projects/NY/chemgen/chemgen-next

cd ..
RSYNC="rsync -avz -e 'ssh -p 4410' ./chemgen-next jdr400@onyx.abudhabi.nyu.edu:/home/jdr400/projects/"  
echo $RSYNC
rsync -avz -e 'ssh -p 4410' ./chemgen-next jdr400@onyx.abudhabi.nyu.edu:/home/jdr400/projects/ 
#rsync -avz -e 'ssh -p 4410' ./chemgen-next-ng jdr400@onyx.abudhabi.nyu.edu:/home/jdr400/projects/ 

#inotify-hookable \
#    --watch-directories '.' \
#    --watch-directories server \
#    --watch-directories common \
#    --watch-directories test \
#    --on-modify-command " find ./ -name '*.test.js' | grep -v node_modules | xargs mocha "

    #--on-modify-command "mocha --recursive --reporter nyan"
    #--on-modify-command "${RSYNC}; mocha --recursive --reporter nyan"
    #--on-modify-command "mocha --reporter spec --recursive --inspect-brk"
