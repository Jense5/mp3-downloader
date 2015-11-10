###
  Downloader module for MP3 Downloader.
  Written by Jense5.
###

# Require external libs
fs = require('fs')
winston = require('winston')
request = require('request')
cheerio = require('cheerio')
inquirer = require('requirer')

# Download function for downloading
# a file from url to destination path.
download = (uri, file, callback) ->
  winston.info('Download started.')
  request.head uri, (error, response, content) ->
    winston.info('Data received, writing to file.')
    stream = fs.createWriteStream(file)
    request(uri).pipe(stream).on 'close', () ->
      winston.info('Wrote data.')
      callback()

# Download the given file name from
# the given url.
downloadTrack = (name, url) ->
  winston.info('Called download track.')
  URI =
    url: url
    headers:
      'Accept': '*/*'
      'Referer': 'http://www.123savemp3.net'
      'User-agent': 'Mozilla/5.0 (Macintosh)'
  winston.info('Created download headers.')
  destination = process.cwd() + '/' + name + '.mp3'
  winston.info('Calculated destination.')
  download URI, destination, () ->
    winston.info('Bye.')

# Ask the user to select a track from
# the given selection.
askForTrack = (titles, links) ->
  winston.info('Ask user to select track.')
