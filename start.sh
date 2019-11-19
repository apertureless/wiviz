#!/bin/sh

# Parse file

node parse.js

# Start python server

python -m SimpleHTTPServer 3000
