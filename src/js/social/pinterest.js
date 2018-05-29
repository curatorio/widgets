
import CommonUtils from '../utils/common';

let SocialPinterest = {
    share: function (post) {
        let url = "http://pinterest.com/pin/create/button/?url={{url}}&media={{image}}&description={{text}}";
        let obj = post;
        obj.url = CommonUtils.postUrl(post);
        CommonUtils.popup(CommonUtils.tinyparser(url, obj), 'pintrest', '600', '270', '0');
    }
};

export default SocialPinterest;