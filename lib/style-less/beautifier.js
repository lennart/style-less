
  module.exports = function(tree) {
    var _compact, _filter, _isLogicalSection, _multi, _selectors, _shortened, _single;
    tree.Import.prototype.toLess = function() {
      if (this.css) {
        return this.toCSS();
      } else {
        return "@import " + this._path.toCSS() + ";";
      }
    };
    tree.mixin.Definition.prototype.toLess = function(ctx, env) {
      var merged, params, rules, sel;
      params = this.params.map(function(p) {
        if (p.value != null) {
          return p.name + ": " + p.value.toLess(env);
        } else {
          return p.name;
        }
      }).join(", ").trim();
      sel = this.selectors[0].toLess(env).trim() + "(" + (params || "") + ")";
      rules = this.rules.reduce(function(_css, r) {
        _css += ctx + "  " + r.toLess(ctx + "  ", env).trim();
        return _css;
      }, "");
      merged = _multi(sel, ctx, env, rules);
      if (merged.length > 80) {
        return ctx + merged;
      } else {
        return ctx + _single(sel, ctx, {
          compress: true
        }, rules);
      }
    };
    tree.Selector.prototype.toLess = function(env) {
      if (this._css) {
        console.log(this._css);
        this._css;
      }
      return this.elements.map(function(e) {
        if (typeof e === 'string') {
          return ' ' + e.trim();
        } else {
          return e.toLess(env);
        }
      }).join("");
    };
    tree.Color.prototype.toLess = function() {
      return this.toCSS();
    };
    tree.Call.prototype.toLess = function(env) {
      var args, _ref;
      args = (_ref = this.args) != null ? _ref.map(function(a) {
        return a.toLess(env);
      }).join(", ").trim() : void 0;
      return this.name + (args != null ? "(" + args + ")" : "");
    };
    tree.mixin.Call.prototype.toLess = function(env) {
      var args, _ref;
      args = (_ref = this.arguments) != null ? _ref.map(function(a) {
        return a.toLess(env);
      }).join(", ").trim() : void 0;
      return this.selector.toLess(env).trim() + (args != null ? "(" + args + ");" : ";");
    };
    tree.Directive.prototype.toLess = function(ctx, env) {
      var merged, params, rules, sel;
      params = this.params.map(function(p) {
        return p.toLess(env);
      }).join(", ").trim();
      sel = this.selectors[0].toLess(env).trim() + "(" + (params || "") + ")";
      rules = this.rules.map(function(r) {
        return r.toLess(env).trim();
      });
      merged = _multi(sel, ctx, env, rules);
      if (merged.length > 80) {
        return merged;
      } else {
        return _single(sel, ctx, {
          compress: true
        }, rules);
      }
    };
    tree.Dimension.prototype.toLess = function() {
      return this.toCSS();
    };
    tree.Anonymous.prototype.toLess = function() {
      return this.toCSS();
    };
    tree.Alpha.prototype.toLess = function() {
      return this.toCSS();
    };
    tree.Element.prototype.toLess = function(env) {
      return this.combinator.toLess(env || {}) + this.value;
    };
    tree.Combinator.prototype.toLess = function(env) {
      return {
        '': '',
        ' ': ' ',
        '&': '&',
        '& ': '& ',
        ':': ' :',
        '::': '::',
        '+': ' + ',
        '~': ' ~ ',
        '>': ' > '
      }[this.value];
    };
    tree.Expression.prototype.toLess = function(env) {
      return this.value.map(function(e) {
        return e.toLess(env);
      }).join(' ');
    };
    tree.JavaScript.prototype.toLess = function() {
      return "" + (this.escaped && "~" || "") + "`" + this.expression + "`";
    };
    tree.Keyword.prototype.toLess = function() {
      return this.toCSS();
    };
    tree.Quoted.prototype.toLess = function() {
      return (this.escaped && "~" || "") + this.quote + this.value + this.quote;
    };
    tree.URL.prototype.toLess = function(env) {
      return "url(" + this.value.toLess(env) + ")";
    };
    tree.Variable.prototype.toLess = function() {
      return this.name;
    };
    tree.Value.prototype.toLess = function(env) {
      return this.value.map(function(e) {
        return e.toLess(env);
      }).join(env.compress ? ',' : ', ');
    };
    tree.Shorthand.prototype.toLess = function(env) {
      return this.a.toLess(env) + "/" + this.b.toLess(env);
    };
    tree.Comment.prototype.toLess = function(env) {
      return this.toCSS(env);
    };
    tree.Rule.prototype.toLess = function(env) {
      return this.name + (env.compress ? ':' : ': ') + this.value.toLess(env) + this.important + ";";
    };
    tree.Operation.prototype.toLess = function(env) {
      return "(" + [this.operands[0].toLess(env), this.op, this.operands[1].toLess(env)].join(" ") + ")";
    };
    _multi = function(selector, context, env, rules) {
      return "" + selector + " {\n" + rules + "\n" + context + "}";
    };
    _single = function(selector, context, env, rules) {
      return selector + ' { ' + rules.trim() + ' }';
    };
    _selectors = function(paths, env, padding) {
      var i, mapped, part, results;
      mapped = paths.map(function(p) {
        return p.map(function(s) {
          return s.toLess(env);
        }).join('').trim();
      });
      results = [padding + mapped.shift()];
      if (mapped.length !== 0) {
        for (i in mapped) {
          part = mapped[i];
          if (env.compress) {
            results.push(',' + part);
          } else {
            if (paths.length > 3 && i % 3 === 2) {
              results.push(',\n' + padding + part);
            } else {
              results.push(', ' + part);
            }
          }
        }
      }
      return results.join("");
    };
    _filter = function(obj, iterator, context) {
      var results;
      results = [];
      if (obj === null) return results;
      return obj.filter(iterator, context);
    };
    _compact = function(array) {
      return _filter(array, function(value) {
        return !!value;
      });
    };
    _isLogicalSection = function(content) {
      var lastChar;
      lastChar = content.charAt(content.length - 2);
      return lastChar === ";" || lastChar === "}";
    };
    _shortened = function(content) {
      return content.replace(/\s+/g, " ").trim();
    };
    tree.Ruleset.prototype.toLess = function(context, env) {
      var css, merged, padding, paths, rules, rulesets, sel;
      var _this = this;
      css = "";
      paths = [];
      rulesets = [];
      if (!this.root) {
        paths = this.selectors.map(function(s) {
          return [s];
        });
      }
      padding = this.root ? "" : context + "  ";
      rules = this.rules.reduce(function(_css, rule, r, list) {
        var comment, content, sel;
        if (rule.rules || (rule instanceof tree.Directive)) {
          sel = rule.selectors.map(function(s) {
            return s.toLess(env);
          }).join(", ").trim();
          if (_isLogicalSection(_css)) _css += "\n";
          content = rule.toLess(padding, env);
          if (_shortened(content).length < 90) {
            content = padding + _shortened(content);
          }
          _css += content;
        } else {
          if (rule instanceof tree.Comment) {
            if (_isLogicalSection(_css)) _css += "\n";
            if (_this.root) {
              _css += rule.toLess(env).trim();
            } else {
              comment = rule.value.toString().trim();
              _css += padding + comment;
            }
          } else {
            if (rule.toLess && !rule.variable) {
              _css += padding + rule.toLess(env);
            } else if (rule.value) {
              if (rule.variable) {
                _css += context + padding + rule.name + ": " + rule.value.toLess(env) + ";";
              } else {
                _css += context + rule.value.toString();
              }
            }
          }
        }
        if (list.length !== r + 1) _css += '\n';
        return _css;
      }, "");
      if (this.root) {
        css += rules;
      } else {
        sel = _selectors(paths, env, context);
        merged = _multi(sel, context, env, rules);
        if (merged.length > 80) {
          css += merged;
        } else {
          sel = _selectors(paths, {
            compress: false
          }, context);
          css += _single(sel, context, env, rules);
        }
      }
      return css;
    };
  };
