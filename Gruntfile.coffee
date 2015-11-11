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
  Grunt.loadNpmTasks('grunt-contrib-uglify')

  # Configuration for CoffeeScript compilation
  coffeeConfiguration =
    glob_to_multiple:
      expand: true
      cwd: 'source'
      src: ['**/*.coffee']
      dest: 'bin'
      ext: '.js'

  # Configuration for cleaning bin/.
  cleanConfiguration =
    bin: 'bin/'
    nodes: 'node_modules/'

  # Add all seperate configurations to
  # the main GruntConfiguration
  Grunt.initConfig
    coffee: coffeeConfiguration
    clean: cleanConfiguration

  # Add executable line to top of file
  Grunt.registerTask 'prepare-executable', () ->
    exeLoc = __dirname + '/bin/Commander.js'
    data = fs.readFileSync(exeLoc)
    fd = fs.openSync exeLoc, 'w+'
    buffer = new Buffer '#!/usr/bin/env node\n\n'
    fs.writeSync(fd, buffer, 0, buffer.length)
    fs.writeSync(fd, data, 0, data.length)
    fs.close(fd)

  # Generate custom build commands that I use often
  Grunt.registerTask 'clear', ['clean:bin']
  Grunt.registerTask 'compile', ['coffee', 'prepare-executable']
