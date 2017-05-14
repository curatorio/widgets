/* global FB */

Curator.SocialFacebook = {
    share: function (post) {
        let obj = post;
        obj.url = Curator.Utils.postUrl(post);
        obj.cleanText = Curator.StringUtils.filterHtml(post.text);
        let cb =  function(){};

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
            let url2 = Curator.Utils.tinyparser(url, obj);
            Curator.Utils.popup(url2, 'twitter', '600', '430', '0');
        }
    }
};
