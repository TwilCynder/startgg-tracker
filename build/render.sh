#!/usr/bin/env bash
mkdir -p $1/pages/rendered
node build/ejs.js $1
