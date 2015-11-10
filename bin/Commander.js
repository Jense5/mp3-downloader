#!/usr/bin/env node


/*
  Commander module for MP3 Downloader.
  Written by Jense5.
 */

(function() {
  var Downloader, components, specs, winston;

  winston = require('winston');

  Downloader = require('./Downloader');

  components = require('minimist')(process.argv.slice(2));

  winston.level = 'error';

  if (components['verbose']) {
    winston.level = 'info';
  }

  specs = components['_'].join(' ');

  Downloader.download(specs);

}).call(this);
