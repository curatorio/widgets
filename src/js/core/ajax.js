import nanoajax from '../libraries/nanoajax';

let serialize = function serialize( obj ) {
    return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a;},[]).join('&');
};

let fixUrl = function (url) {
    let p = window.location.protocol,
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

let ajax = {
    get (url, params, success, fail) {
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

    post (url, params, success, fail) {
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

export default ajax;