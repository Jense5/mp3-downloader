
/*
  Downloader module for MP3 Downloader.
  Written by Jense5.
 */

(function() {
  var askForTrack, cheerio, download, downloadSTR, downloadTrack, fs, inquirer, request, scrape, winston;

  fs = require('fs');

  winston = require('winston');

  request = require('request');

  cheerio = require('cheerio');

  inquirer = require('inquirer');

  download = function(uri, file, callback) {
    winston.info('Download started.');
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
    destination = process.cwd() + '/' + name + '.mp3';
    winston.info('Calculated destination.');
    return download(URI, destination, function() {
      return winston.info('Bye.');
    });
  };

  askForTrack = function(titles, links) {
    winston.info('Ask user to select track.');
    return inquirer.prompt([
      {
        type: 'list',
        name: 'song',
        message: 'Choose a song to download:',
        choices: titles
      }
    ], function(result) {
      var index, name, source;
      winston.info('Received answer from user.');
      name = result['song'];
      index = titles.indexOf(name);
      source = 'http://123savemp3.net' + links[index];
      winston.info('Should download: ' + name);
      return downloadTrack(name, source);
    });
  };

  scrape = function(source) {
    winston.info('Start scrape for source: ' + source);
    return request(source, function(error, response, html) {
      var $, downloads, links, titles;
      winston.info('Received answer from server.');
      $ = cheerio.load(html);
      winston.info('Parsed page with $.');
      links = $('.item').find('.play');
      titles = [];
      downloads = [];
      winston.info('Fetched links.');
      $('.item').find('.desc').each(function(i, element) {
        titles.push($(this).text().trim());
        return downloads.push($(links[i]).attr('data-url'));
      });
      winston.info('Present titles to user.');
      return askForTrack(titles, downloads);
    });
  };

  downloadSTR = function(s) {
    var source;
    winston.info('Download query: ' + s);
    source = 'http://www.123savemp3.net/mp3/' + encodeURIComponent(s);
    return scrape(source);
  };

  module.exports.download = downloadSTR;

}).call(this);
