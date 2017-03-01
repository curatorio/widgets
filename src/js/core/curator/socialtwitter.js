

Curator.SocialTwitter = {
    share: function (post) {
        let obj = post;
        obj.url = Curator.Utils.postUrl(post);

        let url = "http://twitter.com/share?url={{url}}&text={{text}}&hashtags={{hashtags}}";
        let url2 = Curator.Utils.tinyparser(url, obj);
        // console.log(obj);
        // console.log(url);
        // console.log(url2);
        Curator.Utils.popup(url2, 'twitter', '600', '430', '0');
    }
};