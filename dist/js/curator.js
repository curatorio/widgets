;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		// Cheeky wrapper to add root to the factory call
		var factoryWrap = function () {
			var argsCopy = [].slice.call(arguments);
			argsCopy.unshift(root);
			return factory.apply(this, argsCopy);
		};
		define(['jquery', 'curator'], factoryWrap);
	} else if (typeof exports === 'object') {
		module.exports = factory(root, require('jquery'));
	} else {
		root.Curator = factory(root, root.jQuery || root.Zepto);
	}
}(this, function(root, $) {

	if ($ == undefined) {
		window.alert ("jQuery not found\n\nThe Curator Widget is running in dependency mode - this requires jQuery of Zepto. Try disabling DEPENDENCY MODE in the Admin on the Publish page." );
		return false;
	}

	// Debouncing function from John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
// Copy pasted from http://paulirish.com/2009/throttled-smartresize-jquery-event-handler/

(function ($, sr) {
    var debounce = function (func, threshold, execAsap) {
        var timeout;
        return function debounced() {
            var obj = this,
                args = arguments;

            function delayed() {
                if (!execAsap) func.apply(obj, args);
                timeout = null;
            }
            if (timeout) clearTimeout(timeout);
            else if (execAsap) func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 150);
        };
    };
    $.fn[sr] = function (fn) {
        return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
    };
})($, 'smartresize');

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

(function ($) {

    var defaultSettings = {
        selector: '.item',
        width: 225,
        gutter: 20,
        animate: false,
        animationOptions: {
            speed: 200,
            duration: 300,
            effect: 'fadeInOnAppear',
            queue: true,
            complete: function () {}
        }
    };

    var WaterfallRender = function WaterfallRender (options, element) {
        this.element = $(element);
        this._init(options);
    };

    WaterfallRender.prototype._init = function _init (options) {
        var container = this;
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
        this.options = $.extend(true, {}, defaultSettings, options);
        this.gridArr = $.makeArray(this.box.find(this.options.selector));
        this.isResizing = false;
        this.w = 0;
        this.boxArr = [];

        // this.offscreenRender = $('<div class="grid-rendered"></div>').appendTo('body');

        // build columns
        this._setCols();
        // build grid
        this._renderGrid('append');
        // add class 'gridalicious' to container
        $(this.box).addClass('gridalicious');
        // add smartresize
        $(window).smartresize(function () {
            container.resize();
        });
    };

    WaterfallRender.prototype._setName = function _setName (length, current) {
        current = current ? current : '';
        return length ? this._setName(--length, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 60)) + current) : current;
    };

    WaterfallRender.prototype._setCols = function _setCols () {
            var this$1 = this;

        // calculate columns
        this.cols = Math.floor(this.box.width() / this.options.width);
        //If Cols lower than 1, the grid disappears
        if (this.cols < 1) { this.cols = 1; }
        diff = (this.box.width() - (this.cols * this.options.width) - this.options.gutter) / this.cols;
        w = (this.options.width + diff) / this.box.width() * 100;
        this.w = w;
        this.colHeights = new Array (this.cols);
        this.colHeights.fill(0);
        this.colItems = new Array (this.cols);
        this.colItems.fill([]);

        // add columns to box
        for (var i = 0; i < this.cols; i++) {
            var div = $('<div></div>').addClass('galcolumn').attr('id', 'item' + i + this$1.name).css({
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

    WaterfallRender.prototype._renderGrid = function _renderGrid (method, arr, count, prepArray) {
            var this$1 = this;

        var items = [];
        var boxes = [];
        var prependArray = [];
        var itemCount = 0;
        var appendCount = this.appendCount;
        var gutter = this.options.gutter;
        var cols = this.cols;
        var name = this.name;
        var i = 0;
        var w = $('.galcolumn').width();

        // if arr
        if (arr) {
            boxes = arr;
            // if append
            if (method == "append") {
                // get total of items to append
                appendCount += count;
                // set itemCount to last count of appened items
                itemCount = this.appendCount;
            }
            // if prepend
            if (method == "prepend") {
                // set itemCount
                this.isPrepending = true;
                itemCount = Math.round(count % cols);
                if (itemCount <= 0) itemCount = cols;
            }
            // called by _updateAfterPrepend()
            if (method == "renderAfterPrepend") {
                // get total of items that was previously prepended
                appendCount += count;
                // set itemCount by counting previous prepended items
                itemCount = count;
            }
        }
        else {
            boxes = this.gridArr;
            appendCount = $(this.gridArr).length;
        }

        // push out the items to the columns
        for (var i$2 = 0, list = boxes; i$2 < list.length; i$2 += 1) {
            var item = list[i$2];

                var width = '100%';

            // if you want something not to be "responsive", add the class "not-responsive" to the selector container
            if (item.hasClass('not-responsive')) {
                width = 'auto';
            }

            item.css({
                'zoom': '1',
                'filter': 'alpha(opacity=0)',
                'opacity': '0'
            });

            // find shortest col
            var shortestCol = 0;
            for (var i$1=1; i$1 < this.colHeights.length;i$1++) {
                if (this$1.colHeights[i$1] < this$1.colHeights[shortestCol]) {
                    shortestCol = i$1;
                }
            }

            // prepend or append to shortest column
            if (method == 'prepend') {
                $("#item" + shortestCol + name).prepend(item);
                items.push(item);

            } else {
                $("#item" + shortestCol + name).append(item);
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

        if (method == "append" || method == "prepend") {
            if (method == "prepend") {
                // render old items and reverse the new items
                this._updateAfterPrepend(this.gridArr, boxes);
            }
            this._renderItem(items);
            this.isPrepending = false;
        } else {
            this._renderItem(this.gridArr);
        }
    };

    WaterfallRender.prototype._collectItems = function _collectItems () {
        var collection = [];
        $(this.box).find(this.options.selector).each(function (i) {
            collection.push($(this));
        });
        return collection;
    };

    WaterfallRender.prototype._renderItem = function _renderItem (items) {

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
            if (queue === true && effect == "fadeInOnAppear") {
                if (this.isPrepending) items.reverse();
                $.each(items, function (index, value) {
                    setTimeout(function () {
                        $(value).animate({
                            opacity: '1.0'
                        }, duration);
                        t++;
                        if (t == items.length) {
                            complete.call(undefined, items)
                        }
                    }, i * speed);
                    i++;
                });
            } else if (queue === false && effect == "fadeInOnAppear") {
                if (this.isPrepending) items.reverse();
                $.each(items, function (index, value) {
                    $(value).animate({
                        opacity: '1.0'
                    }, duration);
                    t++;
                    if (t == items.length) {
                        if (this.ifCallback) {
                            complete.call(undefined, items);
                        }
                    }
                });
            }

            // no effect but queued
            if (queue === true && !effect) {
                $.each(items, function (index, value) {
                    $(value).css({
                        'opacity': '1',
                        'filter': 'alpha(opacity=100)'
                    });
                    t++;
                    if (t == items.length) {
                        if (this.ifCallback) {
                            complete.call(undefined, items);
                        }
                    }
                });
            }

            // don not animate & no queue
        } else {
            $.each(items, function (index, value) {
                $(value).css({
                    'opacity': '1',
                    'filter': 'alpha(opacity=100)'
                });
            });
            if (this.ifCallback) {
                complete.call(items);
            }
        }
    };

    WaterfallRender.prototype._updateAfterPrepend = function _updateAfterPrepend (prevItems, newItems) {
        var gridArr = this.gridArr;
        // add new items to gridArr
        $.each(newItems, function (index, value) {
            gridArr.unshift(value);
        });
        this.gridArr = gridArr;
    };

    WaterfallRender.prototype.resize = function resize () {
        if (this.box.width() === this.boxWidth) {
            return;
        }

        var newCols = Math.floor(this.box.width() / this.options.width);
        if (this.cols === newCols) {
            // nothings changed yet
            return;
        }

        // delete columns in box
        this.box.find($('.galcolumn')).remove();
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

    WaterfallRender.prototype.append = function append (items) {
        var gridArr = this.gridArr;
        var gridArrAppend = this.gridArrPrepend;
        $.each(items, function (index, value) {
            gridArr.push(value);
            gridArrAppend.push(value);
        });
        this._renderGrid('append', items, $(items).length);
    };

    WaterfallRender.prototype.prepend = function prepend (items) {
        this.ifCallback = false;
        this._renderGrid('prepend', items, $(items).length);
        this.ifCallback = true;
    };

    $.fn.waterfall = function (options, e) {
        if (typeof options === 'string') {
            this.each(function () {
                var container = $.data(this, 'WaterfallRender');
                container[options].apply(container, [e]);
            });
        } else {
            this.each(function () {
                $.data(this, 'WaterfallRender', new WaterfallRender(options, this));
            });
        }
        return this;
    }

})($);

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
/**
 * Props to https://github.com/yanatan16/nanoajax
 */

(function(global){
    // Best place to find information on XHR features is:
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

    var reqfields = [
        'responseType', 'withCredentials', 'timeout', 'onprogress'
    ];

    function nanoajax (params, callback) {
        // Any variable used more than once is var'd here because
        // minification will munge the variables whereas it can't munge
        // the object access.
        var headers = params.headers || {}
            , body = params.body
            , method = params.method || (body ? 'POST' : 'GET')
            , called = false

        var req = getRequest(params.cors)

        function cb(statusCode, responseText) {
            return function () {
                if (!called) {
                    callback(req.status === undefined ? statusCode : req.status,
                        req.status === 0 ? "Error" : (req.response || req.responseText || responseText),
                        req)
                    called = true
                }
            }
        }

        req.open(method, params.url, true)

        var success = req.onload = cb(200)
        req.onreadystatechange = function () {
            if (req.readyState === 4) success()
        }
        req.onerror = cb(null, 'Error')
        req.ontimeout = cb(null, 'Timeout')
        req.onabort = cb(null, 'Abort')

        if (body) {
            setDefault(headers, 'X-Requested-With', 'XMLHttpRequest')

            if (!global.FormData || !(body instanceof global.FormData)) {
                setDefault(headers, 'Content-Type', 'application/x-www-form-urlencoded')
            }
        }

        for (var i = 0, len = reqfields.length, field; i < len; i++) {
            field = reqfields[i]
            if (params[field] !== undefined)
                req[field] = params[field]
        }

        for (var field$1 in headers)
            req.setRequestHeader(field$1, headers[field$1])

        req.send(body)

        return req
    }

    function getRequest(cors) {
        // XDomainRequest is only way to do CORS in IE 8 and 9
        // But XDomainRequest isn't standards-compatible
        // Notably, it doesn't allow cookies to be sent or set by servers
        // IE 10+ is standards-compatible in its XMLHttpRequest
        // but IE 10 can still have an XDomainRequest object, so we don't want to use it
        if (cors && global.XDomainRequest && !/MSIE 1/.test(navigator.userAgent))
            return new XDomainRequest
        if (global.XMLHttpRequest)
            return new XMLHttpRequest
    }

    function setDefault(obj, key, value) {
        obj[key] = obj[key] || value
    }

    global.nanoajax = nanoajax;
})(this);

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

(function(){
    var _tmplCache = {};

    var helpers = {
        networkIcon:function () {
            return this.data.network_name.toLowerCase();
        },
        networkName:function () {
            return this.data.network_name.toLowerCase();
        },
        userUrl:function () {
            if (this.data.user_url && this.data.user_url != '') {
                return this.data.user_url;
            }
            if (this.data.originator_user_url && this.data.originator_user_url != '') {
                return this.data.originator_user_url;
            }
            if (this.data.userUrl && this.data.userUrl != '') {
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
        parseText:function(s) {
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
        nl2br:function(s) {
            s = s.trim();
            s = s.replace(/(?:\r\n|\r|\n)/g, '<br />');

            return s;
        },
        contentImageClasses : function () {
            return this.data.image ? 'crt-post-has-image' : 'crt-post-content-image-hidden';
        },
        contentTextClasses : function () {
            return this.data.text ? 'crt-post-has-text' : 'crt-post-content-text-hidden';

        },
        fuzzyDate : function (dateString)
        {
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
                fuzzy = 'a minute ago.'
            } else if (delta < hour) {
                fuzzy = Math.floor(delta / minute) + ' minutes ago';
            } else if (Math.floor(delta / hour) == 1) {
                fuzzy = '1 hour ago.'
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
        prettyDate : function(time) {
            var date = Curator.DateUtils.dateFromString(time);

            var diff = (((new Date()).getTime() - date.getTime()) / 1000);
            var day_diff = Math.floor(diff / 86400);
            var year = date.getFullYear(),
                month = date.getMonth()+1,
                day = date.getDate();

            if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
                return (
                    year.toString()+'-'
                    +((month<10) ? '0'+month.toString() : month.toString())+'-'
                    +((day<10) ? '0'+day.toString() : day.toString())
                );

            var r =
                (
                    (
                        day_diff == 0 &&
                        (
                            (diff < 60 && "just now")
                            || (diff < 120 && "1 minute ago")
                            || (diff < 3600 && Math.floor(diff / 60) + " minutes ago")
                            || (diff < 7200 && "1 hour ago")
                            || (diff < 86400 && Math.floor(diff / 3600) + " hours ago")
                        )
                    )
                    || (day_diff == 1 && "Yesterday")
                    || (day_diff < 7 && day_diff + " days ago")
                    || (day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago")
                );
            return r;
        }
    };

    root.parseTemplate = function(str, data) {
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
                _tmplCache[str] = func;
            }
            helpers.data = data;
            return func.call(helpers, data);
        } catch (e) {
            window.console.log ('Template parse error: ' +e.message);
            err = e.message;
        }
        return " # ERROR: " + err + " # ";
    };
})();

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

// Test $ exists

var Curator = {
    debug: false,
    SOURCE_TYPES: ['twitter', 'instagram'],

    log: function (s) {

        if (window.console && Curator.debug) {
            window.console.log(s);
        }
    },

    alert: function (s) {
        if (window.alert) {
            window.alert(s);
        }
    },

    checkContainer: function (container) {
        Curator.log("Curator->checkContainer: " + container);
        if ($(container).length === 0) {
            if (window.console) {
                window.console.log('Curator could not find the element ' + container + '. Please ensure this element existings in your HTML code. Exiting.');
            }
            return false;
        }
        return true;
    },

    checkPowered: function (jQuerytag) {
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

    loadCSS: function (config) {
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
        }
        catch (err) {
            console.log('CURATOR UNABLE TO LOAD CSS');
            console.log(err.message);
        }
    },

    addCSSRule: function (sheet, selector, rules, index) {
        if ('insertRule' in sheet) {
            sheet.insertRule(selector + '{' + rules + '}', 0);
        }
        else if ('addRule' in sheet) {
            sheet.addRule(selector, rules);
        }
    },

    createSheet: function () {
        var style = document.createElement("style");
        // WebKit hack :(
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);
        return style.sheet;
    },

    loadWidget: function (config, template) {
        if (template) {
            Curator.Templates.postTemplate = template;
        }

        var ConstructorClass = window.Curator[config.type];
        window.curatorWidget = new ConstructorClass(config);
    },

    Templates:{},

    Config:{
        Defaults : {
            apiEndpoint: 'https://api.curator.io/v1',
            feedId:'',
            postsPerPage:12,
            maxPosts:0,
            debug: false,
            postTemplate:'#post-template',
            showPopupOnClick:true,
            onPostsLoaded: function () {
            },
            filter: {
                showNetworks: false,
                networksLabel: 'Networks:',

                showSources: false,
                sourcesLabel: 'Sources:',
            }
        }
    }
};

if ($ === undefined) {
    Curator.alert('Curator requires jQuery. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}





Curator.serialize = function serialize( obj ) {
    return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
};

Curator.ajax = function (url, params, success, fail) {
    var p = root.location.protocol,
        pp = url.indexOf('://');

    // IE9/IE10 cors requires same protocol
    // stripe current protocol and match window.location
    if (pp) {
        url = url.substr(pp+3);
    }
    url = p+'//'+url;

    if (params) {
        url = url + Curator.serialize (params);
    }

    nanoajax({
        url:url,
        cors:true
    },function(statusCode, responseText) {
        if (statusCode) {
            success(JSON.parse(responseText));
        } else {
            fail (statusCode, responseText)
        }
    });
};

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
    if (typeof this.listeners[type] != "undefined") {
        this.listeners[type].push({scope: scope, callback: callback, args: args});
    } else {
        this.listeners[type] = [{scope: scope, callback: callback, args: args}];
    }
};

EventBus.prototype.off = function off (type, callback, scope) {
        var this$1 = this;

    if (typeof this.listeners[type] != "undefined") {
        var numOfCallbacks = this.listeners[type].length;
        var newArray = [];
        for (var i = 0; i < numOfCallbacks; i++) {
            var listener = this$1.listeners[type][i];
            if (listener.scope == scope && listener.callback == callback) {

            } else {
                newArray.push(listener);
            }
        }
        this.listeners[type] = newArray;
    }
};

EventBus.prototype.has = function has (type, callback, scope) {
        var this$1 = this;

    if (typeof this.listeners[type] != "undefined") {
        var numOfCallbacks = this.listeners[type].length;
        if (callback === undefined && scope === undefined) {
            return numOfCallbacks > 0;
        }
        for (var i = 0; i < numOfCallbacks; i++) {
            var listener = this$1.listeners[type][i];
            if ((scope ? listener.scope == scope : true) && listener.callback == callback) {
                return true;
            }
        }
    }
    return false;
};

EventBus.prototype.trigger = function trigger (type, target) {
        var arguments$1 = arguments;
        var this$1 = this;

    var numOfListeners = 0;
    var event = {
        type: type,
        target: target
    };
    var args = [];
    var numOfArgs = arguments.length;
    for (var i = 0; i < numOfArgs; i++) {
        args.push(arguments$1[i]);
    }
    args = args.length > 2 ? args.splice(2, args.length - 1) : [];
    args = [event].concat(args);
    if (typeof this.listeners[type] != "undefined") {
        var numOfCallbacks = this.listeners[type].length;
        for (var i$1 = 0; i$1 < numOfCallbacks; i$1++) {
            var listener = this$1.listeners[type][i$1];
            if (listener && listener.callback) {
                var concatArgs = args.concat(listener.args);
                listener.callback.apply(listener.scope, concatArgs);
                numOfListeners += 1;
            }
        }
    }
};

EventBus.prototype.getEvents = function getEvents () {
        var this$1 = this;

    var str = "";
    for (var type in this.listeners) {
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

Curator.EventBus = new EventBus();

(function($) {
	// Default styling

	var defaults = {
		circular: false,
		speed: 5000,
		duration: 700,
		minWidth: 250,
		panesVisible: null,
		moveAmount: 0,
		autoPlay: false,
		useCss : true
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
            'height':0
		},

		pane_slider: {
			'width': '0%', // will be set to (number of panes * 100)
			'list-style': 'none',
			'position': 'relative',
			'overflow': 'hidden',
			'padding': '0',
			'left':'0'
		},

		pane: {
			'width': '0%', // will be set to (100 / number of images)
			'position': 'relative',
			'float': 'left'
		}
	};

	var Carousel = function Carousel (container, options) {
			var this$1 = this;

			Curator.log('Carousel->construct');

        this.current_position=0;
        this.animating=false;
        this.timeout=null;
        this.FAKE_NUM=0;
        this.PANES_VISIBLE=0;

			this.options = $.extend([], defaults, options);

			this.$viewport = $(container); // <div> slider, known as $viewport

        this.$panes = this.$viewport.children();
        this.$panes.detach();

			this.$pane_stage = $('<div class="ctr-carousel-stage"></div>').appendTo(this.$viewport);
			this.$pane_slider = $('<div class="ctr-carousel-slider"></div>').appendTo(this.$pane_stage);

			// this.$pane_slider.append(this.$panes);

			this.$viewport.css(css.viewport); // set css on viewport
			this.$pane_slider.css( css.pane_slider ); // set css on pane slider
			this.$pane_stage.css( css.pane_stage ); // set css on pane slider

        this.addControls();
        this.update ();

			$(window).smartresize(function () {
				this$1.resize();
				this$1.move (this$1.current_position, true);

				// reset animation timer
				if (this$1.options.autoPlay) {
					this$1.animate();
				}
			})
		};

		Carousel.prototype.update = function update () {
			this.$panes = this.$pane_slider.children(); // <li> list items, known as $panes
			this.NUM_PANES = this.options.circular ? (this.$panes.length + 1) : this.$panes.length;

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

		Carousel.prototype.add = function add ($els) {
			var $panes = [];
        //
        // $.each($els,(i, $pane)=> {
        // let p = $pane.wrapAll('<div class="crt-carousel-col"></div>').parent();
        // $panes.push(p)
        // });

			this.$pane_slider.append($els);
			this.$panes = this.$pane_slider.children();
		};

		Carousel.prototype.resize = function resize () {
			var this$1 = this;

			var PANE_WRAPPER_WIDTH = this.options.infinite ? ((this.NUM_PANES+1) * 100) + '%' : (this.NUM_PANES * 100) + '%'; // % width of slider (total panes * 100)

			this.$pane_slider.css({width: PANE_WRAPPER_WIDTH}); // set css on pane slider

			this.VIEWPORT_WIDTH = this.$viewport.width();

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
				$(pane).css( $.extend(css.pane, {width: this$1.PANE_WIDTH+'px'}) );
			});
		};

		Carousel.prototype.destroy = function destroy () {

		};

		Carousel.prototype.animate = function animate () {
			var this$1 = this;

			this.animating = true;
			clearTimeout(this.timeout);
			this.timeout = setTimeout(function () {
				this$1.next();
			}, this.options.speed);
		};

		Carousel.prototype.next = function next () {
			var move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE ;
			this.move(this.current_position + move, false);
		};

		Carousel.prototype.prev = function prev () {
			var move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE ;
			this.move(this.current_position - move, false);
		};

		Carousel.prototype.move = function move (i, noAnimate) {
			var this$1 = this;

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

			var curIncFake = (this.FAKE_NUM + this.current_position);
			var left = curIncFake * this.PANE_WIDTH;
			// console.log('move');
			// console.log(curIncFake);
			var panesInView = this.PANES_VISIBLE;
			var max = this.options.infinite ? (this.PANE_WIDTH * this.NUM_PANES) : (this.PANE_WIDTH * this.NUM_PANES) - this.VIEWPORT_WIDTH;


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
				this.$pane_slider.css(
					{
						left: ((0 - this.currentLeft) + 'px')
					});
            this.moveComplete();
			} else {
				var options = {
					duration: this.options.duration,
					complete: function () {
						this$1.moveComplete();
					}
				};
				if (this.options.easing) {
					options.easing = this.options.easing;
				}
				this.$pane_slider.animate(
					{
						left: ((0 - this.currentLeft) + 'px')
					},
					options
				);
			}
		};

		Carousel.prototype.moveComplete = function moveComplete () {
			var this$1 = this;

			// console.log ('moveComplete');
			// console.log (this.current_position);
			// console.log (this.NUM_PANES - this.PANES_VISIBLE);
			if (this.options.infinite && (this.current_position >= (this.NUM_PANES - this.PANES_VISIBLE))) {
				// console.log('IIIII');
				// infinite and we're off the end!
				// re-e-wind, the crowd says 'bo selecta!'
				this.$pane_slider.css({left:0});
				this.current_position = 0 - this.PANES_VISIBLE;
				this.currentLeft = 0;
			}

			setTimeout(function () {
            var paneMaxHieght = 0;
            for (var i=this$1.current_position;i<this$1.current_position + this$1.PANES_VISIBLE;i++)
            {
                	var p = $(this$1.$panes[i]).children('.crt-post');
                var h = p.height();
                if (h > paneMaxHieght) {
                    paneMaxHieght = h;
                }
            }
            	this$1.$pane_stage.animate({height:paneMaxHieght},300);
        }, 50);

			this.$viewport.trigger('curatorCarousel:changed', [this, this.current_position]);

			if (this.options.autoPlay) {
				this.animate();
			}
		};

		Carousel.prototype.addControls = function addControls () {
			this.$viewport.append('<button type="button" data-role="none" class="crt-panel-prev crt-panel-arrow" aria-label="Previous" role="button" aria-disabled="false">Previous</button>');
			this.$viewport.append('<button type="button" data-role="none" class="crt-panel-next crt-panel-arrow" aria-label="Next" role="button" aria-disabled="false">Next</button>');

			this.$viewport.on('click','.crt-panel-prev', this.prev.bind(this));
			this.$viewport.on('click','.crt-panel-next', this.next.bind(this));
		};

		Carousel.prototype.method = function method () {
			var m = arguments[0];
			// let args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
			if (m == 'update') {
				this.update();
			} else if (m == 'add') {
				this.add(arguments[1]);
			} else if (m == 'destroy') {
				this.destroy();
			} else {

			}
		};

	var carousels = {};
	function rand () {
		return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
	}

	$.extend($.fn, { 
		curatorCarousel: function (options) {
			var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));

			$.each(this, function(index, item) {
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



var Client = (function (EventBus) {
    function Client () {
        Curator.log('Client->construct');

        EventBus.call (this);

        this.id = Curator.Utils.uId ();
        Curator.log('id='+this.id);
    }

    if ( EventBus ) Client.__proto__ = EventBus;
    Client.prototype = Object.create( EventBus && EventBus.prototype );
    Client.prototype.constructor = Client;

    Client.prototype.setOptions = function setOptions (options, defaults) {

        this.options = $.extend(true,{}, defaults, options);

        if (options.debug) {
            Curator.debug = true;
        }

        // Curator.log(this.options);

        return true;
    };

    Client.prototype.init = function init () {

        if (!Curator.checkContainer(this.options.container)) {
            return false;
        }

        this.$container = $(this.options.container);

        this.createFeed();
        this.createFilter();
        this.createPopupManager();

        return true;
    };

    Client.prototype.createFeed = function createFeed () {
        var this$1 = this;

        this.feed = new Curator.Feed (this);
        this.feed.on('postsLoaded', function (event) {
            this$1.onPostsLoaded(event.target);
        });
        this.feed.on('postsFailed', function (event) {
            this$1.onPostsFail(event.target);
        });
    };

    Client.prototype.createPopupManager = function createPopupManager () {
        this.popupManager = new Curator.PopupManager(this);
    };

    Client.prototype.createFilter = function createFilter () {
        if (this.options.filter && (this.options.filter.showNetworks || this.options.filter.showSources)) {
            this.filter = new Curator.Filter(this);
        }
    };

    Client.prototype.loadPosts = function loadPosts (page) {
        this.feed.loadPosts(page);
    };

    Client.prototype.createPostElements = function createPostElements (posts)
    {
        var that = this;
        var postElements = [];
        $(posts).each(function(){
            var p = that.createPostElement(this);
            postElements.push(p.$el);
        });
        return postElements;
    };

    Client.prototype.createPostElement = function createPostElement (postJson) {
        var post = new Curator.Post(postJson, this.options, this);
        $(post).bind('postClick',this.onPostClick.bind(this));
        $(post).bind('postReadMoreClick',this.onPostClick.bind(this));

        if (this.options.onPostCreated) {
            this.options.onPostCreated (post);
        }

        return post;
    };

    Client.prototype.onPostsLoaded = function onPostsLoaded (event) {
        Curator.log('Client->onPostsLoaded');
        Curator.log(event.target);
    };

    Client.prototype.onPostsFail = function onPostsFail (event) {
        Curator.log('Client->onPostsLoadedFail');
        Curator.log(event.target);
    };

    Client.prototype.onPostClick = function onPostClick (ev,post) {
        if (this.options.showPopupOnClick) {
            this.popupManager.showPopup(post);
        }
    };

    Client.prototype.track = function track (a) {
        Curator.log('Feed->track '+a);

        Curator.ajax(
            this.getUrl('/track/'+this.options.feedId),
            {a:a},
            function (data) {
                Curator.log('Feed->track success');
                Curator.log(data);
            },
            function (jqXHR, textStatus, errorThrown) {
                Curator.log('Feed->_loadPosts fail');
                Curator.log(textStatus);
                Curator.log(errorThrown);
            }
        );
    };

    Client.prototype.getUrl = function getUrl (trail) {
        return this.options.apiEndpoint+trail;
    };

    Client.prototype.destroy = function destroy () {
        Curator.log('Client->destroy');
        if (this.feed) {
            this.feed.destroy()
        }
        if (this.filter) {
            this.filter.destroy()
        }
        if (this.popupManager) {
            this.popupManager.destroy()
        }
    };

    return Client;
}(EventBus));


Curator.Client = Client;


Curator.Events = {
    FEED_LOADED :'crt:feed:loaded',
    FILTER_CHANGED :'crt:filter:changed'
};


var Feed = (function (EventBus) {
    function Feed(client) {
        EventBus.call (this);

        Curator.log ('Feed->init with options');

        this.widget = client;

        this.posts = [];
        this.currentPage = 0;
        this.postsLoaded = 0;
        this.postCount = 0;
        this.loading = false;
        this.allPostsLoaded = false;
        this.pagination = null;

        this.options = this.widget.options;

        this.params = this.options.feedParams || {};
        this.params.limit = this.options.postsPerPage;

        this.feedBase = this.options.apiEndpoint+'/feed';
    }

    if ( EventBus ) Feed.__proto__ = EventBus;
    Feed.prototype = Object.create( EventBus && EventBus.prototype );
    Feed.prototype.constructor = Feed;

    Feed.prototype.loadPosts = function loadPosts (page, paramsIn) {
        page = page || 0;
        Curator.log ('Feed->loadPosts '+this.loading);
        if (this.loading) {
            return false;
        }
        this.currentPage = page;

        var params = $.extend({},this.options.feedParams,paramsIn);

        params.limit = this.options.postsPerPage;
        params.offset = page * this.options.postsPerPage;

        this._loadPosts (params);
    };

    Feed.prototype.loadMore = function loadMore (paramsIn) {
        Curator.log ('Feed->loadMore '+this.loading);
        if (this.loading) {
            return false;
        }

        var params = {
            limit:this.options.postsPerPage
        };
        $.extend(params,this.options.feedParams, paramsIn);

        params.offset = this.posts.length;

        this._loadPosts (params);
    };

    /**
     * First load - get's the most recent posts.
     * @param params - set parameters to send to API
     * @returns {boolean}
     */
    Feed.prototype.load = function load (params) {
        Curator.log ('Feed->load '+this.loading);

        if (this.loading) {
            return false;
        }
        this.currentPage = 0;

        var loadPostParams = $.extend(this.params, params);

        this._loadPosts (loadPostParams);
    };

    /**
     * Loads posts after the current set
     * @returns {boolean}
     */
    Feed.prototype.loadAfter = function loadAfter () {
        Curator.log ('Feed->loadAfter '+this.loading);

        if (this.loading) {
            return false;
        }
        this.currentPage = 0;

        var params = $.extend({},this.params);

        // TODO should we check we have after?
        if (this.pagination && this.pagination.after) {
            params.after = this.pagination.after;
            delete params.before;
        }

        this._loadPosts (params);
    };

    Feed.prototype._loadPosts = function _loadPosts (params) {
        var this$1 = this;

        Curator.log ('Feed->_loadPosts');

        this.loading = true;

        Curator.ajax(
            this.getUrl('/posts'),
            params,
            function (data) {
                Curator.log('Feed->_loadPosts success');

                if (data.success) {
                    this$1.postCount = data.postCount;
                    this$1.postsLoaded += data.posts.length;

                    this$1.allPostsLoaded = this$1.postsLoaded >= this$1.postCount;

                    this$1.posts = this$1.posts.concat(data.posts);
                    this$1.networks = data.networks;

                    if (data.pagination) {
                        this$1.pagination = data.pagination;
                    }

                    this$1.widget.trigger(Curator.Events.FEED_LOADED, data);
                    this$1.trigger('postsLoaded',data.posts);
                } else {
                    this$1.trigger('postsFailed',data.posts);
                }
                this$1.loading = false;
            },
            function (jqXHR, textStatus, errorThrown) {
                Curator.log('Feed->_loadPosts fail');
                Curator.log(textStatus);
                Curator.log(errorThrown);

                this$1.trigger('postsFailed',[]);
                this$1.loading = false;
            }
        );
    };

    Feed.prototype.loadPost = function loadPost (id, successCallback, failCallback) {
        failCallback = failCallback || function(){};
        $.get(this.getUrl('/post/' + id), {}, function (data) {
            if (data.success) {
                successCallback (data.post);
            } else {
                failCallback ();
            }
        });
    };

    Feed.prototype.inappropriatePost = function inappropriatePost (id, reason, success, failure) {
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
            }
            else {
                failure(jqXHR);
            }
        });
    };

    Feed.prototype.lovePost = function lovePost (id, success, failure) {
        var params = {};

        $.post(this.getUrl('/post/' + id + '/love'), params, function (data, textStatus, jqXHR) {
            data = $.parseJSON(data);

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
        EventBus.prototype.destroy.call(this);
    };

    return Feed;
}(EventBus));

Curator.Feed = Feed;
/**
* ==================================================================
* Filter
* ==================================================================
*/


var Filter = function Filter (client) {
    var this$1 = this;

    Curator.log('Filter->construct');

    this.client = client;
    this.options = client.options;

    this.$filter = Curator.Template.render('#filterTemplate', {});
    this.$filterNetworks =  this.$filter.find('.crt-filter-networks');
    this.$filterNetworksUl =  this.$filter.find('.crt-filter-networks ul');
    this.$filterSources =  this.$filter.find('.crt-filter-sources');
    this.$filterSourcesUl =  this.$filter.find('.crt-filter-sources ul');

    this.client.$container.append(this.$filter);

    this.$filterNetworks.find('label').text(this.client.options.filter.networksLabel);
    this.$filterSources.find('label').text(this.client.options.filter.sourcesLabel);

    this.$filter.on('click','.crt-filter-networks a',function (ev){
        ev.preventDefault();
        var t = $(ev.target);
        var networkId = t.data('network');

        this$1.$filter.find('.crt-filter-networks li').removeClass('active');
        t.parent().addClass('active');

        this$1.client.trigger(Curator.Events.FILTER_CHANGED);

        if (networkId) {
            this$1.client.feed.loadPosts(0, {network_id: networkId});
        } else {
            this$1.client.feed.loadPosts(0, {});
        }
    });

    this.$filter.on('click','.crt-filter-sources a',function (ev){
        ev.preventDefault();
        var t = $(ev.target);
        var sourceId = t.data('source');

        this$1.$filter.find('.crt-filter-sources li').removeClass('active');
        t.parent().addClass('active');

        this$1.client.trigger(Curator.Events.FILTER_CHANGED);

        if (sourceId) {
            this$1.client.feed.loadPosts(0, {source_id:sourceId});
        } else {
            this$1.client.feed.loadPosts(0, {});
        }
    });

    this.client.on(Curator.Events.FEED_LOADED, function (event) {
        this$1.onPostsLoaded(event.target);
    });
};

Filter.prototype.onPostsLoaded = function onPostsLoaded (data) {
        var this$1 = this;


    if (!this.filtersLoaded) {

        if (this.options.filter.showNetworks) {
            this.$filterNetworksUl.append('<li class="crt-filter-label"><label>'+this.client.options.filter.networksLabel+'</label></li>');
            this.$filterNetworksUl.append('<li class="active"><a href="#" data-network="0"> All</a></li>');

            for (var i = 0, list = data.networks; i < list.length; i += 1) {
                var id = list[i];

                    var network = Curator.Networks[id];
                if (network) {
                    this$1.$filterNetworksUl.append('<li><a href="#" data-network="' + id + '"><i class="' + network.icon + '"></i> ' + network.name + '</a></li>');
                } else {
                    console.log(id);
                }
            }
        } else {
            this.$filterNetworks.hide();
        }

        if (this.options.filter.showSources) {
            this.$filterSourcesUl.append('<li class="crt-filter-label"><label>'+this.client.options.filter.sourcesLabel+'</label></li>');
            this.$filterSourcesUl.append('<li class="active"><a href="#" data-source="0"> All</a></li>');
            for (var i$1 = 0, list$1 = data.sources; i$1 < list$1.length; i$1 += 1) {
                var source = list$1[i$1];

                    var network$1 = Curator.Networks[source.network_id];
                if (network$1) {
                    this$1.$filterSourcesUl.append('<li><a href="#" data-source="' + source.id + '"><i class="' + network$1.icon + '"></i> ' + source.name + '</a></li>');
                } else {
                    console.log(source.network_id);
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

Curator.Filter = Filter;
Curator.Networks = {
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
};
/**
* ==================================================================
* Popup
* ==================================================================
*/


Curator.PopupInappropriate = function (post,feed) {
    this.init(post,feed);
};

$.extend(Curator.PopupInappropriate.prototype, {
    feed: null,
    post:null,

    init: function (post,feed) {
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

                feed.inappropriatePost(that.post.id, reason,
                    function () {
                        $input.val('');
                        that.$el.find('.waiting').hide();
                        that.$el.find('.title').html('Thank you');
                        that.$el.find('input.text').hide();
                        that.$el.find('input.text').html('');
                        that.$el.find('.success-message').html('This message has been marked as inappropriate').show();
                    },
                    function () {
                        that.$el.find('.waiting').hide();
                        that.$el.find('.title').html('Oops');
                        that.$el.find('input.text').hide();
                        that.$el.find('input.text').html('');
                        that.$el.find('.success-message').html('It looks like a problem has occurred. Please try again later').show();
                    }
                );
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


var PopupManager = function PopupManager (client) {
    Curator.log("PopupManager->init ");

    this.client = client;
    this.templateId='#popup-wrapper-template';

    this.$wrapper = Curator.Template.render(this.templateId, {});
    this.$popupContainer = this.$wrapper.find('.crt-popup-container');
    this.$underlay = this.$wrapper.find('.crt-popup-underlay');

    $('body').append(this.$wrapper);
    this.$underlay.click(this.onUnderlayClick.bind(this));
    //this.$popupContainer.click(this.onUnderlayClick.bind(this));

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

    this.popup = new Curator.Popup(this, post, this.feed);
    this.$popupContainer.append(this.popup.$popup);

    this.$wrapper.show();

    if (this.$underlay.css('display') !== 'block') {
        this.$underlay.fadeIn();
    }
    this.popup.show();

    $('body').addClass('crt-popup-visible');

    this.currentPostNum = 0;
    for(var i=0;i < this.posts.length;i++)
    {
        // console.log (post.json.id +":"+this.posts[i].id);
        if (post.json.id == this$1.posts[i].id) {
            this$1.currentPostNum = i;
            Curator.log('Found post '+i);
            break;
        }
    }

    this.client.track('popup:show');
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

    this.showPopup({json:this.posts[this.currentPostNum]});
};

PopupManager.prototype.onNext = function onNext () {
    this.currentPostNum+=1;
    this.currentPostNum = this.currentPostNum<this.posts.length?this.currentPostNum:0; // loop back to start

    this.showPopup({json:this.posts[this.currentPostNum]});
};

PopupManager.prototype.onUnderlayClick = function onUnderlayClick (e) {
    Curator.log('PopupManager->onUnderlayClick');
    e.preventDefault();

    if (this.popup) {
        this.popup.hide(function () {
            this.hide();
        }.bind(this));
    }
};

PopupManager.prototype.hide = function hide () {
        var this$1 = this;

    Curator.log('PopupManager->hide');
    this.client.track('popup:hide');
    $('body').removeClass('crt-popup-visible');
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

Curator.PopupManager = PopupManager; 
/**
* ==================================================================
* Popup
* ==================================================================
*/


var Popup = function Popup (popupManager, post, feed) {
    Curator.log("Popup->init ");
 
    this.popupManager = popupManager;
    this.json = post.json;
    this.feed = feed;

    this.templateId='#popup-template';
    this.videoPlaying=false;

    this.$popup = Curator.Template.render(this.templateId, this.json);

    if (this.json.image) {
        this.$popup.addClass('has-image');
    }

    if (this.json.video) {
        this.$popup.addClass('has-video');
    }

    if (this.json.video && this.json.video.indexOf('youtu') >= 0 )
    {
        // youtube
        this.$popup.find('video').remove();
        // this.$popup.removeClass('has-image');

        var youTubeId = Curator.StringUtils.youtubeVideoId(this.json.video);

        var src = '<iframe id="ytplayer" type="text/html" width="615" height="615" \
        src="https://www.youtube.com/embed/'+youTubeId+'?autoplay=0&rel=0&showinfo" \
        frameborder="0"></iframe>';

        this.$popup.find('.crt-video-container img').remove();
        this.$popup.find('.crt-video-container a').remove();
        this.$popup.find('.crt-video-container').append(src);
    } else if (this.json.video && this.json.video.indexOf('vimeo') >= 0 )
    {
        // youtube
        this.$popup.find('video').remove();
        // this.$popup.removeClass('has-image');

        var vimeoId = Curator.StringUtils.vimeoVideoId(this.json.video);

        if (vimeoId) {
            var src$1 = '<iframe src="https://player.vimeo.com/video/' + vimeoId + '?color=ffffff&title=0&byline=0&portrait=0" width="615" height="615" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
            this.$popup.find('.crt-video-container img').remove();
            this.$popup.find('.crt-video-container a').remove();
            this.$popup.find('.crt-video-container').append(src$1);
        }
    }


    this.$popup.on('click',' .crt-close', this.onClose.bind(this));
    this.$popup.on('click',' .crt-previous', this.onPrevious.bind(this));
    this.$popup.on('click',' .crt-next', this.onNext.bind(this));
    this.$popup.on('click',' .crt-play', this.onPlay.bind(this));
    this.$popup.on('click','.crt-share-facebook',this.onShareFacebookClick.bind(this));
    this.$popup.on('click','.crt-share-twitter',this.onShareTwitterClick.bind(this));
};

Popup.prototype.onShareFacebookClick = function onShareFacebookClick (ev) {
    ev.preventDefault();
    Curator.SocialFacebook.share(this.json);
    this.widget.track('share:facebook');
    return false;
};

Popup.prototype.onShareTwitterClick = function onShareTwitterClick (ev) {
    ev.preventDefault();
    Curator.SocialTwitter.share(this.json);
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
        // $('.popup .content').fadeIn('slow');
        // });
    });
};
    
Popup.prototype.hide = function hide (callback) {
    Curator.log('Popup->hide');
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

    delete this.$popup;
};

Curator.Popup = Popup;


/**
* ==================================================================
* Post
* ==================================================================
*/


var Post = function Post (postJson, options, widget) {
    var this$1 = this;

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
    this.$image.css({opacity:0});

    if (this.json.image) {
        this.$image.on('load', this.onImageLoaded.bind(this));
        this.$image.on('error', this.onImageError.bind(this));
    } else {
        // no image ... call this.onImageLoaded
        setTimeout(function () {
            this$1.setHeight();
        },100)
    }

    if (this.json.image_width > 0) {
        var p = (this.json.image_height/this.json.image_width)*100;
        this.$imageContainer.addClass('crt-image-responsive')
            .css('padding-bottom',p+'%')
    }

    if (this.json.url.indexOf('http') !== 0) {
        this.$el.find('.crt-post-share').hide ();
    }

    this.$image.data('dims',this.json.image_width+':'+this.json.image_height);

    this.$post = this.$el.find('.crt-post');

    if (this.json.video) {
        this.$post.addClass('has-video');
    }
};

Post.prototype.onShareFacebookClick = function onShareFacebookClick (ev) {
    ev.preventDefault();
    Curator.SocialFacebook.share(this.json);
    this.widget.track('share:facebook');
    return false;
};

Post.prototype.onShareTwitterClick = function onShareTwitterClick (ev) {
    ev.preventDefault();
    Curator.SocialTwitter.share(this.json);
    this.widget.track('share:twitter');
    return false;
};

Post.prototype.onPostClick = function onPostClick (ev) {

    var target = $(ev.target);

    if (target.is('a') && target.attr('href') !== '#') {
        this.widget.track('click:link');
    } else {
        ev.preventDefault();
        $(this).trigger('postClick', this, this.json, ev);
    }

};

Post.prototype.onImageLoaded = function onImageLoaded () {
    this.$image.animate({opacity:1});

    this.setHeight();
};

Post.prototype.onImageError = function onImageError () {
    // Unable to load image!!!
    this.$image.hide();

    this.setHeight();
};

Post.prototype.setHeight = function setHeight () {
    var height = this.$post.height();
    if (this.options.maxHeight && this.options.maxHeight > 0 && height > this.options.maxHeight) {
        this.$post
            .css({maxHeight: this.options.maxHeight})
            .addClass('crt-post-max-height');
    }
};

Post.prototype.onReadMoreClick = function onReadMoreClick (ev) {
    ev.preventDefault();
    this.widget.track('click:read-more');
    $(this).trigger('postReadMoreClick',this, this.json, ev);
};

Curator.Post = Post;
/* global FB */

Curator.SocialFacebook = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        obj.cleanText = Curator.StringUtils.filterHtml(post.text);
        var cb =  function(){};

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
            var url2 = Curator.Utils.tinyparser(url, obj);
            Curator.Utils.popup(url2, 'twitter', '600', '430', '0');
        }
    }
};


Curator.SocialPinterest = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        var url = "http://pinterest.com/pin/create/button/?url={{url}}&media={{image}}&description={{text}}";
        Curator.Utils.popup(Curator.Utils.tinyparser(url, obj), 'pintrest', '600', '270', '0');
    }
};


Curator.SocialTwitter = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        obj.cleanText = Curator.StringUtils.filterHtml(post.text);

        var url = "http://twitter.com/share?url={{url}}&text={{cleanText}}&hashtags={{hashtags}}";
        console.log (url);
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



Curator.Templates.filterTemplate = ' <div class="crt-filter"> \
<div class="crt-filter-networks">\
<ul class="crt-networks"> </ul>\
</div> \
<div class="crt-filter-sources">\
<ul class="crt-sources"> </ul>\
</div> \
</div>';

Curator.Template = {
    camelize: function (s) {
        return s.replace (/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },
    render: function (templateId, data) {
        var cam = this.camelize(templateId).substring(1);
        var source = '';

        // console.log (cam);
        // console.log (data);

        if (Curator.Templates[cam] !== undefined)
        {
            source = Curator.Templates[cam];
        } else if ($(templateId).length===1)
        {
            source = $(templateId).html();
        }

        if (source === '')
        {
            throw new Error ('could not find template '+templateId+'('+cam+')');
        }

        var tmpl = window.parseTemplate(source, data);
        if ($.parseHTML) {
            // breaks with jquery < 1.8
            tmpl = $.parseHTML(tmpl);
        }
        return $(tmpl).filter('div');
    }
};



Curator.Utils = {
    postUrl : function (post)
    {
        if (post.url && post.url !== "" && post.url !== "''")
        {
            // instagram
            return post.url;
        }

        console.log(post.url);
        if (post.network_id+"" === "1")
        {
            // twitter
            return 'https://twitter.com/'+post.user_screen_name+'/status/'+post.source_identifier;
        }

        return '';
    },

    center: function center (elementWidth, elementHeight, bound) {
        var s = window.screen,
            b = bound || {},
            bH = b.height || s.height,
            bW = b.width || s.height,
            w = elementWidth,
            h = elementHeight;

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
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },

    uId: function uId () {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    }
};

Curator.DateUtils = {
    /**
     * Parse a date string in form DD/MM/YYYY HH:MM::SS - returns as UTC
     */
    dateFromString: function dateFromString(time) {
        dtstr = time.replace(/\D/g," ");
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
    }
};

Curator.StringUtils = {

    twitterLinks: function twitterLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return Curator.StringUtils.url("https://twitter.com/"+username,u);
        });
        s = s.replace(twttr.txt.regexen.validHashtag, function(t) {
            var tag = t.replace("#","%23");
            return Curator.StringUtils.url("https://twitter.com/search?q="+tag,t);
        });

        return s;
    },

    instagramLinks: function instagramLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return Curator.StringUtils.url("https://www.instagram.com/"+username+'/',u);
        });
        s = s.replace(twttr.txt.regexen.validHashtag, function(t) {
            var tag = t.replace("#","");
            return Curator.StringUtils.url("https://www.instagram.com/explore/tags/"+tag+'/',t);
        });

        return s;
    },

    facebookLinks: function facebookLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return Curator.StringUtils.url("https://www.facebook.com/"+username+'/',u);
        });
        s = s.replace(twttr.txt.regexen.validHashtag, function(t) {
            var tag = t.replace("#","%23");
            return Curator.StringUtils.url("https://www.facebook.com/search/top/?q="+tag,t);
        });

        return s;
    },

    linksToHref: function linksToHref (s)
    {
        s = s.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
            return Curator.StringUtils.url(url);
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

        if (match && match[7].length==11) {
            return match[7];
        } else {
            // above doesn't work if video id starts with v
            // eg https://www.youtube.com/embed/vDbr_EamBK4?autoplay=1

            var regExp$1 = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/))([^#\&\?]*).*/;
            var match2 = url.match(regExp$1);
            if (match2 && match2[6].length==11) {
                return match2[6];
            }
        }

        return false;
    },

    vimeoVideoId: function vimeoVideoId (url) {
        var regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/;
        var match = url.match(regExp);

        console.log (match);

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
    }
};

Curator.Config.Waterfall = $.extend({}, Curator.Config.Defaults, {
    scroll:'more',
    waterfall: {
        gridWidth:250,
        animate:true,
        animateSpeed:400
    }
});


var Waterfall = (function (superclass) {
    function Waterfall (options) {
        var this$1 = this;

        superclass.call (this);

        this.setOptions (options,  Curator.Config.Waterfall);

        Curator.log("Waterfall->init with options:");
        Curator.log(this.options);

        if (this.init (this)) {
            this.$scroll = $('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$scroll);
            this.$container.addClass('crt-feed-container');

            if (this.options.scroll === 'continuous') {
                $(this.$scroll).scroll(function () {
                    var height = this$1.$scroll.height();
                    var cHeight = this$1.$feed.height();
                    var scrollTop = this$1.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        this$1.loadMorePosts();
                    }
                });
            } else if (this.options.scroll === 'none') {
                // no scroll - use javascript to trigger loading
            } else {
                // default to more
                this.$more = $('<div class="crt-feed-more"><a href="#"><span>Load more</span></a></div>').appendTo(this.$scroll);
                this.$more.find('a').on('click',function (ev) {
                    ev.preventDefault();
                    this$1.loadMorePosts();
                });
            }

            this.$feed.waterfall({
                selector:'.crt-post-c',
                gutter:0,
                width:this.options.waterfall.gridWidth,
                animate:this.options.waterfall.animate,
                animationOptions: {
                    speed: (this.options.waterfall.animateSpeed/2),
                    duration: this.options.waterfall.animateSpeed
                }
            });

            this.on(Curator.Events.FILTER_CHANGED, function (event) {
                this$1.$feed.find('.crt-post-c').remove();
            });

            // Load first set of posts
            this.feed.load();
        }
    }

    if ( superclass ) Waterfall.__proto__ = superclass;
    Waterfall.prototype = Object.create( superclass && superclass.prototype );
    Waterfall.prototype.constructor = Waterfall;

    Waterfall.prototype.loadMorePosts = function loadMorePosts () {
        Curator.log('Waterfall->loadMorePosts');

        this.feed.loadAfter();
    };


    Waterfall.prototype.loadPage = function loadPage (page) {
        Curator.log('Waterfall->loadPage');

        this.$feed.find('.crt-post-c').remove();

        this.feed.loadPosts(page);
    };

    Waterfall.prototype.onPostsLoaded = function onPostsLoaded (posts) {
        Curator.log("Waterfall->onPostsLoaded");

        var postElements = this.createPostElements (posts);

        //this.$feed.append(postElements);
        this.$feed.waterfall('append', postElements);

        var that = this;
        $.each(postElements,function (i) {
            var post = this;
            if (that.options.waterfall.showReadMore) {
                post.find('.crt-post')
                    .addClass('crt-post-show-read-more');
            }
        });

        if (this.feed.allPostsLoaded && this.$more) {
            this.$more.hide();
        }

        this.popupManager.setPosts(posts);

        this.loading = false;
        this.options.onPostsLoaded (this, posts);
    };

    Waterfall.prototype.onPostsFailed = function onPostsFailed (data) {
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    };

    Waterfall.prototype.destroy = function destroy () {
        Curator.log('Waterfall->destroy');
        //this.$feed.slick('unslick');

        superclass.prototype.destroy.call(this);

        this.$feed.remove();
        this.$scroll.remove();
        if (this.$more) {
            this.$more.remove();
        }
        this.$container.removeClass('crt-feed-container');

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
}(Curator.Client));


Curator.Waterfall = Waterfall;



Curator.Config.Carousel = $.extend({}, Curator.Config.Defaults, {
    scroll:'more',
    carousel:{
        autoPlay:true,
        autoLoad:true
    },
});

var Carousel = (function (Client) {
    function Carousel (options) {
        var this$1 = this;

        Client.call (this);

        options.postsPerPage = 60;

        this.setOptions (options,  Curator.Config.Carousel);

        this.containerHeight=0;
        this.loading=false;
        this.posts=[];
        this.firstLoad=true;

        Curator.log("Carousel->init with options:");
        Curator.log(this.options);

        if (this.init (this)) {

            this.allLoaded = false;

            // this.$wrapper = $('<div class="crt-carousel-wrapper"></div>').appendTo(this.$container);
            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-carousel');

            this.carousel = new window.CCarousel(this.$feed, this.options.carousel);
            this.$feed.on('curatorCarousel:changed', function (event, carousel, currentSlide) {
                // console.log('curatorCarousel:changed '+currentSlide);
                // console.log('curatorCarousel:changed '+(that.feed.postsLoaded-carousel.PANES_VISIBLE));
                // console.log(carousel.PANES_VISIBLE);
                if (this$1.options.carousel.autoLoad) {
                    if (currentSlide >= this$1.feed.postsLoaded - carousel.PANES_VISIBLE) {
                        this$1.loadMorePosts();
                    }
                }
            });

            // load first set of posts
            this.loadPosts(0);
        }
    }

    if ( Client ) Carousel.__proto__ = Client;
    Carousel.prototype = Object.create( Client && Client.prototype );
    Carousel.prototype.constructor = Carousel;

    Carousel.prototype.loadMorePosts = function loadMorePosts () {
        Curator.log('Carousel->loadMorePosts');

        if (this.feed.postCount > this.feed.postsLoaded) {
            this.feed.loadPosts(this.feed.currentPage + 1);
        }
    };

    Carousel.prototype.onPostsLoaded = function onPostsLoaded (posts) {
        Curator.log("Carousel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
             var that = this;
             var $els = [];
            $(posts).each(function(i){
                var p = that.createPostElement(this);
                $els.push(p.$el);

                if (that.options.animate && that.firstLoad) {
                    p.$el.css({opacity: 0});
                    setTimeout(function () {
                        console.log (i);
                        p.$el.css({opacity: 0}).animate({opacity: 1});
                    }, i * 100);
                }
            });

            this.carousel.add($els);
            this.carousel.update();

            // that.$feed.c().trigger('add.owl.carousel',$(p.$el));

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);
        }
        this.firstLoad = false;
    };
    
    Carousel.prototype.onPostsFail = function onPostsFail (data) {
        Curator.log("Carousel->onPostsFail");
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    };

    Carousel.prototype.destroy = function destroy () {
        Client.prototype.destroy.call(this);

        this.carousel.destroy();
        this.$feed.remove();
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
}(Client));


Curator.Carousel = Carousel;

Curator.Config.Panel = $.extend({}, Curator.Config.Defaults, {
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

var Panel = (function (superclass) {
    function Panel  (options) {
        var this$1 = this;

        superclass.call (this);

        this.setOptions (options,  Curator.Config.Panel);

        Curator.log("Panel->init with options:");
        Curator.log(this.options);

        this.containerHeight=0;
        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];

        if (this.init (this)) {
            this.allLoaded = false;

            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-panel');

            if (this.options.panel.fixedHeight) {
                this.$container.addClass('crt-panel-fixed-height');
            }

            this.$feed.curatorCarousel(this.options.panel);
            this.$feed.on('curatorCarousel:changed', function (event, carousel, currentSlide) {
                if (!this$1.allLoaded && this$1.options.panel.autoLoad) {
                    if (currentSlide >= this$1.feed.postsLoaded - 4) {
                        this$1.loadMorePosts();
                    }
                }
            });

            // load first set of posts
            this.loadPosts(0);
        }
    }

    if ( superclass ) Panel.__proto__ = superclass;
    Panel.prototype = Object.create( superclass && superclass.prototype );
    Panel.prototype.constructor = Panel;

    Panel.prototype.loadMorePosts = function loadMorePosts () {
        Curator.log('Carousel->loadMorePosts');

        this.feed.loadPosts(this.feed.currentPage+1);
    };

    Panel.prototype.onPostsLoaded = function onPostsLoaded (posts) {
        Curator.log("Carousel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            var that = this;
            var $els = [];
            $(posts).each(function(){
                var p = that.createPostElement(this);
                $els.push(p.$el);
            });

            that.$feed.curatorCarousel('add',$els);
            that.$feed.curatorCarousel('update');

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);
        }
    };

    Panel.prototype.onPostsFail = function onPostsFail (data) {
        Curator.log("Carousel->onPostsFail");
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    };

    Panel.prototype.destroy = function destroy () {

        superclass.prototype.destroy.call(this);

        this.$feed.curatorCarousel('destroy');
        this.$feed.remove();
        this.$container.removeClass('crt-panel');

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
}(Curator.Client));

Curator.Panel = Panel;

Curator.Config.Grid = $.extend({}, Curator.Config.Defaults, {
    postTemplate:'#gridPostTemplate',
    grid: {
        minWidth:200,
        rows:3
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


var Grid = (function (Client) {
    function Grid  (options) {
        Client.call (this);

        this.setOptions (options,  Curator.Config.Grid);

        Curator.log("Grid->init with options:");
        Curator.log(this.options);

        this.containerHeight=0;
        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];
        this.previousCol=0;

        this.rowsMax = 0;
        this.totalPostsLoaded=0;
        this.allLoaded=false;

        if (this.init (this)) {

            var tmpl = Curator.Template.render('#gridFeedTemplate', {});
            this.$container.append(tmpl);
            this.$feed = this.$container.find('.crt-feed');
            this.$feedWindow = this.$container.find('.crt-feed-window');
            this.$loadMore = this.$container.find('.crt-feed-more a');

            this.$container.addClass('crt-grid');

            if (this.options.grid.showLoadMore) {
                // this.$feed.css({
                //     position:'absolute',
                //     left:0,
                //     top:0,
                //     width:'100%'
                // });
                this.$feedWindow.css({
                    'position':'relative'
                });
                // postsNeeded = cols *  (this.options.grid.rows * 2); //
                this.$loadMore.click(this.onMoreClicked.bind(this))
            } else {
                this.$loadMore.hide();
            }

            this.createHandlers();

            // Debounce wrapper ...

            // This triggers post loading
            this.rowsMax = this.options.grid.rows;
            this.updateLayout ();
        }
    }

    if ( Client ) Grid.__proto__ = Client;
    Grid.prototype = Object.create( Client && Client.prototype );
    Grid.prototype.constructor = Grid;

    Grid.prototype.loadPosts = function loadPosts () {
        console.log ('LOAD POSTS CALLED!!!?!?!!?!?!');
    };

    Grid.prototype.updateLayout = function updateLayout ( ) {
        // Curator.log("Grid->updateLayout ");
        var cols = Math.floor(this.$container.width()/this.options.grid.minWidth);
        cols = cols < 1 ? 1 : cols;

        // set col layout
        this.$container.removeClass('crt-grid-col'+this.previousCol);
        this.previousCol = cols;
        this.$container.addClass('crt-grid-col'+this.previousCol);

        // figure out if we need more posts
        var postsNeeded = cols *  (this.rowsMax + 1);
        // console.log ('postNeeded '+postsNeeded);
        // console.log ('this.feed.postsLoaded '+this.feed.postsLoaded);
        if (postsNeeded > this.feed.postsLoaded && !this.feed.allPostsLoaded) {
            var limit = postsNeeded - this.feed.postsLoaded;

            var params = {
                limit : limit
            };

            if (this.feed.pagination && this.feed.pagination.after) {
                params.after = this.feed.pagination.after;
            }

            // console.log (params);

            this.feed._loadPosts(params);
        } else {
            this.updateHeight(false);
        }
    };

    Grid.prototype.updateHeight = function updateHeight (animate) {
        var postHeight = this.$container.find('.crt-post-c').width();
        this.$feedWindow.css({'overflow':'hidden'});

        var maxRows = Math.ceil(this.feed.postCount / this.previousCol);
        var rows = this.rowsMax < maxRows ? this.rowsMax : maxRows;

        if (animate) {
            this.$feedWindow.animate({height:rows * postHeight});
        } else {
            this.$feedWindow.height(rows * postHeight);
        }

        if (this.options.grid.showLoadMore) {
            if (this.feed.allPostsLoaded) {
                this.$loadMore.hide();
            } else {
                this.$loadMore.show();
            }
        }
    };

    Grid.prototype.createHandlers = function createHandlers () {
        var this$1 = this;

        var id = this.id;
        var updateLayoutDebounced = Curator.Utils.debounce( function () {
            this$1.updateLayout ();
        }, 100);

        $(window).on('resize.'+id, updateLayoutDebounced);

        $(window).on('curatorCssLoaded.'+id, updateLayoutDebounced);

        $(document).on('ready.'+id, updateLayoutDebounced);
    };

    Grid.prototype.destroyHandlers = function destroyHandlers () {
        var id = this.id;

        $(window).off('resize.'+id);

        $(window).off('curatorCssLoaded.'+id);

        $(document).off('ready.'+id);
    };

    Grid.prototype.onPostsLoaded = function onPostsLoaded (posts) {
        Curator.log("Grid->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            var that = this;
            var postElements = [];
            $(posts).each(function(i){
                var p = that.createPostElement.call(that, this);
                postElements.push(p.$el);
                that.$feed.append(p.$el);

                if (that.options.animate) {
                    p.$el.css({opacity:0});
                    setTimeout(function () {
                        p.$el.css({opacity: 0}).animate({opacity: 1});
                    }, i * 100);
                }
            });

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);

            this.updateHeight(true);
        }
    };

    Grid.prototype.createPostElement = function createPostElement (postJson) {
        var post = new Curator.Post(postJson, this.options);
        $(post).bind('postClick',$.proxy(this.onPostClick, this));
        
        if (this.options.onPostCreated) {
            this.options.onPostCreated (post);
        }

        return post;
    };

    Grid.prototype.onPostsFailed = function onPostsFailed (data) {
        Curator.log("Grid->onPostsFailed");
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    };

    Grid.prototype.onPostClick = function onPostClick (ev,post) {
        this.popupManager.showPopup(post);
    };

    Grid.prototype.onMoreClicked = function onMoreClicked (ev) {
        ev.preventDefault();

        this.rowsMax ++;

        this.updateLayout();
    };

    Grid.prototype.destroy = function destroy () {
        Client.prototype.destroy.call(this);

        this.destroyHandlers();

        this.$container.empty()
            .removeClass('crt-grid')
            .removeClass('crt-grid-col'+this.previousCol)
            .css({'height':'','overflow':''});

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    };

    return Grid;
}(Client));

Curator.Grid = Grid;


Curator.Config.Custom = $.extend({}, Curator.Config.Defaults, {
});


var Custom = (function (superclass) {
    function Custom  (options) {
        superclass.call (this);

        this.containerHeight=0;
        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];
        this.totalPostsLoaded=0;
        this.allLoaded=false;

        this.setOptions (options,  Curator.Config.Custom);

        Curator.log("Panel->init with options:");
        Curator.log(this.options);

        if (this.init (this)) {
            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-custom');

            this.loadPosts(0);
        }
    }

    if ( superclass ) Custom.__proto__ = superclass;
    Custom.prototype = Object.create( superclass && superclass.prototype );
    Custom.prototype.constructor = Custom;

    Custom.prototype.onPostsLoaded = function onPostsLoaded (posts) {
        Curator.log("Custom->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            var that = this;
            var postElements = [];
            $(posts).each(function(){
                var p = that.createPostElement(this);
                postElements.push(p.$el);
                that.$feed.append(p.$el);
            });

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);
        }
    };

    Custom.prototype.onPostsFailed = function onPostsFailed (data) {
        Curator.log("Custom->onPostsFailed");
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    };

    Custom.prototype.onPostClick = function onPostClick (ev,post) {
        this.popupManager.showPopup(post);
    };

    Custom.prototype.destroy = function destroy () {
        superclass.prototype.destroy.call(this);

        this.$feed.remove();
        this.$container.removeClass('crt-custom');

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    };

    return Custom;
}(Curator.Client));


	return Curator;
}));