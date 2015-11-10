###
  Downloader module for MP3 Downloader.
  Written by Jense5.
###

# Require external libs
fs = require('fs')
winston = require('winston')
request = require('request')
cheerio = require('cheerio')
inquirer = require('inquirer')

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
  winston.info('Going to download track.')
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
  inquirer.prompt [
    type: 'list'
    name: 'song'
    message: 'Choose a song to download:'
    choices: titles
  ], (result) ->
    winston.info('Received answer from user.')
    name = result['song']
    index = titles.indexOf(name)
    source = 'http://123savemp3.net' + links[index]
    winston.info('Should download: ' + name)
    downloadTrack(name, source)

# Function to scrape the given page. Note
# that it should be one on 123savemp3 with
# a query format.
scrape = (source) ->
  winston.info('Start scrape for source: ' + source)
  request source, (error, response, html) ->
    winston.info('Received answer from server.')
    $ = cheerio.load(html)
    winston.info('Parsed page with $.')
    links = $('.item').find('.play')
    titles = []
    downloads = []
    winston.info('Fetched links.')
    $('.item').find('.desc').each (i, element) ->
      titles.push($(this).text().trim())
      downloads.push($(links[i]).attr('data-url'))
    winston.info('Present titles to user.')
    askForTrack(titles, downloads)

# Starts the download process with
# the given query.
downloadSTR = (s) ->
  winston.info('Download query: ' + s)
  source = 'http://www.123savemp3.net/mp3/' + encodeURIComponent(s)
  scrape(source)

# Export the module
module.exports.download = downloadSTR
