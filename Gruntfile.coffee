###
  Default Gruntfile for MP3 Downloader.
  Written by Jense5.
###

# Require fs
fs = require('fs')

# Configure Grunt module
module.exports = (Grunt) ->

  # Load basic npm tasks to compile
  # CoffeeScript and remove files.
  Grunt.loadNpmTasks('grunt-contrib-clean')
  Grunt.loadNpmTasks('grunt-contrib-coffee')
  Grunt.loadNpmTasks('grunt-contrib-copy')
