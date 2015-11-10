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
