module.exports = (tree) ->
  tree.Import.prototype.toLess = ->
    if @css
      @toCSS()
    else
      "@import " + @_path.toCSS() + ";"

  tree.mixin.Definition.prototype.toLess = (ctx, env) ->
    params = @params.map (p) ->
      if p.value?
        p.name + ": " + p.value.toLess(env)
      else
        p.name
    .join(", ").trim()
    sel = @selectors[0].toLess(env).trim() + "(" + (params || "") + ")"
    rules = @rules.reduce (_css, r) ->
      _css += ctx + "  " + r.toLess(ctx + "  ",env).trim()
      _css
    , ""
    merged = _multi(sel, ctx, env, rules)
    if merged.length > 80
      ctx + merged
    else
      ctx + _single sel, ctx, { compress: true }, rules

  tree.Selector.prototype.toLess = (env) ->
    if @_css
      console.log(@_css)
      @_css

    @elements.map (e) ->
      if typeof e == 'string'
        ' ' + e.trim()
      else
        e.toLess(env)
    .join ""

  tree.Color.prototype.toLess = ->
    @toCSS()

  tree.Call.prototype.toLess = (env) ->
    args = @args?.map (a) ->
      a.toLess env
    .join(", ").trim()
    @name + if args? then "(" + args + ")" else ""

  tree.mixin.Call.prototype.toLess = (env) ->
    args = @arguments?.map (a) ->
      a.toLess(env)
    .join(", ").trim()
    @selector.toLess(env).trim() + if args? then "(" + args + ");" else ";"

  tree.Directive.prototype.toLess = (ctx, env) ->
    params = @params.map (p) ->
      p.toLess(env)
    .join(", ").trim()
    sel = @selectors[0].toLess(env).trim() + "(" + (params || "") + ")"
    rules = @rules.map (r) ->
      r.toLess(env).trim()
    merged = _multi(sel, ctx, env, rules)
    if merged.length > 80
      merged
    else
      _single sel, ctx, { compress : true }, rules

  tree.Dimension.prototype.toLess = ->
    @toCSS()

  tree.Anonymous.prototype.toLess = ->
    @toCSS()

  tree.Alpha.prototype.toLess = ->
    @toCSS()

  tree.Element.prototype.toLess = (env) ->
    @combinator.toLess(env || {}) + @value

  tree.Combinator.prototype.toLess = (env) ->
    return {
        ''  : ''
        ' ' : ' '
        '&' : '&'
        '& ' : '& '
        ':' : ' :'
        '::': '::'
        '+' : ' + '
        '~' : ' ~ '
        '>' : ' > '
    }[@value]

  tree.Expression.prototype.toLess = (env) ->
    @value.map (e) ->
      e.toLess(env)
    .join ' '

  tree.JavaScript.prototype.toLess = ->
    "#{@escaped && "~" || ""}`#{@expression}`"

  tree.Keyword.prototype.toLess = ->
    @toCSS()

  tree.Quoted.prototype.toLess = ->
    (@escaped && "~" || "") + @quote + @value + @quote

  tree.URL.prototype.toLess = (env) ->
    "url(" + @value.toLess(env) + ")"

  tree.Variable.prototype.toLess = () ->
    @name

  tree.Value.prototype.toLess = (env) ->
    @value.map (e) ->
      e.toLess(env)
    .join if env.compress then ',' else ', '

  tree.Shorthand.prototype.toLess = (env) ->
    @a.toLess(env) + "/" +@b.toLess(env)

  tree.Comment.prototype.toLess = (env) ->
    @toCSS env

  tree.Rule.prototype.toLess = (env) ->
    @name + (if env.compress then ':' else ': ') + @value.toLess(env) + @important + ";"

  tree.Operation.prototype.toLess = (env) ->
    "(" + [@operands[0].toLess(env),@op,@operands[1].toLess(env)].join(" ") + ")"

  _multi = (selector, context, env, rules) ->
    "#{selector} {\n#{(rules)}\n#{context}}"

  _single = (selector, context, env, rules) ->
    selector + ' { ' + rules.trim() + ' }'

  _selectors = (paths, env, padding) ->
    mapped = paths.map (p) ->
      p.map (s) ->
        s.toLess(env)
      .join('').trim()

    results = [padding + mapped.shift()]
    unless mapped.length == 0
      for i, part of mapped
        if env.compress 
          results.push ',' + part
        else 
          if paths.length > 3 and i % 3 == 2
            results.push ',\n' + padding + part
          else 
            results.push ', ' + part
    results.join("")

  # Return all the elements that pass a truth test.
  # Delegates to **ECMAScript 5**'s native `filter` if available.
  # Aliased as `select`.
  _filter = (obj, iterator, context) ->
    results = []
    return results if obj is null
    return obj.filter(iterator, context)

  _compact = (array) ->
    _filter array, (value) ->
      return !!value

  _isLogicalSection = (content) ->
    lastChar = content.charAt(content.length - 2)
    lastChar is ";" or lastChar is "}"

  _shortened = (content, padding = "") ->
    padding + content.replace(/\s+/g, " ").trim() 

  tree.Ruleset.prototype.toLess = (context, env) ->
    css = ""
    paths = []
    rulesets = []

    unless @root
      paths = @selectors.map (s) -> [s]

    padding = if @root then "" else context + "  "
    rules = @rules.reduce (_css, rule, r, list) =>
      if rule.rules || (rule instanceof tree.Directive)
        sel = rule.selectors.map (s) ->
          s.toLess(env)
        .join(", ").trim()
        _css += "\n" if _isLogicalSection _css
        content = rule.toLess(padding, env)
        content = padding + _shortened(content) if _shortened(content, padding).length <= 80
        _css += content
      else
        if rule instanceof tree.Comment
          _css += "\n" if _isLogicalSection _css
          if @root
            _css += rule.toLess(env).trim()
          else
            comment = rule.value.toString().trim()

            _css += padding + comment
        else
          if rule.toLess and not rule.variable
            _css += padding + rule.toLess(env)
          else if rule.value
            if rule.variable
              _css += padding + rule.name + ": " + rule.value.toLess(env) + ";"
            else
              _css += context + rule.value.toString()
      _css += '\n' unless list.length == r + 1
      _css
    , ""

    if @root
      css += rules
    else
      sel = _selectors paths, env, context
      merged = _multi(sel, context, env, rules)
      if merged.length > 80
        css += merged
      else
        sel = _selectors paths, { compress : false }, context
        css += _single sel, context, env, rules

    css

  return