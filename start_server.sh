#!/bin/bash

killall node
export NODE_OPTIONS=--openssl-legacy-provider
yarn start
