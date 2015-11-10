#!/usr/bin/env node


/*
  Commander module for MP3 Downloader.
  Written by Jense5.
 */

(function() {
  var Downloader, components, specs;

  Downloader = require('./Downloader');

  components = require('minimist')(process.argv.slice(2));

  specs = components['_'].join(' ');

  Downloader.download(specs);

}).call(this);
