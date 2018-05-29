
let CommonUtils = {
    postUrl (post)
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

    center (w, h, bound) {
        let s = window.screen,
            b = bound || {},
            bH = b.height || s.height,
            bW = b.width || s.height;

        return {
            top: (bH) ? (bH - h) / 2 : 0,
            left: (bW) ? (bW - w) / 2 : 0
        };
    },

    popup (mypage, myname, w, h, scroll) {

        let position = this.center(w, h),
            settings = 'height=' + h + ',width=' + w + ',top=' + position.top +
                ',left=' + position.left + ',scrollbars=' + scroll +
                ',resizable';

        window.open(mypage, myname, settings);
    },

    tinyparser (string, obj) {
        return string.replace(/\{\{(.*?)\}\}/g, function (a, b) {
            return obj && typeof obj[b] !== "undefined" ? encodeURIComponent(obj[b]) : "";
        });
    },

    debounce (func, wait, immediate) {
        let timeout;
        return function() {
            let context = this, args = arguments;
            let later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            window.clearTimeout(timeout);
            timeout = window.setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },

    uId () {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    }
};

export default CommonUtils;