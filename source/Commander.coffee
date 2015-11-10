###
  Commander module for MP3 Downloader.
  Written by Jense5.
###

# Import Downloader module
Downloader = require('./Downloader')

# Fetch arguments
components = require('minimist')(process.argv.slice(2))

# Combine arguments to single string
specs = components['_'].join(' ')

# Start download process
Downloader.download(specs)
