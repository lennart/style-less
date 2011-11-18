fs = require('fs')
vows = require('vows')
should = require('should')
exec = require('child_process').exec
styleLess = require __dirname + "/../src/style-less"
tmpSynopsis = __dirname+'/../tmp/synopsis.less'

vows.describe("Parsing").addBatch
  "synopsis":
    topic: ->
      parser = styleLess.parser({ })
      try
        fs.unlinkSync(tmpSynopsis)
      catch e
        console.log "no need to clean up"
      @synopsis = fs.readFileSync(__dirname+'/fixtures/synopsis.less', 'utf-8')

      styleLess.munge @synopsis, parser, @callback

      return
    "comparing output with diff":
      topic: (less) ->
        fs.writeFileSync(tmpSynopsis, less)
        exec "diff #{tmpSynopsis} #{__dirname + '/fixtures/synopsis.less'}", @callback

        return

      "should be the same": (serr, sout) ->
        sout.should.eql("")

        
      
    "should not be altered": (less) ->
      lines = @synopsis.split "\n"
      less.split("\n").forEach (line, i) ->
        line.should.eql lines[i]
.export(module)