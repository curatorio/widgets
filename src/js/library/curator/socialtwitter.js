

Curator.SocialTwitter = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);

        var url = "http://twitter.com/share?url={{url}}&text={{text}}&hashtags={{hashtags}}";
        Curator.Utils.popup(Curator.Utils.tinyparser(url, obj), 'twitter', '600', '430', '0');
    }
};