(function() {
  var Beautifier, fs, less, munge, parse, parser;

  fs = require("fs");

  less = require("less");

  Beautifier = require(__dirname + '/beautifier');

  less.tree = Beautifier(require(require('path').dirname(require.resolve('less')) + "/tree"));

  parser = function(options) {
    return new less.Parser({
      paths: options.paths || []
    });
  };

  parse = function(lessSrc, parser, cb) {
    return parser.parse(lessSrc, function(e, root) {
      return cb(e, root);
    });
  };

  munge = function(lessSrc, parser, cb) {
    return parse(lessSrc, parser, function(e, root) {
      if (e) {
        return cb(e);
      } else {
        return cb(null, root.toLess("", "production"));
      }
    });
  };

  module.exports = {
    parse: parse,
    munge: munge
  };

}).call(this);
