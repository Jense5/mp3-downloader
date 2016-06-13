
/*
  Downloader module for MP3 Downloader.
  Written by Jense5.
 */

(function() {
  var DEST, askForTrack, cheerio, download, downloadSTR, downloadTrack, fs, inquirer, request, scrape, winston;

  fs = require('fs');

  winston = require('winston');

  request = require('request');

  cheerio = require('cheerio');

  inquirer = require('inquirer');

  DEST = null;

  download = function(uri, file, callback) {
    winston.info('Download started.');
    console.log('Download started.');
    return request.head(uri, function(error, response, content) {
      var stream;
      winston.info('Data received, writing to file.');
      stream = fs.createWriteStream(file);
      return request(uri).pipe(stream).on('close', function() {
        winston.info('Wrote data.');
        return callback();
      });
    });
  };

  downloadTrack = function(name, url) {
    var URI, destination;
    winston.info('Going to download track.');
    URI = {
      url: url,
      headers: {
        'Accept': '*/*',
        'Referer': 'http://www.123savemp3.net',
        'User-agent': 'Mozilla/5.0 (Macintosh)'
      }
    };
    winston.info('Created download headers.');
    destination = DEST;
    if (DEST == null) {
      destination = process.cwd() + '/' + name + '.mp3';
    }
    winston.info('Calculated destination.');
    return download(URI, destination, function() {
      winston.info('Bye.');
      return console.log('Done.');
    });
  };

  askForTrack = function(titles, links) {
    winston.info('Ask user to select a song.');
    return inquirer.prompt([
      {
        type: 'confirm',
        name: 'ready',
        message: 'Are you ready to pick a song?'
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
      var index, name, source;
      if (result['ready']) {
        winston.info('Received answer from user.');
        name = result['song'];
        index = titles.indexOf(name);
        source = links[index];
        return request(source, function(error, response, html) {
          var downloadLocation;
          if (error) {
            winston.error(error);
          }
          downloadLocation = html.match(/window.open\("(.)*"\);/g)[0].slice(13, -4);
          winston.info('Should download: ' + downloadLocation);
          return downloadTrack(name, downloadLocation);
        });
      } else {
        winston.info('Bye.');
        return console.log('Done.');
      }
    });
  };

  scrape = function(source) {
    winston.info('Start scrape for source: ' + source);
    return request(source, function(error, response, html) {
      var $, downloads, newdata, titles;
      winston.info('Received answer from server.');
      $ = cheerio.load(html);
      winston.info('Parsed page with $.');
      newdata = $('.playlist').find('.track');
      titles = [];
      downloads = [];
      winston.info('Fetched links.');
      newdata.each(function(i, element) {
        var newArtist, newTrack;
        newTrack = $(element).find('.name').text().trim();
        newArtist = $(element).find('.artist').text().trim();
        titles.push(newTrack + ' - ' + newArtist);
        return downloads.push($(element).find('.dw').attr('onclick').trim().slice(13, -12));
      });
      winston.info('Present titles to user.');
      if (titles.length > 0) {
        return askForTrack(titles, downloads);
      } else {
        return console.log('No results found.');
      }
    });
  };

  downloadSTR = function(s, p) {
    var source;
    winston.info('Download query: ' + s);
    if (p != null) {
      DEST = p;
    }
    source = 'http://www.my-free-mp3.com/mp3/' + encodeURIComponent(s);
    return scrape(source);
  };

  module.exports.download = downloadSTR;

}).call(this);
