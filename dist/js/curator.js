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
        this.popupManager.showPopup(post);
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
        if (this.filter) {
            this.filter.destroy()
        }
    };

    return Client;
}(EventBus));


Curator.Client = Client;


Curator.Events = {
    FEED_LOADED :'crt:feed:loaded',
    FILTER_CHANGED :'crt:filter:changed'
};
$.support.cors = true;

var defaults = {
    postsPerPage:24,
    feedId:'xxx',
    feedParams:{},
    debug:false,
    apiEndpoint:'https://api.curator.io/v1',
    onPostsLoaded:function(data){
        Curator.log('Feed->onPostsLoaded');
        Curator.log(data);
    },
    onPostsFail:function(data) {
        Curator.log('Feed->onPostsFail failed with message');
        Curator.log(data.message);
    }
};

var Feed = (function (EventBus) {
    function Feed(client) {
        EventBus.call (this);

        Curator.log ('Feed->init with options');

        this.client = client;

        this.posts = [];
        this.currentPage = 0;
        this.postsLoaded = 0;
        this.postCount = 0;
        this.loading = false;

        this.options = this.client.options;

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

                    this$1.posts = this$1.posts.concat(data.posts);
                    this$1.networks = data.networks;

                    this$1.client.trigger(Curator.Events.FEED_LOADED, data);
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

    this.popup.hide(function(){
        this.hide();
    }.bind(this));
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

        console.log(post.url);

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

    center : function (elementWidth, elementHeight, bound) {
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

    popup :  function (mypage, myname, w, h, scroll) {

        var
            position = this.center(w, h),
            settings = 'height=' + h + ',width=' + w + ',top=' + position.top +
                ',left=' + position.left + ',scrollbars=' + scroll +
                ',resizable';

        window.open(mypage, myname, settings);
    },

    tinyparser : function (string, obj) {

        return string.replace(/\{\{(.*?)\}\}/g, function (a, b) {
            return obj && typeof obj[b] !== "undefined" ? encodeURIComponent(obj[b]) : "";
        });
    }
};


Curator.DateUtils = {
    /**
     * Parse a date string in form DD/MM/YYYY HH:MM::SS - returns as UTC
     */
    dateFromString: function (time) {
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
    dateAsDayMonthYear: function (strEpoch) {
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
    dateAsTimeArray: function (strEpoch) {
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

    twitterLinks : function (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return Curator.StringUtils.url("https://twitter.com/"+username,u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            var tag = t.replace("#","%23");
            return Curator.StringUtils.url("https://twitter.com/search?q="+tag,t);
        });

        return s;
    },

    instagramLinks : function (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return Curator.StringUtils.url("https://www.instagram.com/"+username+'/',u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            var tag = t.replace("#","");
            return Curator.StringUtils.url("https://www.instagram.com/explore/tags/"+tag+'/',t);
        });

        return s;
    },

    facebookLinks : function (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return Curator.StringUtils.url("https://www.facebook.com/"+username+'/',u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            var tag = t.replace("#","%23");
            return Curator.StringUtils.url("https://www.facebook.com/search/top/?q="+tag,t);
        });

        return s;
    },

    linksToHref : function (s)
    {
        s = s.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
            return Curator.StringUtils.url(url);
        });

        return s;
    },

    url : function (s,t) {
        t = t || s;
        return '<a href="'+s+'" target="_blank">'+t+'</a>';
    },

    youtubeVideoId : function (url){
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

    vimeoVideoId : function (url){
        var regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/;
        var match = url.match(regExp);

        console.log (match);

        if (match && match.length>=2) {
            return match[1];
        }

        return false;
    },

    filterHtml : function (html) {
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

            if (this.options.scroll=='continuous') {
                $(this.$scroll).scroll(function () {
                    var height = this$1.$scroll.height();
                    var cHeight = this$1.$feed.height();
                    var scrollTop = this$1.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        this$1.loadMorePosts();
                    }
                });
            } else if (this.options.scroll=='none') {
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
            this.loadPosts(0);
        }
    }

    if ( superclass ) Waterfall.__proto__ = superclass;
    Waterfall.prototype = Object.create( superclass && superclass.prototype );
    Waterfall.prototype.constructor = Waterfall;

    Waterfall.prototype.loadPosts = function loadPosts (page, clear) {
        Curator.log('Waterfall->loadPage');
        if (clear) {
            this.$feed.find('.crt-post-c').remove();
        }
        this.feed.loadPosts(page);
    };

    Waterfall.prototype.loadMorePosts = function loadMorePosts () {
        Curator.log('Waterfall->loadMorePosts');

        this.feed.loadPosts(this.feed.currentPage+1);
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

        this.popupManager.setPosts(posts);

        this.loading = false;
        this.options.onPostsLoaded (this, posts);
    };

    Waterfall.prototype.onPostsFailed = function onPostsFailed (data) {
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    };

    Waterfall.prototype.destroy = function destroy () {
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
        this.totalPostsLoaded=0;
        this.allLoaded=false;
        this.previousCol=0;
        this.page=0;
        this.rowsShowing=0;

        if (this.init (this)) {

            var tmpl = Curator.Template.render('#gridFeedTemplate', {});
            this.$container.append(tmpl);
            this.$feed = this.$container.find('.crt-feed');
            this.$feedWindow = this.$container.find('.crt-feed-window');
            this.$loadMore = this.$container.find('.crt-feed-more a');

            this.$container.addClass('crt-grid');

            var cols = Math.floor(this.$container.width()/this.options.grid.minWidth);
            var postsNeeded = cols *  (this.options.grid.rows + 1); // get 1 extra row just in case

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

            this.rowsShowing = this.options.grid.rows;

            this.feed.options.postsPerPage = postsNeeded;
            this.loadPosts(0);
        }

        var to = null;
        var that = this;
        $(window).resize(function(){
            clearTimeout(to);
            to = setTimeout(function(){
                that.updateLayout();
            },100);
        });
        this.updateLayout ();

        $(window).on('curatorCssLoaded',function(){
            clearTimeout(to);
            to = setTimeout(function(){
                that.updateLayout();
            },100);
        });

        $(document).on('ready',function(){
            clearTimeout(to);
            to = setTimeout(function(){
                that.updateLayout();
            },100);
        });
    }

    if ( Client ) Grid.__proto__ = Client;
    Grid.prototype = Object.create( Client && Client.prototype );
    Grid.prototype.constructor = Grid;

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

            this.updateHeight();
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

        this.rowsShowing = this.rowsShowing + this.options.grid.rows;

        this.updateHeight(true);

        this.feed.loadMore();
    };

    Grid.prototype.updateLayout = function updateLayout ( ) {
        var cols = Math.floor(this.$container.width()/this.options.grid.minWidth);
        var postsNeeded = cols *  this.options.grid.rows;

        this.$container.removeClass('crt-grid-col'+this.previousCol);
        this.previousCol = cols;
        this.$container.addClass('crt-grid-col'+this.previousCol);

        if (postsNeeded > this.feed.postsLoaded) {
            this.loadPosts(this.feed.currentPage+1);
        }

        this.updateHeight();
    };

    Grid.prototype.updateHeight = function updateHeight (animate) {
        var postHeight = this.$container.find('.crt-post-c').width();
        this.$feedWindow.css({'overflow':'hidden'});

        var maxRows = Math.ceil(this.feed.postCount / this.previousCol);
        var rows = this.rowsShowing < maxRows ? this.rowsShowing : maxRows;

        if (animate) {
            this.$feedWindow.animate({height:rows * postHeight});
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
    };

    Grid.prototype.destroy = function destroy () {
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