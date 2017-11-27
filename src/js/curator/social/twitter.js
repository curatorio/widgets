

import CommonUtils from "../utils/common";
import StringUtils from "../utils/string";

let SocialTwitter = {
    share: function (post) {
        let obj = post;
        obj.url = CommonUtils.postUrl(post);
        obj.cleanText = StringUtils.filterHtml(post.text);

        let url = "http://twitter.com/share?url={{url}}&text={{cleanText}}&hashtags={{hashtags}}";
        let url2 = CommonUtils.tinyparser(url, obj);
        CommonUtils.popup(url2, 'twitter', '600', '430', '0');
    }
};

export default SocialTwitter;