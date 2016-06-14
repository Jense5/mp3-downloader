
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

  if (components['version']) {
    console.log('Captusi v0.2.0');
    process.exit();
  }

  winston.level = 'error';

  if (components['verbose']) {
    winston.level = 'info';
  }

  if (components['_'].length === 0) {
    console.log('No query povided!');
    process.exit();
  }

  specs = components['_'][0];

  output = null;

  if (components['output'] != null) {
    output = components['output'];
  }

  if (components['output'] != null) {
    location = path.resolve(process.cwd(), output);
  }

  Downloader.download(specs, location);

}).call(this);
