/* global window */

import CommonUtils from '/curator/utils/common';
import StringUtils from '/curator/utils/string';

let SocialFacebook = {
    share: function (post) {
        let obj = post,
            cb = function(){};
        obj.url = CommonUtils.postUrl(post);
        obj.cleanText = StringUtils.filterHtml(post.text);

        if (obj.url.indexOf('http') !== 0) {
            obj.url = obj.image;
        }
        // Disabling for now - doesn't work - seems to get error "Can't Load URL: The domain of this URL isn't
        // included in the app's domains"
        let useJSSDK = false; // window.FB
        if (useJSSDK) {
            window.FB.ui({
                method: 'feed',
                link: obj.url,
                picture: obj.image,
                name: obj.user_screen_name,
                description: obj.cleanText
            }, cb);
        } else {
            let url = "https://www.facebook.com/sharer/sharer.php?u={{url}}&d={{cleanText}}";
            let url2 = CommonUtils.tinyparser(url, obj);
            CommonUtils.popup(url2, 'twitter', '600', '430', '0');
        }
    }
};

export default SocialFacebook;
