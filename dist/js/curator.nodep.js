;(function(root, factory) {
	// no amd or require code because this is supposed to run stand alone!
	root.Curator = factory(window);
}(this, function(root) {
	/* Zepto v1.2.0 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.matches || element.webkitMatchesSelector ||
                          element.mozMatchesSelector || element.oMatchesSelector ||
                          element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }

  function likeArray(obj) {
    var length = !!obj && 'length' in obj && obj.length,
      type = $.type(obj)

    return 'function' != type && !isWindow(obj) && (
      'array' == type || length === 0 ||
        (typeof length == 'number' && length > 0 && (length - 1) in obj)
    )
  }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  function Z(dom, selector) {
    var i, len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overridden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. This method can be overridden in plugins.
  zepto.Z = function(dom, selector) {
    return new Z(dom, selector)
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overridden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overridden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overridden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
      slice.call(
        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.isNumeric = function(val) {
    var num = Number(val), type = typeof val
    return val != null && type != 'boolean' &&
      (type != 'string' || val.length) &&
      !isNaN(num) && isFinite(num) || false
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }
  $.noop = function() {}

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    constructor: zepto.Z,
    length: 0,

    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    indexOf: emptyArray.indexOf,
    concat: function(){
      var i, value, args = []
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i]
        args[i] = zepto.isZ(value) ? value.toArray() : value
      }
      return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
    },

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var nodes = [], collection = typeof selector == 'object' && $(selector)
      this.each(function(_, node){
        while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
          node = node !== context && !isDocument(node) && node.parentNode
        if (node && nodes.indexOf(node) < 0) nodes.push(node)
      })
      return $(nodes)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this.pluck('textContent').join("") : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    removeProp: function(name){
      name = propMap[name] || name
      return this.each(function(){ delete this[name] })
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      if (0 in arguments) {
        if (value == null) value = ""
        return this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
      } else {
        return this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
      }
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
        return {top: 0, left: 0}
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0]
        if (typeof property == 'string') {
          if (!element) return
          return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
        } else if (isArray(property)) {
          if (!element) return
          var props = {}
          var computedStyle = getComputedStyle(element, '')
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            var arr = []
            argType = type(arg)
            if (argType == "array") {
              arg.forEach(function(el) {
                if (el.nodeType !== undefined) return arr.push(el)
                else if ($.zepto.isZ(el)) return arr = arr.concat(el.get())
                arr = arr.concat(zepto.fragment(el))
              })
              return arr
            }
            return argType == "object" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src){
              var target = el.ownerDocument ? el.ownerDocument.defaultView : window
              target['eval'].call(target, el.innerHTML)
            }
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})();

(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      event.timeStamp || (event.timeStamp = Date.now())

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (callback === undefined || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto);

(function($){
  var jsonpID = +new Date(),
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  function ajaxDataFilter(data, type, settings) {
    if (settings.dataFilter == empty) return data
    var context = settings.context
    return settings.dataFilter.call(context, data, type)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('Zepto' + (jsonpID++)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true,
    //Used to handle the raw response data of XMLHttpRequest.
    //This is a pre-filtering function to sanitize the response.
    //The sanitized response should be returned
    dataFilter: empty
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor, hashIndex
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      // cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))

          if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
            result = xhr.response
          else {
            result = xhr.responseText

            try {
              // http://perfectionkills.com/global-eval-what-are-the-options/
              // sanitize response accordingly if data filter callback provided
              result = ajaxDataFilter(result, dataType, settings)
              if (dataType == 'script')    (1,eval)(result)
              else if (dataType == 'xml')  result = xhr.responseXML
              else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
            } catch (e) { error = e }

            if (error) return ajaxError(error, 'parsererror', xhr, settings, deferred)
          }

          ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto);

(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto);

(function(){
  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle
    window.getComputedStyle = function(element, pseudoElement){
      try {
        return nativeGetComputedStyle(element, pseudoElement)
      } catch(e) {
        return null
      }
    }
  }
})();

window.Zepto = Zepto;



// copy Zepto to our current scope as $
var $ = window.Zepto;

//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){
  var prefix = '', eventPrefix,
      vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
      testEl = document.createElement('div'),
      supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
      transform,
      transitionProperty, transitionDuration, transitionTiming, transitionDelay,
      animationName, animationDuration, animationTiming, animationDelay,
      cssReset = {}

  function dasherize(str) { return str.replace(/([A-Z])/g, '-$1').toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  if (testEl.style.transform === undefined) $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
      cssReset[transitionDuration = prefix + 'transition-duration'] =
          cssReset[transitionDelay    = prefix + 'transition-delay'] =
              cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
                  cssReset[animationName      = prefix + 'animation-name'] =
                      cssReset[animationDuration  = prefix + 'animation-duration'] =
                          cssReset[animationDelay     = prefix + 'animation-delay'] =
                              cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback, delay){
    if ($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if ($.isFunction(ease))
      callback = ease, ease = undefined
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
            ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if (delay) delay = parseFloat(delay) / 1000
    return this.anim(properties, duration, ease, callback, delay)
  }

  $.fn.anim = function(properties, duration, ease, callback, delay){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
        fired = false

    if (duration === undefined) duration = $.fx.speeds._default / 1000
    if (delay === undefined) delay = 0
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      } else
        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

      fired = true
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0){
      this.bind(endEvent, wrappedCallback)
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function(){
        if (fired) return
        wrappedCallback.call(that)
      }, ((duration + delay) * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null
})(Zepto);


//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){

  $.makeArray = function(array, results) {
    array = Array.prototype.slice.call( array );
    if ( results ) {
      results.push.apply( results, array );
      return results;
    }
    return array;
  };


  $.cache = {};
  $.noData = {
    "embed": true,
    "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
    "applet": true
  };
  $.acceptData = function (elem) {
    if (elem.nodeName) {
      var match = $.noData[elem.nodeName.toLowerCase()];

      if (match) {
        return ! (match === true || elem.getAttribute("classid") !== match);
      }
    }

    return true;
  };
  $.data = function (elem, name, data, pvt
                         /* Internal Use Only */
  ) {
    if (!$.acceptData(elem)) {
      return;
    }

    var privateCache, thisCache, ret, internalKey = $.expando,
        getByName = typeof name === "string",

        // We have to handle DOM nodes and JS objects differently because IE6-7
        // can't GC object references properly across the DOM-JS boundary
        isNode = elem.nodeType,

        // Only DOM nodes need the global $ cache; JS object data is
        // attached directly to the object so GC can occur automatically
        cache = isNode ? $.cache : elem,

        // Only defining an ID for JS objects if its cache already exists allows
        // the code to shortcut on the same path as a DOM node with no cache
        id = isNode ? elem[internalKey] : elem[internalKey] && internalKey,
        isEvents = name === "events";

    // Avoid doing any more work than we need to when trying to get data on an
    // object that has no data at all
    if ((!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined) {
      return;
    }

    if (!id) {
      // Only DOM nodes need a new unique ID for each element since their data
      // ends up in the global cache
      if (isNode) {
        elem[internalKey] = id = ++$.uuid;
      } else {
        id = internalKey;
      }
    }

    if (!cache[id]) {
      cache[id] = {};

      // Avoids exposing $ metadata on plain JS objects when the object
      // is serialized using JSON.stringify
      if (!isNode) {
        cache[id].toJSON = $.noop;
      }
    }

    // An object can be passed to $.data instead of a key/value pair; this gets
    // shallow copied over onto the existing cache
    if (typeof name === "object" || typeof name === "function") {
      if (pvt) {
        cache[id] = $.extend(cache[id], name);
      } else {
        cache[id].data = $.extend(cache[id].data, name);
      }
    }

    privateCache = thisCache = cache[id];

    // $ data() is stored in a separate object inside the object's internal data
    // cache in order to avoid key collisions between internal data and user-defined
    // data.
    if (!pvt) {
      if (!thisCache.data) {
        thisCache.data = {};
      }

      thisCache = thisCache.data;
    }

    if (data !== undefined) {
      thisCache[$.camelCase(name)] = data;
    }

    // Users should not attempt to inspect the internal events object using $.data,
    // it is undocumented and subject to change. But does anyone listen? No.
    if (isEvents && !thisCache[name]) {
      return privateCache.events;    }

    // Check for both converted-to-camel and non-converted data property names
    // If a data property was specified
    if (getByName) {
      // First Try to find as-is property data
      ret = thisCache[name];
      // Test for null|undefined property data
      if (ret == null) {
        // Try to find the camelCased property
        ret = thisCache[$.camelCase(name)];
      }
    } else {
      ret = thisCache;
    }

    return ret;
  };
})(Zepto);
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){
  var document = window.document, docElem = document.documentElement,
      origShow = $.fn.show, origHide = $.fn.hide, origToggle = $.fn.toggle

  function anim(el, speed, opacity, scale, callback) {
    if (typeof speed == 'function' && !callback) callback = speed, speed = undefined
    var props = { opacity: opacity }
    if (scale) {
      props.scale = scale
      el.css($.fx.cssPrefix + 'transform-origin', '0 0')
    }
    return el.animate(props, speed, null, callback)
  }

  function hide(el, speed, scale, callback) {
    return anim(el, speed, 0, scale, function(){
      origHide.call($(this))
      callback && callback.call(this)
    })
  }

  $.fn.show = function(speed, callback) {
    origShow.call(this)
    if (speed === undefined) speed = 0
    else this.css('opacity', 0)
    return anim(this, speed, 1, '1,1', callback)
  }

  $.fn.hide = function(speed, callback) {
    if (speed === undefined) return origHide.call(this)
    else return hide(this, speed, '0,0', callback)
  }

  $.fn.toggle = function(speed, callback) {
    if (speed === undefined || typeof speed == 'boolean')
      return origToggle.call(this, speed)
    else return this.each(function(){
      var el = $(this)
      el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback)
    })
  }

  $.fn.fadeTo = function(speed, opacity, callback) {
    return anim(this, speed, opacity, null, callback)
  }

  $.fn.fadeIn = function(speed, callback) {
    var target = this.css('opacity')
    if (target > 0) this.css('opacity', 0)
    else target = 1
    return origShow.call(this).fadeTo(speed, target, callback)
  }

  $.fn.fadeOut = function(speed, callback) {
    return hide(this, speed, null, callback)
  }

  $.fn.fadeToggle = function(speed, callback) {
    return this.each(function(){
      var el = $(this)
      el[
          (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
          ](speed, callback)
    })
  }

})(Zepto);

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Debouncing function from John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
// Copy pasted from http://paulirish.com/2009/throttled-smartresize-jquery-event-handler/

(function ($, sr) {
    var debounce = function debounce(func, threshold, execAsap) {
        var timeout;
        return function debounced() {
            var obj = this,
                args = arguments;

            function delayed() {
                if (!execAsap) func.apply(obj, args);
                timeout = null;
            }
            if (timeout) clearTimeout(timeout);else if (execAsap) func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 150);
        };
    };
    $.fn[sr] = function (fn) {
        return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
    };
})($, 'smartresize');

var Factory = function Factory() {};
var slice = Array.prototype.slice;

var augment = function augment(base, body) {
    var uber = Factory.prototype = typeof base === "function" ? base.prototype : base;
    var prototype = new Factory(),
        properties = body.apply(prototype, slice.call(arguments, 2).concat(uber));
    if ((typeof properties === 'undefined' ? 'undefined' : _typeof(properties)) === "object") for (var key in properties) {
        prototype[key] = properties[key];
    }if (!prototype.hasOwnProperty("constructor")) return prototype;
    var constructor = prototype.constructor;
    constructor.prototype = prototype;
    return constructor;
};

augment.defclass = function (prototype) {
    var constructor = prototype.constructor;
    constructor.prototype = prototype;
    return constructor;
};

augment.extend = function (base, body) {
    return augment(base, function (uber) {
        this.uber = uber;
        return body;
    });
};

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

(function () {
    var _tmplCache = {};

    var helpers = {
        networkIcon: function networkIcon() {
            return this.data.network_name.toLowerCase();
        },
        networkName: function networkName() {
            return this.data.network_name.toLowerCase();
        },
        userUrl: function userUrl() {
            if (this.data.user_url && this.data.user_url != '') {
                return this.data.user_url;
            }
            if (this.data.originator_user_url && this.data.originator_user_url != '') {
                return this.data.originator_user_url;
            }
            if (this.data.userUrl && this.data.userUrl != '') {
                return this.data.userUrl;
            }

            var netId = this.data.network_id + '';
            if (netId === '1') {
                return 'http://twitter.com/' + this.data.user_screen_name;
            } else if (netId === '2') {
                return 'http://instagram.com/' + this.data.user_screen_name;
            } else if (netId === '3') {
                return 'http://facebook.com/' + this.data.user_screen_name;
            }

            return '#';
        },
        parseText: function parseText(s) {
            if (this.data.is_html) {
                return s;
            } else {
                if (this.data.network_name === 'Twitter') {
                    s = Curator.StringUtils.linksToHref(s);
                    s = Curator.StringUtils.twitterLinks(s);
                } else if (this.data.network_name === 'Instagram') {
                    s = Curator.StringUtils.linksToHref(s);
                    s = Curator.StringUtils.instagramLinks(s);
                } else if (this.data.network_name === 'Facebook') {
                    s = Curator.StringUtils.linksToHref(s);
                    s = Curator.StringUtils.facebookLinks(s);
                } else {
                    s = Curator.StringUtils.linksToHref(s);
                }

                return helpers.nl2br(s);
            }
        },
        nl2br: function nl2br(s) {
            s = s.trim();
            s = s.replace(/(?:\r\n|\r|\n)/g, '<br />');

            return s;
        },
        contentImageClasses: function contentImageClasses() {
            return this.data.image ? 'crt-post-has-image' : 'crt-post-content-image-hidden';
        },
        contentTextClasses: function contentTextClasses() {
            return this.data.text ? 'crt-post-has-text' : 'crt-post-content-text-hidden';
        },
        fuzzyDate: function fuzzyDate(dateString) {
            var date = Date.parse(dateString + ' UTC');
            var delta = Math.round((new Date() - date) / 1000);

            var minute = 60,
                hour = minute * 60,
                day = hour * 24,
                week = day * 7,
                month = day * 30;

            var fuzzy;

            if (delta < 30) {
                fuzzy = 'Just now';
            } else if (delta < minute) {
                fuzzy = delta + ' seconds ago';
            } else if (delta < 2 * minute) {
                fuzzy = 'a minute ago.';
            } else if (delta < hour) {
                fuzzy = Math.floor(delta / minute) + ' minutes ago';
            } else if (Math.floor(delta / hour) == 1) {
                fuzzy = '1 hour ago.';
            } else if (delta < day) {
                fuzzy = Math.floor(delta / hour) + ' hours ago';
            } else if (delta < day * 2) {
                fuzzy = 'Yesterday';
            } else if (delta < week) {
                fuzzy = 'This week';
            } else if (delta < week * 2) {
                fuzzy = 'Last week';
            } else if (delta < month) {
                fuzzy = 'This month';
            } else {
                fuzzy = date;
            }

            return fuzzy;
        },
        prettyDate: function prettyDate(time) {
            var date = Curator.DateUtils.dateFromString(time);

            var diff = (new Date().getTime() - date.getTime()) / 1000;
            var day_diff = Math.floor(diff / 86400);
            var year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate();

            if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return year.toString() + '-' + (month < 10 ? '0' + month.toString() : month.toString()) + '-' + (day < 10 ? '0' + day.toString() : day.toString());

            var r = day_diff == 0 && (diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff == 1 && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
            return r;
        }
    };

    root.parseTemplate = function (str, data) {
        /// <summary>
        /// Client side template parser that uses &lt;#= #&gt; and &lt;# code #&gt; expressions.
        /// and # # code blocks for template expansion.
        /// NOTE: chokes on single quotes in the document in some situations
        ///       use &amp;rsquo; for literals in text and avoid any single quote
        ///       attribute delimiters.
        /// </summary>
        /// <param name="str" type="string">The text of the template to expand</param>
        /// <param name="data" type="var">
        /// Any data that is to be merged. Pass an object and
        /// that object's properties are visible as variables.
        /// </param>
        /// <returns type="string" />
        var err = "";
        try {
            var func = _tmplCache[str];
            if (!func) {
                var strComp = str.replace(/[\r\t\n]/g, " ").replace(/'(?=[^%]*%>)/g, "\t").split("'").join("\\'").split("\t").join("'").replace(/<%=(.+?)%>/g, "',$1,'").split("<%").join("');").split("%>").join("p.push('");
                var strFunc = "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + strComp + "');}return p.join('');";
                func = new Function("obj", strFunc); // jshint ignore:line
                _tmplCache[str] = func;
            }
            helpers.data = data;
            return func.call(helpers, data);
        } catch (e) {
            window.console.log('Template parse error: ' + e.message);
            err = e.message;
        }
        return " # ERROR: " + err + " # ";
    };
})();
// jQuery.XDomainRequest.js
// Author: Jason Moon - @JSONMOON
// IE8+
// https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest/blob/master/jQuery.XDomainRequest.js


if (!$.support.cors && $.ajaxTransport && window.XDomainRequest) {
    var httpRegEx = /^https?:\/\//i;
    var getOrPostRegEx = /^get|post$/i;
    var sameSchemeRegEx = new RegExp('^' + window.location.protocol, 'i');
    var htmlRegEx = /text\/html/i;
    var jsonRegEx = /\/json/i;
    var xmlRegEx = /\/xml/i;

    // ajaxTransport exists in jQuery 1.5+
    $.ajaxTransport('text html xml json', function (options, userOptions, jqXHR) {
        jqXHR = jqXHR;
        // XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
        if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(options.url) && sameSchemeRegEx.test(options.url)) {
            var xdr = null;
            var userType = (userOptions.dataType || '').toLowerCase();
            return {
                send: function send(headers, complete) {
                    xdr = new window.XDomainRequest();
                    if (/^\d+$/.test(userOptions.timeout)) {
                        xdr.timeout = userOptions.timeout;
                    }
                    xdr.ontimeout = function () {
                        complete(500, 'timeout');
                    };
                    xdr.onload = function () {
                        var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
                        var status = {
                            code: 200,
                            message: 'success'
                        };
                        var responses = {
                            text: xdr.responseText
                        };
                        try {
                            if (userType === 'html' || htmlRegEx.test(xdr.contentType)) {
                                responses.html = xdr.responseText;
                            } else if (userType === 'json' || userType !== 'text' && jsonRegEx.test(xdr.contentType)) {
                                try {
                                    responses.json = $.parseJSON(xdr.responseText);
                                } catch (e) {
                                    status.code = 500;
                                    status.message = 'parseerror';
                                    //throw 'Invalid JSON: ' + xdr.responseText;
                                }
                            } else if (userType === 'xml' || userType !== 'text' && xmlRegEx.test(xdr.contentType)) {
                                var doc = new window.ActiveXObject('Microsoft.XMLDOM');
                                doc.async = false;
                                try {
                                    doc.loadXML(xdr.responseText);
                                } catch (e) {
                                    doc = undefined;
                                }
                                if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                                    status.code = 500;
                                    status.message = 'parseerror';
                                    throw 'Invalid XML: ' + xdr.responseText;
                                }
                                responses.xml = doc;
                            }
                        } catch (parseMessage) {
                            throw parseMessage;
                        } finally {
                            complete(status.code, status.message, responses, allResponseHeaders);
                        }
                    };
                    // set an empty handler for 'onprogress' so requests don't get aborted
                    xdr.onprogress = function () {};
                    xdr.onerror = function () {
                        complete(500, 'error', {
                            text: xdr.responseText
                        });
                    };
                    var postData = '';
                    if (userOptions.data) {
                        postData = $.type(userOptions.data) === 'string' ? userOptions.data : $.param(userOptions.data);
                    }
                    xdr.open(options.type, options.url);
                    xdr.send(postData);
                },
                abort: function abort() {
                    if (xdr) {
                        xdr.abort();
                    }
                }
            };
        }
    });
}
// Test $ exists

var Curator = {
    debug: false,
    SOURCE_TYPES: ['twitter', 'instagram'],

    log: function log(s) {

        if (window.console && Curator.debug) {
            window.console.log(s);
        }
    },

    alert: function alert(s) {
        if (window.alert) {
            window.alert(s);
        }
    },

    checkContainer: function checkContainer(container) {
        Curator.log("Curator->checkContainer: " + container);
        if ($(container).length === 0) {
            if (window.console) {
                window.console.log('Curator could not find the element ' + container + '. Please ensure this element existings in your HTML code. Exiting.');
            }
            return false;
        }
        return true;
    },

    checkPowered: function checkPowered(jQuerytag) {
        Curator.log("Curator->checkPowered");
        var h = jQuerytag.html();
        // Curator.log (h);
        if (h.indexOf('Curator') > 0) {
            return true;
        } else {
            Curator.alert('Container is missing Powered by Curator');
            return false;
        }
    },

    loadCSS: function loadCSS(config) {
        try {
            var sheet = Curator.createSheet(config);

            var headerBgs = '.crt-post .crt-post-header, .crt-post .crt-post-header .social-icon';
            var headerTexts = '.crt-post .crt-post-header, .crt-post .crt-post-share, .crt-post .crt-post-header .crt-post-name a, .crt-post .crt-post-share a, .crt-post .crt-post-header .social-icon i';
            var bodyBgs = '.crt-post';
            var bodyTexts = '.crt-post .crt-post-content-text';

            // add new rules
            Curator.addCSSRule(sheet, headerBgs, 'background-color:' + config.colours.headerBg);
            Curator.addCSSRule(sheet, headerTexts, 'color:' + config.colours.headerText);
            Curator.addCSSRule(sheet, bodyBgs, 'background-color:' + config.colours.bodyBg);
            Curator.addCSSRule(sheet, bodyTexts, 'color:' + config.colours.bodyText);
        } catch (err) {
            console.log('CURATOR UNABLE TO LOAD CSS');
            console.log(err.message);
        }
    },

    addCSSRule: function addCSSRule(sheet, selector, rules, index) {
        if ('insertRule' in sheet) {
            sheet.insertRule(selector + '{' + rules + '}', 0);
        } else if ('addRule' in sheet) {
            sheet.addRule(selector, rules);
        }
    },

    createSheet: function createSheet() {
        var style = document.createElement("style");
        // WebKit hack :(
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);
        return style.sheet;
    },

    loadWidget: function loadWidget(config, template) {
        if (template) {
            Curator.Templates.postTemplate = template;
        }

        var ConstructorClass = window.Curator[config.type];
        window.curatorWidget = new ConstructorClass(config);
    },

    Templates: {},

    Config: {
        Defaults: {
            apiEndpoint: 'https://api.curator.io/v1',
            feedId: '',
            postsPerPage: 12,
            maxPosts: 0,
            debug: false,
            postTemplate: '#post-template',
            onPostsLoaded: function onPostsLoaded() {},
            filter: {
                show: false,
                label: 'Show:'
            }
        }
    },

    augment: augment
};

if ($ === undefined) {
    Curator.alert('Curator requires jQuery. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}

var EventBus = function () {
    function EventBus() {
        _classCallCheck(this, EventBus);

        this.listeners = {};
    }

    _createClass(EventBus, [{
        key: 'on',
        value: function on(type, callback, scope) {
            var args = [];
            var numOfArgs = arguments.length;
            for (var i = 0; i < numOfArgs; i++) {
                args.push(arguments[i]);
            }
            args = args.length > 3 ? args.splice(3, args.length - 1) : [];
            if (typeof this.listeners[type] != "undefined") {
                this.listeners[type].push({ scope: scope, callback: callback, args: args });
            } else {
                this.listeners[type] = [{ scope: scope, callback: callback, args: args }];
            }
        }
    }, {
        key: 'off',
        value: function off(type, callback, scope) {
            if (typeof this.listeners[type] != "undefined") {
                var numOfCallbacks = this.listeners[type].length;
                var newArray = [];
                for (var i = 0; i < numOfCallbacks; i++) {
                    var listener = this.listeners[type][i];
                    if (listener.scope == scope && listener.callback == callback) {} else {
                        newArray.push(listener);
                    }
                }
                this.listeners[type] = newArray;
            }
        }
    }, {
        key: 'has',
        value: function has(type, callback, scope) {
            if (typeof this.listeners[type] != "undefined") {
                var numOfCallbacks = this.listeners[type].length;
                if (callback === undefined && scope === undefined) {
                    return numOfCallbacks > 0;
                }
                for (var i = 0; i < numOfCallbacks; i++) {
                    var listener = this.listeners[type][i];
                    if ((scope ? listener.scope == scope : true) && listener.callback == callback) {
                        return true;
                    }
                }
            }
            return false;
        }
    }, {
        key: 'trigger',
        value: function trigger(type, target) {
            var numOfListeners = 0;
            var event = {
                type: type,
                target: target
            };
            var args = [];
            var numOfArgs = arguments.length;
            for (var i = 0; i < numOfArgs; i++) {
                args.push(arguments[i]);
            }
            args = args.length > 2 ? args.splice(2, args.length - 1) : [];
            args = [event].concat(args);
            if (typeof this.listeners[type] != "undefined") {
                var numOfCallbacks = this.listeners[type].length;
                for (var _i = 0; _i < numOfCallbacks; _i++) {
                    var listener = this.listeners[type][_i];
                    if (listener && listener.callback) {
                        var concatArgs = args.concat(listener.args);
                        listener.callback.apply(listener.scope, concatArgs);
                        numOfListeners += 1;
                    }
                }
            }
        }
    }, {
        key: 'getEvents',
        value: function getEvents() {
            var str = "";
            for (var type in this.listeners) {
                var numOfCallbacks = this.listeners[type].length;
                for (var i = 0; i < numOfCallbacks; i++) {
                    var listener = this.listeners[type][i];
                    str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
                    str += " listen for '" + type + "'\n";
                }
            }
            return str;
        }
    }]);

    return EventBus;
}();

Curator.EventBus = new EventBus();

(function ($) {
    // Default styling

    var defaults = {
        circular: false,
        speed: 5000,
        duration: 700,
        minWidth: 250,
        panesVisible: null,
        moveAmount: 0,
        autoPlay: false,
        useCss: true
    };

    if ($.zepto) {
        defaults.easing = 'ease-in-out';
    }
    // console.log (defaults);

    var css = {
        viewport: {
            'width': '100%', // viewport needs to be fluid
            // 'overflow': 'hidden',
            'position': 'relative'
        },

        pane_stage: {
            'width': '100%', // viewport needs to be fluid
            'overflow': 'hidden',
            'position': 'relative',
            'height': 0
        },

        pane_slider: {
            'width': '0%', // will be set to (number of panes * 100)
            'list-style': 'none',
            'position': 'relative',
            'overflow': 'hidden',
            'padding': '0',
            'left': '0'
        },

        pane: {
            'width': '0%', // will be set to (100 / number of images)
            'position': 'relative',
            'float': 'left'
        }
    };

    var Carousel = function () {
        function Carousel(container, options) {
            var _this = this;

            _classCallCheck(this, Carousel);

            Curator.log('Carousel->construct');

            this.current_position = 0;
            this.animating = false;
            this.timeout = null;
            this.FAKE_NUM = 0;
            this.PANES_VISIBLE = 0;

            this.options = $.extend([], defaults, options);

            this.$viewport = $(container); // <div> slider, known as $viewport

            this.$panes = this.$viewport.children();
            this.$panes.detach();

            this.$pane_stage = $('<div class="ctr-carousel-stage"></div>').appendTo(this.$viewport);
            this.$pane_slider = $('<div class="ctr-carousel-slider"></div>').appendTo(this.$pane_stage);

            // this.$pane_slider.append(this.$panes);

            this.$viewport.css(css.viewport); // set css on viewport
            this.$pane_slider.css(css.pane_slider); // set css on pane slider
            this.$pane_stage.css(css.pane_stage); // set css on pane slider

            this.addControls();
            this.update();

            $(window).smartresize(function () {
                _this.resize();
                _this.move(_this.current_position, true);

                // reset animation timer
                if (_this.options.autoPlay) {
                    _this.animate();
                }
            });
        }

        _createClass(Carousel, [{
            key: 'update',
            value: function update() {
                this.$panes = this.$pane_slider.children(); // <li> list items, known as $panes
                this.NUM_PANES = this.options.circular ? this.$panes.length + 1 : this.$panes.length;

                if (this.NUM_PANES > 0) {
                    this.resize();
                    this.move(this.current_position, true);

                    if (!this.animating) {
                        if (this.options.autoPlay) {
                            this.animate();
                        }
                    }
                }
            }
        }, {
            key: 'add',
            value: function add($els) {
                var $panes = [];
                //
                // $.each($els,(i, $pane)=> {
                //     let p = $pane.wrapAll('<div class="crt-carousel-col"></div>').parent();
                //     $panes.push(p)
                // });

                this.$pane_slider.append($els);
                this.$panes = this.$pane_slider.children();
            }
        }, {
            key: 'resize',
            value: function resize() {
                var _this2 = this;

                var PANE_WRAPPER_WIDTH = this.options.infinite ? (this.NUM_PANES + 1) * 100 + '%' : this.NUM_PANES * 100 + '%'; // % width of slider (total panes * 100)

                this.$pane_slider.css({ width: PANE_WRAPPER_WIDTH }); // set css on pane slider

                this.VIEWPORT_WIDTH = this.$viewport.width();

                if (this.options.panesVisible) {
                    // TODO - change to check if it's a function or a number
                    this.PANES_VISIBLE = this.options.panesVisible();
                    this.PANE_WIDTH = this.VIEWPORT_WIDTH / this.PANES_VISIBLE;
                } else {
                    this.PANES_VISIBLE = this.VIEWPORT_WIDTH < this.options.minWidth ? 1 : Math.floor(this.VIEWPORT_WIDTH / this.options.minWidth);
                    this.PANE_WIDTH = this.VIEWPORT_WIDTH / this.PANES_VISIBLE;
                }

                if (this.options.infinite) {

                    this.$panes.filter('.crt-clone').remove();

                    for (var i = this.NUM_PANES - 1; i > this.NUM_PANES - 1 - this.PANES_VISIBLE; i--) {
                        // console.log(i);
                        var first = this.$panes.eq(i).clone();
                        first.addClass('crt-clone');
                        first.css('opacity', '1');
                        // Should probably move this out to an event
                        first.find('.crt-post-image').css({ opacity: 1 });
                        this.$pane_slider.prepend(first);
                        this.FAKE_NUM = this.PANES_VISIBLE;
                    }
                    this.$panes = this.$pane_slider.children();
                }

                this.$panes.each(function (index, pane) {
                    $(pane).css($.extend(css.pane, { width: _this2.PANE_WIDTH + 'px' }));
                });
            }
        }, {
            key: 'destroy',
            value: function destroy() {}
        }, {
            key: 'animate',
            value: function animate() {
                var _this3 = this;

                this.animating = true;
                clearTimeout(this.timeout);
                this.timeout = setTimeout(function () {
                    _this3.next();
                }, this.options.speed);
            }
        }, {
            key: 'next',
            value: function next() {
                var move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE;
                this.move(this.current_position + move, false);
            }
        }, {
            key: 'prev',
            value: function prev() {
                var move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE;
                this.move(this.current_position - move, false);
            }
        }, {
            key: 'move',
            value: function move(i, noAnimate) {
                var _this4 = this;

                // console.log(i);

                this.current_position = i;

                var maxPos = this.NUM_PANES - this.PANES_VISIBLE;

                // if (this.options.infinite)
                // {
                // 	let mod = this.NUM_PANES % this.PANES_VISIBLE;
                // }

                if (this.current_position < 0) {
                    this.current_position = 0;
                } else if (this.current_position > maxPos) {
                    this.current_position = maxPos;
                }

                var curIncFake = this.FAKE_NUM + this.current_position;
                var left = curIncFake * this.PANE_WIDTH;
                // console.log('move');
                // console.log(curIncFake);
                var panesInView = this.PANES_VISIBLE;
                var max = this.options.infinite ? this.PANE_WIDTH * this.NUM_PANES : this.PANE_WIDTH * this.NUM_PANES - this.VIEWPORT_WIDTH;

                this.currentLeft = left;

                //console.log(left+":"+max);

                if (left < 0) {
                    this.currentLeft = 0;
                } else if (left > max) {
                    this.currentLeft = max;
                } else {
                    this.currentLeft = left;
                }

                if (noAnimate) {
                    this.$pane_slider.css({
                        left: 0 - this.currentLeft + 'px'
                    });
                    this.moveComplete();
                } else {
                    var options = {
                        duration: this.options.duration,
                        complete: function complete() {
                            _this4.moveComplete();
                        }
                    };
                    if (this.options.easing) {
                        options.easing = this.options.easing;
                    }
                    this.$pane_slider.animate({
                        left: 0 - this.currentLeft + 'px'
                    }, options);
                }
            }
        }, {
            key: 'moveComplete',
            value: function moveComplete() {
                var _this5 = this;

                // console.log ('moveComplete');
                // console.log (this.current_position);
                // console.log (this.NUM_PANES - this.PANES_VISIBLE);
                if (this.options.infinite && this.current_position >= this.NUM_PANES - this.PANES_VISIBLE) {
                    // console.log('IIIII');
                    // infinite and we're off the end!
                    // re-e-wind, the crowd says 'bo selecta!'
                    this.$pane_slider.css({ left: 0 });
                    this.current_position = 0 - this.PANES_VISIBLE;
                    this.currentLeft = 0;
                }

                setTimeout(function () {
                    var paneMaxHieght = 0;
                    for (var i = _this5.current_position; i < _this5.current_position + _this5.PANES_VISIBLE; i++) {
                        var p = $(_this5.$panes[i]).children('.crt-post');
                        var h = p.height();
                        if (h > paneMaxHieght) {
                            paneMaxHieght = h;
                        }
                        console.log(p);
                        console.log(i + ":" + h);
                    }
                    _this5.$pane_stage.animate({ height: paneMaxHieght }, 300);
                }, 50);

                this.$viewport.trigger('curatorCarousel:changed', [this, this.current_position]);

                if (this.options.autoPlay) {
                    this.animate();
                }
            }
        }, {
            key: 'addControls',
            value: function addControls() {
                this.$viewport.append('<button type="button" data-role="none" class="crt-panel-prev crt-panel-arrow" aria-label="Previous" role="button" aria-disabled="false">Previous</button>');
                this.$viewport.append('<button type="button" data-role="none" class="crt-panel-next crt-panel-arrow" aria-label="Next" role="button" aria-disabled="false">Next</button>');

                this.$viewport.on('click', '.crt-panel-prev', this.prev.bind(this));
                this.$viewport.on('click', '.crt-panel-next', this.next.bind(this));
            }
        }, {
            key: 'method',
            value: function method() {
                var m = arguments[0];
                // let args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
                if (m == 'update') {
                    this.update();
                } else if (m == 'add') {
                    this.add(arguments[1]);
                } else if (m == 'destroy') {
                    this.destroy();
                } else {}
            }
        }]);

        return Carousel;
    }();

    var carousels = {};
    function rand() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    }

    $.extend($.fn, {
        curatorCarousel: function curatorCarousel(options) {
            var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);

            $.each(this, function (index, item) {
                var id = $(item).data('carousel');

                if (carousels[id]) {
                    carousels[id].method.apply(carousels[id], args);
                } else {
                    id = rand();
                    carousels[id] = new Carousel(item, options);
                    $(item).data('carousel', id);
                }
            });

            return this;
        }
    });

    window.CCarousel = Carousel;
})($);

var Client = function () {
    function Client() {
        _classCallCheck(this, Client);

        Curator.log('Client->construct');
    }

    _createClass(Client, [{
        key: 'setOptions',
        value: function setOptions(options, defaults) {

            this.options = $.extend(true, {}, defaults, options);

            if (options.debug) {
                Curator.debug = true;
            }

            // Curator.log(this.options);

            return true;
        }
    }, {
        key: 'init',
        value: function init() {

            if (!Curator.checkContainer(this.options.container)) {
                return false;
            }

            this.$container = $(this.options.container);

            this.createFeed();
            this.createFilter();
            this.createPopupManager();

            return true;
        }
    }, {
        key: 'createFeed',
        value: function createFeed() {
            var _this6 = this;

            this.feed = new Curator.Feed(this);
            this.feed.on('postsLoaded', function (event) {
                _this6.onPostsLoaded(event.target);
            });
            this.feed.on('postsFailed', function (event) {
                _this6.onPostsFail(event.target);
            });
        }
    }, {
        key: 'createPopupManager',
        value: function createPopupManager() {
            this.popupManager = new Curator.PopupManager(this);
        }
    }, {
        key: 'createFilter',
        value: function createFilter() {
            if (this.options.filter && this.options.filter.show) {
                this.filter = new Curator.Filter(this);
            }
        }
    }, {
        key: 'loadPosts',
        value: function loadPosts(page) {
            this.feed.loadPosts(page);
        }
    }, {
        key: 'createPostElements',
        value: function createPostElements(posts) {
            var that = this;
            var postElements = [];
            $(posts).each(function () {
                var p = that.createPostElement(this);
                postElements.push(p.$el);
            });
            return postElements;
        }
    }, {
        key: 'createPostElement',
        value: function createPostElement(postJson) {
            var post = new Curator.Post(postJson, this.options, this);
            $(post).bind('postClick', this.onPostClick.bind(this));
            $(post).bind('postReadMoreClick', this.onPostClick.bind(this));

            if (this.options.onPostCreated) {
                this.options.onPostCreated(post);
            }

            return post;
        }
    }, {
        key: 'onPostsLoaded',
        value: function onPostsLoaded(event) {
            Curator.log('Client->onPostsLoaded');
            Curator.log(event.target);
        }
    }, {
        key: 'onPostsFail',
        value: function onPostsFail(event) {
            Curator.log('Client->onPostsLoadedFail');
            Curator.log(event.target);
        }
    }, {
        key: 'onPostClick',
        value: function onPostClick(ev, post) {
            this.popupManager.showPopup(post);
        }
    }, {
        key: 'track',
        value: function track(a) {
            Curator.log('Feed->track ' + a);

            $.ajax({
                url: this.getUrl('/track/' + this.options.feedId),
                dataType: 'json',
                data: { a: a },
                success: function success(data) {
                    Curator.log('Feed->track success');
                    Curator.log(data);
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    Curator.log('Feed->_loadPosts fail');
                    Curator.log(textStatus);
                    Curator.log(errorThrown);
                }
            });
        }
    }, {
        key: 'getUrl',
        value: function getUrl(trail) {
            return this.options.apiEndpoint + trail;
        }
    }]);

    return Client;
}();

Curator.Client = Client;
$.support.cors = true;

var defaults = {
    postsPerPage: 24,
    feedId: 'xxx',
    feedParams: {},
    debug: false,
    apiEndpoint: 'https://api.curator.io/v1',
    onPostsLoaded: function onPostsLoaded(data) {
        Curator.log('Feed->onPostsLoaded');
        Curator.log(data);
    },
    onPostsFail: function onPostsFail(data) {
        Curator.log('Feed->onPostsFail failed with message');
        Curator.log(data.message);
    }
};

var Feed = function (_EventBus) {
    _inherits(Feed, _EventBus);

    function Feed(client) {
        _classCallCheck(this, Feed);

        var _this7 = _possibleConstructorReturn(this, (Feed.__proto__ || Object.getPrototypeOf(Feed)).call(this));

        Curator.log('Feed->init with options');

        _this7.client = client;

        _this7.posts = [];
        _this7.currentPage = 0;
        _this7.postsLoaded = 0;
        _this7.postCount = 0;
        _this7.loading = false;

        _this7.options = _this7.client.options;

        _this7.feedBase = _this7.options.apiEndpoint + '/feed';
        return _this7;
    }

    _createClass(Feed, [{
        key: 'loadPosts',
        value: function loadPosts(page, paramsIn) {
            page = page || 0;
            Curator.log('Feed->loadPosts ' + this.loading);
            if (this.loading) {
                return false;
            }
            this.currentPage = page;

            var params = $.extend({}, this.options.feedParams, paramsIn);

            params.limit = this.options.postsPerPage;
            params.offset = page * this.options.postsPerPage;

            this._loadPosts(params);
        }
    }, {
        key: 'loadMore',
        value: function loadMore(paramsIn) {
            Curator.log('Feed->loadMore ' + this.loading);
            if (this.loading) {
                return false;
            }

            var params = {
                limit: this.options.postsPerPage
            };
            $.extend(params, this.options.feedParams, paramsIn);

            params.offset = this.posts.length;

            this._loadPosts(params);
        }
    }, {
        key: '_loadPosts',
        value: function _loadPosts(params) {
            var _this8 = this;

            Curator.log('Feed->_loadPosts');

            this.loading = true;

            $.ajax({
                url: this.getUrl('/posts'),
                dataType: 'json',
                data: params,
                success: function success(data) {
                    Curator.log('Feed->_loadPosts success');

                    if (data.success) {
                        _this8.postCount = data.postCount;
                        _this8.postsLoaded += data.posts.length;

                        _this8.posts = _this8.posts.concat(data.posts);
                        _this8.networks = data.networks;

                        _this8.trigger('postsLoaded', data.posts);
                    } else {
                        _this8.trigger('postsFailed', data.posts);
                    }
                    _this8.loading = false;
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    Curator.log('Feed->_loadPosts fail');
                    Curator.log(textStatus);
                    Curator.log(errorThrown);

                    _this8.trigger('postsFailed', []);
                    _this8.loading = false;
                }
            });
        }
    }, {
        key: 'loadPost',
        value: function loadPost(id, successCallback, failCallback) {
            failCallback = failCallback || function () {};
            $.get(this.getUrl('/post/' + id), {}, function (data) {
                if (data.success) {
                    successCallback(data.post);
                } else {
                    failCallback();
                }
            });
        }
    }, {
        key: 'inappropriatePost',
        value: function inappropriatePost(id, reason, success, failure) {
            var params = {
                reason: reason
                // where: {
                //     id: {'=': id}
                // }
            };

            $.post(this.getUrl('/post/' + id + '/inappropriate'), params, function (data, textStatus, jqXHR) {
                data = $.parseJSON(data);

                if (data.success === true) {
                    success();
                } else {
                    failure(jqXHR);
                }
            });
        }
    }, {
        key: 'lovePost',
        value: function lovePost(id, success, failure) {
            var params = {};

            $.post(this.getUrl('/post/' + id + '/love'), params, function (data, textStatus, jqXHR) {
                data = $.parseJSON(data);

                if (data.success === true) {
                    success(data.loves);
                } else {
                    failure(jqXHR);
                }
            });
        }
    }, {
        key: 'getUrl',
        value: function getUrl(trail) {
            return this.feedBase + '/' + this.options.feedId + trail;
        }
    }]);

    return Feed;
}(EventBus);

Curator.Feed = Feed;
/**
* ==================================================================
* Filter
* ==================================================================
*/

Curator.Templates.filterTemplate = ' <div class="crt-filter"> \
<div class="crt-filter-network">\
<label>Show:</label> \
<ul class="networks">\
</ul>\
</div> \
</div>';

var Filter = function () {
    function Filter(client) {
        var _this9 = this;

        _classCallCheck(this, Filter);

        Curator.log('Filter->construct');

        this.client = client;

        this.$filter = Curator.Template.render('#filterTemplate', {});
        this.$filterNetworks = this.$filter.find('.networks');

        this.client.$container.append(this.$filter);

        this.$filter.find('.crt-filter-network label').text(this.client.options.filter.label);

        this.$filter.on('click', '.crt-filter-network a', function (ev) {
            ev.preventDefault();
            console.log(ev);
            var t = $(ev.target);
            var networkId = t.data('network');

            _this9.$filter.find('.crt-filter-network li').removeClass('active');
            t.parent().addClass('active');

            Curator.EventBus.trigger('crt:filter:change');

            if (networkId) {
                _this9.client.feed.loadPosts(0, { network_id: networkId });
            } else {
                _this9.client.feed.loadPosts(0, {});
            }
        });

        this.client.feed.on('postsLoaded', function (event) {
            _this9.onPostsLoaded(event.target);
        });
    }

    _createClass(Filter, [{
        key: 'onPostsLoaded',
        value: function onPostsLoaded() {
            console.log("Asd");

            if (!this.filtersLoaded) {
                this.$filterNetworks.append('<li class="active"><a href="#" data-network="0"> All</a></li>');

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.client.feed.networks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var id = _step.value;

                        var network = Curator.Networks[id];
                        console.log(network);
                        this.$filterNetworks.append('<li><a href="#" data-network="' + id + '"><i class="' + network.icon + '"></i> ' + network.name + '</a></li>');
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                this.filtersLoaded = true;
            }
        }
    }]);

    return Filter;
}();

Curator.Filter = Filter;
Curator.Networks = {
    1: {
        name: 'Twitter',
        icon: 'crt-icon-twitter'
    },
    2: {
        name: 'Instagram',
        icon: 'crt-icon-instagram'
    },
    3: {
        name: 'Facebook',
        icon: 'crt-icon-facebook'
    },
    4: {
        name: 'Pinterest',
        icon: 'crt-icon-pinterest'
    },
    5: {
        name: 'Google',
        icon: 'crt-icon-google'
    },
    6: {
        name: 'Vine',
        icon: 'crt-icon-vine'
    },
    7: {
        name: 'Flickr',
        icon: 'crt-icon-flickr'
    },
    8: {
        name: 'Youtube',
        icon: 'crt-icon-youtube'
    },
    9: {
        name: 'Tumblr',
        icon: 'crt-icon-tumblr'
    },
    10: {
        name: 'RSS',
        icon: 'crt-icon-rss'
    },
    11: {
        name: 'LinkedIn',
        icon: 'crt-icon-linkedin'
    }
};
/**
* ==================================================================
* Popup
* ==================================================================
*/

Curator.PopupInappropriate = function (post, feed) {
    this.init(post, feed);
};

$.extend(Curator.PopupInappropriate.prototype, {
    feed: null,
    post: null,

    init: function init(post, feed) {
        var that = this;

        this.feed = feed;
        this.post = post;

        this.jQueryel = $('.mark-bubble');

        $('.mark-close').click(function (e) {
            e.preventDefault();
            $(this).parent().fadeOut('slow');
        });

        $('.mark-bubble .submit').click(function () {
            var $input = that.$el.find('input.text');

            var reason = $.trim($input.val());

            if (reason) {
                $input.disabled = true;
                $(this).hide();

                that.$el.find('.waiting').show();

                feed.inappropriatePost(that.post.id, reason, function () {
                    $input.val('');
                    that.$el.find('.waiting').hide();
                    that.$el.find('.title').html('Thank you');
                    that.$el.find('input.text').hide();
                    that.$el.find('input.text').html('');
                    that.$el.find('.success-message').html('This message has been marked as inappropriate').show();
                }, function () {
                    that.$el.find('.waiting').hide();
                    that.$el.find('.title').html('Oops');
                    that.$el.find('input.text').hide();
                    that.$el.find('input.text').html('');
                    that.$el.find('.success-message').html('It looks like a problem has occurred. Please try again later').show();
                });
            }
        });

        this.$el.fadeIn('slow');
    }
});
/**
* ==================================================================
* Popup Manager
* ==================================================================
*/

var PopupManager = function () {
    function PopupManager(client) {
        _classCallCheck(this, PopupManager);

        Curator.log("PopupManager->init ");

        this.client = client;
        this.templateId = '#popup-wrapper-template';

        this.$wrapper = Curator.Template.render(this.templateId, {});
        this.$popupContainer = this.$wrapper.find('.crt-popup-container');
        this.$underlay = this.$wrapper.find('.crt-popup-underlay');

        $('body').append(this.$wrapper);
        this.$underlay.click(this.onUnderlayClick.bind(this));
        //this.$popupContainer.click(this.onUnderlayClick.bind(this));
    }

    _createClass(PopupManager, [{
        key: 'showPopup',
        value: function showPopup(post) {
            var _this10 = this;

            if (this.popup) {
                this.popup.hide(function () {
                    _this10.popup.destroy();
                    _this10.showPopup2(post);
                });
            } else {
                this.showPopup2(post);
            }
        }
    }, {
        key: 'showPopup2',
        value: function showPopup2(post) {
            this.popup = new Curator.Popup(this, post, this.feed);
            this.$popupContainer.append(this.popup.$popup);

            this.$wrapper.show();

            if (this.$underlay.css('display') !== 'block') {
                this.$underlay.fadeIn();
            }
            this.popup.show();

            $('body').addClass('crt-popup-visible');

            this.currentPostNum = 0;
            for (var i = 0; i < this.posts.length; i++) {
                // console.log (post.json.id +":"+this.posts[i].id);
                if (post.json.id == this.posts[i].id) {
                    this.currentPostNum = i;
                    Curator.log('Found post ' + i);
                    break;
                }
            }

            this.client.track('popup:show');
        }
    }, {
        key: 'setPosts',
        value: function setPosts(posts) {
            this.posts = posts;
        }
    }, {
        key: 'onClose',
        value: function onClose() {
            this.hide();
        }
    }, {
        key: 'onPrevious',
        value: function onPrevious() {
            this.currentPostNum -= 1;
            this.currentPostNum = this.currentPostNum >= 0 ? this.currentPostNum : this.posts.length - 1; // loop back to start

            this.showPopup({ json: this.posts[this.currentPostNum] });
        }
    }, {
        key: 'onNext',
        value: function onNext() {
            this.currentPostNum += 1;
            this.currentPostNum = this.currentPostNum < this.posts.length ? this.currentPostNum : 0; // loop back to start

            this.showPopup({ json: this.posts[this.currentPostNum] });
        }
    }, {
        key: 'onUnderlayClick',
        value: function onUnderlayClick(e) {
            Curator.log('PopupManager->onUnderlayClick');
            e.preventDefault();

            this.popup.hide(function () {
                this.hide();
            }.bind(this));
        }
    }, {
        key: 'hide',
        value: function hide() {
            var _this11 = this;

            Curator.log('PopupManager->hide');
            this.client.track('popup:hide');
            $('body').removeClass('crt-popup-visible');
            this.currentPostNum = 0;
            this.popup = null;
            this.$underlay.fadeOut(function () {
                _this11.$underlay.css({ 'display': '', 'opacity': '' });
                _this11.$wrapper.hide();
            });
        }
    }, {
        key: 'destroy',
        value: function destroy() {

            this.$underlay.remove();

            delete this.$popup;
            delete this.$underlay;
        }
    }]);

    return PopupManager;
}();

Curator.PopupManager = PopupManager;
/**
* ==================================================================
* Popup
* ==================================================================
*/

var Popup = function () {
    function Popup(popupManager, post, feed) {
        _classCallCheck(this, Popup);

        Curator.log("Popup->init ");

        this.popupManager = popupManager;
        this.json = post.json;
        this.feed = feed;

        this.templateId = '#popup-template';
        this.videoPlaying = false;

        this.$popup = Curator.Template.render(this.templateId, this.json);

        if (this.json.image) {
            this.$popup.addClass('has-image');
        }

        if (this.json.video) {
            this.$popup.addClass('has-video');
        }

        if (this.json.video && this.json.video.indexOf('youtu') >= 0) {
            // youtube
            this.$popup.find('video').remove();
            // this.$popup.removeClass('has-image');

            var youTubeId = Curator.StringUtils.youtubeVideoId(this.json.video);

            var src = '<iframe id="ytplayer" type="text/html" width="615" height="615" \
            src="https://www.youtube.com/embed/' + youTubeId + '?autoplay=0&rel=0&showinfo" \
            frameborder="0"></iframe>';

            this.$popup.find('.crt-video-container img').remove();
            this.$popup.find('.crt-video-container a').remove();
            this.$popup.find('.crt-video-container').append(src);
        }

        this.$popup.on('click', ' .crt-close', this.onClose.bind(this));
        this.$popup.on('click', ' .crt-previous', this.onPrevious.bind(this));
        this.$popup.on('click', ' .crt-next', this.onNext.bind(this));
        this.$popup.on('click', ' .crt-play', this.onPlay.bind(this));
        this.$popup.on('click', '.crt-share-facebook', this.onShareFacebookClick.bind(this));
        this.$popup.on('click', '.crt-share-twitter', this.onShareTwitterClick.bind(this));
    }

    _createClass(Popup, [{
        key: 'onShareFacebookClick',
        value: function onShareFacebookClick(ev) {
            ev.preventDefault();
            Curator.SocialFacebook.share(this.json);
            this.widget.track('share:facebook');
            return false;
        }
    }, {
        key: 'onShareTwitterClick',
        value: function onShareTwitterClick(ev) {
            ev.preventDefault();
            Curator.SocialTwitter.share(this.json);
            this.widget.track('share:twitter');
            return false;
        }
    }, {
        key: 'onClose',
        value: function onClose(e) {
            e.preventDefault();
            var that = this;
            this.hide(function () {
                that.popupManager.onClose();
            });
        }
    }, {
        key: 'onPrevious',
        value: function onPrevious(e) {
            e.preventDefault();

            this.popupManager.onPrevious();
        }
    }, {
        key: 'onNext',
        value: function onNext(e) {
            e.preventDefault();

            this.popupManager.onNext();
        }
    }, {
        key: 'onPlay',
        value: function onPlay(e) {
            Curator.log('Popup->onPlay');
            e.preventDefault();

            this.videoPlaying = !this.videoPlaying;

            if (this.videoPlaying) {
                this.$popup.find('video')[0].play();
                this.popupManager.client.track('video:play');
            } else {
                this.$popup.find('video')[0].pause();
                this.popupManager.client.track('video:pause');
            }

            Curator.log(this.videoPlaying);

            this.$popup.toggleClass('video-playing', this.videoPlaying);
        }
    }, {
        key: 'show',
        value: function show() {
            //
            // let post = this.json;
            // let mediaUrl = post.image,
            //     text = post.text;
            //
            // if (mediaUrl) {
            //     let $imageWrapper = that.$el.find('div.main-image-wrapper');
            //     this.loadMainImage(mediaUrl, $imageWrapper, ['main-image']);
            // }
            //
            // let $socialIcon = this.$el.find('.social-icon');
            // $socialIcon.attr('class', 'social-icon');
            // $socialIcon.addClass(Curator.SOURCE_TYPES[post.sourceType]);
            //
            // //format the date
            // let date = Curator.Utils.dateAsDayMonthYear(post.sourceCreateAt);
            //
            // this.$el.find('input.discovery-id').val(post.id);
            // this.$el.find('div.full-name span').html(post.user_full_name);
            // this.$el.find('div.username span').html('@' + post.user_screen_name);
            // this.$el.find('div.date span').html(date);
            // this.$el.find('div.love-indicator span').html(post.loves);
            // this.$el.find('div.side-text span').html(text);
            //
            // this.wrapper.show();
            this.$popup.fadeIn(function () {
                // that.$popup.find('.crt-popup').animate({width:950}, function () {
                //     $('.popup .content').fadeIn('slow');
                // });
            });
        }
    }, {
        key: 'hide',
        value: function hide(callback) {
            Curator.log('Popup->hide');
            var that = this;
            this.$popup.fadeOut(function () {
                that.destroy();
                callback();
            });
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            if (this.$popup && this.$popup.length) {
                this.$popup.remove();

                if (this.$popup.find('video').length) {
                    this.$popup.find('video')[0].pause();
                }
            }

            delete this.$popup;
        }
    }]);

    return Popup;
}();

Curator.Popup = Popup;

/**
* ==================================================================
* Post
* ==================================================================
*/

var Post = function () {
    function Post(postJson, options, widget) {
        var _this12 = this;

        _classCallCheck(this, Post);

        this.options = options;
        this.widget = widget;

        this.templateId = this.options.postTemplate;

        this.json = postJson;
        this.$el = Curator.Template.render(this.templateId, postJson);

        this.$el.find('.crt-share-facebook').click(this.onShareFacebookClick.bind(this));
        this.$el.find('.crt-share-twitter').click(this.onShareTwitterClick.bind(this));
        // this.$el.find('.crt-hitarea').click(this.onPostClick.bind(this));
        this.$el.find('.crt-post-read-more-button').click(this.onReadMoreClick.bind(this));
        // this.$el.on('click','.crt-post-text-body a',this.onLinkClick.bind(this));
        this.$el.click(this.onPostClick.bind(this));
        this.$post = this.$el.find('.crt-post');
        this.$image = this.$el.find('.crt-post-image');
        this.$imageContainer = this.$el.find('.crt-image-c');
        this.$image.css({ opacity: 0 });

        if (this.json.image) {
            this.$image.on('load', this.onImageLoaded.bind(this));
            this.$image.on('error', this.onImageError.bind(this));
        } else {
            // no image ... call this.onImageLoaded
            setTimeout(function () {
                console.log('asdasd');
                _this12.setHeight();
            }, 100);
        }

        if (this.json.image_width > 0) {
            var p = this.json.image_height / this.json.image_width * 100;
            this.$imageContainer.addClass('crt-image-responsive').css('padding-bottom', p + '%');
        }

        this.$image.data('dims', this.json.image_width + ':' + this.json.image_height);

        this.$post = this.$el.find('.crt-post');

        if (this.json.video) {
            this.$post.addClass('has-video');
        }
    }

    _createClass(Post, [{
        key: 'onShareFacebookClick',
        value: function onShareFacebookClick(ev) {
            ev.preventDefault();
            Curator.SocialFacebook.share(this.json);
            this.widget.track('share:facebook');
            return false;
        }
    }, {
        key: 'onShareTwitterClick',
        value: function onShareTwitterClick(ev) {
            ev.preventDefault();
            Curator.SocialTwitter.share(this.json);
            this.widget.track('share:twitter');
            return false;
        }
    }, {
        key: 'onPostClick',
        value: function onPostClick(ev) {

            var target = $(ev.target);

            if (target.is('a') && target.attr('href') !== '#') {
                this.widget.track('click:link');
            } else {
                ev.preventDefault();
                $(this).trigger('postClick', this, this.json, ev);
            }
        }
    }, {
        key: 'onImageLoaded',
        value: function onImageLoaded() {
            this.$image.animate({ opacity: 1 });

            this.setHeight();
        }
    }, {
        key: 'onImageError',
        value: function onImageError() {
            // Unable to load image!!!
            this.$image.hide();

            this.setHeight();
        }
    }, {
        key: 'setHeight',
        value: function setHeight() {
            var height = this.$post.height();
            console.log(height);
            if (this.options.maxHeight && this.options.maxHeight > 0 && height > this.options.maxHeight) {
                this.$post.css({ maxHeight: this.options.maxHeight }).addClass('crt-post-max-height');
            }
        }
    }, {
        key: 'onReadMoreClick',
        value: function onReadMoreClick(ev) {
            ev.preventDefault();
            this.widget.track('click:read-more');
            $(this).trigger('postReadMoreClick', this, this.json, ev);
        }
    }]);

    return Post;
}();

Curator.Post = Post;
/* global FB */

Curator.SocialFacebook = {
    share: function share(post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        var cb = function cb() {};

        // Disabling for now - doesn't work - seems to get error "Can't Load URL: The domain of this URL isn't
        // included in the app's domains"
        var useJSSDK = false; // window.FB
        if (useJSSDK) {
            window.FB.ui({
                method: 'feed',
                link: obj.url,
                picture: obj.image,
                name: obj.user_screen_name,
                description: obj.text
            }, cb);
        } else {
            var url = "https://www.facebook.com/sharer/sharer.php?u={{url}}&d={{text}}";
            var url2 = Curator.Utils.tinyparser(url, obj);
            Curator.Utils.popup(url2, 'twitter', '600', '430', '0');
        }
    }
};

Curator.SocialPinterest = {
    share: function share(post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        var url = "http://pinterest.com/pin/create/button/?url={{url}}&media={{image}}&description={{text}}";
        Curator.Utils.popup(Curator.Utils.tinyparser(url, obj), 'pintrest', '600', '270', '0');
    }
};

Curator.SocialTwitter = {
    share: function share(post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);

        var url = "http://twitter.com/share?url={{url}}&text={{text}}&hashtags={{hashtags}}";
        var url2 = Curator.Utils.tinyparser(url, obj);
        // console.log(obj);
        // console.log(url);
        // console.log(url2);
        Curator.Utils.popup(url2, 'twitter', '600', '430', '0');
    }
};

Curator.Templates.postTemplate = ' \
<div class="crt-post-c">\
    <div class="crt-post-bg"></div> \
    <div class="crt-post post<%=id%> crt-post-<%=this.networkIcon()%>"> \
        <div class="crt-post-header"> \
            <span class="crt-social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name">\
            <div class="crt-post-fullname"><%=user_full_name%></div>\
            <div class="crt-post-username"><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div>\
            </div> \
        </div> \
        <div class="crt-post-content"> \
            <div class="crt-image crt-hitarea crt-post-content-image <%=this.contentImageClasses()%>" > \
                <div class="crt-image-c"><img src="<%=image%>" class="crt-post-image" /></div> \
                <span class="crt-play"><i class="crt-play-icon"></i></span> \
            </div> \
            <div class="text crt-post-content-text <%=this.contentTextClasses()%>"> \
                <div class="crt-post-text-body"><%=this.parseText(text)%></div> \
            </div> \
        </div> \
        <div class="crt-post-footer">\
            <div class="crt-date"><%=this.prettyDate(source_created_at)%></div> \
            <div class="crt-post-share"><span class="ctr-share-hint"></span><a href="#" class="crt-share-facebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="crt-share-twitter"><i class="crt-icon-twitter"></i></a></div>\
        </div> \
        <div class="crt-post-read-more"><a href="#" class="crt-post-read-more-button">Read more</a> </div> \
    </div>\
</div>';

Curator.Templates.popupWrapperTemplate = ' \
<div class="crt-popup-wrapper"> \
    <div class="crt-popup-wrapper-c"> \
        <div class="crt-popup-underlay"></div> \
        <div class="crt-popup-container"></div> \
    </div> \
</div>';

Curator.Templates.popupTemplate = ' \
<div class="crt-popup"> \
    <a href="#" class="crt-close crt-icon-cancel"></a> \
    <a href="#" class="crt-next crt-icon-right-open"></a> \
    <a href="#" class="crt-previous crt-icon-left-open"></a> \
    <div class="crt-popup-left">  \
        <div class="crt-video"> \
            <div class="crt-video-container">\
                <video preload="none">\
                <source src="<%=video%>" type="video/mp4" >\
                </video>\
                <img src="<%=image%>" />\
                <a href="javascript:;" class="crt-play"><i class="crt-play-icon"></i></a> \
            </div> \
        </div> \
        <div class="crt-image"> \
            <img src="<%=image%>" /> \
        </div> \
    </div> \
    <div class="crt-popup-right"> \
        <div class="crt-popup-header"> \
            <span class="crt-social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
        </div> \
        <div class="crt-popup-text <%=this.contentTextClasses()%>"> \
            <div class="crt-popup-text-container"> \
                <p class="crt-date"><%=this.prettyDate(source_created_at)%></p> \
                <div class="crt-popup-text-body"><%=this.parseText(text)%></div> \
            </div> \
        </div> \
        <div class="crt-popup-footer">\
            <div class="crt-post-share"><span class="ctr-share-hint"></span><a href="#" class="crt-share-facebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="crt-share-twitter"><i class="crt-icon-twitter"></i></a></div>\
        </div> \
    </div> \
</div>';

Curator.Templates.popupUnderlayTemplate = '';

Curator.Template = {
    camelize: function camelize(s) {
        return s.replace(/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase() : '';
        });
    },
    render: function render(templateId, data) {
        var cam = this.camelize(templateId).substring(1);
        var source = '';

        // console.log (cam);
        // console.log (data);

        if (Curator.Templates[cam] !== undefined) {
            source = Curator.Templates[cam];
        } else if ($(templateId).length === 1) {
            source = $(templateId).html();
        }

        if (source === '') {
            throw new Error('could not find template ' + templateId + '(' + cam + ')');
        }

        var tmpl = window.parseTemplate(source, data);
        if ($.parseHTML) {
            // breaks with jquery < 1.8
            tmpl = $.parseHTML(tmpl);
        }
        return $(tmpl).filter('div');
    }
};

Curator.Track = {

    track: function track(action) {
        $.ajax({
            url: this.getUrl('/posts'),
            dataType: 'json',
            data: params,
            success: function success(data) {
                Curator.log('Feed->_loadPosts success');

                if (data.success) {
                    that.postCount = data.postCount;
                    that.postsLoaded += data.posts.length;

                    that.posts = that.posts.concat(data.posts);

                    if (that.options.onPostsLoaded) {
                        that.options.onPostsLoaded(data.posts);
                    }
                } else {
                    if (that.options.onPostsFail) {
                        that.options.onPostsFail(data);
                    }
                }
                that.loading = false;
            },
            error: function error(jqXHR, textStatus, errorThrown) {
                Curator.log('Feed->_loadPosts fail');
                Curator.log(textStatus);
                Curator.log(errorThrown);

                if (that.options.onPostsFail) {
                    that.options.onPostsFail();
                }
                that.loading = false;
            }
        });
    },

    getUrl: function getUrl(trail) {
        return this.feedBase + '/' + this.options.feedId + trail;
    }
};

Curator.Utils = {

    postUrl: function postUrl(post) {

        console.log(post.url);

        if (post.url && post.url !== "" && post.url !== "''") {
            // instagram
            return post.url;
        }

        console.log(post.url);
        if (post.network_id + "" === "1") {
            // twitter
            return 'https://twitter.com/' + post.user_screen_name + '/status/' + post.source_identifier;
        }

        return '';
    },

    center: function center(elementWidth, elementHeight, bound) {
        var s = window.screen,
            b = bound || {},
            bH = b.height || s.height,
            bW = b.width || s.height,
            w = elementWidth,
            h = elementHeight;

        return {
            top: bH ? (bH - h) / 2 : 0,
            left: bW ? (bW - w) / 2 : 0
        };
    },

    popup: function popup(mypage, myname, w, h, scroll) {

        var position = this.center(w, h),
            settings = 'height=' + h + ',width=' + w + ',top=' + position.top + ',left=' + position.left + ',scrollbars=' + scroll + ',resizable';

        window.open(mypage, myname, settings);
    },

    tinyparser: function tinyparser(string, obj) {

        return string.replace(/\{\{(.*?)\}\}/g, function (a, b) {
            return obj && typeof obj[b] !== "undefined" ? encodeURIComponent(obj[b]) : "";
        });
    }
};

Curator.DateUtils = {
    /**
     * Parse a date string in form DD/MM/YYYY HH:MM::SS - returns as UTC
     */
    dateFromString: function dateFromString(time) {
        dtstr = time.replace(/\D/g, " ");
        var dtcomps = dtstr.split(" ");

        // modify month between 1 based ISO 8601 and zero based Date
        dtcomps[1]--;

        var date = new Date(Date.UTC(dtcomps[0], dtcomps[1], dtcomps[2], dtcomps[3], dtcomps[4], dtcomps[5]));

        return date;
    },

    /**
     * Format the date as DD/MM/YYYY
     */
    dateAsDayMonthYear: function dateAsDayMonthYear(strEpoch) {
        var myDate = new Date(parseInt(strEpoch, 10));
        // console.log(myDate.toGMTString()+"<br>"+myDate.toLocaleString());

        var day = myDate.getDate() + '';
        var month = myDate.getMonth() + 1 + '';
        var year = myDate.getFullYear() + '';

        day = day.length === 1 ? '0' + day : day;
        month = month.length === 1 ? '0' + month : month;

        var created = day + '/' + month + '/' + year;

        return created;
    },

    /**
     * Convert the date into a time array
     */
    dateAsTimeArray: function dateAsTimeArray(strEpoch) {
        var myDate = new Date(parseInt(strEpoch, 10));

        var hours = myDate.getHours() + '';
        var mins = myDate.getMinutes() + '';
        var ampm = void 0;

        if (hours >= 12) {
            ampm = 'PM';
            if (hours > 12) {
                hours = hours - 12 + '';
            }
        } else {
            ampm = 'AM';
        }

        hours = hours.length === 1 ? '0' + hours : hours; //console.log(hours.length);
        mins = mins.length === 1 ? '0' + mins : mins; //console.log(mins);

        var array = [parseInt(hours.charAt(0), 10), parseInt(hours.charAt(1), 10), parseInt(mins.charAt(0), 10), parseInt(mins.charAt(1), 10), ampm];

        return array;
    }
};

Curator.StringUtils = {

    twitterLinks: function twitterLinks(s) {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
            var username = u.replace("@", "");
            return Curator.StringUtils.url("https://twitter.com/" + username, u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
            var tag = t.replace("#", "%23");
            return Curator.StringUtils.url("https://twitter.com/search?q=" + tag, t);
        });

        return s;
    },

    instagramLinks: function instagramLinks(s) {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
            var username = u.replace("@", "");
            return Curator.StringUtils.url("https://www.instagram.com/" + username + '/', u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
            var tag = t.replace("#", "");
            return Curator.StringUtils.url("https://www.instagram.com/explore/tags/" + tag + '/', t);
        });

        return s;
    },

    facebookLinks: function facebookLinks(s) {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
            var username = u.replace("@", "");
            return Curator.StringUtils.url("https://www.facebook.com/" + username + '/', u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
            var tag = t.replace("#", "%23");
            return Curator.StringUtils.url("https://www.facebook.com/search/top/?q=" + tag, t);
        });

        return s;
    },

    linksToHref: function linksToHref(s) {
        s = s.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
            return Curator.StringUtils.url(url);
        });

        return s;
    },

    url: function url(s, t) {
        t = t || s;
        return '<a href="' + s + '" target="_blank">' + t + '</a>';
    },

    youtubeVideoId: function youtubeVideoId(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        return match && match[7].length == 11 ? match[7] : false;
    }
};

Curator.Config.Waterfall = $.extend({}, Curator.Config.Defaults, {
    scroll: 'more',
    waterfall: {
        gridWidth: 250,
        animate: true,
        animateSpeed: 400
    }
});

var Waterfall = function (_Curator$Client) {
    _inherits(Waterfall, _Curator$Client);

    function Waterfall(options) {
        _classCallCheck(this, Waterfall);

        var _this13 = _possibleConstructorReturn(this, (Waterfall.__proto__ || Object.getPrototypeOf(Waterfall)).call(this));

        _this13.setOptions(options, Curator.Config.Waterfall);

        Curator.log("Waterfall->init with options:");
        Curator.log(_this13.options);

        if (_this13.init(_this13)) {
            _this13.$scroll = $('<div class="crt-feed-scroll"></div>').appendTo(_this13.$container);
            _this13.$feed = $('<div class="crt-feed"></div>').appendTo(_this13.$scroll);
            _this13.$container.addClass('crt-feed-container');

            if (_this13.options.scroll == 'continuous') {
                $(_this13.$scroll).scroll(function () {
                    var height = _this13.$scroll.height();
                    var cHeight = _this13.$feed.height();
                    var scrollTop = _this13.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        _this13.loadMorePosts();
                    }
                });
            } else if (_this13.options.scroll == 'none') {
                // no scroll - use javascript to trigger loading
            } else {
                // default to more
                _this13.$more = $('<div class="crt-feed-more"><a href="#"><span>Load more</span></a></div>').appendTo(_this13.$scroll);
                _this13.$more.find('a').on('click', function (ev) {
                    ev.preventDefault();
                    _this13.loadMorePosts();
                });
            }

            _this13.$feed.waterfall({
                selector: '.crt-post-c',
                gutter: 0,
                width: _this13.options.waterfall.gridWidth,
                animate: _this13.options.waterfall.animate,
                animationOptions: {
                    speed: _this13.options.waterfall.animateSpeed / 2,
                    duration: _this13.options.waterfall.animateSpeed
                }
            });

            Curator.EventBus.on('crt:filter:change', function (event) {
                _this13.$feed.find('.crt-post-c').remove();
            });

            // Load first set of posts
            _this13.loadPosts(0);
        }
        return _this13;
    }

    _createClass(Waterfall, [{
        key: 'loadPosts',
        value: function loadPosts(page, clear) {
            Curator.log('Waterfall->loadPage');
            if (clear) {
                this.$feed.find('.crt-post-c').remove();
            }
            this.feed.loadPosts(page);
        }
    }, {
        key: 'loadMorePosts',
        value: function loadMorePosts() {
            Curator.log('Waterfall->loadMorePosts');

            this.feed.loadPosts(this.feed.currentPage + 1);
        }
    }, {
        key: 'onPostsLoaded',
        value: function onPostsLoaded(posts) {
            Curator.log("Waterfall->onPostsLoaded");
            Curator.log(posts);

            var postElements = this.createPostElements(posts);

            //this.$feed.append(postElements);
            this.$feed.waterfall('append', postElements);

            var that = this;
            $.each(postElements, function (i) {
                var post = this;
                if (that.options.waterfall.showReadMore) {
                    post.find('.crt-post').addClass('crt-post-show-read-more');
                }
            });

            this.popupManager.setPosts(posts);

            this.loading = false;
            this.options.onPostsLoaded(this, posts);
        }
    }, {
        key: 'onPostsFailed',
        value: function onPostsFailed(data) {
            this.loading = false;
            this.$feed.html('<p style="text-align: center">' + data.message + '</p>');
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            //this.$feed.slick('unslick');
            this.$feed.remove();
            this.$scroll.remove();
            if (this.$more) {
                this.$more.remove();
            }
            this.$container.removeClass('crt-feed-container');

            delete this.$feed;
            delete this.$scroll;
            delete this.$container;
            delete this.options;
            delete this.totalPostsLoaded;
            delete this.loading;
            delete this.allLoaded;

            // TODO add code to cascade destroy down to Feed & Posts
            // unregistering events etc
            delete this.feed;
        }
    }]);

    return Waterfall;
}(Curator.Client);

Curator.Waterfall = Waterfall;

Curator.Config.Carousel = $.extend({}, Curator.Config.Defaults, {
    scroll: 'more',
    carousel: {
        autoPlay: true,
        autoLoad: true
    }
});

var Carousel = function (_Client) {
    _inherits(Carousel, _Client);

    function Carousel(options) {
        _classCallCheck(this, Carousel);

        var _this14 = _possibleConstructorReturn(this, (Carousel.__proto__ || Object.getPrototypeOf(Carousel)).call(this));

        _this14.setOptions(options, Curator.Config.Carousel);

        _this14.containerHeight = 0;
        _this14.loading = false;
        _this14.posts = [];
        _this14.firstLoad = true;

        Curator.log("Carousel->init with options:");
        Curator.log(_this14.options);

        if (_this14.init(_this14)) {

            _this14.allLoaded = false;

            var _that = _this14;

            // this.$wrapper = $('<div class="crt-carousel-wrapper"></div>').appendTo(this.$container);
            _this14.$feed = $('<div class="crt-feed"></div>').appendTo(_this14.$container);
            _this14.$container.addClass('crt-carousel');

            _this14.carousel = new window.CCarousel(_this14.$feed, _this14.options.carousel);
            _this14.$feed.on('curatorCarousel:changed', function (event, carousel, currentSlide) {
                console.log('curatorCarousel:changed ' + currentSlide);
                // console.log('curatorCarousel:changed '+(that.feed.postsLoaded-carousel.PANES_VISIBLE));
                // console.log(carousel.PANES_VISIBLE);
                if (_that.options.carousel.autoLoad) {
                    // if (currentSlide >= that.feed.postsLoaded - carousel.PANES_VISIBLE) {
                    _that.loadMorePosts();
                    // }
                }
            });

            // load first set of posts
            _this14.loadPosts(0);
        }
        return _this14;
    }

    _createClass(Carousel, [{
        key: 'loadMorePosts',
        value: function loadMorePosts() {
            Curator.log('Carousel->loadMorePosts');

            if (this.feed.postCount > this.feed.postsLoaded) {
                this.feed.loadPosts(this.feed.currentPage + 1);
            }
        }
    }, {
        key: 'onPostsLoaded',
        value: function onPostsLoaded(posts) {
            Curator.log("Carousel->onPostsLoaded");

            this.loading = false;

            if (posts.length === 0) {
                this.allLoaded = true;
            } else {
                var _that2 = this;
                var $els = [];
                $(posts).each(function (i) {
                    var p = _that2.createPostElement(this);
                    $els.push(p.$el);

                    if (_that2.options.animate && _that2.firstLoad) {
                        p.$el.css({ opacity: 0 });
                        setTimeout(function () {
                            console.log(i);
                            p.$el.css({ opacity: 0 }).animate({ opacity: 1 });
                        }, i * 100);
                    }
                });

                this.carousel.add($els);
                this.carousel.update();

                // that.$feed.c().trigger('add.owl.carousel',$(p.$el));

                this.popupManager.setPosts(posts);

                this.options.onPostsLoaded(this, posts);
            }
            this.firstLoad = false;
        }
    }, {
        key: 'onPostsFail',
        value: function onPostsFail(data) {
            Curator.log("Carousel->onPostsFail");
            this.loading = false;
            this.$feed.html('<p style="text-align: center">' + data.message + '</p>');
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.carousel.destroy();
            this.$feed.remove();
            this.$container.removeClass('crt-carousel');

            delete this.$feed;
            delete this.$container;
            delete this.options;
            delete this.feed.postsLoaded;
            delete this.loading;
            delete this.allLoaded;

            // TODO add code to cascade destroy down to Feed & Posts
            // unregistering events etc
            delete this.feed;
        }
    }]);

    return Carousel;
}(Client);

Curator.Carousel = Carousel;

Curator.Config.Panel = $.extend({}, Curator.Config.Defaults, {
    panel: {
        // speed: 500,
        autoPlay: true,
        autoLoad: true,
        moveAmount: 1,
        fixedHeight: false,
        infinite: true,
        minWidth: 2000
    }
});

var Panel = function (_Curator$Client2) {
    _inherits(Panel, _Curator$Client2);

    function Panel(options) {
        _classCallCheck(this, Panel);

        var _this15 = _possibleConstructorReturn(this, (Panel.__proto__ || Object.getPrototypeOf(Panel)).call(this));

        _this15.setOptions(options, Curator.Config.Panel);

        Curator.log("Panel->init with options:");
        Curator.log(_this15.options);

        _this15.containerHeight = 0;
        _this15.loading = false;
        _this15.feed = null;
        _this15.$container = null;
        _this15.$feed = null;
        _this15.posts = [];

        if (_this15.init(_this15)) {
            _this15.allLoaded = false;

            _this15.$feed = $('<div class="crt-feed"></div>').appendTo(_this15.$container);
            _this15.$container.addClass('crt-panel');

            if (_this15.options.panel.fixedHeight) {
                _this15.$container.addClass('crt-panel-fixed-height');
            }

            _this15.$feed.curatorCarousel(_this15.options.panel);
            _this15.$feed.on('curatorCarousel:changed', function (event, carousel, currentSlide) {
                if (!_this15.allLoaded && _this15.options.panel.autoLoad) {
                    if (currentSlide >= _this15.feed.postsLoaded - 4) {
                        _this15.loadMorePosts();
                    }
                }
            });

            // load first set of posts
            _this15.loadPosts(0);
        }
        return _this15;
    }

    _createClass(Panel, [{
        key: 'loadMorePosts',
        value: function loadMorePosts() {
            Curator.log('Carousel->loadMorePosts');

            this.feed.loadPosts(this.feed.currentPage + 1);
        }
    }, {
        key: 'onPostsLoaded',
        value: function onPostsLoaded(posts) {
            Curator.log("Carousel->onPostsLoaded");

            this.loading = false;

            if (posts.length === 0) {
                this.allLoaded = true;
            } else {
                var _that3 = this;
                var $els = [];
                $(posts).each(function () {
                    var p = _that3.createPostElement(this);
                    $els.push(p.$el);
                });

                _that3.$feed.curatorCarousel('add', $els);
                _that3.$feed.curatorCarousel('update');

                this.popupManager.setPosts(posts);

                this.options.onPostsLoaded(this, posts);
            }
        }
    }, {
        key: 'onPostsFail',
        value: function onPostsFail(data) {
            Curator.log("Carousel->onPostsFail");
            this.loading = false;
            this.$feed.html('<p style="text-align: center">' + data.message + '</p>');
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.$feed.curatorCarousel('destroy');
            this.$feed.remove();
            this.$container.removeClass('crt-panel');

            delete this.$feed;
            delete this.$container;
            delete this.options;
            delete this.feed.postsLoaded;
            delete this.loading;
            delete this.allLoaded;

            // TODO add code to cascade destroy down to Feed & Posts
            // unregistering events etc
            delete this.feed;
        }
    }]);

    return Panel;
}(Curator.Client);

Curator.Panel = Panel;

Curator.Config.Grid = $.extend({}, Curator.Config.Defaults, {
    postTemplate: '#gridPostTemplate',
    grid: {
        minWidth: 200,
        rows: 3
    }
});

Curator.Templates.gridPostTemplate = ' \
<div class="crt-post-c">\
    <div class="crt-post post<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>"> \
        <div class="crt-post-content"> \
            <div class="crt-hitarea" > \
                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="spacer" /> \
                <div class="crt-post-content-image" style="background-image: url(<%=image%>);"> </div> \
                <div class="crt-post-content-text-c"> \
                    <div class="crt-post-content-text"> \
                        <%=this.parseText(text)%> \
                    </div> \
                </div> \
                <a href="javascript:;" class="crt-play"><i class="crt-play-icon"></i></a> \
                <span class="crt-social-icon crt-social-icon-normal"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
                <div class="crt-post-hover">\
                    <div class="crt-post-header"> \
                        <img src="<%=user_image%>"  /> \
                        <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
                    </div> \
                    <div class="crt-post-hover-text"> \
                        <%=this.parseText(text)%> \
                    </div> \
                    <span class="crt-social-icon crt-social-icon-hover"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
                </div> \
            </div> \
        </div> \
    </div>\
</div>';

Curator.Templates.gridFeedTemplate = ' \
<div class="crt-feed-window">\
    <div class="crt-feed"></div>\
</div>\
<div class="crt-feed-more"><a href="#">Load more</a></div>';

var Grid = function (_Client2) {
    _inherits(Grid, _Client2);

    function Grid(options) {
        _classCallCheck(this, Grid);

        var _this16 = _possibleConstructorReturn(this, (Grid.__proto__ || Object.getPrototypeOf(Grid)).call(this));

        _this16.setOptions(options, Curator.Config.Grid);

        Curator.log("Grid->init with options:");
        Curator.log(_this16.options);

        _this16.containerHeight = 0;
        _this16.loading = false;
        _this16.feed = null;
        _this16.$container = null;
        _this16.$feed = null;
        _this16.posts = [];
        _this16.totalPostsLoaded = 0;
        _this16.allLoaded = false;
        _this16.previousCol = 0;
        _this16.page = 0;
        _this16.rowsShowing = 0;

        if (_this16.init(_this16)) {

            var tmpl = Curator.Template.render('#gridFeedTemplate', {});
            _this16.$container.append(tmpl);
            _this16.$feed = _this16.$container.find('.crt-feed');
            _this16.$feedWindow = _this16.$container.find('.crt-feed-window');
            _this16.$loadMore = _this16.$container.find('.crt-feed-more a');

            _this16.$container.addClass('crt-grid');

            var cols = Math.floor(_this16.$container.width() / _this16.options.grid.minWidth);
            var postsNeeded = cols * (_this16.options.grid.rows + 1); // get 1 extra row just in case

            if (_this16.options.grid.showLoadMore) {
                // this.$feed.css({
                //     position:'absolute',
                //     left:0,
                //     top:0,
                //     width:'100%'
                // });
                _this16.$feedWindow.css({
                    'position': 'relative'
                });
                // postsNeeded = cols *  (this.options.grid.rows * 2); //
                _this16.$loadMore.click(_this16.onMoreClicked.bind(_this16));
            } else {
                _this16.$loadMore.hide();
            }

            _this16.rowsShowing = _this16.options.grid.rows;

            _this16.feed.options.postsPerPage = postsNeeded;
            _this16.loadPosts(0);
        }

        var to = null;
        var that = _this16;
        $(window).resize(function () {
            clearTimeout(to);
            to = setTimeout(function () {
                that.updateLayout();
            }, 100);
        });
        _this16.updateLayout();

        $(window).on('curatorCssLoaded', function () {
            clearTimeout(to);
            to = setTimeout(function () {
                that.updateLayout();
            }, 100);
        });

        $(document).on('ready', function () {
            clearTimeout(to);
            to = setTimeout(function () {
                that.updateLayout();
            }, 100);
        });
        return _this16;
    }

    _createClass(Grid, [{
        key: 'onPostsLoaded',
        value: function onPostsLoaded(posts) {
            Curator.log("Grid->onPostsLoaded");

            this.loading = false;

            if (posts.length === 0) {
                this.allLoaded = true;
            } else {
                var _that4 = this;
                var postElements = [];
                $(posts).each(function (i) {
                    var p = _that4.createPostElement.call(_that4, this);
                    postElements.push(p.$el);
                    _that4.$feed.append(p.$el);

                    if (_that4.options.animate) {
                        p.$el.css({ opacity: 0 });
                        setTimeout(function () {
                            p.$el.css({ opacity: 0 }).animate({ opacity: 1 });
                        }, i * 100);
                    }
                });

                this.popupManager.setPosts(posts);

                this.options.onPostsLoaded(this, posts);

                this.updateHeight();
            }
        }
    }, {
        key: 'createPostElement',
        value: function createPostElement(postJson) {
            var post = new Curator.Post(postJson, this.options);
            $(post).bind('postClick', $.proxy(this.onPostClick, this));

            if (this.options.onPostCreated) {
                this.options.onPostCreated(post);
            }

            return post;
        }
    }, {
        key: 'onPostsFailed',
        value: function onPostsFailed(data) {
            Curator.log("Grid->onPostsFailed");
            this.loading = false;
            this.$feed.html('<p style="text-align: center">' + data.message + '</p>');
        }
    }, {
        key: 'onPostClick',
        value: function onPostClick(ev, post) {
            this.popupManager.showPopup(post);
        }
    }, {
        key: 'onMoreClicked',
        value: function onMoreClicked(ev) {
            ev.preventDefault();

            this.rowsShowing = this.rowsShowing + this.options.grid.rows;

            this.updateHeight(true);

            this.feed.loadMore();
        }
    }, {
        key: 'updateLayout',
        value: function updateLayout() {
            var cols = Math.floor(this.$container.width() / this.options.grid.minWidth);
            var postsNeeded = cols * this.options.grid.rows;

            this.$container.removeClass('crt-grid-col' + this.previousCol);
            this.previousCol = cols;
            this.$container.addClass('crt-grid-col' + this.previousCol);

            if (postsNeeded > this.feed.postsLoaded) {
                this.loadPosts(this.feed.currentPage + 1);
            }

            this.updateHeight();
        }
    }, {
        key: 'updateHeight',
        value: function updateHeight(animate) {
            var postHeight = this.$container.find('.crt-post-c').width();
            this.$feedWindow.css({ 'overflow': 'hidden' });

            var maxRows = Math.ceil(this.feed.postCount / this.previousCol);
            var rows = this.rowsShowing < maxRows ? this.rowsShowing : maxRows;

            if (animate) {
                this.$feedWindow.animate({ height: rows * postHeight });
            } else {
                this.$feedWindow.height(rows * postHeight);
            }

            if (this.options.grid.showLoadMore) {
                if (this.rowsShowing >= maxRows) {
                    this.$loadMore.hide();
                } else {
                    this.$loadMore.show();
                }
            }
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.$container.empty().removeClass('crt-grid').removeClass('crt-grid-col' + this.previousCol).css({ 'height': '', 'overflow': '' });

            delete this.$feed;
            delete this.$container;
            delete this.options;
            delete this.totalPostsLoaded;
            delete this.loading;
            delete this.allLoaded;

            // TODO add code to cascade destroy down to Feed & Posts
            // unregistering events etc
            delete this.feed;
        }
    }]);

    return Grid;
}(Client);

Curator.Grid = Grid;

var widgetDefaults = {
    feedId: '',
    postsPerPage: 12,
    maxPosts: 0,
    apiEndpoint: 'https://api.curator.io/v1',
    onPostsLoaded: function onPostsLoaded() {}
};

Curator.Custom = Curator.augment.extend(Curator.Client, {
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts: [],
    totalPostsLoaded: 0,
    allLoaded: false,

    constructor: function constructor(options) {
        this.uber.setOptions.call(this, options, widgetDefaults);

        Curator.log("Panel->init with options:");
        Curator.log(this.options);

        if (this.uber.init.call(this)) {
            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-custom');

            this.loadPosts(0);
        }
    },

    onPostsLoaded: function onPostsLoaded(posts) {
        Curator.log("Custom->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            var that = this;
            var postElements = [];
            $(posts).each(function () {
                var p = that.createPostElement(this);
                postElements.push(p.$el);
                that.$feed.append(p.$el);
            });

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded(this, posts);
        }
    },

    onPostsFailed: function onPostsFailed(data) {
        Curator.log("Custom->onPostsFailed");
        this.loading = false;
        this.$feed.html('<p style="text-align: center">' + data.message + '</p>');
    },

    onPostClick: function onPostClick(ev, post) {
        this.popupManager.showPopup(post);
    },

    destroy: function destroy() {
        this.$feed.remove();
        this.$container.removeClass('crt-custom');

        delete this.$feed;
        delete this.$container;
        delete this.options;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }

});

	root.Curator = Curator;
	return Curator;
}));