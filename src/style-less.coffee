# require dependencies
fs = require "fs"
less = require "less"
# load Beautifier
Beautifier = require __dirname + '/beautifier'

# Inject Beautifier into LESS tree – this is hacky
less.tree = Beautifier require(require('path').dirname(require.resolve('less'))+"/tree")


# ### Public API

# Utility funciton to produce a new parser, for Parser reuse
parser = (options) ->
  new(less.Parser)
    paths: options.paths || []

# parse given `lessSrc` with `parser` and run `cb` on completion
# yielding the root node of the parse tree on success
parse = (lessSrc, parser, cb) ->
  parser.parse lessSrc, (e, root) ->
    cb(e, root)

# like the above but yields the beautified less tree as a string
munge = (lessSrc, parser, cb) ->
  parse lessSrc, parser, (e, root) ->
    if e
      cb(e)
    else
      cb(null, root.toLess("","production"))

# export API

module.exports =
  parser: parser
  parse: parse
  munge: munge