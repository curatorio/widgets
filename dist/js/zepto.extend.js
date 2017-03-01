;(function(root, factory) {
	// no amd or require code because this is supposed to run stand alone!
	root.Curator = factory(window);
}(this, function(root) {
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

	root.Curator = Curator;
	return Curator;
}));