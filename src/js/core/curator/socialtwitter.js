

Curator.SocialTwitter = {
    share: function (post) {
        let obj = post;
        obj.url = Curator.Utils.postUrl(post);
        obj.cleanText = Curator.StringUtils.filterHtml(post.text);

        let url = "http://twitter.com/share?url={{url}}&text={{cleanText}}&hashtags={{hashtags}}";
        console.log (url);
        let url2 = Curator.Utils.tinyparser(url, obj);
        // console.log(obj);
        // console.log(url);
        // console.log(url2);
        Curator.Utils.popup(url2, 'twitter', '600', '430', '0');
    }
};