/* Zepto v1.2.0-27-g324cd27 - zepto event ie fx fx_methods data - zeptojs.com/license */
(function(global, factory) {
  if (typeof define === 'function' && define.amd) {
      define('zepto', function () {
          return factory(global);
      });
  } else {
      factory(global);
  }
}(window, function(window) {
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
      // don't use "interactive" on IE <= 10 (it can fired premature)
      if (document.readyState === "complete" ||
          (document.readyState !== "loading" && !document.documentElement.doScroll))
        setTimeout(function(){ callback($) }, 0)
      else {
        var handler = function() {
          document.removeEventListener("DOMContentLoaded", handler, false)
          window.removeEventListener("load", handler, false)
          callback($)
        }
        document.addEventListener("DOMContentLoaded", handler, false)
        window.addEventListener("load", handler, false)
      }
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
      return typeof selector == 'string' ? this.length > 0 && zepto.matches(this[0], selector) : 
          selector && this.selector == selector.selector
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
      return (typeof name == 'string' && !(1 in arguments)) ?
        (this[0] && this[0][name]) :
        this.each(function(idx){
          if (isObject(name)) for (key in name) this[propMap[key] || key] = name[key]
          else this[name] = funcArg(this, value, idx, this[name])
        })
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
})()

window.Zepto = Zepto
window.$crt = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
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

      try {
        event.timeStamp || (event.timeStamp = Date.now())
      } catch (ignored) { }

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

})(Zepto)

;(function(){
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
})()

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
})(Zepto)

;(function($, undefined){
  var document = window.document,
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

})(Zepto)

;(function($){
  var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
    exp = $.expando = 'Zepto' + (+new Date()), emptyArray = []

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id]
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        if (name in store) return store[name]
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
    $.each(node.attributes || emptyArray, function(i, attr){
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] =
          $.zepto.deserializeValue(attr.value)
    })
    return store
  }

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
      $.isPlainObject(name) ?
        this.each(function(i, node){
          $.each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
        (0 in this ? getData(this[0], name) : undefined) :
      // set value on all elements
      this.each(function(){ setData(this, name, value) })
  }

  $.data = function(elem, name, value) {
    return $(elem).data(name, value)
  }

  $.hasData = function(elem) {
    var id = elem[exp], store = id && data[id]
    return store ? !$.isEmptyObject(store) : false
  }

  $.fn.removeData = function(names) {
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names || store, function(key){
        delete store[names ? camelize(this) : key]
      })
    })
  }

  // Generate extended `remove` and `empty` functions
  ;['remove', 'empty'].forEach(function(methodName){
    var origFn = $.fn[methodName]
    $.fn[methodName] = function() {
      var elements = this.find('*')
      if (methodName === 'remove') elements = elements.add(this)
      elements.removeData()
      return origFn.call(this)
    }
  })
})(Zepto)
  return Zepto
}))
;
;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define('curator', factory);
    } else if (typeof exports === 'object') {
		module.exports = factory(require('jquery'));
	} else {
		root.Curator = factory(root.jQuery || root.Zepto);
	}
}(this, function($local) {
	if ($local == undefined) {
		window.alert ("jQuery not found\n\nThe Curator Widget is running in dependency mode - this requires jQuery of Zepto. Try disabling DEPENDENCY MODE in the Admin on the Publish page." );
		return false;
	}

	var Curator = (function () {
'use strict';

/**
 * Props to https://github.com/yanatan16/nanoajax
 */

// Best place to find information on XHR features is:
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

var reqfields = [
    'responseType', 'withCredentials', 'timeout', 'onprogress'
];

function nanoajax (params, callback) {
    // Any variable used more than once is var'd here because
    // minification will munge the variables whereas it can't munge
    // the object access.
    var headers = params.headers || {},
        body = params.body,
        method = params.method || (body ? 'POST' : 'GET'),
        called = false;

    var req = getRequest(params.cors);

    function cb(statusCode, responseText) {
        return function () {
            if (!called) {
                callback(req.status === undefined ? statusCode : req.status,
                    req.status === 0 ? "Error" : (req.response || req.responseText || responseText),
                    req);
                called = true;
            }
        };
    }

    req.open(method, params.url, true);

    var success = req.onload = cb(200);
    req.onreadystatechange = function () {
        if (req.readyState === 4) {success();}
    };
    req.onerror = cb(null, 'Error');
    req.ontimeout = cb(null, 'Timeout');
    req.onabort = cb(null, 'Abort');

    if (body) {
        setDefault(headers, 'X-Requested-With', 'XMLHttpRequest');

        if (!global.FormData || !(body instanceof global.FormData)) {
            setDefault(headers, 'Content-Type', 'application/x-www-form-urlencoded');
        }
    }

    for (var i = 0, len = reqfields.length, field = (void 0); i < len; i++) {
        field = reqfields[i];
        if (params[field] !== undefined)
            { req[field] = params[field]; }
    }

    for (var field$1 in headers) {
        req.setRequestHeader(field$1, headers[field$1]);
    }

    req.send(body);

    return req;
}

function getRequest(cors) {
    // XDomainRequest is only way to do CORS in IE 8 and 9
    // But XDomainRequest isn't standards-compatible
    // Notably, it doesn't allow cookies to be sent or set by servers
    // IE 10+ is standards-compatible in its XMLHttpRequest
    // but IE 10 can still have an XDomainRequest object, so we don't want to use it
    if (cors && window.XDomainRequest && !/MSIE 1/.test(window.navigator.userAgent)) {
        return new window.XDomainRequest ();
    }
    if (window.XMLHttpRequest) {
        return new window.XMLHttpRequest ();
    }
}

function setDefault(obj, key, value) {
    obj[key] = obj[key] || value;
}

var arrayFill = function (array, value, start, end) {

    if (!Array.isArray(array)) {
        throw new TypeError('array is not a Array');
    }

    var length = array.length;
    start = parseInt(start, 10) || 0;
    end = end === undefined ? length : (parseInt(end, 10) || 0);

    var i;
    var l;

    if (start < 0) {
        i = Math.max(length + start, 0);
    } else {
        i = Math.min(start, length);
    }

    if (end < 0) {
        l = Math.max(length + end, 0);
    } else {
        l = Math.min(end, length);
    }

    for (; i < l; i++) {
        array[i] = value;
    }

    return array;
};


if (!Array.prototype.fill) {
    Array.prototype.fill = function (value, start, end) {
        return arrayFill(this, value, start, end);
    };
}

if (!Object.keys) {
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    var hasDontEnumBug = true,
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null}) {
        hasDontEnumBug = false;
    }

    Object.keys = function keys(object) {

        if (
            (typeof object != "object" && typeof object != "function") ||
            object === null
        ) {
            throw new TypeError("Object.keys called on a non-object");
        }

        var keys = [];
        for (var name in object) {
            if (owns(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (owns(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }
        return keys;
    };

}

// From https://cdn.rawgit.com/twitter/twitter-text/v1.13.4/js/twitter-text.js
// Cut down to only include RegEx functions

(function () {
    var twttr = {};
    twttr.txt = {};
    twttr.txt.regexen = {};

    var HTML_ENTITIES = {
        '&': '&amp;',
        '>': '&gt;',
        '<': '&lt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    // HTML escaping
    twttr.txt.htmlEscape = function(text) {
        return text && text.replace(/[&"'><]/g, function(character) {
            return HTML_ENTITIES[character];
        });
    };

    // Builds a RegExp
    function regexSupplant(regex, flags) {
        flags = flags || "";
        if (typeof regex !== "string") {
            if (regex.global && flags.indexOf("g") < 0) {
                flags += "g";
            }
            if (regex.ignoreCase && flags.indexOf("i") < 0) {
                flags += "i";
            }
            if (regex.multiline && flags.indexOf("m") < 0) {
                flags += "m";
            }

            regex = regex.source;
        }

        return new RegExp(regex.replace(/#\{(\w+)\}/g, function(match, name) {
            var newRegex = twttr.txt.regexen[name] || "";
            if (typeof newRegex !== "string") {
                newRegex = newRegex.source;
            }
            return newRegex;
        }), flags);
    }

    twttr.txt.regexSupplant = regexSupplant;

    // simple string interpolation
    function stringSupplant(str, values) {
        return str.replace(/#\{(\w+)\}/g, function(match, name) {
            return values[name] || "";
        });
    }

    twttr.txt.stringSupplant = stringSupplant;

    function addCharsToCharClass(charClass, start, end) {
        var s = String.fromCharCode(start);
        if (end !== start) {
            s += "-" + String.fromCharCode(end);
        }
        charClass.push(s);
        return charClass;
    }

    twttr.txt.addCharsToCharClass = addCharsToCharClass;

    // Some minimizers convert string escapes into their literal values, which leads to intermittent Unicode normalization bugs and
    // increases the gzipped download size. Use RegEx literals as opposed to string literals to prevent that.
    var unicodeLettersAndMarks = /A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u192B\u1930-\u193B\u19B0-\u19C0\u19C8\u19C9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2D/.source;
    var unicodeNumbers = /0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19/.source;
    var hashtagSpecialChars = /_\u200c\u200d\ua67e\u05be\u05f3\u05f4\uff5e\u301c\u309b\u309c\u30a0\u30fb\u3003\u0f0b\u0f0c\u00b7/.source;
    var hashTagSpecialChars2 = /\.-/.source;
    // A hashtag must contain at least one unicode letter or mark, as well as numbers, underscores, and select special characters.
    twttr.txt.regexen.hashSigns = /[#＃]/;
    twttr.txt.regexen.hashtagAlpha = new RegExp("[" + unicodeLettersAndMarks + "]");
    twttr.txt.regexen.hashtagAlphaNumeric = new RegExp("[" + unicodeLettersAndMarks + unicodeNumbers + hashtagSpecialChars + hashTagSpecialChars2 + "]");
    twttr.txt.regexen.endHashtagMatch = regexSupplant(/^(?:#{hashSigns}|:\/\/)/);
    twttr.txt.regexen.hashtagBoundary = new RegExp("(?:^|$|[^&" + unicodeLettersAndMarks + unicodeNumbers + hashtagSpecialChars + "])");
    // twttr.txt.regexen.validHashtag = regexSupplant(/(#{hashtagBoundary})(#{hashSigns})(?!\ufe0f|\u20e3)(#{hashtagAlphaNumeric}*#{hashtagAlpha}#{hashtagAlphaNumeric}*)/gi);
    twttr.txt.regexen.validHashtag = regexSupplant(/[#]+(#{hashtagAlphaNumeric}*)/gi);

    window.twttr = twttr;
}());

var EventBus = function EventBus() {
    this.listeners = {};
};

EventBus.prototype.on = function on (type, callback, scope) {
        var arguments$1 = arguments;

    var args = [];
    var numOfArgs = arguments.length;
    for (var i = 0; i < numOfArgs; i++) {
        args.push(arguments$1[i]);
    }
    args = args.length > 3 ? args.splice(3, args.length - 1) : [];
    if (typeof this.listeners[type] !== "undefined") {
        this.listeners[type].push({scope: scope, callback: callback, args: args});
    } else {
        this.listeners[type] = [{scope: scope, callback: callback, args: args}];
    }
};

EventBus.prototype.off = function off (type, callback, scope) {
        var this$1 = this;

    if (typeof this.listeners[type] !== "undefined") {
        var numOfCallbacks = this.listeners[type].length;
        var newArray = [];
        for (var i = 0; i < numOfCallbacks; i++) {
            var listener = this$1.listeners[type][i];
            if (listener.scope === scope && listener.callback === callback) {

            } else {
                newArray.push(listener);
            }
        }
        this.listeners[type] = newArray;
    }
};

EventBus.prototype.has = function has (type, callback, scope) {
        var this$1 = this;

    if (typeof this.listeners[type] !== "undefined") {
        var numOfCallbacks = this.listeners[type].length;
        if (callback === undefined && scope === undefined) {
            return numOfCallbacks > 0;
        }
        for (var i = 0; i < numOfCallbacks; i++) {
            var listener = this$1.listeners[type][i];
            if ((scope ? listener.scope === scope : true) && listener.callback === callback) {
                return true;
            }
        }
    }
    return false;
};

EventBus.prototype.trigger = function trigger (type) {
        var arguments$1 = arguments;
        var this$1 = this;

    var event = {
        type: type,
        // target: target
    };
    var args = [];
    // let numOfArgs = arguments.length;
    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments$1[i]);
    }
    // args = args.length > 2 ? args.splice(2, args.length - 1) : [];
    args = [event].concat(args);
    if (typeof this.listeners[type] !== "undefined") {
        var numOfCallbacks = this.listeners[type].length;
        for (var i$1 = 0; i$1 < numOfCallbacks; i$1++) {
            var listener = this$1.listeners[type][i$1];
            if (listener && listener.callback) {
                var concatArgs = args.concat(listener.args);
                listener.callback.apply(listener.scope, concatArgs);
                
            }
        }
    }
};

EventBus.prototype.getEvents = function getEvents () {
        var this$1 = this;

    var str = "";
    for (var type in this$1.listeners) {
        var numOfCallbacks = this$1.listeners[type].length;
        for (var i = 0; i < numOfCallbacks; i++) {
            var listener = this$1.listeners[type][i];
            str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
            str += " listen for '" + type + "'\n";
        }
    }
    return str;
};

EventBus.prototype.destroy = function destroy () {
    // Might be a bit simplistic!!!
    this.listeners = {};
};

var Globals = {
    POST_CLICK_ACTION_OPEN_POPUP:   'open-popup',
    POST_CLICK_ACTION_GOTO_SOURCE:  'goto-source',
    POST_CLICK_ACTION_NOTHING:      'nothing',
};

var CommonUtils = {
    postUrl: function postUrl (post)
    {
        if (post.url && post.url !== "" && post.url !== "''")
        {
            // instagram
            return post.url;
        }

        if (post.network_id+"" === "1")
        {
            // twitter
            return 'https://twitter.com/'+post.user_screen_name+'/status/'+post.source_identifier;
        }

        return '';
    },

    center: function center (w, h, bound) {
        var s = window.screen,
            b = bound || {},
            bH = b.height || s.height,
            bW = b.width || s.height;

        return {
            top: (bH) ? (bH - h) / 2 : 0,
            left: (bW) ? (bW - w) / 2 : 0
        };
    },

    popup: function popup (mypage, myname, w, h, scroll) {

        var position = this.center(w, h),
            settings = 'height=' + h + ',width=' + w + ',top=' + position.top +
                ',left=' + position.left + ',scrollbars=' + scroll +
                ',resizable';

        window.open(mypage, myname, settings);
    },

    tinyparser: function tinyparser (string, obj) {
        return string.replace(/\{\{(.*?)\}\}/g, function (a, b) {
            return obj && typeof obj[b] !== "undefined" ? encodeURIComponent(obj[b]) : "";
        });
    },

    debounce: function debounce (func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) { func.apply(context, args); }
            };
            var callNow = immediate && !timeout;
            window.clearTimeout(timeout);
            timeout = window.setTimeout(later, wait);
            if (callNow) { func.apply(context, args); }
        };
    },

    uId: function uId () {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    }
};

/* globals twttr, document */

var StringUtils = {

    camelize: function camelize (s) {
        return s.replace (/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },

    twitterLinks: function twitterLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return StringUtils.url("https://twitter.com/"+username,u);
        });
        s = s.replace(twttr.txt.regexen.validHashtag, function(t) {
            var tag = t.replace("#","%23");
            return StringUtils.url("https://twitter.com/search?q="+tag,t);
        });

        return s;
    },

    instagramLinks: function instagramLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_\.]+/g, function(u) {
            var username = u.replace("@","");
            return StringUtils.url("https://www.instagram.com/"+username+'/',u);
        });
        s = s.replace(twttr.txt.regexen.validHashtag, function(t) {
            var tag = t.replace("#","");
            return StringUtils.url("https://www.instagram.com/explore/tags/"+tag+'/',t);
        });

        return s;
    },

    facebookLinks: function facebookLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return StringUtils.url("https://www.facebook.com/"+username+'/',u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            var tag = t.replace("#","%23");
            return StringUtils.url("https://www.facebook.com/search/top/?q="+tag,t);
        });

        return s;
    },

    linksToHref: function linksToHref (s)
    {
        s = s.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+[A-Za-z0-9-_:%&~\?\/=]+/g, function(url) {
            return StringUtils.url(url);
        });

        return s;
    },

    url: function url (s,t) {
        t = t || s;
        return '<a href="'+s+'" target="_blank">'+t+'</a>';
    },

    youtubeVideoId: function youtubeVideoId (url){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);

        if (match && match[7].length === 11) {
            return match[7];
        } else {
            // above doesn't work if video id starts with v
            // eg https://www.youtube.com/embed/vDbr_EamBK4?autoplay=1

            var regExp$1 = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/))([^#\&\?]*).*/;
            var match2 = url.match(regExp$1);
            if (match2 && match2[6].length === 11) {
                return match2[6];
            }
        }

        return false;
    },

    vimeoVideoId: function vimeoVideoId (url) {
        var regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/;
        var match = url.match(regExp);
        
        if (match && match.length>=2) {
            return match[1];
        }

        return false;
    },

    filterHtml: function filterHtml (html) {
        try {
            var div = document.createElement("div");
            div.innerHTML = html;
            var text = div.textContent || div.innerText || "";
            return text;
        } catch (e) {
            return html;
        }
    },

    nl2br:function(s) {
        s = s.trim();
        s = s.replace(/(?:\r\n|\r|\n)/g, '<br />');

        return s;
    }
};

/* global window */

var SocialFacebook = {
    share: function (post) {
        var obj = post,
            cb = function(){};
        obj.url = CommonUtils.postUrl(post);
        obj.cleanText = StringUtils.filterHtml(post.text);

        if (obj.url.indexOf('http') !== 0) {
            obj.url = obj.image;
        }
        // Disabling for now - doesn't work - seems to get error "Can't Load URL: The domain of this URL isn't
        // included in the app's domains"
        var useJSSDK = false; // window.FB
        if (useJSSDK) {
            window.FB.ui({
                method: 'feed',
                link: obj.url,
                picture: obj.image,
                name: obj.user_screen_name,
                description: obj.cleanText
            }, cb);
        } else {
            var url = "https://www.facebook.com/sharer/sharer.php?u={{url}}&d={{cleanText}}";
            var url2 = CommonUtils.tinyparser(url, obj);
            CommonUtils.popup(url2, 'twitter', '600', '430', '0');
        }
    }
};

var SocialTwitter = {
    share: function (post) {
        var obj = post;
        obj.url = CommonUtils.postUrl(post);
        obj.cleanText = StringUtils.filterHtml(post.text);

        var url = "http://twitter.com/share?url={{url}}&text={{cleanText}}&hashtags={{hashtags}}";
        var url2 = CommonUtils.tinyparser(url, obj);
        CommonUtils.popup(url2, 'twitter', '600', '430', '0');
    }
};

/* globals window */

var Logger = {
    debug: false,

    log: function (s) {

        if (window.console && Logger.debug) {
            window.console.log(s);
        }
    },

    error: function (s) {
        if (window.console) {
            window.console.error(s);
        }
    },
};

var Events = {
    FEED_LOADED             :'feed:loaded',
    FEED_FAILED             :'feed:failed',

    FILTER_CHANGED          :'filter:changed',

    POSTS_LOADED             :'posts:loaded',
    POSTS_FAILED             :'posts:failed',
    POSTS_RENDERED           :'posts:rendered',

    POST_CREATED            :'post:created',
    POST_CLICK              :'post:click',
    POST_CLICK_READ_MORE    :'post:clickReadMore',
    POST_IMAGE_LOADED       :'post:imageLoaded',
    POST_IMAGE_FAILED       :'post:imageFailed',

    CAROUSEL_CHANGED        :'carousel:changed',
};

var v1PopupUnderlayTemplate = '';

var v1PopupWrapperTemplate = ' \
<div class="crt-popup-wrapper"> \
    <div class="crt-popup-wrapper-c"> \
        <div class="crt-popup-underlay"></div> \
        <div class="crt-popup-container"></div> \
    </div> \
</div>';

var v1PopupTemplate = " \n<div class=\"crt-popup\"> \n    <a href=\"#\" class=\"crt-close crt-icon-cancel\"></a> \n    <a href=\"#\" class=\"crt-next crt-icon-right-open\"></a> \n    <a href=\"#\" class=\"crt-previous crt-icon-left-open\"></a> \n    <div class=\"crt-popup-left\">  \n        <div class=\"crt-video\"> \n            <div class=\"crt-video-container\">\n                <video preload=\"none\">\n                <source src=\"<%=video%>\" type=\"video/mp4\">\n                </video>\n                <img src=\"<%=image%>\" alt=\"Image posted by <%=this.userScreenName()%> to <%=this.networkName()%>\" />\n                <a href=\"javascript:;\" class=\"crt-play\"><i class=\"crt-play-icon\"></i></a> \n            </div> \n        </div> \n        <div class=\"crt-image\"> \n            <img src=\"<%=image%>\" alt=\"Image posted by <%=this.userScreenName()%> to <%=this.networkName()%>\" /> \n        </div> \n        <div class=\"crt-pagination\"><ul></ul></div>\n    </div> \n    <div class=\"crt-popup-right\"> \n        <div class=\"crt-popup-header\"> \n            <span class=\"crt-social-icon\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n            <img src=\"<%=user_image%>\" alt=\"Profile image for <%=user_full_name%>\"  /> \n            <div class=\"crt-post-name\"><span><%=user_full_name%></span><br/><a href=\"<%=this.userUrl()%>\" target=\"_blank\"><%=this.userScreenName()%></a></div> \n        </div> \n        <div class=\"crt-popup-text <%=this.contentTextClasses()%>\"> \n            <div class=\"crt-popup-text-container\"> \n                <p class=\"crt-date\"><%=this.prettyDate(source_created_at)%></p> \n                <div class=\"crt-popup-text-body\"><%=this.parseText(text)%></div> \n            </div> \n        </div> \n        <div class=\"crt-popup-read-more\">\n            <a href=\"<%=url%>\" target=\"_blank\" class=\"crt-button\"><%=this._t(\"go-to-original-post\")%></a> \n        </div>\n        <div class=\"crt-popup-footer\">\n            <div class=\"crt-popup-stats\"><span><%=likes%></span> <%=this._t(\"likes\", likes)%> <i class=\"sep\"></i> <span><%=comments%></span> <%=this._t(\"comments\", comments)%></div> \n            <div class=\"crt-post-share\"><span class=\"ctr-share-hint\"></span><a href=\"#\" class=\"crt-share-facebook\"><i class=\"crt-icon-facebook\"></i></a>  <a href=\"#\" class=\"crt-share-twitter\"><i class=\"crt-icon-twitter\"></i></a></div>\n        </div> \n    </div> \n</div>";

var filterTemplate = "<div class=\"crt-filter\"> \n<div class=\"crt-filter-networks\">\n<ul class=\"crt-networks\"> \n    <li class=\"crt-filter-label\"><label><%=this._t('filter')%>:</label></li>\n    <li class=\"active\"><a href=\"#\" data-network=\"0\"> <%=this._t('all')%></a></li>\n</ul>\n</div> \n<div class=\"crt-filter-sources\">\n<ul class=\"crt-sources\"> \n    <li class=\"crt-filter-label\"><label><%=this._t('filter')%>:</label></li>\n    <li class=\"active\"><a href=\"#\" data-source=\"0\"> <%=this._t('all')%></a></li>\n</ul>\n</div> \n</div>";

var gridPostTemplate = " \n<div class=\"crt-post-c\">\n    <div class=\"crt-post post<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>\"> \n        <div class=\"crt-post-content\"> \n            <div class=\"crt-hitarea\" > \n                <img src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\" class=\"spacer\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /> \n                <div class=\"crt-post-content-image\" style=\"background-image:url('<%=image%>');\"></div> \n                <div class=\"crt-post-content-text-c\"> \n                    <div class=\"crt-post-content-text\"> \n                        <%=this.parseText(text)%> \n                    </div> \n                </div> \n                <a href=\"javascript:;\" class=\"crt-play\"><i class=\"crt-play-icon\"></i></a> \n                <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                <div class=\"crt-post-hover\">\n                    <div class=\"crt-post-header\"> \n                        <img src=\"<%=user_image%>\" alt=\"Profile image for <%=user_full_name%>\"  /> \n                        <div class=\"crt-post-name\"><span><%=user_full_name%></span><br/><a href=\"<%=this.userUrl()%>\" target=\"_blank\">@<%=user_screen_name%></a></div> \n                    </div> \n                    <div class=\"crt-post-hover-text\"> \n                        <%=this.parseText(text)%> \n                    </div> \n                    <span class=\"crt-social-icon crt-social-icon-hover\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                </div> \n            </div> \n        </div> \n    </div>\n</div>";

var v1PostTemplate = ' \
<div class="crt-post-v1 crt-post-c">\
    <div class="crt-post-bg"></div> \
    <div class="crt-post post<%=id%> crt-post-<%=this.networkIcon()%>"> \
        <div class="crt-post-header"> \
            <span class="crt-social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>" alt="Profile image for <%=user_full_name%>"  /> \
            <div class="crt-post-name">\
            <div class="crt-post-fullname"><%=user_full_name%></div>\
            <div class="crt-post-username"><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div>\
            </div> \
        </div> \
        <div class="crt-post-content"> \
            <div class="crt-image crt-hitarea crt-post-content-image <%=this.contentImageClasses()%>" > \
                <div class="crt-image-c"><img src="<%=image%>" class="crt-post-image" alt="Image posted by <%=user_screen_name%> to <%=this.networkName()%>" /></div> \
                <span class="crt-play"><i class="crt-play-icon"></i></span> \
            </div> \
            <div class="text crt-post-content-text <%=this.contentTextClasses()%>"> \
                <div class="crt-post-text-body"><%=this.parseText(text)%></div> \
            </div> \
        </div> \
        <div class="crt-post-footer">\
            <div class="crt-date"><%=this.prettyDate(source_created_at)%></div> \
            <div class="crt-post-share"><span class="crt-share-hint"></span><a href="#" class="crt-share-facebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="crt-share-twitter"><i class="crt-icon-twitter"></i></a></div>\
        </div> \
        <div class="crt-post-read-more"><a href="#" class="crt-post-read-more-button">Read more</a> </div> \
    </div>\
</div>';

var v2PostTemplate = " \n<div class=\"crt-post-v2 crt-post crt-post-<%=this.networkIcon()%> <%=this.contentTextClasses()%>  <%=this.contentImageClasses()%>\" data-post=\"<%=id%>\"> \n    <div class=\"crt-post-border\">\n        <div class=\"crt-post-c\">\n            <div class=\"crt-post-content\">\n                <div class=\"crt-image crt-hitarea crt-post-content-image\" > \n                    <div class=\"crt-image-c\"><img src=\"<%=image%>\" class=\"crt-post-image\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /></div>   \n                    <span class=\"crt-play\"><i class=\"crt-play-icon\"></i></span> \n                    <div class=\"crt-image-carousel\"><i class=\"crt-icon-image-carousel\"></i></div> \n                </div> \n                <div class=\"crt-post-header\"> \n                    <span class=\"crt-social-icon\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                    <div class=\"crt-post-fullname\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\"><%=user_full_name%></a></div>\n                </div> \n                <div class=\"text crt-post-content-text\"> \n                    <%=this.parseText(text)%> \n                </div> \n            </div> \n            <div class=\"crt-post-footer\"> \n                <img class=\"crt-post-userimage\" src=\"<%=user_image%>\" alt=\"Profile image for <%=user_screen_name%>\" /> \n                <span class=\"crt-post-username\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\"><%=this.userScreenName()%></a></span>\n                <span class=\"crt-date\"><%=this.prettyDate(source_created_at)%></span> \n                <div class=\"crt-post-share\"><span class=\"crt-share-hint\"></span><a href=\"#\" class=\"crt-share-facebook\"><i class=\"crt-icon-facebook\"></i></a>  <a href=\"#\" class=\"crt-share-twitter\"><i class=\"crt-icon-twitter\"></i></a></div>\n            </div> \n            <div class=\"crt-post-max-height-read-more\"><a href=\"#\" class=\"crt-post-read-more-button\"><%=this._t(\"read-more\")%></a></div> \n        </div> \n    </div> \n</div>";

var template = "\n<div class=\"crt-grid-post crt-grid-post-v2 crt-post-<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>\" data-post=\"<%=id%>\">     <div class=\"crt-post-c\"> \n        <div class=\"crt-post-content\"> \n            <div class=\"crt-hitarea\" > \n                <img src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\" class=\"crt-spacer\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /> \n                <div class=\"crt-grid-post-image\">\n                    <div class=\"crt-post-content-image\" style=\"background-image:url('<%=image%>');\"></div> \n                    <span class=\"crt-play\"><i class=\"crt-play-icon\"></i></span> \n                    <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                    <div class=\"crt-image-carousel\"><i class=\"crt-icon-image-carousel\"></i></div> \n                </div>\n                <div class=\"crt-grid-post-text\">\n                    <div class=\"crt-grid-post-text-wrap\"> \n                        <div><%=this.parseText(text)%></div> \n                    </div> \n                    <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                </div>\n                <div class=\"crt-post-hover\">\n                    <div>\n                        <div class=\"crt-post-header\"> \n                            <span class=\"crt-social-icon\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                            <div class=\"crt-post-fullname\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\"><%=user_full_name%></a></div>\n                        </div> \n                        <div class=\"crt-post-content-text\"> \n                            <%=this.parseText(text)%> \n                        </div> \n                        <div class=\"crt-post-read-more\"><a href=\"#\" class=\"crt-post-read-more-button\"><%=this._t(\"read-more\")%></a></div> \n                        <div class=\"crt-post-footer\">\n                            <img class=\"crt-post-userimage\" src=\"<%=user_image%>\" alt=\"Profile image for <%=user_full_name%>\" /> \n                            <span class=\"crt-post-username\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\"><%=this.userScreenName()%></a></span>\n                            <span class=\"crt-date\"><%=this.prettyDate(source_created_at)%></span> \n                            <div class=\"crt-post-share\"><span class=\"crt-share-hint\"></span><a href=\"#\" class=\"crt-share-facebook\"><i class=\"crt-icon-facebook\"></i></a>  <a href=\"#\" class=\"crt-share-twitter\"><i class=\"crt-icon-twitter\"></i></a></div>\n                        </div> \n                    </div>\n                </div> \n            </div> \n        </div> \n    </div>\n</div>";

var v2GridFeedTemple = "\n<div class=\"crt-feed-window\">\n    <div class=\"crt-feed\"></div>\n</div>\n<div class=\"crt-load-more\"><a href=\"#\"><%=this._t(\"load-more\")%></a></div>";

var template$1 = "\n<div class=\"crt-grid-post crt-grid-post-minimal crt-grid-post-v2 crt-post-<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>\" data-post=\"<%=id%>\">     <div class=\"crt-post-c\"> \n        <div class=\"crt-post-content\"> \n            <div class=\"crt-hitarea\" > \n                <img src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\" class=\"crt-spacer\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /> \n                <div class=\"crt-grid-post-image\">\n                    <div class=\"crt-post-content-image\" style=\"background-image:url('<%=image%>');\"></div> \n                    <a href=\"javascript:;\" class=\"crt-play\"><i class=\"crt-play-icon\"></i></a> \n                    <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                    <div class=\"crt-image-carousel\"><i class=\"crt-icon-image-carousel\"></i></div> \n                </div>\n                <div class=\"crt-grid-post-text\">\n                    <div class=\"crt-grid-post-text-wrap\"> \n                        <div><%=this.parseText(text)%></div> \n                    </div> \n                    <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                </div>\n                <div class=\"crt-post-hover\">\n                    <div>\n                        <div class=\"crt-post-header\">\n                            <span class=\"crt-social-icon\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span>  \n                        </div> \n                        <div class=\"crt-post-minimal-stats\"> \n                            <span class=\"crt-likes\"><i class=\"crt-icon-heart\"></i>&nbsp;<%=likes%></span>\n                            <span class=\"crt-comments\"><i class=\"crt-icon-comment\"></i>&nbsp;<%=comments%></span>\n                        </div> \n                    </div> \n                </div> \n            </div> \n        </div> \n    </div>\n</div>";

var template$2 = "\n<div class=\"crt-feed-window\">\n    <div class=\"crt-feed\"></div>\n</div>\n<div class=\"crt-load-more\"><a href=\"#\"><%=this._t(\"load-more\")%></a></div>";

var template$3 = "\n<div class=\"crt-list-post crt-post-<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>\" data-post=\"<%=id%>\">     <div class=\"crt-post-c\"> \n        <div class=\"crt-post-content\"> \n            <div class=\"crt-list-post-image\">\n                <div>\n                <img class=\"crt-post-content-image\" src=\"<%=image%>\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /> \n                <a href=\"javascript:;\" class=\"crt-play\"><i class=\"crt-play-icon\"></i></a> \n                <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                <span class=\"crt-image-carousel\"><i class=\"crt-icon-image-carousel\"></i></span>\n                </div> \n            </div>\n            <div class=\"crt-list-post-text\">\n                <div class=\"crt-post-header\"> \n                    <div class=\"crt-post-fullname\"><%=id%> - <a href=\"<%=this.userUrl()%>\" target=\"_blank\"><%=user_full_name%></a></div>\n                </div> \n                <div class=\"crt-list-post-text-wrap\"> \n                    <div><%=this.parseText(text)%></div> \n                </div> \n                <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span>\n                 <div class=\"crt-post-footer\">\n                    <img class=\"crt-post-userimage\" src=\"<%=user_image%>\" alt=\"Profile image for <%=user_full_name%>\"/> \n                    <span class=\"crt-post-username\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\">@<%=user_screen_name%></a></span>\n                    <span class=\"crt-date\"><%=this.prettyDate(source_created_at)%></span> \n                    <div class=\"crt-post-share\"><span class=\"crt-share-hint\"></span><a href=\"#\" class=\"crt-share-facebook\"><i class=\"crt-icon-facebook\"></i></a>  <a href=\"#\" class=\"crt-share-twitter\"><i class=\"crt-icon-twitter\"></i></a></div>\n                </div>  \n            </div>\n        </div> \n    </div>\n</div>";

var Templates = {
    'filter'                : filterTemplate,
    'popup'                 : v1PopupTemplate,
    'popup-underlay'        : v1PopupUnderlayTemplate,
    'popup-wrapper'         : v1PopupWrapperTemplate,

    // V1
    'post-v1'               : v1PostTemplate,
    'grid-post-v1'          : gridPostTemplate,

    // V2
    'post-v2'               : v2PostTemplate,
    'grid-post-v2'          : template,
    'grid-post-minimal'     : template$1,
    'grid-feed-v2'          : v2GridFeedTemple,

    'list-feed'             : template$2,
    'list-post'             : template$3,
};

/**
 * Microlib for translations with support for placeholders and multiple plural forms.
 *
 * https://github.com/musterknabe/translate.js
 *
 * v1.1.0
 *
 * @author Jonas Girnatis <dermusterknabe@gmail.com>
 * @licence May be freely distributed under the MIT license.
 */


var isNumeric = function(obj) { return !isNaN(parseFloat(obj)) && isFinite(obj); };
var isObject = function(obj) { return typeof obj === 'object' && obj !== null; };
var isString = function(obj) { return Object.prototype.toString.call(obj) === '[object String]'; };

var libTranslate = {
    getTranslationFunction: function(messageObject, options) {
        options = isObject(options) ? options : {};

        var debug = options.debug;
        var namespaceSplitter = options.namespaceSplitter || '::';

        function getTranslationValue(translationKey) {
            if(messageObject[translationKey]) {
                return messageObject[translationKey];
            }

            var components = translationKey.split(namespaceSplitter); //@todo make this more robust. maybe support more levels?
            var namespace = components[0];
            var key = components[1];

            if(messageObject[namespace] && messageObject[namespace][key]) {
                return messageObject[namespace][key];
            }

            return null;
        }

        function getPluralValue(translation, count) {
            if (isObject(translation)) {
                var keys = Object.keys(translation);
                var upperCap;

                if(keys.length === 0) {
                    debug && window.console.log('[Translation] No plural forms found.');
                    return null;
                }

                for(var i = 0; i < keys.length; i++) {
                    if(keys[i].indexOf('gt') === 0) {
                        upperCap = parseInt(keys[i].replace('gt', ''), 10);
                    }
                }

                if(translation[count]){
                    translation = translation[count];
                } else if(count > upperCap) { //int > undefined returns false
                    translation = translation['gt' + upperCap];
                } else if(translation.n) {
                    translation = translation.n;
                } else {
                    debug && window.console.log('[Translation] No plural forms found for count:"' + count + '" in', translation);
                    translation = translation[Object.keys(translation).reverse()[0]];
                }
            }

            return translation;
        }

        function replacePlaceholders(translation, replacements) {
            if (isString(translation)) {
                return translation.replace(/\{(\w*)\}/g, function (match, key) {
                    if(!replacements.hasOwnProperty(key)) {
                        debug && window.console.log('Could not find replacement "' + key + '" in provided replacements object:', replacements);

                        return '{' + key + '}';
                    }

                    return replacements.hasOwnProperty(key) ? replacements[key] : key;
                });
            }

            return translation;
        }

        return function (translationKey) {
            var replacements = isObject(arguments[1]) ? arguments[1] : (isObject(arguments[2]) ? arguments[2] : {});
            var count = isNumeric(arguments[1]) ? arguments[1] : (isNumeric(arguments[2]) ? arguments[2] : null);

            var translation = getTranslationValue(translationKey);

            if (count !== null) {
                replacements.n = replacements.n ? replacements.n : count;

                //get appropriate plural translation string
                translation = getPluralValue(translation, count);
            }

            //replace {placeholders}
            translation = replacePlaceholders(translation, replacements);

            if (translation === null) {
                translation = debug ? '@@' + translationKey + '@@' : translationKey;

                if (debug) {
                    window.console.log('Translation for "' + translationKey + '" not found.');
                }
            }

            return translation;
        };
    }
};

function _k (o, key, val) {
    // console.log(key);
    var kPath = key.split('.');
    for (var i=0;i<kPath.length;i++) {
        var k = kPath[i];
        if (!o[k]) {
            o[k] = {};
        }
        if (i === kPath.length-1) {
            o[k] = val;
        } else {
            o = o[k];
        }
    }
}

var langsData = "\nid,en,de,it,nl,es,fr,po,ru,sl,pl,ar,fi\nload-more,Load more,Mehr anzeigen,Di più,Laad meer,Cargar más,Voir plus,Carregar Mais,Загрузить больше,Prikaži več,,,Lataa lisää\nminutes-ago.1,{n} minute ago,Vor einer Minute,Un minuto fa,{n} minuut geleden,Hace un minuto,Il y a {n} minute,Tem um minuto,Одну минуту назад,pred {n} minuto,,,{n} minuutti sitten\nminutes-ago.n,{n} minutes ago,Vor {n} Minuten,{n} minuti fa,{n} minuten geleden,Hace {n} minutos,Il y a {n} minutes,Tem {n} minutos,{n} минут назад,pred {n} minutami,,,{n} minuuttia sitten\nhours-ago.1,{n} hour ago,Vor einer Stunde,Un'ora fa,{n} uur geleden,Hace una hora,Il y a {n} heure,Tem {n} hora,Один час назад,pred {n} uro,,,{n} tunti sitten\nhours-ago.n,{n} hours ago,Vor {n} Stunden,{n} ore fa,{n} uren geleden,Hace {n} horas,Il y a {n} heures,Tem {n} horas,{n} часов назад,pred {n} urami,,,{n} tuntia sitten\ndays-ago.1,{n} day ago,Vor einem Tag,Un giorno fa,{n} dag geleden,Hace un día,Il y a {n} jour,Faz um dia,Один день назад,pred {n} dnevom,,,{n} päivä sitten\ndays-ago.n,{n} days ago,Vor {n} Tagen,{n} giorni fa,{n} dagen geleden,Hace {n} días,Il y a {n} jours,Fazem {n} dias,{n} дней назад,pred {n} dnevi,,,{n} päivää sitten\nweeks-ago.1,{n} week ago,Vor einer Woche,Una settimana fa,{n} week geleden,Hace una semana,Il y a {n} semaine,Faz uma semana,Одну неделю назад,pred {n} tednom,,,{n} viikko sitten\nweeks-ago.n,{n} weeks ago,Vor {n} Wochen,{n} settimane fa,{n} weken geleden,Hace {n} semanas,Il y a {n} semaines,Fazem {n} semanas,{n} недель назад,pred {n} tedni,,,{n} viikkoa sitten\nmonths-ago.1,{n} month ago,Vor einem Monat,Un mese fa,{n} maand geleden,Hace un mes,Il y a {n} mois,Tem um mês,Один месяц назад,pred {n} mesecem,,,{n} kuukausi sitten\nmonths-ago.n,{n} months ago,Vor {n} Monaten,{n} mesi,{n} maanden geleden,Hace {n} meses,Il y a {n} mois,Tem {n} meses,{n} месяцев назад,pred {n} meseci,,,{n} kuukautta sitten\nyesterday,Yesterday,Gestern,Leri,Gisteren,Ayer,Hier,Ontem,Вчера,Včeraj,,,Eilen\njust-now,Just now,Eben,Appena,Nu,Ahora,Il y a un instant,Agora,Только что,Pravkar,,,Juuri nyt\nprevious,Previous,Zurück,Indietro,Vorige,Anterior,Précédent,Anterior,Предыдущий,Prejšnji,,,Edellinen\nnext,Next,Weiter,Più,Volgende,Siguiente,Suivant,Próximo,Следующий,Naslednji,,,Seuraava\ncomments,Comments,Kommentare,Commenti,Comments,Comentarios,Commentaires,Comentários,Комментарии,Komentarji,,,Kommentit\nlikes,Likes,Gefällt mir,Mi piace,Likes,Me gusta,J'aime,Curtir,Лайки,Všečki,,,Tykkäykset\nread-more,Read more,Weiterlesen,Di più,Lees meer,Leer más,En savoir plus,Leia mais,Подробнее,Preberi več,,,Lue lisää\nfilter,Filter,Filtern,filtrare,Filtreren,filtrar,filtrer,Filtro,фильтровать,Filter,,,Suodata\nall,All,Alle,Tutti,Alle,Todas,Tout,Todos,все,Vsi,,,Kaikki\ngo-to-original-post,Go to original post,,,,,,,,,,,Palaa alkuperäiseen postaukseen\n";


var langs = {};
var langDataLines = langsData.split('\n');

// Remove unused lines
for (var i = langDataLines.length-1 ; i>=0 ; i--) {
    if (!langDataLines[i]) {
        langDataLines.splice(i,1);
    }
}
var keys = langDataLines[0].split(',');

for (var i$1=1;i$1<langDataLines.length;i$1++) {
    var langDataCols = langDataLines[i$1].split(',');
    for (var j = 1;j < langDataCols.length;j++) {
        _k (langs, keys[j]+'.'+langDataCols[0], langDataCols[j]);
    }
}

var _cache = {};
var currentLang = 'en';

var mod = {
    setLang: function setLang (lang) {
        currentLang = lang;
    },

    t: function t (key, n, lang) {
        lang = lang || currentLang;

        if (!_cache[lang]) {
            if (langs[lang]) {
                _cache[lang] = libTranslate.getTranslationFunction(langs[lang]);
            } else {
                window.console.error('Unsupported language `' + lang + '`');
                _cache[lang] = libTranslate.getTranslationFunction(langs.en);
            }
        }

        key = key.toLowerCase();
        key = key.replace(' ','-');

        var t = _cache[lang](key, n);
        if (t === key) {
            // if translation same as the key then no translation was found, fallback to English
            return mod.t(key, n, 'en');
        }
        return t;
    }
};

var DateUtils = {
    /**
     * Parse a date string in form DD/MM/YYYY HH:MM::SS - returns as UTC
     */
    dateFromString: function dateFromString(time) {
        var dtstr = time.replace(/\D/g," ");
        var dtcomps = dtstr.split(" ");

        // modify month between 1 based ISO 8601 and zero based Date
        dtcomps[1]--;

        var date = new Date(Date.UTC(dtcomps[0],dtcomps[1],dtcomps[2],dtcomps[3],dtcomps[4],dtcomps[5]));

        return date;
    },

    /**
     * Format the date as DD/MM/YYYY
     */
    dateAsDayMonthYear: function dateAsDayMonthYear(strEpoch) {
        var myDate = new Date(parseInt(strEpoch, 10));
        // console.log(myDate.toGMTString()+"<br>"+myDate.toLocaleString());

        var day = myDate.getDate() + '';
        var month = (myDate.getMonth() + 1) + '';
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
        var ampm;

        if (hours >= 12) {
            ampm = 'PM';
            if (hours > 12) {
                hours = (hours - 12) + '';
            }
        }
        else {
            ampm = 'AM';
        }

        hours = hours.length === 1 ? '0' + hours : hours; //console.log(hours.length);
        mins = mins.length === 1 ? '0' + mins : mins; //console.log(mins);

        var array = [
            parseInt(hours.charAt(0), 10),
            parseInt(hours.charAt(1), 10),
            parseInt(mins.charAt(0), 10),
            parseInt(mins.charAt(1), 10),
            ampm
        ];

        return array;
    },


    fuzzyDate: function fuzzyDate (dateString) {
        var date = Date.parse(dateString+' UTC');
        var delta = Math.round((new Date () - date) / 1000);

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
        } else if (Math.floor(delta / hour) === 1) {
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

    prettyDate: function prettyDate (time) {
        var date = DateUtils.dateFromString(time);

        var diff = (((new Date()).getTime() - date.getTime()) / 1000);
        var day_diff = Math.floor(diff / 86400);
        var year = date.getFullYear(),
            month = date.getMonth()+1,
            day = date.getDate();

        if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) {
            return year.toString() + '-' + ((month < 10) ? '0' + month.toString() : month.toString()) + '-' + ((day < 10) ? '0' + day.toString() : day.toString());
        }

        var minute_diff = Math.floor(diff / 60);
        var hour_diff = Math.floor(diff / 3600);
        var week_diff = Math.ceil(day_diff / 7);

        var r =
            (
                (
                    day_diff === 0 &&
                    (
                        (diff < 60 && mod.t("Just now")) ||
                        (diff < 3600 && mod.t("minutes ago", minute_diff)) || //
                        (diff < 86400 && mod.t("hours ago", hour_diff)) // + " hours ago")
                    )
                ) ||
                (day_diff === 1 && mod.t("Yesterday")) ||
                (day_diff < 7 && mod.t("days ago",day_diff)) ||
                (day_diff < 31 && mod.t("weeks ago",week_diff))
            );
        return r;
    }
};

var helpers = {
    networkIcon: function networkIcon () {
        return this.data.network_name.toLowerCase();
    },

    networkName: function networkName () {
        return this.data.network_name.toLowerCase();
    },

    userUrl: function userUrl () {
        if (this.data.user_url && this.data.user_url !== '') {
            return this.data.user_url;
        }
        if (this.data.originator_user_url && this.data.originator_user_url !== '') {
            return this.data.originator_user_url;
        }
        if (this.data.userUrl && this.data.userUrl !== '') {
            return this.data.userUrl;
        }

        var netId = this.data.network_id+'';
        if (netId === '1') {
            return 'http://twitter.com/' + this.data.user_screen_name;
        } else if (netId === '2') {
            return 'http://instagram.com/'+this.data.user_screen_name;
        } else if (netId === '3') {
            return 'http://facebook.com/'+this.data.user_screen_name;
        }

        return '#';
    },

    userScreenName: function userScreenName () {
        if (this.data.user_screen_name) {
            return '@' + this.data.user_screen_name;
        } else {
            return '';
        }
    },

    parseText: function parseText (s) {
        if (this.data.is_html) {
            return s;
        } else {
            if (this.data.network_name === 'Twitter') {
                s = StringUtils.linksToHref(s);
                s = StringUtils.twitterLinks(s);
            } else if (this.data.network_name === 'Instagram') {
                s = StringUtils.linksToHref(s);
                s = StringUtils.instagramLinks(s);
            } else if (this.data.network_name === 'Facebook') {
                s = StringUtils.linksToHref(s);
                s = StringUtils.facebookLinks(s);
            } else {
                s = StringUtils.linksToHref(s);
            }

            return StringUtils.nl2br(s);
        }
    },

    nl2br: function nl2br (s) {
        return StringUtils.nl2br(s);
    },

    contentImageClasses: function contentImageClasses () {
        return this.data.image ? 'crt-post-has-image' : 'crt-post-content-image-hidden crt-post-no-image';
    },

    contentTextClasses: function contentTextClasses () {
        return this.data.text ? 'crt-post-has-text' : 'crt-post-content-text-hidden crt-post-no-text';
    },

    fuzzyDate: function fuzzyDate (dateString)
    {
        return DateUtils.fuzzyDate(dateString);
    },

    prettyDate: function prettyDate (time) {
        return DateUtils.prettyDate (time);
    },

    _t: function _t (s, n) {
        return mod.t (s, n);
    }
};

// Change to use $local is passed into the factory wrapper - it's either jQuery or Zepto
var z = null;

if (window.$crt) {
    z = window.$crt;
} else if (window.Zepto) {
    z = window.Zepto;
} else if (window.jQuery) {
    z = window.jQuery;
}


if (!z) {
    window.alert('Curator requires jQuery or Zepto. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}

var z$1 = z;

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

var _rendererTmplCache = {};

var Templating = {
    renderTemplate: function renderTemplate (templateId, data) {
        var source = '';
        var $t = z$1('#'+templateId);

        if ($t.length===1)
        {
            source = $t.html();
        } else if (Templates[templateId] !== undefined)
        {
            source = Templates[templateId];
        }

        if (source === '')
        {
            throw new Error ('Could not find template '+templateId);
        }

        var tmpl = Templating.render(source, data);
        if (z$1.parseHTML) {
            // breaks with jquery < 1.8
            tmpl = z$1.parseHTML(tmpl);
        }
        return z$1(tmpl).filter('div');
    },

    render: function render (str, data) {
        var err = "";
        try {
            var func = _rendererTmplCache[str];
            if (!func) {
                var strComp =
                    str.replace(/[\r\t\n]/g, " ")
                        .replace(/'(?=[^%]*%>)/g, "\t")
                        .split("'").join("\\'")
                        .split("\t").join("'")
                        .replace(/<%=(.+?)%>/g, "',$1,'")
                        .split("<%").join("');")
                        .split("%>").join("p.push('");

                // note - don't change the 'var' in the string to 'let'!!!
                var strFunc =
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +
                    "with(obj){p.push('" + strComp + "');}return p.join('');";

                func = new Function("obj", strFunc);  // jshint ignore:line
                _rendererTmplCache[str] = func;
            }
            helpers.data = data;
            return func.call(helpers, data);
        } catch (e) {
            Logger.error ('Template parse error: ' +e.message);
            err = e.message;
        }
        return " # ERROR: " + err + " # ";
    }
};

/**
* ==================================================================
* Post
* ==================================================================
*/


var Post = (function (EventBus$$1) {
    function Post (postJson, options, widget) {
        var this$1 = this;

        EventBus$$1.call(this);

        this.options = options;
        this.widget = widget;

        var templateId = this.widget.options.templatePost;

        this.json = postJson;
        this.$el = Templating.renderTemplate(templateId, postJson);

        this.$postC = this.$el.find('.crt-post-c');
        this.$image = this.$el.find('.crt-post-image');
        this.$imageContainer = this.$el.find('.crt-image-c');

        this.$el.find('.crt-share-facebook').click(this.onShareFacebookClick.bind(this));
        this.$el.find('.crt-share-twitter').click(this.onShareTwitterClick.bind(this));
        // this.$el.find('.crt-hitarea').click(this.onPostClick.bind(this));
        this.$el.find('.crt-post-read-more-button').click(this.onReadMoreClick.bind(this));
        // this.$el.on('click','.crt-post-text-body a',this.onLinkClick.bind(this));

        this.$postC.click(this.onPostClick.bind(this));

        this.$image.css({opacity:0});

        if (this.json.image) {
            this.$image.on('load', this.onImageLoaded.bind(this));
            this.$image.on('error', this.onImageError.bind(this));
        } else {
            // no image ... call this.onImageLoaded
            window.setTimeout(function () {
                this$1.setHeight();
            },100);
        }

        if (this.json.image_width > 0) {
            var p = (this.json.image_height/this.json.image_width)*100;
            this.$imageContainer.addClass('crt-image-responsive')
                .css('padding-bottom',p+'%');
        }

        if (this.json.url.indexOf('http') !== 0) {
            this.$el.find('.crt-post-share').hide ();
        }

        this.$image.data('dims',this.json.image_width+':'+this.json.image_height);

        if (this.json.video) {
            this.$el.addClass('crt-post-has-video');
        }

        if (this.json.images && this.json.images.length > 0) {
            this.$el.addClass('crt-has-image-carousel');
        }
    }

    if ( EventBus$$1 ) Post.__proto__ = EventBus$$1;
    Post.prototype = Object.create( EventBus$$1 && EventBus$$1.prototype );
    Post.prototype.constructor = Post;

    Post.prototype.onShareFacebookClick = function onShareFacebookClick (ev) {
        ev.preventDefault();
        SocialFacebook.share(this.json);
        this.widget.track('share:facebook');
        return false;
    };

    Post.prototype.onShareTwitterClick = function onShareTwitterClick (ev) {
        ev.preventDefault();
        SocialTwitter.share(this.json);
        this.widget.track('share:twitter');
        return false;
    };

    Post.prototype.onPostClick = function onPostClick (ev) {
        Logger.log('Post->click');

        var target = z$1(ev.target);

        // console.log(target[0].className.indexOf('read-more'));
        // console.log(target.attr('href'));

        if (target[0] && target[0].className.indexOf('read-more') > 0) {
            // ignore read more clicks
            return;
        }

        if (target.is('a') && target.attr('href') !== '#' && target.attr('href') !== 'javascript:;') {
            this.widget.track('click:link');
        } else {
            ev.preventDefault();
            this.trigger(Events.POST_CLICK, this, ev);
        }

    };

    Post.prototype.onReadMoreClick = function onReadMoreClick (ev) {
        ev.preventDefault();

        this.widget.track('click:read-more');
        this.trigger(Events.POST_CLICK_READ_MORE, this, this.json, ev);
    };

    Post.prototype.onImageLoaded = function onImageLoaded () {
        this.$image.animate({opacity:1});

        this.setHeight();

        this.trigger(Events.POST_IMAGE_LOADED, this);
        this.widget.trigger(Events.POST_IMAGE_LOADED, this);
    };

    Post.prototype.onImageError = function onImageError () {
        // Unable to load image!!!
        this.$image.hide();

        this.setHeight();

        this.trigger(Events.POST_IMAGE_FAILED, this);
        this.widget.trigger(Events.POST_IMAGE_FAILED, this);
    };

    Post.prototype.setHeight = function setHeight () {
        var height = this.$postC.height();
        if (this.options.maxHeight && this.options.maxHeight > 0 && height > this.options.maxHeight) {
            this.$postC
                .css({maxHeight: this.options.maxHeight});
            this.$el.addClass('crt-post-max-height');
        }

        this.layout();
    };

    Post.prototype.getHeight = function getHeight () {
        if (this.$el.hasClass('crt-post-max-height')) {
            return this.$postC.height();
        } else {
            // let $pane = z(this.$panes[i]);
            var contentHeight = this.$el.find('.crt-post-content').height();
            var footerHeight = this.$el.find('.crt-post-footer').height();
            return contentHeight + footerHeight + 2;
        }
    };

    Post.prototype.layout = function layout () {
        // Logger.log("Post->layout");
        this.layoutFooter();
    };

    Post.prototype.layoutFooter = function layoutFooter () {
        // Logger.log("Post->layoutFooter");
        var $userName = this.$el.find('.crt-post-username');
        var $date = this.$el.find('.crt-date');
        var $footer = this.$el.find('.crt-post-footer');
        var $share = this.$el.find('.crt-post-share');
        var $userImage = this.$el.find('.crt-post-userimage');

        var footerWidth = $footer.width();
        var padding = 40;
        var elementsWidth = $userName.width() + $date.width() + $share.width() + $userImage.width() + padding;

        if (elementsWidth > footerWidth) {
            $userName.hide();
        }
    };

    return Post;
}(EventBus));

var HtmlUtils = {
    checkContainer: function checkContainer (container) {
        Logger.log("Curator->checkContainer: " + container);
        if (z$1(container).length === 0) {
            Logger.error('Curator could not find the element ' + container + '. Please ensure this element existings in your HTML code. Exiting.');
            return false;
        }
        return true;
    },

    checkPowered: function checkPowered (jQuerytag) {
        Logger.log("Curator->checkPowered");
        var h = jQuerytag.html();
        // Logger.log (h);
        if (h.indexOf('Curator') > 0) {
            return true;
        } else {
            window.alert('Container is missing Powered by Curator');
            return false;
        }
    },

    addCSSRule: function addCSSRule (sheet, selector, rules, index) {
        index = index || 0;
        if ('insertRule' in sheet) {
            sheet.insertRule(selector + '{' + rules + '}', 0);
        }
        else if ('addRule' in sheet) {
            sheet.addRule(selector, rules);
        }
    },

    createSheet: function createSheet () {
        var style = document.createElement("style");
        // WebKit hack :(
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);
        return style.sheet;
    },

    loadCSS: function loadCSS () {
        // not used!
    },
    
    isTouch: function isTouch () {
        var b = false;
        try {
            b = ("ontouchstart" in document.documentElement);
        } catch (e) {}
        
        return b;
    }
};

var serialize = function serialize( obj ) {
    return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a;},[]).join('&');
};

var fixUrl = function (url) {
    var p = window.location.protocol,
        pp = url.indexOf('://');

    // IE9/IE10 cors requires same protocol
    // stripe current protocol and match window.location
    if (pp) {
        url = url.substr(pp + 3);
    }

    // if not https: or http: (eg file:) default to https:
    p = p !== 'https:' && p !== 'http:' ? 'https:' : p;
    url = p + '//' + url;
    return url;
};

var ajax = {
    get: function get (url, params, success, fail) {
        url = fixUrl(url);

        if (params) {
            url = url + serialize (params);
        }

        nanoajax ({
            url:url,
            cors:true
        },function(statusCode, responseText) {
            if (statusCode) {
                success(JSON.parse(responseText));
            } else {
                fail (statusCode, responseText);
            }
        });
    },

    post: function post (url, params, success, fail) {
        url = fixUrl(url);

        nanoajax ({
            url:url,
            cors:true,
            body:params,
            method:'POST'
        },function(statusCode, responseText) {
            if (statusCode) {
                success(JSON.parse(responseText));
            } else {
                fail (statusCode, responseText);
            }
        });
    }
};

var Feed = (function (EventBus$$1) {
    function Feed(widget) {
        EventBus$$1.call (this);

        Logger.log ('Feed->init with options');

        this.widget = widget;

        this.posts = [];
        this.currentPage = 0;
        this.postsLoaded = 0;
        this.postCount = 0;
        this.loading = false;
        this.allPostsLoaded = false;
        this.pagination = {
            after:null,
            before:null
        };

        this.options = this.widget.options;

        this.params = this.options.feedParams || {};
        this.params.limit = this.options.postsPerPage;

        this.feedBase = this.options.apiEndpoint+'/feeds';
    }

    if ( EventBus$$1 ) Feed.__proto__ = EventBus$$1;
    Feed.prototype = Object.create( EventBus$$1 && EventBus$$1.prototype );
    Feed.prototype.constructor = Feed;

    Feed.prototype.loadPosts = function loadPosts (page, paramsIn) {
        page = page || 0;
        Logger.log ('Feed->loadPosts '+this.loading);
        if (this.loading) {
            return false;
        }
        this.currentPage = page;

        if (+this.currentPage === 0) {
            this.posts = [];
            this.postsLoaded = 0;
        }

        var params = z$1.extend({},this.params,paramsIn);

        params.limit = this.options.postsPerPage;
        params.offset = page * this.options.postsPerPage;

        this._loadPosts (params);
    };

    Feed.prototype.loadMorePaginated = function loadMorePaginated (paramsIn) {

        var params = z$1.extend({},this.params,paramsIn);

        if (this.pagination && this.pagination.after) {
            params.after = this.pagination.after;
        }

        // console.log (params);

        this._loadPosts (params);
    };

    Feed.prototype.loadMore = function loadMore (paramsIn) {
        Logger.log ('Feed->loadMore '+this.loading);
        if (this.loading) {
            return false;
        }

        var params = {
            limit:this.options.postsPerPage
        };
        z$1.extend(params,this.options.feedParams, paramsIn);

        params.offset = this.posts.length;

        this._loadPosts (params);
    };

    /**
     * First load - get's the most recent posts.
     * @param params - set parameters to send to API
     * @returns {boolean}
     */
    Feed.prototype.load = function load (params) {
        Logger.log ('Feed->load '+this.loading);

        if (this.loading) {
            return false;
        }
        this.currentPage = 0;

        var loadPostParams = z$1.extend(this.params, params);

        this._loadPosts (loadPostParams);
    };

    /**
     * Loads posts after the current set
     * @returns {boolean}
     */
    Feed.prototype.loadAfter = function loadAfter () {
        Logger.log ('Feed->loadAfter '+this.loading);

        if (this.loading) {
            return false;
        }
        this.currentPage = 0;

        var params = z$1.extend({},this.params);

        // TODO should we check we have after?
        if (this.pagination && this.pagination.after) {
            params.after = this.pagination.after;
            delete params.before;
        }

        this._loadPosts (params);
    };

    Feed.prototype._loadPosts = function _loadPosts (params) {
        var this$1 = this;

        Logger.log ('Feed->_loadPosts');

        this.loading = true;

        params.rnd = (new Date ()).getTime();

        ajax.get(
            this.getUrl('/posts'),
            params,
            function (data) {
                Logger.log('Feed->_loadPosts success');

                if (data.success) {
                    this$1.postCount = data.postCount;
                    this$1.postsLoaded += data.posts.length;

                    this$1.allPostsLoaded = this$1.postsLoaded >= this$1.postCount;

                    this$1.posts = this$1.posts.concat(data.posts);
                    this$1.networks = data.networks;

                    if (data.pagination) {
                        this$1.pagination = data.pagination;
                    }

                    this$1.widget.trigger(Events.FEED_LOADED, data);
                    this$1.trigger(Events.FEED_LOADED, data);

                    this$1.widget.trigger(Events.POSTS_LOADED, data.posts);
                    this$1.trigger(Events.POSTS_LOADED, data.posts);
                } else {
                    this$1.trigger(Events.POSTS_FAILED, data);
                    this$1.widget.trigger(Events.POSTS_FAILED, data);
                }
                this$1.loading = false;
            },
            function (jqXHR, textStatus, errorThrown) {
                Logger.log('Feed->_loadPosts fail');
                Logger.log(textStatus);
                Logger.log(errorThrown);

                this$1.trigger(Events.POSTS_FAILED, []);
                this$1.loading = false;
            }
        );
    };

    Feed.prototype.loadPost = function loadPost (id, successCallback, failCallback) {
        failCallback = failCallback || function(){};
        ajax.get(
            this.getUrl('/post/' + id),
            {},
            function (data) {
                if (data.success) {
                    successCallback (data.post);
                } else {
                    failCallback ();
                }
            },
            function (jqXHR, textStatus, errorThrown) { /* jshint ignore:line */
                // FAIL
            });
    };

    Feed.prototype.inappropriatePost = function inappropriatePost (id, reason, success, failure) {
        var params = {
            reason: reason
        };

        ajax.post(
            this.getUrl('/post/' + id + '/inappropriate'),
            params,
            function (data, textStatus, jqXHR) {
                data = z$1.parseJSON(data);

                if (data.success === true) {
                    success();
                }
                else {
                    failure(jqXHR);
                }
        }   );
    };

    Feed.prototype.lovePost = function lovePost (id, success, failure) {
        var params = {};

        z$1.post(this.getUrl('/post/' + id + '/love'), params, function (data, textStatus, jqXHR) {
            data = z$1.parseJSON(data);

            if (data.success === true) {
                success(data.loves);
            }
            else {
                failure(jqXHR);
            }
        });
    };

    Feed.prototype.getUrl = function getUrl (trail) {
        return this.feedBase+'/'+this.options.feedId+trail;
    };

    Feed.prototype.destroy = function destroy () {
        EventBus$$1.prototype.destroy.call(this);
    };

    return Feed;
}(EventBus));

var networks = {
    1 : {
        name:'Twitter',
        icon:'crt-icon-twitter'
    },
    2 : {
        name:'Instagram',
        icon:'crt-icon-instagram'
    },
    3 : {
        name:'Facebook',
        icon:'crt-icon-facebook'
    },
    4 : {
        name:'Pinterest',
        icon:'crt-icon-pinterest'
    },
    5 : {
        name:'Google',
        icon:'crt-icon-google'
    },
    6 : {
        name:'Vine',
        icon:'crt-icon-vine'
    },
    7 : {
        name:'Flickr',
        icon:'crt-icon-flickr'
    },
    8 : {
        name:'Youtube',
        icon:'crt-icon-youtube'
    },
    9 : {
        name:'Tumblr',
        icon:'crt-icon-tumblr'
    },
    10 : {
        name:'RSS',
        icon:'crt-icon-rss'
    },
    11 : {
        name:'LinkedIn',
        icon:'crt-icon-linkedin'
    },
    12 : {
        id: 12,
        name:'Vimeo',
        slug:'vimeo',
        icon:'crt-icon-vimeo'
    },
    13 : {
        id: 13,
        name:'Diffbot',
        slug:'difbot',
        icon:'crt-icon-cogs'
    },
    14 : {
        id: 14,
        name:'Webo',
        slug:'webo',
        icon:'crt-icon-weibo'
    },
    15 : {
        id: 15,
        name:'Glassdoor',
        slug:'glassdoor',
        icon:'crt-icon-cogs'
    },
    16 : {
        id: 16,
        name:'Instagram',
        slug:'instagram',
        icon:'crt-icon-instagram'
    },
    17 : {
        id: 17,
        name:'Yelp',
        slug:'yelp',
        icon:'crt-icon-yelp'
    },
};

/**
* ==================================================================
* Filter
* ==================================================================
*/

var Filter = (function (EventBus$$1) {
    function Filter (widget) {
        var this$1 = this;

        Logger.log('Filter->construct');

        EventBus$$1.call(this);

        this.widget = widget;
        this.options = widget.options;

        this.$filter = Templating.renderTemplate(this.options.templateFilter, {});
        this.$filterNetworks =  this.$filter.find('.crt-filter-networks');
        this.$filterNetworksUl =  this.$filter.find('.crt-filter-networks ul');
        this.$filterSources =  this.$filter.find('.crt-filter-sources');
        this.$filterSourcesUl =  this.$filter.find('.crt-filter-sources ul');

        this.widget.$container.append(this.$filter);

        this.$filter.on('click','.crt-filter-networks a', function (ev) {
            ev.preventDefault();
            var t = z$1(ev.target);
            var networkId = t.data('network');

            this$1.$filter.find('.crt-filter-networks li').removeClass('active');
            t.parent().addClass('active');

            this$1.widget.trigger(Events.FILTER_CHANGED, this$1);

            if (networkId) {
                this$1.widget.feed.params.network_id = networkId;
            } else {
                this$1.widget.feed.params.network_id = 0;
            }

            this$1.widget.feed.loadPosts(0);
        });

        this.$filter.on('click','.crt-filter-sources a', function (ev) {
            ev.preventDefault();
            var t = z$1(ev.target);
            var sourceId = t.data('source');

            this$1.$filter.find('.crt-filter-sources li').removeClass('active');
            t.parent().addClass('active');

            this$1.widget.trigger(Events.FILTER_CHANGED, this$1);

            if (sourceId) {
                this$1.widget.feed.params.source_id = sourceId;
            } else {
                this$1.widget.feed.params.source_id = 0;
            }

            this$1.widget.feed.loadPosts(0);
        });

        this.widget.on(Events.FEED_LOADED, this.onPostsLoaded.bind(this));
    }

    if ( EventBus$$1 ) Filter.__proto__ = EventBus$$1;
    Filter.prototype = Object.create( EventBus$$1 && EventBus$$1.prototype );
    Filter.prototype.constructor = Filter;

    Filter.prototype.onPostsLoaded = function onPostsLoaded (event, data) {
        var this$1 = this;


        var networks$$1 = data.networks;
        var sources = data.sources;

        if (!this.filtersLoaded) {
            if (this.options.filter.showNetworks) {
                for (var i = 0, list = networks$$1; i < list.length; i += 1) {
                    var id = list[i];

                    var network = networks[id];
                    if (network) {
                        this$1.$filterNetworksUl.append('<li><a href="#" data-network="' + id + '"><i class="' + network.icon + '"></i> ' + network.name + '</a></li>');
                    } else {
                        //console.log(id);
                    }
                }
            } else {
                this.$filterNetworks.hide();
            }

            if (this.options.filter.showSources) {
                for (var i$1 = 0, list$1 = sources; i$1 < list$1.length; i$1 += 1) {
                    var source = list$1[i$1];

                    var network$1 = networks[source.network_id];
                    if (network$1) {
                        this$1.$filterSourcesUl.append('<li><a href="#" data-source="' + source.id + '"><i class="' + network$1.icon + '"></i> ' + source.name + '</a></li>');
                    } else {
                        // console.log(source.network_id);
                    }
                }
            } else {
                this.$filterSources.hide();
            }

            this.filtersLoaded = true;
        }
    };

    Filter.prototype.destroy = function destroy () {
        this.$filter.remove();
    };

    return Filter;
}(EventBus));

/**
 * ==================================================================
 * Popup
 * ==================================================================
 */

var Popup = function Popup (popupManager, post, widget) {
    var this$1 = this;

    Logger.log("Popup->init ");
 
    this.popupManager = popupManager;
    this.json = post;
    this.widget = widget;

    var templateId = this.widget.options.templatePopup;
    this.videoPlaying=false;

    this.$popup = Templating.renderTemplate(templateId, this.json);
    this.$left = this.$popup.find('.crt-popup-left');

    if (this.json.image) {
        this.$popup.addClass('has-image');
    }

    if (this.json.video) {
        this.$popup.addClass('has-video');
    }

    if (this.json.url) {
        this.$popup.addClass('crt-has-read-more');
    }

    if (this.json.video && this.json.video.indexOf('youtu') >= 0 )
    {
        // youtube
        this.$popup.find('video').remove();
        // this.$popup.removeClass('has-image');

        var youTubeId = StringUtils.youtubeVideoId(this.json.video);

        var src = "<div class=\"crt-responsive-video\"><iframe id=\"ytplayer\" src=\"https://www.youtube.com/embed/" + youTubeId + "?autoplay=0&rel=0&showinfo\" frameborder=\"0\" allowfullscreen></iframe></div>";

        this.$popup.find('.crt-video-container img').remove();
        this.$popup.find('.crt-video-container a').remove();
        this.$popup.find('.crt-video-container').append(src);
    } else if (this.json.video && this.json.video.indexOf('vimeo') >= 0 )
    {
        // youtube
        this.$popup.find('video').remove();
        // this.$popup.removeClass('has-image');

        var vimeoId = StringUtils.vimeoVideoId(this.json.video);

        if (vimeoId) {
            var src$1 = "<div class=\"crt-responsive-video\"><iframe src=\"https://player.vimeo.com/video/" + vimeoId + "?color=ffffff&title=0&byline=0&portrait=0\" frameborder=\"0\" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
            this.$popup.find('.crt-video-container img').remove();
            this.$popup.find('.crt-video-container a').remove();
            this.$popup.find('.crt-video-container').append(src$1);
        }
    }

    if (this.json.images)
    {
        this.$page = this.$popup.find('.crt-pagination ul');
        for (var i = 0;i < this.json.images.length;i++) {
            this$1.$page.append('<li><a href="" data-page="'+i+'"></a></li>');
        }
        this.$page.find('a').click(this.onPageClick.bind(this));
        this.currentImage = 0;
        this.$page.find('li:nth-child('+(this.currentImage+1)+')').addClass('selected');
    }

    this.$popup.on('click',' .crt-close', this.onClose.bind(this));
    this.$popup.on('click',' .crt-previous', this.onPrevious.bind(this));
    this.$popup.on('click',' .crt-next', this.onNext.bind(this));
    this.$popup.on('click',' .crt-play', this.onPlay.bind(this));
    this.$popup.on('click','.crt-share-facebook',this.onShareFacebookClick.bind(this));
    this.$popup.on('click','.crt-share-twitter',this.onShareTwitterClick.bind(this));

    z$1(window).on('resize.crt-popup',CommonUtils.debounce(this.onResize.bind(this),50));

    this.onResize ();
};

Popup.prototype.onResize = function onResize () {
    Logger.log('Popup->onResize');
    var windowWidth = z$1(window).width ();
    var padding = 60;
    var paddingMobile = 40;
    var rightPanel = 335;
    var leftPanelMax = 600;

    if (windowWidth > 1055) {
        this.$left.width(leftPanelMax+rightPanel);
    } else if (windowWidth > 910) {
        this.$left.width(windowWidth-(padding*2));
    } else if (windowWidth > leftPanelMax+(paddingMobile*2)) {
        this.$left.width(600);
    } else {
        this.$left.width(windowWidth-(paddingMobile*2));
    }
};

Popup.prototype.onPageClick = function onPageClick (ev) {
    ev.preventDefault();
    var a = z$1(ev.target);
    var page = a.data('page');

    var image = this.json.images[page];

    this.$popup.find('.crt-image img').attr('src', image.url);
    this.currentImage = page;

    this.$page.find('li').removeClass('selected');
    this.$page.find('li:nth-child('+(this.currentImage+1)+')').addClass('selected');
};

Popup.prototype.onShareFacebookClick = function onShareFacebookClick (ev) {
    ev.preventDefault();
    SocialFacebook.share(this.json);
    this.widget.track('share:facebook');
    return false;
};

Popup.prototype.onShareTwitterClick = function onShareTwitterClick (ev) {
    ev.preventDefault();
    SocialTwitter.share(this.json);
    this.widget.track('share:twitter');
    return false;
};

Popup.prototype.onClose = function onClose (e) {
    e.preventDefault();
    var that = this;
    this.hide(function(){
        that.popupManager.onClose();
    });
};

Popup.prototype.onPrevious = function onPrevious (e) {
    e.preventDefault();

    this.popupManager.onPrevious();
};

Popup.prototype.onNext = function onNext (e) {
    e.preventDefault();

    this.popupManager.onNext();
};

Popup.prototype.onPlay = function onPlay (e) {
    Logger.log('Popup->onPlay');
    e.preventDefault();

    this.videoPlaying = !this.videoPlaying;

    if (this.videoPlaying) {
        this.$popup.find('video')[0].play();
        this.widget.track('video:play');
    } else {
        this.$popup.find('video')[0].pause();
        this.widget.track('video:pause');
    }

    Logger.log(this.videoPlaying);

    this.$popup.toggleClass('video-playing',this.videoPlaying );
};

Popup.prototype.show = function show () {
    //
    // let post = this.json;
    // let mediaUrl = post.image,
    // text = post.text;
    //
    // if (mediaUrl) {
    // let $imageWrapper = that.$el.find('div.main-image-wrapper');
    // this.loadMainImage(mediaUrl, $imageWrapper, ['main-image']);
    // }
    //
    // let $socialIcon = this.$el.find('.social-icon');
    // $socialIcon.attr('class', 'social-icon');
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
        // z('.popup .content').fadeIn('slow');
        // });
    });
};
    
Popup.prototype.hide = function hide (callback) {
    Logger.log('Popup->hide');
    var that = this;
    this.$popup.fadeOut(function(){
        that.destroy();
        callback ();
    });
};
    
Popup.prototype.destroy = function destroy () {
    if (this.$popup && this.$popup.length) {
        this.$popup.remove();

        if (this.$popup.find('video').length) {
            this.$popup.find('video')[0].pause();

        }
    }

    z$1(window).off('resize.crt-popup');

    delete this.$popup;
};

/**
* ==================================================================
* Popup Manager
* ==================================================================
*/

var PopupManager = function PopupManager (widget) {
    Logger.log("PopupManager->init ");

    this.widget = widget;
    var templateId = this.widget.options.templatePopupWrapper;

    this.$wrapper = Templating.renderTemplate(templateId, {});
    this.$popupContainer = this.$wrapper.find('.crt-popup-container');
    this.$underlay = this.$wrapper.find('.crt-popup-underlay');

    z$1('body').append(this.$wrapper);
    this.$underlay.click(this.onUnderlayClick.bind(this));
};

PopupManager.prototype.showPopup = function showPopup (post) {
        var this$1 = this;

    if (this.popup) {
        this.popup.hide(function () {
            this$1.popup.destroy();
            this$1.showPopup2(post);
        });
    } else {
        this.showPopup2(post);
    }

};

PopupManager.prototype.showPopup2 = function showPopup2 (post) {
        var this$1 = this;

    this.popup = new Popup(this, post, this.widget);
    this.$popupContainer.append(this.popup.$popup);

    this.$wrapper.show();

    if (this.$underlay.css('display') !== 'block') {
        this.$underlay.fadeIn();
    }
    this.popup.show();

    z$1('body').addClass('crt-popup-visible');

    this.currentPostNum = 0;
    for(var i=0;i < this.posts.length;i++)
    {
        // console.log (post.json.id +":"+this.posts[i].id);
        if (post.id === this$1.posts[i].id) {
            this$1.currentPostNum = i;
            Logger.log('Found post '+i);
            break;
        }
    }

    this.widget.track('popup:show');
};

PopupManager.prototype.setPosts = function setPosts (posts) {
    this.posts = posts;
};

PopupManager.prototype.onClose = function onClose () {
    this.hide();
};

PopupManager.prototype.onPrevious = function onPrevious () {
    this.currentPostNum-=1;
    this.currentPostNum = this.currentPostNum>=0?this.currentPostNum:this.posts.length-1; // loop back to start

    this.showPopup(this.posts[this.currentPostNum]);
};

PopupManager.prototype.onNext = function onNext () {
    this.currentPostNum+=1;
    this.currentPostNum = this.currentPostNum<this.posts.length?this.currentPostNum:0; // loop back to start

    this.showPopup(this.posts[this.currentPostNum]);
};

PopupManager.prototype.onUnderlayClick = function onUnderlayClick (e) {
    Logger.log('PopupManager->onUnderlayClick');
    e.preventDefault();

    if (this.popup) {
        this.popup.hide(function () {
            this.hide();
        }.bind(this));
    }
};

PopupManager.prototype.hide = function hide () {
        var this$1 = this;

    Logger.log('PopupManager->hide');
    this.widget.track('popup:hide');
    z$1('body').removeClass('crt-popup-visible');
    this.currentPostNum = 0;
    this.popup = null;
    this.$underlay.fadeOut(function () {
        this$1.$underlay.css({'display':'','opacity':''});
        this$1.$wrapper.hide();
    });
};
    
PopupManager.prototype.destroy = function destroy () {

    this.$underlay.remove();

    delete this.$popup;
    delete this.$underlay;
};

var Widget = (function (EventBus$$1) {
    function Widget () {
        Logger.log('Widget->construct');

        EventBus$$1.call (this);

        this.id = CommonUtils.uId ();
    }

    if ( EventBus$$1 ) Widget.__proto__ = EventBus$$1;
    Widget.prototype = Object.create( EventBus$$1 && EventBus$$1.prototype );
    Widget.prototype.constructor = Widget;

    Widget.prototype.init = function init (options, defaults) {
        var this$1 = this;


        this.options = z$1.extend(true,{}, defaults, options);

        if (!HtmlUtils.checkContainer(this.options.container)) {
            return false;
        }

        this.$container = z$1(this.options.container);
        this.$container.addClass('crt-feed');
        this.$container.addClass('crt-feed-container');

        if (HtmlUtils.isTouch()) {
            this.$container.addClass('crt-touch');
        } else {
            this.$container.addClass('crt-no-touch');
        }

        // get inline options
        var inlineOptions = [
            'lang',
            'debug'
        ];
        for (var i = 0, list = inlineOptions; i < list.length; i += 1) {
            var option = list[i];

            var val = this$1.$container.data('crt-'+option);
            if (val) {
                this$1.options[option] = val;
            }
        }

        if (this.options.debug) {
            Logger.debug = true;
        }

        this.updateResponsiveOptions ();

        Logger.log ('Setting language to: '+this.options.lang);
        mod.setLang(this.options.lang);

        this.createFeed();
        this.createFilter();
        this.createPopupManager();

        return true;
    };

    Widget.prototype.updateResponsiveOptions = function updateResponsiveOptions () {
        // console.log('updateResponsiveOptions');
        if (!this.options.responsive) {
            this.responsiveOptions = z$1.extend(true, {}, this.options);
            return;
        }

        var width = z$1(window).width();
        var keys = Object.keys(this.options.responsive);
        keys = keys.map(function (x) { return parseInt(x); });
        keys = keys.sort(function (a, b) {
            return a - b;
        });
        keys = keys.reverse();

        var foundKey = null;
        for (var i = 0, list = keys; i < list.length; i += 1) {
            var key = list[i];

            if (width <= key) {
                foundKey = key;
            }
        }
        if (!foundKey) {
            this.responsiveKey = null;
            this.responsiveOptions = z$1.extend(true, {}, this.options);
        }

        if (this.responsiveKey !== foundKey) {
            // console.log('CHANGING RESPONSIVE SETTINGS '+foundKey);
            this.responsiveKey = foundKey;
            this.responsiveOptions = z$1.extend(true, {}, this.options, this.options.responsive[foundKey]);
        }
    };

    Widget.prototype.createFeed = function createFeed () {
        this.feed = new Feed (this);
        this.feed.on(Events.POSTS_LOADED, this.onPostsLoaded.bind(this));
        this.feed.on(Events.POSTS_FAILED, this.onPostsFail.bind(this));
        this.feed.on(Events.FEED_LOADED, this.onFeedLoaded.bind(this));
    };

    Widget.prototype.createPopupManager = function createPopupManager () {
        this.popupManager = new PopupManager(this);
    };

    Widget.prototype.createFilter = function createFilter () {
        Logger.log('Widget->createFilter');
        Logger.log(this.options.filter);

        if (this.options.filter && (this.options.filter.showNetworks || this.options.filter.showSources)) {

            this.filter = new Filter(this);
        }
    };

    Widget.prototype.loadPosts = function loadPosts (page) {
        this.feed.loadPosts(page);
    };

    Widget.prototype.createPostElements = function createPostElements (posts)
    {
        var that = this;
        var postElements = [];
        z$1(posts).each(function(){
            var p = that.createPostElement(this);
            postElements.push(p.$el);
        });
        return postElements;
    };

    Widget.prototype.createPostElement = function createPostElement (postJson) {
        var post = new Post(postJson, this.options, this);
        post.on(Events.POST_CLICK,this.onPostClick.bind(this));
        post.on(Events.POST_CLICK_READ_MORE,this.onPostClickReadMore.bind(this));
        post.on(Events.POST_IMAGE_LOADED, this.onPostImageLoaded.bind(this));

        this.trigger(Events.POST_CREATED, post);

        return post;
    };

    Widget.prototype.onPostsLoaded = function onPostsLoaded (event, posts) {
        Logger.log('Widget->onPostsLoaded');
        Logger.log(event);
        Logger.log(posts);
    };

    Widget.prototype.onPostsFail = function onPostsFail (event, data) {
        Logger.log('Widget->onPostsLoadedFail');
        Logger.log(event);
        Logger.log(data);
    };

    Widget.prototype.onPostClick = function onPostClick (ev, post) {
        Logger.log('Widget->onPostClick');
        Logger.log(ev);
        Logger.log(post);

        this.trigger(Events.POST_CLICK, post);

        if (this.options.postClickAction === Globals.POST_CLICK_ACTION_OPEN_POPUP) {
            this.popupManager.showPopup(post.json);
        } else if (this.options.postClickAction === Globals.POST_CLICK_ACTION_GOTO_SOURCE) {
            window.open(post.json.url);
        }
    };

    Widget.prototype.onPostClickReadMore = function onPostClickReadMore (ev, post) {
        Logger.log('Widget->onPostClickReadMore');
        Logger.log(ev);
        Logger.log(post);

        this.trigger(Events.POST_CLICK_READ_MORE, post);

        if (this.options.postClickReadMoreAction === Globals.POST_CLICK_ACTION_OPEN_POPUP) {
            this.popupManager.showPopup(post.json);
        } else if (this.options.postClickAction === Globals.POST_CLICK_ACTION_GOTO_SOURCE) {
            window.open(post.json.url);
        }
    };

    Widget.prototype.onPostImageLoaded = function onPostImageLoaded (ev, post) {
        // Logger.log('Widget->onPostImageLoaded');
        // Logger.log(event);
        // Logger.log(post);
    };

    Widget.prototype.onFeedLoaded = function onFeedLoaded (ev, response) {
        if (this.options.hidePoweredBy && response.account.plan.unbranded === 1) {
            //<a href="http://curator.io" target="_blank" class="crt-logo crt-tag">Powered by Curator.io</a>
            this.$container.addClass('crt-feed-unbranded');
        } else {
            this.$container.addClass('crt-feed-branded');
        }
    };

    Widget.prototype.track = function track (a) {
        Logger.log('Feed->track '+a);

        ajax.get (
            this.getUrl('/track/'+this.options.feedId),
            {a:a},
            function (data) {
                Logger.log('Feed->track success');
                Logger.log(data);
            },
            function (jqXHR, textStatus, errorThrown) {
                Logger.log('Feed->_loadPosts fail');
                Logger.log(textStatus);
                Logger.log(errorThrown);
            }
        );
    };

    Widget.prototype.getUrl = function getUrl (trail) {
        return this.options.apiEndpoint+trail;
    };

    Widget.prototype._t = function _t (s) {
        return mod.t (s);
    };

    Widget.prototype.destroy = function destroy () {
        Logger.log('Widget->destroy');

        EventBus$$1.prototype.destroy.call(this);

        if (this.feed) {
            this.feed.destroy();
        }
        if (this.filter) {
            this.filter.destroy();
        }
        if (this.popupManager) {
            this.popupManager.destroy();
        }
        this.$container.removeClass('crt-feed');
        this.$container.removeClass('crt-feed-unbranded');
        this.$container.removeClass('crt-feed-branded');
    };

    return Widget;
}(EventBus));

var ConfigWidgetBase = {
    apiEndpoint: 'https://api.curator.io/v1.1',
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    templatePost:'post-v2',
    templatePopup:'popup',
    templatePopupWrapper:'popup-wrapper',
    templateFilter:'filter',
    lang:'en',
    debug:false,
    postClickAction:'open-popup',     // open-popup | goto-source | nothing
    postClickReadMoreAction:'open-popup',     // open-popup | goto-source | nothing
    filter: {
        showNetworks: false,
        showSources: false,
    }
};

var ConfigWidgetWaterfall = z$1.extend({}, ConfigWidgetBase, {
    waterfall: {
        showLoadMore:true,
        continuousScroll:false,
        gridWidth:300,
        animate:true,
        animateSpeed:400
    }
});

var makeArray = function(array, results) {
    array = Array.prototype.slice.call( array );
    if ( results ) {
        results.push.apply( results, array );
        return results;
    }
    return array;
};

/**
 * Based on the awesome jQuery Grid-A-Licious(tm)
 *
 * Terms of Use - jQuery Grid-A-Licious(tm)
 * under the MIT (http://www.opensource.org/licenses/mit-license.php) License.
 *
 * Original Version Copyright 2008-2012 Andreas Pihlström (Suprb). All rights reserved.
 * (http://suprb.com/apps/gridalicious/)
 *
 */

var LayoutWaterfallSettings = {
    selector: '.item',
    width: 225,
    gutter: 20,
    animate: false,
    animationOptions: {
        speed: 200,
        duration: 300,
        effect: 'fadeInOnAppear',
        queue: true,
        complete: function () {
        }
    }
};

var LayoutWaterfall = function LayoutWaterfall(options, element) {
    Logger.log("WaterfallLayout->onPostsLoaded");
    this.element = z$1(element);
    this.id = CommonUtils.uId ();

    // let container = this;
    this.name = this._setName(5);
    this.gridArr = [];
    this.gridArrAppend = [];
    this.gridArrPrepend = [];
    this.setArr = false;
    this.setGrid = false;
    this.cols = 0;
    this.itemCount = 0;
    this.isPrepending = false;
    this.appendCount = 0;
    this.resetCount = true;
    this.ifCallback = true;
    this.box = this.element;
    this.boxWidth = this.box.width();
    this.options = z$1.extend(true, {}, LayoutWaterfallSettings, options);
    this.gridArr = makeArray(this.box.find(this.options.selector));
    this.isResizing = false;
    this.w = 0;
    this.boxArr = [];


    // this.offscreenRender = z('<div class="grid-rendered"></div>').appendTo('body');

    // build columns
    this._setCols();
    // build grid
    this._renderGrid('append');
    // add class 'gridalicious' to container
    z$1(this.box).addClass('gridalicious');

    this.createHandlers ();
};

LayoutWaterfall.prototype.createHandlers = function createHandlers () {
        var this$1 = this;

    Logger.log("WaterfallLayout->createHandlers");
    z$1(window).on('resize.'+this.id, CommonUtils.debounce( function () {
        this$1.resize();
    }, 100));
};

LayoutWaterfall.prototype.destroyHandlers = function destroyHandlers () {
    Logger.log("WaterfallLayout->destroyHandlers");
    z$1(window).off('resize.'+this.id);
};

LayoutWaterfall.prototype._setName = function _setName (length, current) {
    current = current ? current : '';
    return length ? this._setName(--length, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 60)) + current) : current;
};

LayoutWaterfall.prototype._setCols = function _setCols () {
        var this$1 = this;

    // calculate columns
    this.cols = Math.floor(this.box.width() / this.options.width);
    //If Cols lower than 1, the grid disappears
    if (this.cols < 1) {
        this.cols = 1;
    }
    var diff = (this.box.width() - (this.cols * this.options.width) - this.options.gutter) / this.cols;
    var w = (this.options.width + diff) / this.box.width() * 100;
    this.w = w;
    this.colHeights = new Array(this.cols);
    this.colHeights.fill(0);
    this.colItems = new Array(this.cols);
    this.colItems.fill([]);

    // add columns to box
    for (var i = 0; i < this.cols; i++) {
        var div = z$1('<div></div>').addClass('galcolumn').attr('id', 'item' + i + this$1.name).css({
            'width': w + '%',
            'paddingLeft': this$1.options.gutter,
            'paddingBottom': this$1.options.gutter,
            'float': 'left',
            '-webkit-box-sizing': 'border-box',
            '-moz-box-sizing': 'border-box',
            '-o-box-sizing': 'border-box',
            'box-sizing': 'border-box'
        });
        this$1.box.append(div);
    }
};

LayoutWaterfall.prototype._renderGrid = function _renderGrid (method, arr, count) {
        var this$1 = this;

    var items = [];
    var boxes = [];
    // let prependArray = prepArray || [];
    var appendCount = this.appendCount;
    // let gutter = this.options.gutter;
    var cols = this.cols;
    var name = this.name;
    // let i = 0;
    // let w = z('.galcolumn').width();

    // if arr
    if (arr) {
        boxes = arr;
        // if append
        if (method === "append") {
            // get total of items to append
            appendCount += count;
            // set itemCount to last count of appened items
            
        }
        // if prepend
        if (method === "prepend") {
            // set itemCount
            this.isPrepending = true;
            
        }
        // called by _updateAfterPrepend()
        if (method === "renderAfterPrepend") {
            // get total of items that was previously prepended
            appendCount += count;
            // set itemCount by counting previous prepended items
            
        }
    }
    else {
        boxes = this.gridArr;
        appendCount = z$1(this.gridArr).length;
    }

    // push out the items to the columns
    for (var i$1 = 0, list = boxes; i$1 < list.length; i$1 += 1) {
        var item = list[i$1];

            if (item.hasClass('not-responsive')) {
            
        }

        item.css({
            'zoom': '1',
            'filter': 'alpha(opacity=0)',
            'opacity': '0'
        });

        // find shortest col
        var shortestCol = 0;
        for (var i = 1; i < this.colHeights.length; i++) {
            if (this$1.colHeights[i] < this$1.colHeights[shortestCol]) {
                shortestCol = i;
            }
        }

        // prepend or append to shortest column
        if (method === 'prepend') {
            z$1("#item" + shortestCol + name).prepend(item);
            items.push(item);

        } else {
            z$1("#item" + shortestCol + name).append(item);
            items.push(item);
            if (appendCount >= cols) {
                appendCount = (appendCount - cols);
            }
        }

        // update col heights
        this$1.colItems[shortestCol].push(item);
        this$1.colHeights[shortestCol] += item.height();
    }

    this.appendCount = appendCount;

    if (method === "append" || method === "prepend") {
        if (method === "prepend") {
            // render old items and reverse the new items
            this._updateAfterPrepend(this.gridArr, boxes);
        }
        this._renderItem(items);
        this.isPrepending = false;
    } else {
        this._renderItem(this.gridArr);
    }
};

LayoutWaterfall.prototype._collectItems = function _collectItems () {
    var collection = [];
    z$1(this.box).find(this.options.selector).each(function () {
        collection.push(z$1(this));
    });
    return collection;
};

LayoutWaterfall.prototype._renderItem = function _renderItem (items) {

    var speed = this.options.animationOptions.speed;
    var effect = this.options.animationOptions.effect;
    var duration = this.options.animationOptions.duration;
    var queue = this.options.animationOptions.queue;
    var animate = this.options.animate;
    var complete = this.options.animationOptions.complete;

    var i = 0;
    var t = 0;

    // animate
    if (animate === true && !this.isResizing) {

        // fadeInOnAppear
        if (queue === true && effect === "fadeInOnAppear") {
            if (this.isPrepending) { items.reverse(); }
            z$1.each(items, function (index, value) {
                window.setTimeout(function () {
                    z$1(value).animate({
                        opacity: '1.0'
                    }, duration);
                    t++;
                    if (t === items.length) {
                        complete.call(undefined, items);
                    }
                }, i * speed);
                i++;
            });
        } else if (queue === false && effect === "fadeInOnAppear") {
            if (this.isPrepending) { items.reverse(); }
            z$1.each(items, function (index, value) {
                z$1(value).animate({
                    opacity: '1.0'
                }, duration);
                t++;
                if (t === items.length) {
                    if (this.ifCallback) {
                        complete.call(undefined, items);
                    }
                }
            });
        }

        // no effect but queued
        if (queue === true && !effect) {
            z$1.each(items, function (index, value) {
                z$1(value).css({
                    'opacity': '1',
                    'filter': 'alpha(opacity=100)'
                });
                t++;
                if (t === items.length) {
                    if (this.ifCallback) {
                        complete.call(undefined, items);
                    }
                }
            });
        }

        // don not animate & no queue
    } else {
        z$1.each(items, function (index, value) {
            z$1(value).css({
                'opacity': '1',
                'filter': 'alpha(opacity=100)'
            });
        });
        if (this.ifCallback) {
            complete.call(items);
        }
    }
};

LayoutWaterfall.prototype._updateAfterPrepend = function _updateAfterPrepend (prevItems, newItems) {
    var gridArr = this.gridArr;
    // add new items to gridArr
    z$1.each(newItems, function (index, value) {
        gridArr.unshift(value);
    });
    this.gridArr = gridArr;
};

LayoutWaterfall.prototype.resize = function resize () {
    if (this.box.width() === this.boxWidth) {
        return;
    }

    var newCols = Math.floor(this.box.width() / this.options.width);
    if (this.cols === newCols) {
        // nothings changed yet
        return;
    }

    // delete columns in box
    this.box.find(z$1('.galcolumn')).remove();
    // build columns
    this._setCols();
    // build grid
    this.ifCallback = false;
    this.isResizing = true;
    this._renderGrid('append');
    this.ifCallback = true;
    this.isResizing = false;
    this.boxWidth = this.box.width();
};

LayoutWaterfall.prototype.append = function append (items) {
    var gridArr = this.gridArr;
    var gridArrAppend = this.gridArrPrepend;
    z$1.each(items, function (index, value) {
        gridArr.push(value);
        gridArrAppend.push(value);
    });
    this._renderGrid('append', items, z$1(items).length);
};

LayoutWaterfall.prototype.prepend = function prepend (items) {
    this.ifCallback = false;
    this._renderGrid('prepend', items, z$1(items).length);
    this.ifCallback = true;
};

LayoutWaterfall.prototype.destroy = function destroy () {
    this.destroyHandlers ();
};

var Waterfall = (function (Widget$$1) {
    function Waterfall (options) {
        var this$1 = this;

        Widget$$1.call (this);

        if (this.init (options,  ConfigWidgetWaterfall)) {
            Logger.log("Waterfall->init with options:");
            Logger.log(this.options);

            this.$scroll = z$1('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
            this.$feed = z$1('<div class="crt-feed"></div>').appendTo(this.$scroll);
            this.$container.addClass('crt-widget-waterfall');

            if (this.options.continuousScroll) {
                z$1(this.$scroll).scroll(function () {
                    var height = this$1.$scroll.height();
                    var cHeight = this$1.$feed.height();
                    var scrollTop = this$1.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        this$1.loadMorePosts();
                    }
                });
            }

            if (this.options.waterfall.showLoadMore) {
                // default to more
                this.$more = z$1('<div class="crt-load-more"><a href="#"><span>' + this._t('load-more') + '</span></a></div>')
                    .appendTo(this.$scroll);
                this.$more.find('a').on('click', function (ev) {
                    ev.preventDefault();
                    this$1.loadMorePosts();
                });
            }

            this.ui = new LayoutWaterfall({
                selector:'.crt-post-c',
                gutter:0,
                width:this.options.waterfall.gridWidth,
                animate:this.options.waterfall.animate,
                animationOptions: {
                    speed: (this.options.waterfall.animateSpeed/2),
                    duration: this.options.waterfall.animateSpeed
                }
            },this.$feed);

            this.on(Events.FILTER_CHANGED, function () {
                this$1.$feed.find('.crt-post').remove();
            });

            // Load first set of posts
            this.feed.load();

            this.iniListeners();
        }
    }

    if ( Widget$$1 ) Waterfall.__proto__ = Widget$$1;
    Waterfall.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
    Waterfall.prototype.constructor = Waterfall;

    Waterfall.prototype.iniListeners = function iniListeners () {

    };

    Waterfall.prototype.destroyListeners = function destroyListeners () {

    };

    Waterfall.prototype.loadMorePosts = function loadMorePosts () {
        Logger.log('Waterfall->loadMorePosts');

        this.feed.loadAfter();
    };


    Waterfall.prototype.loadPage = function loadPage (page) {
        Logger.log('Waterfall->loadPage');

        this.$feed.find('.crt-post').remove();

        this.feed.loadPosts(page);
    };

    Waterfall.prototype.onPostsLoaded = function onPostsLoaded (event, posts) {
        Logger.log("Waterfall->onPostsLoaded");

        var postElements = this.createPostElements (posts);

        //this.$feed.append(postElements);
        this.ui.append(postElements);

        var that = this;
        z$1.each(postElements,function () {
            var post = this;
            if (that.options.waterfall.showReadMore) {
                post.find('.crt-post')
                    .addClass('crt-post-show-read-more');
            }
        });

        if (this.options.waterfall.showLoadMore) {
            if (this.feed.allPostsLoaded) {
                this.$more.hide();
            } else {
                this.$more.show();
            }
        }

        this.popupManager.setPosts(posts);

        this.loading = false;

        this.trigger(Events.POSTS_RENDERED, this);
    };

    Waterfall.prototype.destroy = function destroy () {
        Logger.log('Waterfall->destroy');

        Widget$$1.prototype.destroy.call(this);

        this.feed.destroy();

        this.ui.destroy ();

        this.$feed.remove();
        this.$scroll.remove();
        if (this.$more) {
            this.$more.remove();
        }
        this.$container.removeClass('crt-feed-container')
            .removeClass('crt-widget-waterfall');

        this.destroyListeners();

        delete this.$feed;
        delete this.$scroll;
        delete this.$container;
        delete this.options ;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    };

    return Waterfall;
}(Widget));

var ConfigWidgetList = z$1.extend({}, ConfigWidgetBase, {
    templatePost:'list-post',
    templateFeed:'list-feed',
    animate:false,
    list: {
        showLoadMore:true,
    }
});

var List = (function (Widget$$1) {
    function List  (options) {
        Widget$$1.call (this);

        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];
        //
        // if ('scrollRestoration' in window.history) {
        //     window.history.scrollRestoration = 'manual';
        // }

        if (this.init (options,  ConfigWidgetList)) {
            Logger.log("List->init with options:");
            Logger.log(this.options);

            var tmpl = Templating.renderTemplate(this.responsiveOptions.templateFeed, {});
            this.$container.append(tmpl);
            this.$feed = this.$container.find('.crt-feed');
            this.$feedWindow = this.$container.find('.crt-feed-window');
            this.$loadMore = this.$container.find('.crt-load-more a');
            this.$scroller = z$1(window);

            this.$container.addClass('crt-list');
            this.$container.addClass('crt-widget-list');

            if (this.responsiveOptions.list.showLoadMore) {
                this.$feedWindow.css({
                    'position':'relative'
                });
                this.$loadMore.click(this.onMoreClicked.bind(this));
            } else {
                this.$loadMore.hide();
            }

            this.createHandlers();

            // This triggers post loading
            this.feed.load();
        }
    }

    if ( Widget$$1 ) List.__proto__ = Widget$$1;
    List.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
    List.prototype.constructor = List;

    List.prototype.createHandlers = function createHandlers () {
        var this$1 = this;

        var id = this.id;
        var updateLayoutDebounced = CommonUtils.debounce( function () {
            this$1.updateLayout ();
        }, 100);

        z$1(window).on('resize.'+id, CommonUtils.debounce(function () {
            this$1.updateResponsiveOptions ();
            this$1.updateLayout ();
        }, 100));

        z$1(window).on('curatorCssLoaded.'+id, updateLayoutDebounced);

        z$1(document).on('ready.'+id, updateLayoutDebounced);

        if (this.responsiveOptions.list.continuousScroll) {
            z$1(window).on('scroll.'+id, CommonUtils.debounce(function () {
                this$1.checkScroll();
            }, 100));
        }

        this.on(Events.FILTER_CHANGED, function () {
            this$1.$feed.find('.crt-list-post').remove();
        });
    };

    List.prototype.destroyHandlers = function destroyHandlers () {
        var id = this.id;

        z$1(window).off('resize.'+id);

        z$1(window).off('curatorCssLoaded.'+id);

        z$1(document).off('ready.'+id);

        z$1(window).off('scroll.'+id);
    };

    List.prototype.loadPosts = function loadPosts () {
        // console.log ('LOAD POSTS CALLED!!!?!?!!?!?!');
    };

    List.prototype.updateLayout = function updateLayout ( ) {
        // Logger.log("List->updateLayout ");
        var cols = Math.floor(this.$container.width()/this.responsiveOptions.list.minWidth);
        cols = cols < 1 ? 1 : cols;

        // set col layout
        this.$container.removeClass('crt-list-col'+this.columnCount);
        this.columnCount = cols;
        this.$container.addClass('crt-list-col'+this.columnCount);

        // figure out if we need more posts
        var postsNeeded = cols *  (this.rowsMax + 1);
        // console.log ('postNeeded '+postsNeeded);
        // console.log ('this.feed.postsLoaded '+this.feed.postsLoaded);
        if (postsNeeded > this.feed.postsLoaded && !this.feed.allPostsLoaded) {
            var limit = postsNeeded - this.feed.postsLoaded;

            var params = {
                limit : limit
            };

            this.feed.loadMorePaginated(params);
        } else {
            this.updateHeight(false);
        }
    };

    List.prototype.updateHeight = function updateHeight (animate) {
        var $post = this.$container.find('.crt-post-c').first();
        var postHeight = $post.width();
        var postMargin = parseInt($post.css("margin-left"));
        postHeight += postMargin;

        this.$feedWindow.css({'overflow':'hidden'});

        var maxRows = Math.ceil(this.feed.postCount / this.columnCount);
        var rows = this.rowsMax < maxRows ? this.rowsMax : maxRows;

        // if (animate) {
        //     this.$feedWindow.animate({height:rows * postHeight});
        // } else {
        var scrollTopOrig = this.$scroller.scrollTop();
        // }

        this.$feedWindow.height(rows * postHeight);
        var scrollTopNew = this.$scroller.scrollTop();
        // console.log(scrollTopOrig+":"+scrollTopNew);

        if (scrollTopNew > scrollTopOrig+100) {
            // chrome seems to lock scroll position relative to bottom - so scrollTop changes when we adjust height
            // - let's reset
            this.$scroller.scrollTop(scrollTopOrig);
        }
        if (this.responsiveOptions.list.showLoadMore) {
            var postsVisible = this.columnCount * rows;
            if (this.feed.allPostsLoaded && postsVisible >= this.feed.posts.length) {
                this.$loadMore.hide();
            } else {
                this.$loadMore.show();
            }
        }
    };

    List.prototype.checkScroll = function checkScroll () {
        Logger.log("List->checkScroll");
        // console.log('scroll');
        var top = this.$container.offset().top;
        var feedBottom = top+this.$feedWindow.height();
        var scrollTop = this.$scroller.scrollTop();
        var windowBottom = scrollTop+z$1(window).height();
        var diff = windowBottom - feedBottom;

        if (diff > this.responsiveOptions.list.continuousScrollOffset) {
            if (!this.feed.loading && !this.feed.allPostsLoaded) {
                this.rowsMax += this.responsiveOptions.list.rowsToAdd;
                this.updateLayout();
            }
        }
    };

    List.prototype.onPostsLoaded = function onPostsLoaded (event, posts) {
        var this$1 = this;

        Logger.log("List->onPostsLoaded");

        this.loading = false;

        if (posts.length !== 0) {
            this.postElements = [];
            var i = 0;

            var anim = function (post) {
                window.setTimeout (function () {
                    post.$el.css({opacity: 0}).animate({opacity: 1});
                }, i * 100);
            };

            for (var i$1 = 0, list = posts; i$1 < list.length; i$1 += 1) {
                var postJson = list[i$1];

                var post = this$1.createPostElement(postJson);
                this$1.postElements.push(post);
                this$1.$feed.append(post.$el);
                post.layout();

                if (this$1.responsiveOptions.animate) {
                    post.$el.css({opacity: 0});
                    anim (post, i);
                    i++;
                }
            }

            this.popupManager.setPosts(posts);

            if (this.responsiveOptions.list.showLoadMore) {
                if (this.feed.allPostsLoaded) {
                    this.$loadMore.hide();
                } else {
                    this.$loadMore.show();
                }
            } else {
                this.$loadMore.hide();
            }
        }
    };

    List.prototype.onMoreClicked = function onMoreClicked (ev) {
        ev.preventDefault();

        this.feed.loadMorePaginated();
    };

    List.prototype.destroy = function destroy () {
        Widget$$1.prototype.destroy.call(this);

        this.feed.destroy();

        this.destroyHandlers();

        this.$container.empty()
            .removeClass('crt-list')
            .removeClass('crt-widget-list')
            .removeClass('crt-list-col'+this.columnCount)
            .css({'height':'','overflow':''});

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.loading;

        // TODO add code to cascade destroy down to Posts
        // unregistering events etc
        delete this.feed;
    };

    return List;
}(Widget));

var ConfigWidgetGrid$1 = z$1.extend({}, ConfigWidgetBase, {
    templatePost:'grid-post-v2',
    templateFeed:'grid-feed-v2',
    animate:false,
    grid: {
        minWidth:200,
        rows:3,
        showLoadMore:false,
        rowsToAdd:1,
        continuousScroll:false,
        continuousScrollOffset:50,
        hover:{
            showName:true,
            showFooter:true,
            showText:true,
        }
    }
});

var Grid = (function (Widget$$1) {
    function Grid  (options) {
        Widget$$1.call (this);

        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];
        this.columnCount=0;
        this.rowsMax = 0;
        this.totalPostsLoaded=0;
        this.allLoaded=false;
        //
        // if ('scrollRestoration' in window.history) {
        //     window.history.scrollRestoration = 'manual';
        // }

        if (this.init (options,  ConfigWidgetGrid$1)) {
            Logger.log("Grid->init with options:");
            Logger.log(this.options);

            var tmpl = Templating.renderTemplate(this.responsiveOptions.templateFeed, {});
            this.$container.append(tmpl);
            this.$feed = this.$container.find('.crt-feed');
            this.$feedWindow = this.$container.find('.crt-feed-window');
            this.$loadMore = this.$container.find('.crt-load-more a');
            this.$scroller = z$1(window);

            this.$container.addClass('crt-grid');
            this.$container.addClass('crt-widget-grid');

            if (this.responsiveOptions.grid.showLoadMore) {
                this.$feedWindow.css({
                    'position':'relative'
                });
                this.$loadMore.click(this.onMoreClicked.bind(this));
            } else {
                this.$loadMore.hide();
            }

            if (!this.responsiveOptions.grid.hover.showName) {
                this.$container.addClass('crt-grid-hide-name');
            }

            if (!this.responsiveOptions.grid.hover.showFooter) {
                this.$container.addClass('crt-grid-hide-footer');
            }

            if (!this.responsiveOptions.grid.hover.showText) {
                this.$container.addClass('crt-grid-hide-text');
            }

            this.createHandlers();

            // This triggers post loading
            this.rowsMax = this.responsiveOptions.grid.rows;
            this.updateLayout ();
        }
    }

    if ( Widget$$1 ) Grid.__proto__ = Widget$$1;
    Grid.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
    Grid.prototype.constructor = Grid;

    Grid.prototype.createHandlers = function createHandlers () {
        var this$1 = this;

        var id = this.id;
        var updateLayoutDebounced = CommonUtils.debounce( function () {
            this$1.updateLayout ();
        }, 100);

        z$1(window).on('resize.'+id, CommonUtils.debounce(function () {
            this$1.updateResponsiveOptions ();
            this$1.updateLayout ();
        }, 100));

        z$1(window).on('curatorCssLoaded.'+id, updateLayoutDebounced);

        z$1(document).on('ready.'+id, updateLayoutDebounced);

        if (this.responsiveOptions.grid.continuousScroll) {
            z$1(window).on('scroll.'+id, CommonUtils.debounce(function () {
                this$1.checkScroll();
            }, 100));
        }

        this.on(Events.FILTER_CHANGED, function () {
            this$1.$feed.find('.crt-grid-post').remove();
        });
    };

    Grid.prototype.destroyHandlers = function destroyHandlers () {
        var id = this.id;

        z$1(window).off('resize.'+id);

        z$1(window).off('curatorCssLoaded.'+id);

        z$1(document).off('ready.'+id);

        z$1(window).off('scroll.'+id);
    };

    Grid.prototype.loadPosts = function loadPosts () {
        // console.log ('LOAD POSTS CALLED!!!?!?!!?!?!');
    };

    Grid.prototype.updateLayout = function updateLayout ( ) {
        // Logger.log("Grid->updateLayout ");
        var cols = Math.floor(this.$container.width()/this.responsiveOptions.grid.minWidth);
        cols = cols < 1 ? 1 : cols;

        // set col layout
        this.$container.removeClass('crt-grid-col'+this.columnCount);
        this.columnCount = cols;
        this.$container.addClass('crt-grid-col'+this.columnCount);

        // figure out if we need more posts
        var postsNeeded = cols *  (this.rowsMax + 1);
        // console.log ('postNeeded '+postsNeeded);
        // console.log ('this.feed.postsLoaded '+this.feed.postsLoaded);
        if (postsNeeded > this.feed.postsLoaded && !this.feed.allPostsLoaded) {
            var limit = postsNeeded - this.feed.postsLoaded;

            var params = {
                limit : limit
            };

            this.feed.loadMorePaginated(params);
        } else {
            this.updateHeight(false);
        }
    };

    Grid.prototype.updateHeight = function updateHeight (animate) {
        var $post = this.$container.find('.crt-grid-post').first();
        var postHeight = $post.height();
        var postMarginBottom = parseInt($post.css("margin-bottom"));
        // let postMarginTop = parseInt($post.css("margin-top"));
        // let postPaddingBottom = parseInt($post.css("padding-bottom"));
        // let postPaddingTop = parseInt($post.css("padding-top"));

        postHeight += postMarginBottom;

        this.$feedWindow.css({'overflow':'hidden'});

        var maxRows = Math.ceil(this.feed.postCount / this.columnCount);
        var rows = this.rowsMax < maxRows ? this.rowsMax : maxRows;

        // if (animate) {
        //     this.$feedWindow.animate({height:rows * postHeight});
        // } else {
        var scrollTopOrig = this.$scroller.scrollTop();
        // }

        this.$feedWindow.height(rows * postHeight);
        var scrollTopNew = this.$scroller.scrollTop();
        // console.log(scrollTopOrig+":"+scrollTopNew);

        if (scrollTopNew > scrollTopOrig+100) {
            // chrome seems to lock scroll position relative to bottom - so scrollTop changes when we adjust height
            // - let's reset
            this.$scroller.scrollTop(scrollTopOrig);
        }
        if (this.responsiveOptions.grid.showLoadMore) {
            var postsVisible = this.columnCount * rows;
            if (this.feed.allPostsLoaded && postsVisible >= this.feed.posts.length) {
                this.$loadMore.hide();
            } else {
                this.$loadMore.show();
            }
        }
    };

    Grid.prototype.checkScroll = function checkScroll () {
        Logger.log("Grid->checkScroll");
        // console.log('scroll');
        var top = this.$container.offset().top;
        var feedBottom = top+this.$feedWindow.height();
        var scrollTop = this.$scroller.scrollTop();
        var windowBottom = scrollTop+z$1(window).height();
        var diff = windowBottom - feedBottom;

        if (diff > this.responsiveOptions.grid.continuousScrollOffset) {
            if (!this.feed.loading && !this.feed.allPostsLoaded) {
                this.rowsMax += this.responsiveOptions.grid.rowsToAdd;
                this.updateLayout();
            }
        }
    };

    Grid.prototype.onPostsLoaded = function onPostsLoaded (event, posts) {
        var this$1 = this;

        Logger.log("Grid->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            this.postElements = [];
            var i = 0;

            var anim = function (post) {
                window.setTimeout (function () {
                    post.$el.css({opacity: 0}).animate({opacity: 1});
                }, i * 100);
            };

            for (var i$1 = 0, list = posts; i$1 < list.length; i$1 += 1) {
                var postJson = list[i$1];

                var post = this$1.createPostElement(postJson);
                this$1.postElements.push(post);
                this$1.$feed.append(post.$el);
                post.layout();

                if (this$1.responsiveOptions.animate) {
                    post.$el.css({opacity: 0});
                    anim (post, i);
                    i++;
                }
            }

            this.popupManager.setPosts(posts);

            window.setTimeout(function () {
                this$1.updateHeight(true);
            },10);
        }
    };

    Grid.prototype.onMoreClicked = function onMoreClicked (ev) {
        ev.preventDefault();

        var rowsToAdd = 1;

        if (this.columnCount <= 1) {
            rowsToAdd = 4;
        } else if (this.columnCount === 2) {
            rowsToAdd = 2;
        }

        this.rowsMax += rowsToAdd;

        this.updateLayout();
    };

    Grid.prototype.destroy = function destroy () {
        Widget$$1.prototype.destroy.call(this);

        this.feed.destroy();

        this.destroyHandlers();

        this.$container.empty()
            .removeClass('crt-widget-grid')
            .removeClass('crt-grid')
            .removeClass('crt-grid-col'+this.columnCount)
            .css({'height':'','overflow':''});

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Posts
        // unregistering events etc
        delete this.feed;
    };

    return Grid;
}(Widget));

var LayoutCarouselSettings = {
    infinite: false,
	speed: 5000,
	duration: 700,
	minWidth: 250,
	panesVisible: null,
	moveAmount: 0,
	autoPlay: false,
	useCss : true
};

if (z$1.zepto) {
    LayoutCarouselSettings.easing = 'ease-in-out';
}

var LayoutCarousel = (function (EventBus$$1) {
	function LayoutCarousel (container, options) {
		Logger.log('LayoutCarousel->construct');

        EventBus$$1.call (this);

        this.id = CommonUtils.uId ();
		this.current_position=0;
		this.animating=false;
		this.timeout=null;
		this.FAKE_NUM=0;
		this.PANES_VISIBLE=0;

		this.options = z$1.extend({}, LayoutCarouselSettings, options);

		// Validate options
        if (!this.options.minWidth || this.options.minWidth < 100) {
            this.options.minWidth = LayoutCarouselSettings.minWidth;
		}

		this.$viewport = z$1(container); // <div> slider, known as $viewport

		this.$panes = this.$viewport.children();
		this.$panes.detach();

		this.$stage = z$1('<div class="crt-carousel-stage"></div>').appendTo(this.$viewport);
		this.$pane_slider = z$1('<div class="crt-carousel-slider"></div>').appendTo(this.$stage);

		if (this.options.matchHeights) {
            this.$stage.addClass('crt-match-heights');
        }

		this.addControls();
		this.createHandlers();
        this.update ();
	}

	if ( EventBus$$1 ) LayoutCarousel.__proto__ = EventBus$$1;
	LayoutCarousel.prototype = Object.create( EventBus$$1 && EventBus$$1.prototype );
	LayoutCarousel.prototype.constructor = LayoutCarousel;

    LayoutCarousel.prototype.createHandlers = function createHandlers () {
        var this$1 = this;

        z$1(window).on('resize.'+this.id, CommonUtils.debounce( function () {
            this$1.updateLayout ();
        }, 100));
    };

    LayoutCarousel.prototype.destroyHandlers = function destroyHandlers () {

        z$1(window).off('resize.'+this.id);
        // z(window).off('curatorCssLoaded.'+id);
        // z(document).off('ready.'+id);
    };

	LayoutCarousel.prototype.update = function update () {
        Logger.log('LayoutCarousel->update ');
		this.$panes = this.$pane_slider.children(); // <li> list items, known as $panes
		this.NUM_PANES = this.$panes.length;

		if (this.NUM_PANES > 0) {
			this.resize();
			this.move (this.current_position, true);

			if (!this.animating) {
				if (this.options.autoPlay) {
					this.animate();
				}
			}
		}
	};

	LayoutCarousel.prototype.add = function add ($els) {
        Logger.log('LayoutCarousel->add '+$els.length);

		this.$pane_slider.append($els);
		this.$panes = this.$pane_slider.children();
	};

	LayoutCarousel.prototype.resize = function resize () {
		var this$1 = this;

		var PANE_WRAPPER_WIDTH = this.options.infinite ? ((this.NUM_PANES+1) * 100) + '%' : (this.NUM_PANES * 100) + '%'; // % width of slider (total panes * 100)

		this.$pane_slider.css({width: PANE_WRAPPER_WIDTH}); // set css on pane slider

		this.VIEWPORT_WIDTH = this.$viewport.width();
        Logger.log('VIEWPORT_WIDTH = '+this.VIEWPORT_WIDTH);

		if (this.options.panesVisible) {
			// TODO - change to check if it's a function or a number
			this.PANES_VISIBLE = this.options.panesVisible();
			this.PANE_WIDTH = (this.VIEWPORT_WIDTH / this.PANES_VISIBLE);
		} else {
			this.PANES_VISIBLE = this.VIEWPORT_WIDTH < this.options.minWidth ? 1 : Math.floor(this.VIEWPORT_WIDTH / this.options.minWidth);
			this.PANE_WIDTH = (this.VIEWPORT_WIDTH / this.PANES_VISIBLE);
		}

		if (this.options.infinite) {

			this.$panes.filter('.crt-clone').remove();

			for(var i = this.NUM_PANES-1; i > this.NUM_PANES - 1 - this.PANES_VISIBLE; i--)
			{
				// console.log(i);
				var first = this$1.$panes.eq(i).clone();
				first.addClass('crt-clone');
				first.css('opacity','1');
				// Should probably move this out to an event
				first.find('.crt-post-image').css({opacity:1});
				this$1.$pane_slider.prepend(first);
				this$1.FAKE_NUM = this$1.PANES_VISIBLE;
			}
			this.$panes = this.$pane_slider.children();

		}

		this.$panes.each(function (index, pane) {
			z$1(pane).css( {width: this$1.PANE_WIDTH+'px'});
		});
	};

	LayoutCarousel.prototype.updateLayout = function updateLayout () {
        this.resize();
        this.move (this.current_position, true);

        // reset animation timer
        if (this.options.autoPlay) {
            this.animate();
        }
	};

	LayoutCarousel.prototype.animate = function animate () {
		var this$1 = this;

		this.animating = true;
		window.clearTimeout(this.timeout);
		this.timeout = window.setTimeout(function () {
			this$1.next();
		}, this.options.speed);
	};

	LayoutCarousel.prototype.next = function next () {
		var move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE;
		this.move(this.current_position + move, false);
	};

	LayoutCarousel.prototype.prev = function prev () {
		var move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE;
		this.move(this.current_position - move, false);
	};

	LayoutCarousel.prototype.move = function move (i, noAnimate) {
        Logger.log('LayoutCarousel->move '+i);
		this.current_position = i;

		var maxPos = this.NUM_PANES - this.PANES_VISIBLE;

		if (this.current_position < 0) {
			this.current_position = 0;
		} else if (this.current_position > maxPos) {
			this.current_position = maxPos;
		}

		var curIncFake = (this.FAKE_NUM + this.current_position);
		var left = curIncFake * this.PANE_WIDTH;
		var max = this.options.infinite ? (this.PANE_WIDTH * this.NUM_PANES) : (this.PANE_WIDTH * this.NUM_PANES) - this.VIEWPORT_WIDTH;

		this.currentLeft = left;

		if (left < 0) {
			this.currentLeft = 0;
		} else if (left > max) {
			this.currentLeft = max;
		} else {
			this.currentLeft = left;
		}
        var x = (0 - this.currentLeft);

        Logger.log('LayoutCarousel->move x:'+x);
		if (noAnimate) {
			this.$pane_slider.css({'transform': 'translate3d('+x+'px, 0px, 0px)'});
			this.moveComplete();
		} else {
			// let options = {
			// 	duration: this.options.duration,
			// 	complete: this.moveComplete.bind(this),
			// 	// easing:'asd'
			// };
			// if (this.options.easing) {
			// 	options.easing = this.options.easing;
			// }
            // this.$pane_slider.addClass('crt-animate-transform');
			// this.$pane_slider.animate({'transform': 'translate3d('+x+'px, 0px, 0px)'},
			// 	options
			// );
			var options = {
				duration: this.options.duration,
				complete: this.moveComplete.bind(this),
				// easing:'asd'
			};
			if (this.options.easing) {
				options.easing = this.options.easing;
			}

            if (z$1.zepto) {
                this.$pane_slider.addClass('crt-animate-transform');
                this.$pane_slider.animate({'transform': 'translate3d('+x+'px, 0px, 0px)'},
                    options
                );
            } else {
            	// Jquery doesn't animate transform
                options.step = function(now, fx) {
                    z$1(this).css('-webkit-transform','translate3d('+now+'px, 0px, 0px)');
                    z$1(this).css('-moz-transform','translate3d('+now+'px, 0px, 0px)');
                    z$1(this).css('transform','translate3d('+now+'px, 0px, 0px)');
                };

                this.$pane_slider.addClass('crt-animate-transform');
                this.$pane_slider.animate({'transformX': x},
                    options
                );
			}
		}
	};

	LayoutCarousel.prototype.moveComplete = function moveComplete () {
        var this$1 = this;

        Logger.log('LayoutCarousel->moveComplete');
		if (this.options.infinite && (this.current_position >= (this.NUM_PANES - this.PANES_VISIBLE))) {
			// infinite and we're off the end!
			// re-e-wind, the crowd says 'bo selecta!'
			this.$pane_slider.css({'transform': 'translate3d(0px, 0px, 0px)'});
			this.current_position = 0 - this.PANES_VISIBLE;
			this.currentLeft = 0;
		}
		window.setTimeout(function () {
			this$1.updateHeight();
		}, 50);

		this.trigger(Events.CAROUSEL_CHANGED, [this, this.current_position]);

		if (this.options.autoPlay) {
			this.animate();
		}
	};

	LayoutCarousel.prototype.updateHeight = function updateHeight () {
        Logger.log('LayoutCarousel->updateHeight');

        var min = this.options.infinite ? this.current_position + this.FAKE_NUM: this.current_position;
        var paneMaxHeight = this.getMaxHeight(min);

        if (this.$stage.height() !== paneMaxHeight) {
            this.$stage.animate({height: paneMaxHeight}, 300);
        }

        if (this.options.matchHeights) {
        	this.setPaneHeights (min);
        	this.setPaneHeights (min + this.PANES_VISIBLE);
        }
	};

	LayoutCarousel.prototype.setPaneHeights = function setPaneHeights (min) {
        var this$1 = this;

        Logger.log('LayoutCarousel->setPaneHeights '+min);

        var max = min + this.PANES_VISIBLE;
        var paneMaxHeight = this.getMaxHeight(min);


        if (this.options.matchHeights) {
            for (var i = min; i < max; i++) {
                var $pane = z$1(this$1.$panes[i]);
                $pane.find('.crt-post-c').height((paneMaxHeight - 2));
            }
        }
	};

	LayoutCarousel.prototype.getMaxHeight = function getMaxHeight (min) {
        var this$1 = this;

        Logger.log('LayoutCarousel->getMaxHeight '+min);
        var paneMaxHeight = 0;
        var max = min + this.PANES_VISIBLE;
        for (var i = min; i < max; i++)
        {
        	if (this$1.$panes[i]) {
                var $pane = z$1(this$1.$panes[i]);

                var h = 0;
                if ($pane.hasClass('crt-post-max-height')) {
                    h = $pane.height();
                } else {
                    var contentHeight = $pane.find('.crt-post-content').height();
                    var footerHeight = $pane.find('.crt-post-footer').height();
                    h = contentHeight + footerHeight + 2;
                }
                // Logger.log('LayoutCarousel->updateHeight i: '+i+' = '+h);
                if (h > paneMaxHeight) {
                    paneMaxHeight = h;
                }
            }
        }

        return paneMaxHeight;
	};

	LayoutCarousel.prototype.addControls = function addControls () {
		this.$viewport.append('<button type="button" data-role="none" class="crt-panel-prev crt-panel-arrow" aria-label="Previous" role="button" aria-disabled="false">Previous</button>');
		this.$viewport.append('<button type="button" data-role="none" class="crt-panel-next crt-panel-arrow" aria-label="Next" role="button" aria-disabled="false">Next</button>');

		this.$viewport.on('click','.crt-panel-prev', this.prev.bind(this));
		this.$viewport.on('click','.crt-panel-next', this.next.bind(this));
	};

    LayoutCarousel.prototype.destroy = function destroy () {
        this.destroyHandlers ();
        window.clearTimeout(this.timeout);
    };

	return LayoutCarousel;
}(EventBus));

var ConfigCarousel = z$1.extend({}, ConfigWidgetBase, {
    scroll:'more',
    carousel:{
        autoPlay:true,
        autoLoad:true,
        infinite:false,
        matchHeights:false
    },
});

var Carousel = (function (Widget$$1) {
    function Carousel (options) {
        var this$1 = this;

        Widget$$1.call (this);

        options.postsPerPage = 30;

        this.loading=false;
        this.posts=[];
        this.firstLoad=true;

        if (this.init (options,  ConfigCarousel)) {
            Logger.log("Carousel->init with options:");
            Logger.log(this.options);

            this.allLoaded = false;

            // this.$wrapper = z('<div class="crt-carousel-wrapper"></div>').appendTo(this.$container);
            this.$feed = z$1('<div class="crt-carousel-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-carousel');
            this.$container.addClass('crt-widget-carousel');

            this.carousel = new LayoutCarousel(this.$feed, this.options.carousel);
            this.carousel.on(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));

            this.on(Events.FILTER_CHANGED, function () {
                this$1.$feed.find('.crt-post').remove();
            });

            // load first set of posts
            this.loadPosts(0);
        }
    }

    if ( Widget$$1 ) Carousel.__proto__ = Widget$$1;
    Carousel.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
    Carousel.prototype.constructor = Carousel;

    Carousel.prototype.loadMorePosts = function loadMorePosts () {
        Logger.log('Carousel->loadMorePosts');

        if (this.feed.postCount > this.feed.postsLoaded) {
            this.feed.loadPosts(this.feed.currentPage + 1);
        }
    };

    Carousel.prototype.onPostsLoaded = function onPostsLoaded (event, posts) {
        Logger.log("Carousel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
             var that = this;
             var $els = [];
            z$1(posts).each(function(i){
                var p = that.createPostElement(this);
                $els.push(p.$el);

                if (that.options.animate && that.firstLoad) {
                    p.$el.css({opacity: 0});
                    window.setTimeout(function () {
                        p.$el.css({opacity: 0}).animate({opacity: 1});
                    }, i * 100);
                }
            });

            this.carousel.add($els);
            this.carousel.update();

            this.popupManager.setPosts(posts);
        }
        this.firstLoad = false;
    };

    Carousel.prototype.onCarouselChange = function onCarouselChange (event, currentSlide) {
        if (this.options && this.options.carousel.autoLoad) {
            if (currentSlide >= this.feed.postsLoaded - this.carousel.PANES_VISIBLE) {
                this.loadMorePosts();
            }
        }
    };

    Carousel.prototype.destroy = function destroy () {
        Widget$$1.prototype.destroy.call(this);

        this.feed.destroy();

        this.carousel.off(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));
        this.carousel.destroy();

        this.$feed.remove();
        this.$container.removeClass('crt-widget-carousel');
        this.$container.removeClass('crt-carousel');

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.feed.postsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    };

    return Carousel;
}(Widget));

var ConfigPanel = z$1.extend({}, ConfigWidgetBase, {
    panel: {
        // speed: 500,
        autoPlay: true,
        autoLoad: true,
        moveAmount:1,
        fixedHeight:false,
        infinite:true,
        minWidth:2000
    }
});

var Panel = (function (Widget$$1) {
    function Panel  (options) {
        Widget$$1.call (this);

        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];

        if (this.init (options,  ConfigPanel)) {
            Logger.log("Panel->init with options:");
            Logger.log(this.options);

            this.allLoaded = false;

            this.$feed = z$1('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-widget-carousel');
            this.$container.addClass('crt-widget-panel');

            if (this.options.panel.fixedHeight) {
                this.$container.addClass('crt-panel-fixed-height');
            }

            this.carousel = new LayoutCarousel(this.$feed, this.options.panel);
            this.carousel.on(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));

            // load first set of posts
            this.loadPosts(0);
        }
    }

    if ( Widget$$1 ) Panel.__proto__ = Widget$$1;
    Panel.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
    Panel.prototype.constructor = Panel;

    Panel.prototype.loadMorePosts = function loadMorePosts () {
        Logger.log('Panel->loadMorePosts');

        this.feed.loadPosts(this.feed.currentPage+1);
    };

    Panel.prototype.onPostsLoaded = function onPostsLoaded (event, posts) {
        Logger.log("Panel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            var that = this;
            var $els = [];
            z$1(posts).each(function() {
                var p = that.createPostElement(this);
                $els.push(p.$el);
            });


            this.carousel.add($els);
            this.carousel.update();

            this.popupManager.setPosts(posts);
        }
    };

    Panel.prototype.onPostImageLoaded = function onPostImageLoaded () {
        // Logger.log('Panel->onPostImageLoaded');
        this.carousel.updateHeight();
    };

    Panel.prototype.onCarouselChange = function onCarouselChange (event, currentSlide) {
        if (this.options && this.options.panel.autoLoad) {
            if (currentSlide >= this.feed.postsLoaded - 4) {
                this.loadMorePosts();
            }
        }
    };

    Panel.prototype.destroy = function destroy () {

        Widget$$1.prototype.destroy.call(this);

        this.feed.destroy();

        this.carousel.off(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));
        this.carousel.destroy();

        this.$feed.remove();
        this.$container.removeClass('crt-panel');
        this.$container.removeClass('crt-widget-panel');
        this.$container.removeClass('crt-carousel');
        this.$container.removeClass('crt-widget-carousel');

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.feed.postsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    };

    return Panel;
}(Widget));

var findContainer = function (config) {
    // find with data-crt-feed-id
    var container = z$1('[data-crt-feed-id="'+config.feedId+'"]');
    if (container.length > 0) {
        return container.get(0);
    }

    // could not find container ... try using the class feedId
    container = z$1('.crt-feed-'+config.feedId);
    if (container.length > 0) {
        return container.get(0);
    }

    // could not find container ... try using the feedId
    container = z$1('#curator-'+config.feedId);
    if (container.length > 0) {
        return container.get(0);
    }

    container = z$1(config.container);
    if (container.length) {
        return container.get(0);
    }
    return false;
};

var loadWidget = function (config) {
    if (typeof window.onCuratorBeforeBootstrap === 'function') {
        window.onCuratorBeforeBootstrap();
    }
    if (window.jQuery) {
        window.jQuery(window).trigger('curatorCssLoaded');
    }
    var container = findContainer (config);

    if (!container) {
        Logger.error('Curator - could not find container');
        return false;
    } else {
        config.container = container;
        var ConstructorClass = Crt.Widgets[config.type];
        return new ConstructorClass(config);
    }
};

var Crt = {

    loadWidget: loadWidget,
    loadCSS: function () {/* depreciated */},
    z: z$1,
    _t: function _t (s, n, lang) {
        return mod.t (s, n, lang);
    },

    Templates: Templates,
    Templating: Templating,
    EventBus: EventBus,
    Events: Events,
    Logger: Logger,
    Globals: Globals,

    Ui: {
        Post: Post,
    },

    Widgets: {
        Waterfall: Waterfall,
        Grid: Grid,
        Carousel: Carousel,
        Panel: Panel,
        List: List,
    },

    Utils: {
        Html: HtmlUtils,
        String: StringUtils
    },
};

return Crt;

}());


	return Curator;
}));