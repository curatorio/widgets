;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('curator', ['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        root.Curator = factory(root.jQuery || root.Zepto);
    }
}(this, function($local) {

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
    }
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
    POST_LAYOUT_CHANGED     :'post:layoutChanged',

    CAROUSEL_CHANGED        :'carousel:changed',
    GRID_HEIGHT_CHANGED     :'grid:heightChanged',
};

var v1PopupUnderlayTemplate = '';

var v1PopupWrapperTemplate = ' \
<div class="crt-popup-wrapper"> \
    <div class="crt-popup-wrapper-c"> \
        <div class="crt-popup-underlay"></div> \
        <div class="crt-popup-container"></div> \
    </div> \
</div>';

var v1PopupTemplate = " \n<div class=\"crt-popup\"> \n    <a href=\"#\" class=\"crt-close crt-icon-cancel\"></a> \n    <a href=\"#\" class=\"crt-next crt-icon-right-open\"></a> \n    <a href=\"#\" class=\"crt-previous crt-icon-left-open\"></a> \n    <div class=\"crt-popup-left\">  \n        <div class=\"crt-video\"> \n            <div class=\"crt-video-container\">\n                <video preload=\"none\">\n                <source src=\"<%=video%>\" type=\"video/mp4\">\n                </video>\n                <img src=\"<%=image%>\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" />\n                <a href=\"javascript:;\" class=\"crt-play\"><i class=\"crt-play-icon\"></i></a> \n            </div> \n        </div> \n        <div class=\"crt-image\"> \n            <img src=\"<%=image%>\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /> \n        </div> \n        <div class=\"crt-pagination\"><ul></ul></div>\n    </div> \n    <div class=\"crt-popup-right\"> \n        <div class=\"crt-popup-header\"> \n            <span class=\"crt-social-icon\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n            <img src=\"<%=user_image%>\" alt=\"Profile image for <%=user_full_name%>\"  /> \n            <div class=\"crt-post-name\"><span><%=user_full_name%></span><br/><a href=\"<%=this.userUrl()%>\" target=\"_blank\">@<%=user_screen_name%></a></div> \n        </div> \n        <div class=\"crt-popup-text <%=this.contentTextClasses()%>\"> \n            <div class=\"crt-popup-text-container\"> \n                <p class=\"crt-date\"><%=this.prettyDate(source_created_at)%></p> \n                <a class=\"crt-link\" href=\"<%= this.networkIcon() == \"facebook\" ? url :\"\" %>\" target=\"_blank\"><%= this.networkIcon() == \"facebook\" ? \"Go to post\" :\"\" %></a>\n                <div class=\"crt-popup-text-body\"><%=this.parseText(text)%></div> \n            </div> \n        </div> \n        <div class=\"crt-popup-read-more\">\n            <a href=\"#\" class=\"crt-post-read-more-button\"><%=this._t(\"read-more\")%></a> \n        </div>\n        <div class=\"crt-popup-footer\">\n            <div class=\"crt-popup-stats\"><span><%=likes%></span> <%=this._t(\"likes\", likes)%> <i class=\"sep\"></i> <span><%=comments%></span> <%=this._t(\"comments\", comments)%></div> \n            <div class=\"crt-post-share\"><span class=\"ctr-share-hint\"></span><a href=\"#\" class=\"crt-share-facebook\"><i class=\"crt-icon-facebook\"></i></a>  <a href=\"#\" class=\"crt-share-twitter\"><i class=\"crt-icon-twitter\"></i></a></div>\n        </div> \n    </div> \n</div>";

var filterTemplate = "<div class=\"crt-filter\"> \n<div class=\"crt-filter-networks\">\n<ul class=\"crt-networks\"> \n    <li class=\"crt-filter-label\"><label><%=this._t('filter')%>:</label></li>\n    <li class=\"active\"><a href=\"#\" data-network=\"0\"> <%=this._t('all')%></a></li>\n</ul>\n</div> \n<div class=\"crt-filter-sources\">\n<ul class=\"crt-sources\"> \n    <li class=\"crt-filter-label\"><label><%=this._t('filter')%>:</label></li>\n    <li class=\"active\"><a href=\"#\" data-source=\"0\"> <%=this._t('all')%></a></li>\n</ul>\n</div> \n</div>";

var gridPostTemplate = " \n<div class=\"crt-post-c\">\n    <div class=\"crt-post post<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>\"> \n        <div class=\"crt-post-content\"> \n            <div class=\"crt-hitarea\" > \n                <img src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\" class=\"spacer\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /> \n                <div class=\"crt-post-content-image\" style=\"background-image:url('<%=image%>');\"></div> \n                <div class=\"crt-post-content-text-c\"> \n                    <div class=\"crt-post-content-text\"> \n                        <%=this.parseText(text)%> \n                    </div> \n                </div> \n                <a href=\"javascript:;\" class=\"crt-play\"><i class=\"crt-play-icon\"></i></a> \n                <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                <div class=\"crt-post-hover\">\n                    <div class=\"crt-post-header\"> \n                        <img src=\"<%=user_image%>\" alt=\"Profile image for <%=user_full_name%>\"  /> \n                        <div class=\"crt-post-name\"><span><%=user_full_name%></span><br/><a href=\"<%=this.userUrl()%>\" target=\"_blank\">@<%=user_screen_name%></a></div> \n                    </div> \n                    <div class=\"crt-post-hover-text\"> \n                        <%=this.parseText(text)%> \n                    </div> \n                    <span class=\"crt-social-icon crt-social-icon-hover\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                </div> \n            </div> \n        </div> \n    </div>\n</div>";

var template = " \n<div class=\"crt-post-v1 crt-post-c\">\n    <div class=\"crt-post-bg\"></div> \n    <div class=\"crt-post post<%=id%> crt-post-<%=this.networkIcon()%>\"> \n        <div class=\"crt-post-header\"> \n            <span class=\"crt-social-icon\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n            <img src=\"<%=user_image%>\" alt=\"Profile image for <%=user_full_name%>\"  /> \n            <div class=\"crt-post-name\">\n            <div class=\"crt-post-fullname\"><%=user_full_name%></div>\n            <div class=\"crt-post-username\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\">@<%=user_screen_name%></a></div>\n            </div> \n        </div> \n        <div class=\"crt-post-content\"> \n            <div class=\"crt-image crt-hitarea crt-post-content-image <%=this.contentImageClasses()%>\" > \n                <div class=\"crt-image-c\"><img src=\"<%=image%>\" class=\"crt-post-image\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /></div> \n                <span class=\"crt-play\"><i class=\"crt-play-icon\"></i></span> \n            </div> \n            <div class=\"text crt-post-content-text <%=this.contentTextClasses()%>\"> \n                <div class=\"crt-post-text-body\"><%=this.parseText(text)%></div> \n            </div> \n        </div> \n        <div class=\"crt-post-footer\">\n            <div class=\"crt-date\"><%=this.prettyDate(source_created_at)%></div> \n            <div class=\"crt-post-share\"><span class=\"crt-share-hint\"></span><a href=\"#\" class=\"crt-share-facebook\"><i class=\"crt-icon-facebook\"></i></a>  <a href=\"#\" class=\"crt-share-twitter\"><i class=\"crt-icon-twitter\"></i></a></div>\n        </div> \n        <div class=\"crt-post-read-more\"><a href=\"#\" class=\"crt-post-read-more-button\">Read more</a> </div> \n    </div>\n</div>";

var template$1 = " \n<div class=\"crt-post-v2 crt-post crt-post-<%=this.networkIcon()%> <%=this.contentTextClasses()%>  <%=this.contentImageClasses()%>\" data-post=\"<%=id%>\"> \n    <div class=\"crt-post-border\">\n        <div class=\"crt-post-c\">\n            <div class=\"crt-post-content\">\n                <div class=\"crt-image crt-hitarea crt-post-content-image\" > \n                    <div class=\"crt-image-c\"><img src=\"<%=image%>\" class=\"crt-post-image\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /></div>   \n                    <span class=\"crt-play\"><i class=\"crt-play-icon\"></i></span> \n                    <div class=\"crt-image-carousel\"><i class=\"crt-icon-image-carousel\"></i></div> \n                </div> \n                <div class=\"crt-post-header\"> \n                    <span class=\"crt-social-icon\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                    <div class=\"crt-post-fullname\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\"><%=user_full_name%></a></div>\n                </div> \n                <div class=\"text crt-post-content-text\"> \n                    <%=this.parseText(text)%> \n                </div> \n            </div> \n            <% if (options.showComments || options.showLikes) { %>\n                <div class=\"crt-comments-likes\">\n                    <% if (options.showLikes) { %><span><%=likes%></span> <%=this._t(\"likes\", likes)%><% } %><% if (options.showComments && options.showLikes) { %> <span class=\"crt-sep\"></span> <% } %><% if (options.showComments) { %><span><%=comments%></span> <%=this._t(\"comments\", comments)%><% } %>\n                </div>\n            <% } %>\n            <div class=\"crt-post-footer\"> \n                <img class=\"crt-post-userimage\" src=\"<%=user_image%>\" alt=\"Profile image for <%=user_screen_name%>\" /> \n                <span class=\"crt-post-username\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\">@<%=user_screen_name%></a></span>\n                <span class=\"crt-date\"><%=this.prettyDate(source_created_at)%></span> \n                <div class=\"crt-post-share\"><span class=\"crt-share-hint\"></span><a href=\"#\" class=\"crt-share-facebook\"><i class=\"crt-icon-facebook\"></i></a>  <a href=\"#\" class=\"crt-share-twitter\"><i class=\"crt-icon-twitter\"></i></a></div>\n            </div> \n            <div class=\"crt-post-max-height-read-more\"><a href=\"#\" class=\"crt-post-read-more-button\"><%=this._t(\"read-more\")%></a></div> \n        </div> \n    </div> \n</div>";

var template$2 = "\n<div class=\"crt-grid-post crt-grid-post-v2 crt-post-<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>\" data-post=\"<%=id%>\">     <div class=\"crt-post-c\"> \n        <div class=\"crt-post-content\"> \n            <div class=\"crt-hitarea\" > \n                <img src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\" class=\"crt-spacer\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /> \n                <div class=\"crt-grid-post-image\">\n                    <div class=\"crt-post-content-image\" style=\"background-image:url('<%=image%>');\"></div> \n                    <span class=\"crt-play\"><i class=\"crt-play-icon\"></i></span> \n                    <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                    <div class=\"crt-image-carousel\"><i class=\"crt-icon-image-carousel\"></i></div> \n                </div>\n                <div class=\"crt-grid-post-text\">\n                    <div class=\"crt-grid-post-text-wrap\"> \n                        <div><%=this.parseText(text)%></div> \n                    </div> \n                    <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                </div>\n                <div class=\"crt-post-hover\">\n                    <div>\n                        <div class=\"crt-post-header\"> \n                            <span class=\"crt-social-icon\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                            <div class=\"crt-post-fullname\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\"><%=user_full_name%></a></div>\n                        </div> \n                        <div class=\"crt-post-content-text\"> \n                            <%=this.parseText(text)%> \n                        </div> \n                        <div class=\"crt-post-read-more\"><a href=\"#\" class=\"crt-post-read-more-button\"><%=this._t(\"read-more\")%></a></div> \n                        <div class=\"crt-post-footer\">\n                            <img class=\"crt-post-userimage\" src=\"<%=user_image%>\" alt=\"Profile image for <%=user_full_name%>\" /> \n                            <span class=\"crt-post-username\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\">@<%=user_screen_name%></a></span>\n                            <span class=\"crt-date\"><%=this.prettyDate(source_created_at)%></span> \n                            <div class=\"crt-post-share\"><span class=\"crt-share-hint\"></span><a href=\"#\" class=\"crt-share-facebook\"><i class=\"crt-icon-facebook\"></i></a>  <a href=\"#\" class=\"crt-share-twitter\"><i class=\"crt-icon-twitter\"></i></a></div>\n                        </div> \n                    </div>\n                </div> \n            </div> \n        </div> \n    </div>\n</div>";

var v2GridFeedTemple = "\n<div class=\"crt-feed-window\">\n    <div class=\"crt-feed\"></div>\n</div>\n<div class=\"crt-load-more\"><a href=\"#\"><%=this._t(\"load-more\")%></a></div>";

var template$3 = "\n<div class=\"crt-grid-post crt-grid-post-minimal crt-grid-post-v2 crt-post-<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>\" data-post=\"<%=id%>\">     <div class=\"crt-post-c\"> \n        <div class=\"crt-post-content\"> \n            <div class=\"crt-hitarea\" > \n                <img src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\" class=\"crt-spacer\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /> \n                <div class=\"crt-grid-post-image\">\n                    <div class=\"crt-post-content-image\" style=\"background-image:url('<%=image%>');\"></div> \n                    <a href=\"javascript:;\" class=\"crt-play\"><i class=\"crt-play-icon\"></i></a> \n                    <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                    <div class=\"crt-image-carousel\"><i class=\"crt-icon-image-carousel\"></i></div> \n                </div>\n                <div class=\"crt-grid-post-text\">\n                    <div class=\"crt-grid-post-text-wrap\"> \n                        <div><%=this.parseText(text)%></div> \n                    </div> \n                    <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                </div>\n                <div class=\"crt-post-hover\">\n                    <div>\n                        <div class=\"crt-post-header\">\n                            <span class=\"crt-social-icon\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span>  \n                        </div> \n                        <div class=\"crt-post-minimal-stats\"> \n                            <span class=\"crt-likes\"><i class=\"crt-icon-heart\"></i>&nbsp;<%=likes%></span>\n                            <span class=\"crt-comments\"><i class=\"crt-icon-comment\"></i>&nbsp;<%=comments%></span>\n                        </div> \n                    </div> \n                </div> \n            </div> \n        </div> \n    </div>\n</div>";

var template$4 = "\n<div class=\"crt-feed-window\">\n    <div class=\"crt-feed\"></div>\n</div>\n<div class=\"crt-load-more\"><a href=\"#\"><%=this._t(\"load-more\")%></a></div>";

var template$5 = "\n<div class=\"crt-list-post crt-post-<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>\" data-post=\"<%=id%>\">     <div class=\"crt-post-c\"> \n        <div class=\"crt-post-content\"> \n            <div class=\"crt-list-post-image\">\n                <div>\n                <img class=\"crt-post-content-image\" src=\"<%=image%>\" alt=\"Image posted by <%=user_screen_name%> to <%=this.networkName()%>\" /> \n                <a href=\"javascript:;\" class=\"crt-play\"><i class=\"crt-play-icon\"></i></a> \n                <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span> \n                <span class=\"crt-image-carousel\"><i class=\"crt-icon-image-carousel\"></i></span>\n                </div> \n            </div>\n            <div class=\"crt-list-post-text\">\n                <div class=\"crt-post-header\"> \n                    <div class=\"crt-post-fullname\"><%=id%> - <a href=\"<%=this.userUrl()%>\" target=\"_blank\"><%=user_full_name%></a></div>\n                </div> \n                <div class=\"crt-list-post-text-wrap\"> \n                    <div><%=this.parseText(text)%></div> \n                </div> \n                <span class=\"crt-social-icon crt-social-icon-normal\"><i class=\"crt-icon-<%=this.networkIcon()%>\"></i></span>\n                 <div class=\"crt-post-footer\">\n                    <img class=\"crt-post-userimage\" src=\"<%=user_image%>\" alt=\"Profile image for <%=user_full_name%>\"/> \n                    <span class=\"crt-post-username\"><a href=\"<%=this.userUrl()%>\" target=\"_blank\">@<%=user_screen_name%></a></span>\n                    <span class=\"crt-date\"><%=this.prettyDate(source_created_at)%></span> \n                    <div class=\"crt-post-share\"><span class=\"crt-share-hint\"></span><a href=\"#\" class=\"crt-share-facebook\"><i class=\"crt-icon-facebook\"></i></a>  <a href=\"#\" class=\"crt-share-twitter\"><i class=\"crt-icon-twitter\"></i></a></div>\n                </div>  \n            </div>\n        </div> \n    </div>\n</div>";

// Note the .crt-feed-spacer below was added to fix issues where the feed didn't fill the full width of a browser when it (the feed
// is a child of a flex-box that doesn't grow correctly ... pretty hacky but it works :|
var template$6 = "\n<div class=\"crt-feed-scroll\">\n<div class=\"crt-feed\"><div class=\"crt-feed-spacer\">-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- </div></div>\n</div>\n<div class=\"crt-load-more\"><a href=\"#\"><span><%=this._t(\"load-more\")%></span></a></div>\n";

var Templates = {
    'filter'                : filterTemplate,
    'popup'                 : v1PopupTemplate,
    'popup-underlay'        : v1PopupUnderlayTemplate,
    'popup-wrapper'         : v1PopupWrapperTemplate,

    // V1
    'post-v1'               : template,
    'grid-post-v1'          : gridPostTemplate,

    // V2
    'post-v2'               : template$1,
    'grid-post-v2'          : template$2,
    'grid-post-minimal'     : template$3,
    'grid-feed-v2'          : v2GridFeedTemple,

    'list-feed'             : template$4,
    'list-post'             : template$5,

    'waterfall-feed'        : template$6,
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

var langsData = "\nid,en,de,it,nl,es,fr,po,ru,sl\nload-more,Load more,Mehr anzeigen,Di più,Laad meer,Cargar más,Voir plus,Carregar Mais,Загрузить больше,Prikaži več\nminutes-ago.1,{n} minute ago,Vor einer Minute,Un minuto fa,{n} minuut geleden,Hace un minuto,Il y a {n} minute,Tem um minuto,Одну минуту назад,pred {n} minuto\nminutes-ago.n,{n} minutes ago,Vor {n} Minuten,{n} minuti fa,{n} minuten geleden,Hace {n} minutos,Il y a {n} minutes,Tem {n} minutos,{n} минут назад,pred {n} minutami\nhours-ago.1,{n} hour ago,Vor einer Stunde,Un'ora fa,{n} uur geleden,Hace una hora,Il y a {n} heure,Tem {n} hora,Один час назад,pred {n} uro\nhours-ago.n,{n} hours ago,Vor {n} Stunden,{n} ore fa,{n} uren geleden,Hace {n} horas,Il y a {n} heures,Tem {n} horas,{n} часов назад,pred {n} urami\ndays-ago.1,{n} day ago,Vor einem Tag,Un giorno fa,{n} dag geleden,Hace un día,Il y a {n} jour,Faz um dia,Один день назад,pred {n} dnevom\ndays-ago.n,{n} days ago,Vor {n} Tagen,{n} giorni fa,{n} dagen geleden,Hace {n} días,Il y a {n} jours,Fazem {n} dias,{n} дней назад,pred {n} dnevi\nweeks-ago.1,{n} week ago,Vor einer Woche,Una settimana fa,{n} week geleden,Hace una semana,Il y a {n} semaine,Faz uma semana,Одну неделю назад,pred {n} tednom\nweeks-ago.n,{n} weeks ago,Vor {n} Wochen,{n} settimane fa,{n} weken geleden,Hace {n} semanas,Il y a {n} semaines,Fazem {n} semanas,{n} недель назад,pred {n} tedni\nmonths-ago.1,{n} month ago,Vor einem Monat,Un mese fa,{n} maand geleden,Hace un mes,Il y a {n} mois,Tem um mês,Один месяц назад,pred {n} mesecem\nmonths-ago.n,{n} months ago,Vor {n} Monaten,{n} mesi,{n} maanden geleden,Hace {n} meses,Il y a {n} mois,Tem {n} meses,{n} месяцев назад,pred {n} meseci\nyesterday,Yesterday,Gestern,Leri,Gisteren,Ayer,Hier,Ontem,Вчера,Včeraj\njust-now,Just now,Eben,Appena,Nu,Ahora,Il y a un instant,Agora,Только что,Pravkar\nprevious,Previous,Zurück,Indietro,Vorige,Anterior,Précédent,Anterior,Предыдущий,Prejšnji\nnext,Next,Weiter,Più,Volgende,Siguiente,Suivant,Próximo,Следующий,Naslednji\ncomments,Comments,Kommentare,Commenti,Comments,Comentarios,Commentaires,Comentários,Комментарии,Komentarji\nlikes,Likes,Gefällt mir,Mi piace,Likes,Me gusta,J'aime,Curtir,Лайки,Všečki\nread-more,Read more,Weiterlesen,Di più,Lees meer,Leer más,En savoir plus,Leia mais,Подробнее,Preberi več\nfilter,Filter,Filtern,filtrare,Filtreren,filtrar,filtrer,Filtro,фильтровать,Filter\nall,All,Alle,Tutti,Alle,Todas,Tout,Todos,все,Vsi\n";


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

        return _cache[lang](key, n);
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

// console.log(typeof $local);

if (typeof $local !== 'undefined')  {
    z = $local;
} else if (window.$crtZepto) {
    z = window.$crtZepto;
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
    renderTemplate: function renderTemplate (templateId, data, options) {

        if (options) {
            data.options = options;
        }

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

        return Templating.renderDiv(source, data);
    },

    renderDiv: function renderDiv (source, data) {
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
            Logger.log ('Template parse error: ' +e.message);
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
        this.$el = Templating.renderTemplate(templateId, postJson, this.widget.options);

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
        this.trigger(Events.POST_LAYOUT_CHANGED, this);
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
        } catch (e) {
        }

        return b;
    },

    isVisible: function isVisible (el) {
        if(el.css('display')!=='none' && el.css('visibility')!=='hidden' && el.width()>0) {
            return true;
        } else {
            return false;
        }
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
        this.params.hasPoweredBy = this.widget.hasPoweredBy;
        this.params.version = '1.2';

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

    /**
     * Loads new posts
     * @returns {boolean}
     */
    Feed.prototype.loadNewPosts = function loadNewPosts () {
        var this$1 = this;

        Logger.log ('Feed->loadNewPosts '+this.loading);

        if (this.loading) {
            return false;
        }
        this.currentPage = 0;

        var params = z$1.extend({},this.params);

        // TODO should we check we have after?
        if (this.pagination && this.pagination.before) {
            params.before = this.pagination.before;
            delete params.after;
        }

        // console.log(params.before);

        return new Promise (function (resolve, reject) {
            this$1.loading = true;

            params.rnd = (new Date ()).getTime();

            ajax.get(
                this$1.getUrl('/posts'),
                params,
                function (data) {
                    Logger.log('Feed->_loadPosts success');
                    this$1.loading = false;


                    if (data.success) {
                        // this.postCount = data.postCount;
                        // this.postsLoaded += data.posts.length;
                        //
                        // this.allPostsLoaded = this.postsLoaded >= this.postCount;
                        //
                        // this.posts = this.posts.concat(data.posts);
                        // this.networks = data.networks;
                        //
                        if (data.pagination && data.pagination.before) {
                            this$1.pagination.before = data.pagination.before;
                        }
                        //
                        // this.widget.trigger(Events.FEED_LOADED, data);
                        // this.trigger(Events.FEED_LOADED, data);
                        //
                        // this.widget.trigger(Events.POSTS_LOADED, data.posts);
                        // this.trigger(Events.POSTS_LOADED, data.posts);

                        // add to the beginning
                        if (data.posts.length > 0) {
                            this$1.posts = data.posts.concat(this$1.posts);
                        }

                        resolve (data.posts);
                    } else {
                        // this.trigger(Events.POSTS_FAILED, data);
                        // this.widget.trigger(Events.POSTS_FAILED, data);
                        reject();
                    }
                },
                function (jqXHR, textStatus, errorThrown) {
                    Logger.log('Feed->_loadNewPosts fail');
                    Logger.log(textStatus);
                    Logger.log(errorThrown);

                    this$1.trigger(Events.POSTS_FAILED, []);
                    this$1.loading = false;
                }
            );
        });
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
        id: 1,
        name:'Twitter',
        slug:'twitter',
        icon:'crt-icon-twitter'
    },
    2 : {
        id: 2,
        name:'Instagram',
        slug:'instagram',
        icon:'crt-icon-instagram'
    },
    3 : {
        id: 3,
        name:'Facebook',
        slug:'facebook',
        icon:'crt-icon-facebook'
    },
    4 : {
        id: 4,
        name:'Pinterest',
        slug:'pinterest',
        icon:'crt-icon-pinterest'
    },
    5 : {
        id: 5,
        name:'Google',
        slug:'google',
        icon:'crt-icon-google'
    },
    6 : {
        id: 6,
        name:'Vine',
        slug:'vine',
        icon:'crt-icon-vine'
    },
    7 : {
        id: 7,
        name:'Flickr',
        slug:'flickr',
        icon:'crt-icon-flickr'
    },
    8 : {
        id: 8,
        name:'Youtube',
        slug:'youtube',
        icon:'crt-icon-youtube'
    },
    9 : {
        id: 9,
        name:'Tumblr',
        slug:'tumblr',
        icon:'crt-icon-tumblr'
    },
    10 : {
        id: 10,
        name:'RSS',
        slug:'rss',
        icon:'crt-icon-rss'
    },
    11 : {
        id: 11,
        name:'LinkedIn',
        slug:'linkedin',
        icon:'crt-icon-linkedin'
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

    this.$popup.find('.crt-image img').attr('src',image.url);
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

        if (!options) {
            console.error('options missing');
            return false;
        }

        this.options = z$1.extend(true,{}, defaults, options);

        if(!options.container) {
            console.error('options.container missing');
            return false;
        }

        if (!HtmlUtils.checkContainer(this.options.container)) {
            return false;
        }
        this.$container = z$1(this.options.container);

        if (!this.options.feedId) {
            console.error('options.feedId missing');
        }

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

        this.checkPoweredBy ();
        this.createFeed();
        this.createFilter();
        this.createPopupManager();

        var crtEvent = {
            name:'crt:widget:created',
            data:{
                feedId:options.feedId
            }
        };

        window.postMessage(crtEvent, '*');

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

    Widget.prototype.checkPoweredBy = function checkPoweredBy () {
        var html = this.$container.text().trim();

        this.hasPoweredBy = html.indexOf('Powered by Curator.io') > -1;
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
    apiEndpoint: 'https://api.curator.io/v1.2',
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    templatePost:'post-v2',
    templatePopup:'popup',
    templatePopupWrapper:'popup-wrapper',
    templateFilter:'filter',
    lang:'en',
    debug:false,
    postClickAction:'open-popup',             // open-popup | goto-source | nothing
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
        animateSpeed:400,
        handleResize:true,
        templateFeed:'waterfall-feed'
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
 * A collection of shims that provide minimal functionality of the ES6 collections.
 *
 * These implementations are not meant to be used outside of the ResizeObserver
 * modules as they cover only a limited range of use cases.
 */
/* eslint-disable require-jsdoc, valid-jsdoc */
var MapShim = (function () {
    if (typeof Map !== 'undefined') {
        return Map;
    }

    /**
     * Returns index in provided array that matches the specified key.
     *
     * @param {Array<Array>} arr
     * @param {*} key
     * @returns {number}
     */
    function getIndex(arr, key) {
        var result = -1;

        arr.some(function (entry, index) {
            if (entry[0] === key) {
                result = index;

                return true;
            }

            return false;
        });

        return result;
    }

    return (function () {
        function anonymous() {
            this.__entries__ = [];
        }

        var prototypeAccessors = { size: { configurable: true } };

        /**
         * @returns {boolean}
         */
        prototypeAccessors.size.get = function () {
            return this.__entries__.length;
        };

        /**
         * @param {*} key
         * @returns {*}
         */
        anonymous.prototype.get = function (key) {
            var index = getIndex(this.__entries__, key);
            var entry = this.__entries__[index];

            return entry && entry[1];
        };

        /**
         * @param {*} key
         * @param {*} value
         * @returns {void}
         */
        anonymous.prototype.set = function (key, value) {
            var index = getIndex(this.__entries__, key);

            if (~index) {
                this.__entries__[index][1] = value;
            } else {
                this.__entries__.push([key, value]);
            }
        };

        /**
         * @param {*} key
         * @returns {void}
         */
        anonymous.prototype.delete = function (key) {
            var entries = this.__entries__;
            var index = getIndex(entries, key);

            if (~index) {
                entries.splice(index, 1);
            }
        };

        /**
         * @param {*} key
         * @returns {void}
         */
        anonymous.prototype.has = function (key) {
            return !!~getIndex(this.__entries__, key);
        };

        /**
         * @returns {void}
         */
        anonymous.prototype.clear = function () {
            this.__entries__.splice(0);
        };

        /**
         * @param {Function} callback
         * @param {*} [ctx=null]
         * @returns {void}
         */
        anonymous.prototype.forEach = function (callback, ctx) {
            var this$1 = this;
            if ( ctx === void 0 ) { ctx = null; }

            for (var i = 0, list = this$1.__entries__; i < list.length; i += 1) {
                var entry = list[i];

                callback.call(ctx, entry[1], entry[0]);
            }
        };

        Object.defineProperties( anonymous.prototype, prototypeAccessors );

        return anonymous;
    }());
})();

/**
 * Detects whether window and document objects are available in current environment.
 */
var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && window.document === document;

// Returns global object of a current environment.
var global$1 = (function () {
    if (typeof global !== 'undefined' && global.Math === Math) {
        return global;
    }

    if (typeof self !== 'undefined' && self.Math === Math) {
        return self;
    }

    if (typeof window !== 'undefined' && window.Math === Math) {
        return window;
    }

    // eslint-disable-next-line no-new-func
    return Function('return this')();
})();

/**
 * A shim for the requestAnimationFrame which falls back to the setTimeout if
 * first one is not supported.
 *
 * @returns {number} Requests' identifier.
 */
var requestAnimationFrame$1 = (function () {
    if (typeof requestAnimationFrame === 'function') {
        // It's required to use a bounded function because IE sometimes throws
        // an "Invalid calling object" error if rAF is invoked without the global
        // object on the left hand side.
        return requestAnimationFrame.bind(global$1);
    }

    return function (callback) { return setTimeout(function () { return callback(Date.now()); }, 1000 / 60); };
})();

// Defines minimum timeout before adding a trailing call.
var trailingTimeout = 2;

/**
 * Creates a wrapper function which ensures that provided callback will be
 * invoked only once during the specified delay period.
 *
 * @param {Function} callback - Function to be invoked after the delay period.
 * @param {number} delay - Delay after which to invoke callback.
 * @returns {Function}
 */
var throttle = function (callback, delay) {
    var leadingCall = false,
        trailingCall = false,
        lastCallTime = 0;

    /**
     * Invokes the original callback function and schedules new invocation if
     * the "proxy" was called during current request.
     *
     * @returns {void}
     */
    function resolvePending() {
        if (leadingCall) {
            leadingCall = false;

            callback();
        }

        if (trailingCall) {
            proxy();
        }
    }

    /**
     * Callback invoked after the specified delay. It will further postpone
     * invocation of the original function delegating it to the
     * requestAnimationFrame.
     *
     * @returns {void}
     */
    function timeoutCallback() {
        requestAnimationFrame$1(resolvePending);
    }

    /**
     * Schedules invocation of the original function.
     *
     * @returns {void}
     */
    function proxy() {
        var timeStamp = Date.now();

        if (leadingCall) {
            // Reject immediately following calls.
            if (timeStamp - lastCallTime < trailingTimeout) {
                return;
            }

            // Schedule new call to be in invoked when the pending one is resolved.
            // This is important for "transitions" which never actually start
            // immediately so there is a chance that we might miss one if change
            // happens amids the pending invocation.
            trailingCall = true;
        } else {
            leadingCall = true;
            trailingCall = false;

            setTimeout(timeoutCallback, delay);
        }

        lastCallTime = timeStamp;
    }

    return proxy;
};

// Minimum delay before invoking the update of observers.
var REFRESH_DELAY = 20;

// A list of substrings of CSS properties used to find transition events that
// might affect dimensions of observed elements.
var transitionKeys = ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'];

// Check if MutationObserver is available.
var mutationObserverSupported = typeof MutationObserver !== 'undefined';

/**
 * Singleton controller class which handles updates of ResizeObserver instances.
 */
var ResizeObserverController = function() {
    this.connected_ = false;
    this.mutationEventsAdded_ = false;
    this.mutationsObserver_ = null;
    this.observers_ = [];

    this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
    this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
};

/**
 * Adds observer to observers list.
 *
 * @param {ResizeObserverSPI} observer - Observer to be added.
 * @returns {void}
 */


/**
 * Holds reference to the controller's instance.
 *
 * @private {ResizeObserverController}
 */


/**
 * Keeps reference to the instance of MutationObserver.
 *
 * @private {MutationObserver}
 */

/**
 * Indicates whether DOM listeners have been added.
 *
 * @private {boolean}
 */
ResizeObserverController.prototype.addObserver = function (observer) {
    if (!~this.observers_.indexOf(observer)) {
        this.observers_.push(observer);
    }

    // Add listeners if they haven't been added yet.
    if (!this.connected_) {
        this.connect_();
    }
};

/**
 * Removes observer from observers list.
 *
 * @param {ResizeObserverSPI} observer - Observer to be removed.
 * @returns {void}
 */
ResizeObserverController.prototype.removeObserver = function (observer) {
    var observers = this.observers_;
    var index = observers.indexOf(observer);

    // Remove observer if it's present in registry.
    if (~index) {
        observers.splice(index, 1);
    }

    // Remove listeners if controller has no connected observers.
    if (!observers.length && this.connected_) {
        this.disconnect_();
    }
};

/**
 * Invokes the update of observers. It will continue running updates insofar
 * it detects changes.
 *
 * @returns {void}
 */
ResizeObserverController.prototype.refresh = function () {
    var changesDetected = this.updateObservers_();

    // Continue running updates if changes have been detected as there might
    // be future ones caused by CSS transitions.
    if (changesDetected) {
        this.refresh();
    }
};

/**
 * Updates every observer from observers list and notifies them of queued
 * entries.
 *
 * @private
 * @returns {boolean} Returns "true" if any observer has detected changes in
 *  dimensions of it's elements.
 */
ResizeObserverController.prototype.updateObservers_ = function () {
    // Collect observers that have active observations.
    var activeObservers = this.observers_.filter(function (observer) {
        return observer.gatherActive(), observer.hasActive();
    });

    // Deliver notifications in a separate cycle in order to avoid any
    // collisions between observers, e.g. when multiple instances of
    // ResizeObserver are tracking the same element and the callback of one
    // of them changes content dimensions of the observed target. Sometimes
    // this may result in notifications being blocked for the rest of observers.
    activeObservers.forEach(function (observer) { return observer.broadcastActive(); });

    return activeObservers.length > 0;
};

/**
 * Initializes DOM listeners.
 *
 * @private
 * @returns {void}
 */
ResizeObserverController.prototype.connect_ = function () {
    // Do nothing if running in a non-browser environment or if listeners
    // have been already added.
    if (!isBrowser || this.connected_) {
        return;
    }

    // Subscription to the "Transitionend" event is used as a workaround for
    // delayed transitions. This way it's possible to capture at least the
    // final state of an element.
    document.addEventListener('transitionend', this.onTransitionEnd_);

    window.addEventListener('resize', this.refresh);

    if (mutationObserverSupported) {
        this.mutationsObserver_ = new MutationObserver(this.refresh);

        this.mutationsObserver_.observe(document, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMSubtreeModified', this.refresh);

        this.mutationEventsAdded_ = true;
    }

    this.connected_ = true;
};

/**
 * Removes DOM listeners.
 *
 * @private
 * @returns {void}
 */
ResizeObserverController.prototype.disconnect_ = function () {
    // Do nothing if running in a non-browser environment or if listeners
    // have been already removed.
    if (!isBrowser || !this.connected_) {
        return;
    }

    document.removeEventListener('transitionend', this.onTransitionEnd_);
    window.removeEventListener('resize', this.refresh);

    if (this.mutationsObserver_) {
        this.mutationsObserver_.disconnect();
    }

    if (this.mutationEventsAdded_) {
        document.removeEventListener('DOMSubtreeModified', this.refresh);
    }

    this.mutationsObserver_ = null;
    this.mutationEventsAdded_ = false;
    this.connected_ = false;
};

/**
 * "Transitionend" event handler.
 *
 * @private
 * @param {TransitionEvent} event
 * @returns {void}
 */
ResizeObserverController.prototype.onTransitionEnd_ = function (ref) {
        var propertyName = ref.propertyName; if ( propertyName === void 0 ) { propertyName = ''; }

    // Detect whether transition may affect dimensions of an element.
    var isReflowProperty = transitionKeys.some(function (key) {
        return !!~propertyName.indexOf(key);
    });

    if (isReflowProperty) {
        this.refresh();
    }
};

/**
 * Returns instance of the ResizeObserverController.
 *
 * @returns {ResizeObserverController}
 */
ResizeObserverController.getInstance = function () {
    if (!this.instance_) {
        this.instance_ = new ResizeObserverController();
    }

    return this.instance_;
};

ResizeObserverController.instance_ = null;

/**
 * Defines non-writable/enumerable properties of the provided target object.
 *
 * @param {Object} target - Object for which to define properties.
 * @param {Object} props - Properties to be defined.
 * @returns {Object} Target object.
 */
var defineConfigurable = (function (target, props) {
    for (var i = 0, list = Object.keys(props); i < list.length; i += 1) {
        var key = list[i];

        Object.defineProperty(target, key, {
            value: props[key],
            enumerable: false,
            writable: false,
            configurable: true
        });
    }

    return target;
});

/**
 * Returns the global object associated with provided element.
 *
 * @param {Object} target
 * @returns {Object}
 */
var getWindowOf = (function (target) {
    // Assume that the element is an instance of Node, which means that it
    // has the "ownerDocument" property from which we can retrieve a
    // corresponding global object.
    var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;

    // Return the local global object if it's not possible extract one from
    // provided element.
    return ownerGlobal || global$1;
});

// Placeholder of an empty content rectangle.
var emptyRect = createRectInit(0, 0, 0, 0);

/**
 * Converts provided string to a number.
 *
 * @param {number|string} value
 * @returns {number}
 */
function toFloat(value) {
    return parseFloat(value) || 0;
}

/**
 * Extracts borders size from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @param {...string} positions - Borders positions (top, right, ...)
 * @returns {number}
 */
function getBordersSize(styles) {
    var arguments$1 = arguments;

    var positions = [], len = arguments.length - 1;
    while ( len-- > 0 ) { positions[ len ] = arguments$1[ len + 1 ]; }

    return positions.reduce(function (size, position) {
        var value = styles['border-' + position + '-width'];

        return size + toFloat(value);
    }, 0);
}

/**
 * Extracts paddings sizes from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @returns {Object} Paddings box.
 */
function getPaddings(styles) {
    var positions = ['top', 'right', 'bottom', 'left'];
    var paddings = {};

    for (var i = 0, list = positions; i < list.length; i += 1) {
        var position = list[i];

        var value = styles['padding-' + position];

        paddings[position] = toFloat(value);
    }

    return paddings;
}

/**
 * Calculates content rectangle of provided SVG element.
 *
 * @param {SVGGraphicsElement} target - Element content rectangle of which needs
 *      to be calculated.
 * @returns {DOMRectInit}
 */
function getSVGContentRect(target) {
    var bbox = target.getBBox();

    return createRectInit(0, 0, bbox.width, bbox.height);
}

/**
 * Calculates content rectangle of provided HTMLElement.
 *
 * @param {HTMLElement} target - Element for which to calculate the content rectangle.
 * @returns {DOMRectInit}
 */
function getHTMLElementContentRect(target) {
    // Client width & height properties can't be
    // used exclusively as they provide rounded values.
    var clientWidth = target.clientWidth;
    var clientHeight = target.clientHeight;

    // By this condition we can catch all non-replaced inline, hidden and
    // detached elements. Though elements with width & height properties less
    // than 0.5 will be discarded as well.
    //
    // Without it we would need to implement separate methods for each of
    // those cases and it's not possible to perform a precise and performance
    // effective test for hidden elements. E.g. even jQuery's ':visible' filter
    // gives wrong results for elements with width & height less than 0.5.
    if (!clientWidth && !clientHeight) {
        return emptyRect;
    }

    var styles = getWindowOf(target).getComputedStyle(target);
    var paddings = getPaddings(styles);
    var horizPad = paddings.left + paddings.right;
    var vertPad = paddings.top + paddings.bottom;

    // Computed styles of width & height are being used because they are the
    // only dimensions available to JS that contain non-rounded values. It could
    // be possible to utilize the getBoundingClientRect if only it's data wasn't
    // affected by CSS transformations let alone paddings, borders and scroll bars.
    var width = toFloat(styles.width),
        height = toFloat(styles.height);

    // Width & height include paddings and borders when the 'border-box' box
    // model is applied (except for IE).
    if (styles.boxSizing === 'border-box') {
        // Following conditions are required to handle Internet Explorer which
        // doesn't include paddings and borders to computed CSS dimensions.
        //
        // We can say that if CSS dimensions + paddings are equal to the "client"
        // properties then it's either IE, and thus we don't need to subtract
        // anything, or an element merely doesn't have paddings/borders styles.
        if (Math.round(width + horizPad) !== clientWidth) {
            width -= getBordersSize(styles, 'left', 'right') + horizPad;
        }

        if (Math.round(height + vertPad) !== clientHeight) {
            height -= getBordersSize(styles, 'top', 'bottom') + vertPad;
        }
    }

    // Following steps can't be applied to the document's root element as its
    // client[Width/Height] properties represent viewport area of the window.
    // Besides, it's as well not necessary as the <html> itself neither has
    // rendered scroll bars nor it can be clipped.
    if (!isDocumentElement(target)) {
        // In some browsers (only in Firefox, actually) CSS width & height
        // include scroll bars size which can be removed at this step as scroll
        // bars are the only difference between rounded dimensions + paddings
        // and "client" properties, though that is not always true in Chrome.
        var vertScrollbar = Math.round(width + horizPad) - clientWidth;
        var horizScrollbar = Math.round(height + vertPad) - clientHeight;

        // Chrome has a rather weird rounding of "client" properties.
        // E.g. for an element with content width of 314.2px it sometimes gives
        // the client width of 315px and for the width of 314.7px it may give
        // 314px. And it doesn't happen all the time. So just ignore this delta
        // as a non-relevant.
        if (Math.abs(vertScrollbar) !== 1) {
            width -= vertScrollbar;
        }

        if (Math.abs(horizScrollbar) !== 1) {
            height -= horizScrollbar;
        }
    }

    return createRectInit(paddings.left, paddings.top, width, height);
}

/**
 * Checks whether provided element is an instance of the SVGGraphicsElement.
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
var isSVGGraphicsElement = (function () {
    // Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
    // interface.
    if (typeof SVGGraphicsElement !== 'undefined') {
        return function (target) { return target instanceof getWindowOf(target).SVGGraphicsElement; };
    }

    // If it's so, then check that element is at least an instance of the
    // SVGElement and that it has the "getBBox" method.
    // eslint-disable-next-line no-extra-parens
    return function (target) { return target instanceof getWindowOf(target).SVGElement && typeof target.getBBox === 'function'; };
})();

/**
 * Checks whether provided element is a document element (<html>).
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
function isDocumentElement(target) {
    return target === getWindowOf(target).document.documentElement;
}

/**
 * Calculates an appropriate content rectangle for provided html or svg element.
 *
 * @param {Element} target - Element content rectangle of which needs to be calculated.
 * @returns {DOMRectInit}
 */
function getContentRect(target) {
    if (!isBrowser) {
        return emptyRect;
    }

    if (isSVGGraphicsElement(target)) {
        return getSVGContentRect(target);
    }

    return getHTMLElementContentRect(target);
}

/**
 * Creates rectangle with an interface of the DOMRectReadOnly.
 * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
 *
 * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and dimensions.
 * @returns {DOMRectReadOnly}
 */
function createReadOnlyRect(ref) {
    var x = ref.x;
    var y = ref.y;
    var width = ref.width;
    var height = ref.height;

    // If DOMRectReadOnly is available use it as a prototype for the rectangle.
    var Constr = typeof DOMRectReadOnly !== 'undefined' ? DOMRectReadOnly : Object;
    var rect = Object.create(Constr.prototype);

    // Rectangle's properties are not writable and non-enumerable.
    defineConfigurable(rect, {
        x: x, y: y, width: width, height: height,
        top: y,
        right: x + width,
        bottom: height + y,
        left: x
    });

    return rect;
}

/**
 * Creates DOMRectInit object based on the provided dimensions and the x/y coordinates.
 * Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
 *
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} width - Rectangle's width.
 * @param {number} height - Rectangle's height.
 * @returns {DOMRectInit}
 */
function createRectInit(x, y, width, height) {
    return { x: x, y: y, width: width, height: height };
}

/**
 * Class that is responsible for computations of the content rectangle of
 * provided DOM element and for keeping track of it's changes.
 */
var ResizeObservation = function(target) {
    this.broadcastWidth = 0;
    this.broadcastHeight = 0;
    this.contentRect_ = createRectInit(0, 0, 0, 0);

    this.target = target;
};

/**
 * Updates content rectangle and tells whether it's width or height properties
 * have changed since the last broadcast.
 *
 * @returns {boolean}
 */


/**
 * Reference to the last observed content rectangle.
 *
 * @private {DOMRectInit}
 */


/**
 * Broadcasted width of content rectangle.
 *
 * @type {number}
 */
ResizeObservation.prototype.isActive = function () {
    var rect = getContentRect(this.target);

    this.contentRect_ = rect;

    return rect.width !== this.broadcastWidth || rect.height !== this.broadcastHeight;
};

/**
 * Updates 'broadcastWidth' and 'broadcastHeight' properties with a data
 * from the corresponding properties of the last observed content rectangle.
 *
 * @returns {DOMRectInit} Last observed content rectangle.
 */
ResizeObservation.prototype.broadcastRect = function () {
    var rect = this.contentRect_;

    this.broadcastWidth = rect.width;
    this.broadcastHeight = rect.height;

    return rect;
};

var ResizeObserverEntry = function(target, rectInit) {
    var contentRect = createReadOnlyRect(rectInit);

    // According to the specification following properties are not writable
    // and are also not enumerable in the native implementation.
    //
    // Property accessors are not being used as they'd require to define a
    // private WeakMap storage which may cause memory leaks in browsers that
    // don't support this type of collections.
    defineConfigurable(this, { target: target, contentRect: contentRect });
};

var ResizeObserverSPI = function(callback, controller, callbackCtx) {
    this.activeObservations_ = [];
    this.observations_ = new MapShim();

    if (typeof callback !== 'function') {
        throw new TypeError('The callback provided as parameter 1 is not a function.');
    }

    this.callback_ = callback;
    this.controller_ = controller;
    this.callbackCtx_ = callbackCtx;
};

/**
 * Starts observing provided element.
 *
 * @param {Element} target - Element to be observed.
 * @returns {void}
 */


/**
 * Registry of the ResizeObservation instances.
 *
 * @private {Map<Element, ResizeObservation>}
 */


/**
 * Public ResizeObserver instance which will be passed to the callback
 * function and used as a value of it's "this" binding.
 *
 * @private {ResizeObserver}
 */

/**
 * Collection of resize observations that have detected changes in dimensions
 * of elements.
 *
 * @private {Array<ResizeObservation>}
 */
ResizeObserverSPI.prototype.observe = function (target) {
    if (!arguments.length) {
        throw new TypeError('1 argument required, but only 0 present.');
    }

    // Do nothing if current environment doesn't have the Element interface.
    if (typeof Element === 'undefined' || !(Element instanceof Object)) {
        return;
    }

    if (!(target instanceof getWindowOf(target).Element)) {
        throw new TypeError('parameter 1 is not of type "Element".');
    }

    var observations = this.observations_;

    // Do nothing if element is already being observed.
    if (observations.has(target)) {
        return;
    }

    observations.set(target, new ResizeObservation(target));

    this.controller_.addObserver(this);

    // Force the update of observations.
    this.controller_.refresh();
};

/**
 * Stops observing provided element.
 *
 * @param {Element} target - Element to stop observing.
 * @returns {void}
 */
ResizeObserverSPI.prototype.unobserve = function (target) {
    if (!arguments.length) {
        throw new TypeError('1 argument required, but only 0 present.');
    }

    // Do nothing if current environment doesn't have the Element interface.
    if (typeof Element === 'undefined' || !(Element instanceof Object)) {
        return;
    }

    if (!(target instanceof getWindowOf(target).Element)) {
        throw new TypeError('parameter 1 is not of type "Element".');
    }

    var observations = this.observations_;

    // Do nothing if element is not being observed.
    if (!observations.has(target)) {
        return;
    }

    observations.delete(target);

    if (!observations.size) {
        this.controller_.removeObserver(this);
    }
};

/**
 * Stops observing all elements.
 *
 * @returns {void}
 */
ResizeObserverSPI.prototype.disconnect = function () {
    this.clearActive();
    this.observations_.clear();
    this.controller_.removeObserver(this);
};

/**
 * Collects observation instances the associated element of which has changed
 * it's content rectangle.
 *
 * @returns {void}
 */
ResizeObserverSPI.prototype.gatherActive = function () {
        var this$1 = this;

    this.clearActive();

    this.observations_.forEach(function (observation) {
        if (observation.isActive()) {
            this$1.activeObservations_.push(observation);
        }
    });
};

/**
 * Invokes initial callback function with a list of ResizeObserverEntry
 * instances collected from active resize observations.
 *
 * @returns {void}
 */
ResizeObserverSPI.prototype.broadcastActive = function () {
    // Do nothing if observer doesn't have active observations.
    if (!this.hasActive()) {
        return;
    }

    var ctx = this.callbackCtx_;

    // Create ResizeObserverEntry instance for every active observation.
    var entries = this.activeObservations_.map(function (observation) {
        return new ResizeObserverEntry(observation.target, observation.broadcastRect());
    });

    this.callback_.call(ctx, entries, ctx);
    this.clearActive();
};

/**
 * Clears the collection of active observations.
 *
 * @returns {void}
 */
ResizeObserverSPI.prototype.clearActive = function () {
    this.activeObservations_.splice(0);
};

/**
 * Tells whether observer has active observations.
 *
 * @returns {boolean}
 */
ResizeObserverSPI.prototype.hasActive = function () {
    return this.activeObservations_.length > 0;
};

// Registry of internal observers. If WeakMap is not available use current shim
// for the Map collection as it has all required methods and because WeakMap
// can't be fully polyfilled anyway.
var observers = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();

/**
 * ResizeObserver API. Encapsulates the ResizeObserver SPI implementation
 * exposing only those methods and properties that are defined in the spec.
 */
var ResizeObserver = function(callback) {
    if (!(this instanceof ResizeObserver)) {
        throw new TypeError('Cannot call a class as a function.');
    }
    if (!arguments.length) {
        throw new TypeError('1 argument required, but only 0 present.');
    }

    var controller = ResizeObserverController.getInstance();
    var observer = new ResizeObserverSPI(callback, controller, this);

    observers.set(this, observer);
};

// Expose public methods of ResizeObserver.
['observe', 'unobserve', 'disconnect'].forEach(function (method) {
    ResizeObserver.prototype[method] = function () {
        return (ref = observers.get(this))[method].apply(ref, arguments);
        var ref;
    };
});

var index = (function () {
    // Export existing implementation if available.
    if (typeof global$1.ResizeObserver !== 'undefined') {
        return global$1.ResizeObserver;
    }

    return ResizeObserver;
})();

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
    Logger.log("WaterfallLayout->constructor");
    this.element = z$1(element);
    this.id = CommonUtils.uId ();

    // let container = this;
    this.name = this._setName(5);
    this.gridArr = [];
    this.gridArrAppend = [];
    this.gridArrPrepend = [];
    this.setArr = false;
    this.setGrid = false;
    this.cols = -1;
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
    this.visible = false;

    // this.element.is(':visible')

    // build columns
    // this._setCols(1);
    this.resize();
    // build grid
    // this._renderGrid('append');
    // add class 'gridalicious' to container
    // z(this.box).addClass('gridalicious');

    this.createHandlers ();

    this.$spacer = this.element.find('.crt-feed-spacer');

    this.$spacer.remove();
};

LayoutWaterfall.prototype.createHandlers = function createHandlers () {
        var this$1 = this;

    Logger.log("WaterfallLayout->createHandlers");

    this.resizeDebounced = CommonUtils.debounce( function () {
        this$1.resize();
    }, 100);

    if (this.options.handleResize) {
        this.ro = new index(function (entries, observer) {
            if (entries.length > 0) {
                // let entry = entries[0];

                this$1.redraw();
            }
        });

        this.ro.observe(this.element[0]);
    }
    this.redraw();
};

LayoutWaterfall.prototype.destroyHandlers = function destroyHandlers () {
    Logger.log("WaterfallLayout->destroyHandlers");

    if (this.ro) {
        this.ro.disconnect();
    }

};

LayoutWaterfall.prototype.redraw = function redraw () {
    this.resizeDebounced ();
};

LayoutWaterfall.prototype._setName = function _setName (length, current) {
    current = current ? current : '';
    return length ? this._setName(--length, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 60)) + current) : current;
};

LayoutWaterfall.prototype._setCols = function _setCols (newCols) {
        var this$1 = this;

    Logger.log("WaterfallLayout->_setCols "+newCols);
    // calculate columns
    var boxWidth = this.box.width();
    Logger.log('boxWidth: '+boxWidth);
    this.cols = newCols;
    //If Cols lower than 1, the grid disappears
    if (this.cols < 1) {
        this.cols = 1;
    }
    var diff = (boxWidth - (this.cols * this.options.width) - this.options.gutter) / this.cols;
    var colWidth = (this.options.width + diff) / boxWidth * 100;

    Logger.log('colWidth: '+colWidth);

    if (colWidth < 0 || colWidth > 100) {
        colWidth = 100;
    }
    this.w = colWidth;
    this.colHeights = new Array(this.cols);
    this.colHeights.fill(0);
    this.colItems = new Array(this.cols);
    this.colItems.fill([]);

    // delete columns in box
    this.box.find('.galcolumn').remove();
    // build columns

    // add columns to box
    for (var i = 0; i < this.cols; i++) {
        var div = z$1('<div></div>').addClass('galcolumn').attr('id', 'item' + i + this$1.name).css({
            'width': colWidth + '%',
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
            z$1.each(items, function (index$$1, value) {
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
            z$1.each(items, function (index$$1, value) {
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
            z$1.each(items, function (index$$1, value) {
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
        z$1.each(items, function (index$$1, value) {
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
    z$1.each(newItems, function (index$$1, value) {
        gridArr.unshift(value);
    });
    this.gridArr = gridArr;
};

LayoutWaterfall.prototype.resize = function resize () {
    Logger.log("WaterfallLayout->resize");

    var newCols = Math.floor(this.box.width() / this.options.width);

    if (newCols < 1) {
        newCols = 1;
    }

    Logger.log('newCols:'+newCols);
    Logger.log('oldCol:'+this.cols);

    if (this.cols === newCols) {
        // nothings changed yet
        // console.log('NOTHING CHANGED');
        return;
    }

    if (!HtmlUtils.isVisible(this.element)) {
        // console.log('NOT VISIBLE');
        this.visible = false;
        return;
    }

    // if (newCols > 1) {
    // return;
    // }

    this.visible = true;
    this.ifCallback = false;
    this.isResizing = true;

    this._setCols(newCols);
    // build grid
    this._renderGrid('append');
    this.ifCallback = true;
    this.isResizing = false;
    this.boxWidth = this.box.width();
};

LayoutWaterfall.prototype.append = function append (items) {
    var gridArr = this.gridArr;
    var gridArrAppend = this.gridArrPrepend;
    z$1.each(items, function (index$$1, value) {
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
            // console.log('TEST');
            var tmpl = Templating.renderTemplate(this.options.waterfall.templateFeed, {});
            this.$container.append(tmpl);

            this.$scroll = this.$container.find('.crt-feed-scroll');
            this.$feed = this.$container.find('.crt-feed');
            this.$container.addClass('crt-widget-waterfall');
            this.$loadMore = this.$container.find('.crt-load-more');

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
                var $aLoadMore = this.$loadMore.find('a');
                $aLoadMore.on('click', function (ev) {
                    ev.preventDefault();
                    this$1.loadMorePosts();
                });
            } else {
                this.$loadMore.remove();
            }

            this.ui = new LayoutWaterfall({
                selector:'.crt-post-c',
                gutter:0,
                width:this.options.waterfall.gridWidth,
                animate:this.options.waterfall.animate,
                handleResize:this.options.waterfall.handleResize,
                animationOptions: {
                    speed: (this.options.waterfall.animateSpeed/2),
                    duration: this.options.waterfall.animateSpeed
                }
            }, this.$feed);

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
                this.$loadMore.hide();
            } else {
                this.$loadMore.show();
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
        if (this.$loadMore) {
            this.$loadMore.remove();
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
                this.rowsMax += this.responsiveOptions.list.loadMoreRows;
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
        loadMoreRows:1,
        continuousScroll:false,
        continuousScrollOffset:50,
        hover:{
            showName:true,
            showFooter:true,
            showText:true,
        }
    },
    responsive:{
        480:{
            grid:{
                loadMoreRows:4
            }
        },
        768:{
            grid:{
                loadMoreRows:2
            }
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

        this.trigger(Events.GRID_HEIGHT_CHANGED,this);
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
                this.rowsMax += this.responsiveOptions.grid.loadMoreRows;
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

        this.rowsMax += this.responsiveOptions.grid.loadMoreRows;

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
    function LayoutCarousel (widget, container, options) {
		Logger.log('LayoutCarousel->construct');

        EventBus$$1.call (this);

        this.id = CommonUtils.uId ();
        this.widget = widget;
		this.currentPost = 0;
		this.animating = false;
		this.timeout = null;
		this.PANES_VISIBLE = 0;
		this.PANE_WIDTH = 0;
		this.posts = [];
		this.paneCache = {};
        this.$panes = [];

		this.options = z$1.extend({}, LayoutCarouselSettings, options);

		// Validate options
        if (!this.options.minWidth || this.options.minWidth < 100) {
            this.options.minWidth = LayoutCarouselSettings.minWidth;
		}

		this.$viewport = z$1(container); // <div> slider, known as $viewport

		this.$stage = z$1('<div class="crt-carousel-stage"></div>').appendTo(this.$viewport);
		this.$paneSlider = z$1('<div class="crt-carousel-slider"></div>').appendTo(this.$stage);

		if (this.options.matchHeights) {
            this.$stage.addClass('crt-match-heights');
        }

		this.addControls();
		this.createHandlers();
	}

    if ( EventBus$$1 ) LayoutCarousel.__proto__ = EventBus$$1;
    LayoutCarousel.prototype = Object.create( EventBus$$1 && EventBus$$1.prototype );
    LayoutCarousel.prototype.constructor = LayoutCarousel;

    LayoutCarousel.prototype.addControls = function addControls () {
        this.$viewport.append('<button type="button" data-role="none" class="crt-panel-prev crt-panel-arrow" aria-label="Previous" role="button" aria-disabled="false">Previous</button>');
        this.$viewport.append('<button type="button" data-role="none" class="crt-panel-next crt-panel-arrow" aria-label="Next" role="button" aria-disabled="false">Next</button>');

        this.$viewport.on('click','.crt-panel-prev', this.prev.bind(this));
        this.$viewport.on('click','.crt-panel-next', this.next.bind(this));
    };

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

	LayoutCarousel.prototype.addPosts = function addPosts (posts) {
        Logger.log('LayoutCarousel->addPosts '+posts.length);
        var firstLoad = this.posts.length === 0;
		this.posts = this.posts.concat(posts);

		if (firstLoad) {
            this.calcSizes();

            this.currentPost = 0;

            this.updatePanes();

			var x = 0-(this.PANES_VISIBLE * this.PANE_WIDTH);
            this.$paneSlider.width (this.PANE_WIDTH * (this.PANES_VISIBLE * 3));
            this.$paneSlider.css({'transform': 'translate3d('+x+'px, 0px, 0px)'});

			this.updateHeight();

            if (this.options.autoPlay) {
                this.tick();
            }
		}
	};

	LayoutCarousel.prototype.calcSizes = function calcSizes () {

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
	};

	LayoutCarousel.prototype.updatePanes = function updatePanes () {
        var this$1 = this;


        var panes = this.createPanes();

        this.$paneSlider.empty();

        var currentIds = [];

        for(var i = 0, list = panes; i < list.length; i += 1) {
            var pane = list[i];

            this$1.$paneSlider.append(pane.$el);
            currentIds.push(pane.paneIndex);
        }

        this.currentPanes = panes;

        // TODO - clean up cache - needs work
        // console.log('----- clean cache -----');
        // // clean up cache
        // let keys = Object.keys(this.paneCache);
        // let start  = this.currentPost - (this.PANES_VISIBLE * 2);
        // let end  = this.currentPost + (this.PANES_VISIBLE * 3);
        // console.log('start '+start);
        // console.log('end '+end);
        // for (let key of keys) {
        //     let pos = key.replace('idx','');
        //     if (pos < start || pos > end) {
        //         console.log('cleaning '+key);
        //         if (this.paneCache[key]) {
        //             this.paneCache[key].destroy();
        //             delete this.paneCache[key];
        //         }
        //     } else {
        //         console.log('keeping '+key);
        //     }
        // }
	};

	LayoutCarousel.prototype.createPanes = function createPanes () {
        var this$1 = this;


        var panes = [];
        var start  = this.currentPost - this.PANES_VISIBLE;
        for (var counter = 0 ; counter < this.PANES_VISIBLE * 3; counter++) {
            var postObject = this$1.getPane(start + counter);

            z$1(postObject.$el).css( {width: this$1.PANE_WIDTH+'px'});

            panes.push(postObject);
        }

        return panes;
	};

    LayoutCarousel.prototype.getPane = function getPane (paneIndex) {

        var postToLoad = paneIndex;
        if (paneIndex < 0) {
            postToLoad = this.posts.length + paneIndex;
        } else if (paneIndex > this.posts.length - 1) {
            postToLoad = paneIndex % this.posts.length;
        }

        // console.log(paneIndex + " : " + postToLoad );

        var pane = null;
        if (this.paneCache['idx'+paneIndex]) {
            // console.log('cache hit '+paneIndex);
            pane = this.paneCache['idx'+paneIndex];
        } else {
            // console.log('cache miss '+paneIndex);
            var post = this.posts[postToLoad];
            pane = this.widget.createPostElement(post);
            pane.on(Events.POST_LAYOUT_CHANGED,this.onPostLayoutChanged.bind(this));
            this.paneCache['idx'+paneIndex] = pane;
        }

        pane.paneIndex = 'idx'+paneIndex;
        return pane;
    };

    LayoutCarousel.prototype.resize = function resize () {
	    var this$1 = this;

	    var oldPanesVisible = this.PANES_VISIBLE;

		this.calcSizes();

        this.$paneSlider.width (this.PANE_WIDTH * (this.PANES_VISIBLE * 3));

        if (oldPanesVisible !== this.PANES_VISIBLE)
        {
            // layout needs changing
            this.updatePanes();
        } else {
            // just resize current panes
            for (var i = 0 ; i < this.currentPanes.length ; i++) {
                this$1.currentPanes[i].$el.css( {width: this$1.PANE_WIDTH+'px'});
            }
        }

        var x = 0-(this.PANES_VISIBLE * this.PANE_WIDTH);
        this.$paneSlider.width (this.PANE_WIDTH * (this.PANES_VISIBLE * 3));
        this.$paneSlider.css({'transform': 'translate3d('+x+'px, 0px, 0px)'});
	};

	LayoutCarousel.prototype.updateLayout = function updateLayout () {
        this.resize();
        this.move (0, true);

        // reset animation timer
        if (this.options.autoPlay) {
            this.tick();
        }
	};

	LayoutCarousel.prototype.tick = function tick () {
		var this$1 = this;

		window.clearTimeout(this.timeout);
		this.timeout = window.setTimeout(function () {
			this$1.next();
		}, this.options.speed);
	};

	LayoutCarousel.prototype.next = function next () {
		var move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE;
		this.move(move, false);
	};

	LayoutCarousel.prototype.prev = function prev () {
		var move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE;
		this.move(0 - move, false);
	};

	LayoutCarousel.prototype.move = function move (moveAmt, noAnimate) {
        Logger.log('LayoutCarousel->move currentPost:'+this.currentPost+' moveAmt:'+moveAmt);
        var previousPost = this.currentPost;
		var newPost = this.currentPost + moveAmt;
        this.animating = true;

		if (this.options.infinite) {
            if (newPost < 0) {
                newPost = this.posts.length + newPost;
            } else if (newPost > this.posts.length) {
                newPost = newPost - this.posts.length;
            }
        } else {
            if (newPost < 0) {
                newPost = 0;
            } else if (newPost > (this.posts.length - this.PANES_VISIBLE)) {
                newPost = this.posts.length - this.PANES_VISIBLE;
            }
            moveAmt = newPost - previousPost;
		}

		this.currentPost = newPost;

		if (moveAmt) {

            var x = (0 - (this.PANES_VISIBLE * this.PANE_WIDTH)) - (moveAmt * this.PANE_WIDTH);

            if (noAnimate) {
                this.$paneSlider.removeClass('crt-animate-transform');
                this.$paneSlider.css({'transform': 'translate3d(' + x + 'px, 0px, 0px)'});
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
                // this.$paneSlider.addClass('crt-animate-transform');
                // this.$paneSlider.animate({'transform': 'translate3d('+x+'px, 0px, 0px)'},
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
                    this.$paneSlider.addClass('crt-animate-transform');
                    this.$paneSlider.animate({'transform': 'translate3d('+x+'px, 0px, 0px)'},
                        options
                    );
                } else {
                    // Jquery doesn't animate transform
                    options.step = function(now, fx) {
                        z$1(this).css('-webkit-transform','translate3d('+now+'px, 0px, 0px)');
                        z$1(this).css('-moz-transform','translate3d('+now+'px, 0px, 0px)');
                        z$1(this).css('transform','translate3d('+now+'px, 0px, 0px)');
                    };

                    this.$paneSlider.addClass('crt-animate-transform');
                    this.$paneSlider.animate({'transformX': x},
                        options
                    );
                }
            }
        }
	};

	LayoutCarousel.prototype.moveComplete = function moveComplete () {
        var this$1 = this;

        Logger.log('LayoutCarousel->moveComplete');

        window.setTimeout(function () {
			this$1.updateHeight();
		}, 50);

		this.updatePanes();

		// reset x position
        var x = 0-(this.PANES_VISIBLE * this.PANE_WIDTH);
        this.$paneSlider.css({'transform': 'translate3d('+x+'px, 0px, 0px)'});

        // trigger change event
		this.trigger(Events.CAROUSEL_CHANGED, this, this.currentPost);

		if (this.options.autoPlay) {
			this.tick();
		}
	};

	LayoutCarousel.prototype.updateHeight = function updateHeight () {
        Logger.log('LayoutCarousel->updateHeight');

        var paneMaxHeight = this.getMaxHeight();

        if (this.$stage.height() !== paneMaxHeight) {
            this.$stage.animate({height: paneMaxHeight}, 300);
        }

        if (this.options.matchHeights) {
        	this.setPaneHeights ();
        }
	};

	LayoutCarousel.prototype.setPaneHeights = function setPaneHeights () {
        var this$1 = this;

        Logger.log('LayoutCarousel->setPaneHeights ');

        if (this.options.matchHeights) {
            var paneMaxHeight = this.getMaxHeight();
            var h = paneMaxHeight - 2;

            for (var i = 0, list = this$1.currentPanes; i < list.length; i += 1)
            {
                var pane = list[i];

                var $pane = pane.$el;
                // TODO - could move this to ui.post
                $pane.find('.crt-post-c').animate({height: h}, 300);
            }
        }
	};

	LayoutCarousel.prototype.getMaxHeight = function getMaxHeight () {
        var this$1 = this;

        Logger.log('LayoutCarousel->getMaxHeight ');

        var paneMaxHeight = 0;
        var min = this.PANES_VISIBLE;
        var max = min + this.PANES_VISIBLE;
        for (var i = min; i < max; i++)
        {
        	if (this$1.currentPanes[i]) {
                // let $pane = this.currentPanes[i].$el;
                var h = this$1.currentPanes[i].getHeight();

                // Logger.log('LayoutCarousel->updateHeight i: '+i+' = '+h);
                if (h > paneMaxHeight) {
                    paneMaxHeight = h;
                }
            }
        }

        Logger.log(paneMaxHeight);

        return paneMaxHeight;
	};

    LayoutCarousel.prototype.onPostLayoutChanged = function onPostLayoutChanged (post) {
	    var this$1 = this;

	    window.clearTimeout(this.postLayoutChangedTO);
	    this.postLayoutChangedTO = window.setTimeout(function (){
	        this$1.updateHeight ();
        },100);
    };

	LayoutCarousel.prototype.reset = function reset () {
        window.clearTimeout(this.timeout);
        this.$paneSlider.empty();
        this.$paneSlider.css({'transform': 'translate3d(0px, 0px, 0px)'});
        this.posts = [];
        this.currentPost = 0;
        this.paneCache = [];
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

        options.postsPerPage = 100;

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

            this.carousel = new LayoutCarousel(this, this.$feed, this.options.carousel);
            this.carousel.on(Events.CAROUSEL_CHANGED, this.onCarouselChange.bind(this));

            this.on(Events.FILTER_CHANGED, function () {
                this$1.carousel.reset ();
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
            this.carousel.addPosts(posts);

            this.popupManager.setPosts(posts);
        }
        this.firstLoad = false;
    };

    Carousel.prototype.onCarouselChange = function onCarouselChange (event, carouselLayout, currentSlide) {
        Logger.log("Carousel->onCarouselChange currentSlide: "+currentSlide);
        if (this.options && this.options.carousel.autoLoad) {
            var pos = this.feed.postsLoaded - (this.carousel.PANES_VISIBLE * 2);
            if (currentSlide >= pos) {
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

            this.carousel = new LayoutCarousel(this, this.$feed, this.options.panel);
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
            this.carousel.addPosts(posts);

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
