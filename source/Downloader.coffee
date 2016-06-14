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

# Store destination & domain name
DEST = null
CORESOURCE = 'http://www.my-free-mp3.com/mp3/'

# Help function to handle the error and response of a HTTP request.
handleStatus = (error, response) ->
  winston.info('Processing response...')
  winston.error('Error: ' + error) if error
  process.exit() if error
  winston.info('Status Code: ' + response.statusCode)
  if response.statusCode != 200
    winson.error('Invalid Status Code: ' + response.statusCode)
    process.exit()

# Download function for downloading a file from url to destination path.
download = (uri, file, callback) ->
  console.log('Download started.')
  request.head uri, (error, response, content) ->
    handleStatus(error, response)
    winston.info('Write Data to File')
    stream = fs.createWriteStream(file)
    request(uri).pipe(stream).on 'close', () -> callback()

# Download the given file name from the given url. The path will be in the
# current directory with the tracks' title as name unless DEST is set.
downloadTrack = (name, url) ->
  winston.info('Start Track Download')
  URI =
    url: url
    headers:
      'Accept': '*/*'
      'User-agent': 'Mozilla/5.0 (Macintosh)'
  winston.info('Created download headers.')
  destination = DEST
  destination = process.cwd() + '/' + name + '.mp3' unless DEST?
  winston.info('Set path to ' + destination)
  download URI, destination, () -> console.log('Done.')

# Ask the user to select a track from the given selection. Titles and Links
# lists should have the same length. Link at index i should correspond to
# the Title at index i.
askForTrack = (titles, links) ->
  winston.info('Ask User Input')
  inquirer.prompt [{
    type: 'confirm'
    name: 'ready'
    message: 'Multiple files found. You want to choose?'}, {
    when: (response) -> return response['ready']
    type: 'list'
    name: 'song'
    message: 'Choose a song to download:'
    choices: titles}
  ], (result) ->
    if result['ready']
      winston.info('Received Choice: ' + result['song'])
      name = result['song']
      source = links[titles.indexOf(name)]
      request source, (error, response, html) ->
        handleStatus(error, response)
        downloadLocation = html.match(/window.open\("(.)*"\);/g)[0].slice(13,-4)
        winston.info('Should Download: ' + downloadLocation)
        downloadTrack(name, downloadLocation)
    console.log('Done.') unless result['ready']

# Function to scrape the given results page. The function is written for the
# souce code of the results page of CORESOURCE. Running this function on other
# websites might be a bad idea.
scrape = (source) ->
  winston.info('Fetch Source: ' + source)
  request source, (error, response, html) ->
    handleStatus(error, response)
    $ = cheerio.load(html)
    winston.info('Converted Source to Cheerio')
    newdata = $('.playlist').find('.track')
    [titles, downloads] = [[],[]]
    winston.info('Fetched Elements')
    newdata.each (i, element) ->
      newTrack = $(element).find('.name').text().trim()
      newArtist = $(element).find('.artist').text().trim()
      titles.push(newTrack + ' - ' + newArtist)
      downloads.push($(element).find('.dw').attr('onclick').trim().slice(13,-12))
    if titles.length > 0
      askForTrack(titles, downloads)
    else
      console.log('No results found.')

# Starts the download process with the given query (string) and an optional
# path to store the downloaded audio file. Starts the scraper with the
# converted query url.
downloadSTR = (str, pth) ->
  DEST = pth if pth?
  winston.info('Download query: ' + str)
  winston.info('Path set: ' + DEST)
  scrape(CORESOURCE + encodeURIComponent(str))

module.exports.download = downloadSTR
