###
  Commander module for MP3 Downloader.
  Written by Jense5.
###

# Import winston & Downloader module
winston = require('winston')
Downloader = require('./Downloader')

# Fetch arguments
components = require('minimist')(process.argv.slice(2))

# Check verbose mode
winston.level = 'error'
winston.level = 'info' if components['verbose']

# Combine arguments to single string
specs = components['_'].join(' ')

# Start download process
Downloader.download(specs)
