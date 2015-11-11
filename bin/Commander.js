#!/usr/bin/env node


/*
  Commander module for MP3 Downloader.
  Written by Jense5.
 */

(function() {
  var Downloader, components, location, output, path, specs, winston;

  path = require('path');

  winston = require('winston');

  Downloader = require('./Downloader');

  components = require('minimist')(process.argv.slice(2));

  winston.level = 'error';

  if (components['verbose']) {
    winston.level = 'info';
  }

  specs = components['_'].join(' ');

  output = null;

  if (components['output'] != null) {
    output = components['output'];
  }

  if (components['output'] != null) {
    location = path.resolve(process.cwd(), output);
  }

  Downloader.download(specs, location);

}).call(this);
