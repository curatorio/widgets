

Curator.serialize = function serialize( obj ) {
    return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
};

Curator.ajax = function (url, params, success, fail) {
    let p = root.location.protocol,
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
