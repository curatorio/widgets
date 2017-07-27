/**
 * Props to https://github.com/yanatan16/nanoajax
 */

(function(global){
    // Best place to find information on XHR features is:
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

    let reqfields = [
        'responseType', 'withCredentials', 'timeout', 'onprogress'
    ];

    function nanoajax (params, callback) {
        // Any variable used more than once is var'd here because
        // minification will munge the variables whereas it can't munge
        // the object access.
        let headers = params.headers || {}
            , body = params.body
            , method = params.method || (body ? 'POST' : 'GET')
            , called = false

        let req = getRequest(params.cors)

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

        let success = req.onload = cb(200)
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

        for (let i = 0, len = reqfields.length, field; i < len; i++) {
            field = reqfields[i]
            if (params[field] !== undefined)
                req[field] = params[field]
        }

        for (let field in headers)
            req.setRequestHeader(field, headers[field])

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