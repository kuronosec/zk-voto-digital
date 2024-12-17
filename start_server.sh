#!/bin/bash

killall node
export NODE_OPTIONS=--openssl-legacy-provider
cd src/file-server/
node index.js &
cd ../..
yarn start &
