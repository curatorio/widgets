

Curator.serialize = function serialize( obj ) {
    return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
};

Curator.ajax = function (url, params, success, fail) {
    let httpRegEx = /^https?:\/\//i;
    if (!httpRegEx.test(url)) {
        url = root.location.protocol+'//'+url;
    }

    // console.log (params);

    if (params) {
        url = url + Curator.serialize (params);
    }
    // console.log (url);

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
