
/*
  Downloader module for MP3 Downloader.
  Written by Jense5.
 */

(function() {
  var CORESOURCE, DEST, askForTrack, cheerio, download, downloadSTR, downloadTrack, fs, handleStatus, inquirer, request, scrape, winston;

  fs = require('fs');

  winston = require('winston');

  request = require('request');

  cheerio = require('cheerio');

  inquirer = require('inquirer');

  DEST = null;

  CORESOURCE = 'http://www.my-free-mp3.com/mp3/';

  handleStatus = function(error, response) {
    winston.info('Processing response...');
    if (error) {
      winston.error('Error: ' + error);
    }
    if (error) {
      process.exit();
    }
    winston.info('Status Code: ' + response.statusCode);
    if (response.statusCode !== 200) {
      winson.error('Invalid Status Code: ' + response.statusCode);
      return process.exit();
    }
  };

  download = function(uri, file, callback) {
    console.log('Download started.');
    return request.head(uri, function(error, response, content) {
      var stream;
      handleStatus(error, response);
      winston.info('Write Data to File');
      stream = fs.createWriteStream(file);
      return request(uri).pipe(stream).on('close', function() {
        return callback();
      });
    });
  };

  downloadTrack = function(name, url) {
    var URI, destination;
    winston.info('Start Track Download');
    URI = {
      url: url,
      headers: {
        'Accept': '*/*',
        'User-agent': 'Mozilla/5.0 (Macintosh)'
      }
    };
    winston.info('Created download headers.');
    destination = DEST;
    if (DEST == null) {
      destination = process.cwd() + '/' + name + '.mp3';
    }
    winston.info('Set path to ' + destination);
    return download(URI, destination, function() {
      return console.log('Done.');
    });
  };

  askForTrack = function(titles, links) {
    winston.info('Ask User Input');
    return inquirer.prompt([
      {
        type: 'confirm',
        name: 'ready',
        message: 'Multiple files found. You want to choose?'
      }, {
        when: function(response) {
          return response['ready'];
        },
        type: 'list',
        name: 'song',
        message: 'Choose a song to download:',
        choices: titles
      }
    ], function(result) {
      var name, source;
      if (result['ready']) {
        winston.info('Received Choice: ' + result['song']);
        name = result['song'];
        source = links[titles.indexOf(name)];
        request(source, function(error, response, html) {
          var downloadLocation;
          handleStatus(error, response);
          downloadLocation = html.match(/window.open\("(.)*"\);/g)[0].slice(13, -4);
          winston.info('Should Download: ' + downloadLocation);
          return downloadTrack(name, downloadLocation);
        });
      }
      if (!result['ready']) {
        return console.log('Done.');
      }
    });
  };

  scrape = function(source) {
    winston.info('Fetch Source: ' + source);
    return request(source, function(error, response, html) {
      var $, downloads, newdata, ref, titles;
      handleStatus(error, response);
      $ = cheerio.load(html);
      winston.info('Converted Source to Cheerio');
      newdata = $('.playlist').find('.track');
      ref = [[], []], titles = ref[0], downloads = ref[1];
      winston.info('Fetched Elements');
      newdata.each(function(i, element) {
        var newArtist, newTrack;
        newTrack = $(element).find('.name').text().trim();
        newArtist = $(element).find('.artist').text().trim();
        titles.push(newTrack + ' - ' + newArtist);
        return downloads.push($(element).find('.dw').attr('onclick').trim().slice(13, -12));
      });
      if (titles.length > 0) {
        return askForTrack(titles, downloads);
      } else {
        return console.log('No results found.');
      }
    });
  };

  downloadSTR = function(str, pth) {
    if (pth != null) {
      DEST = pth;
    }
    winston.info('Download query: ' + str);
    winston.info('Path set: ' + DEST);
    return scrape(CORESOURCE + encodeURIComponent(str));
  };

  module.exports.download = downloadSTR;

}).call(this);
