fs = require 'fs'
spawn = require('child_process').spawn

# Run a CoffeeScript through our node/coffee interpreter.
run = (args, cb) ->
  proc =         spawn 'coffee', args
  proc.stderr.on 'data', (buffer) -> console.log buffer.toString()
  proc.on        'exit', (status) ->
    process.exit(1) if status != 0
    cb() if typeof cb is 'function'

task 'build', 'build the CoffeeScript language from source', build = (cb) ->
  files = fs.readdirSync 'src'
  files = ('src/' + file for file in files when file.match(/\.coffee$/))
  run ['-c', '-o', 'lib/style-less'].concat(files), cb