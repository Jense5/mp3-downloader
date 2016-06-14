# Import winston & Downloader module
path = require('path')
winston = require('winston')
Downloader = require('./Downloader')

# Fetch arguments
components = require('minimist')(process.argv.slice(2))

if components['version']
  console.log('Captusi v0.2.0')
  process.exit()

# Check verbose mode
winston.level = 'error'
winston.level = 'info' if components['verbose']

# Combine arguments to single string
if components['_'].length == 0
  console.log('No query povided!')
  process.exit()
specs = components['_'][0]

# Fetch the output argument.
output = null
output = components['output'] if components['output']?

# Parse output to absolute path
location = path.resolve(process.cwd(), output) if components['output']?

# Start download process
Downloader.download(specs, location)
