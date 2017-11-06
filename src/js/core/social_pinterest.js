
Curator.SocialPinterest = {
    share: function (post) {
        let obj = post;
        obj.url = Curator.Utils.postUrl(post);
        let url = "http://pinterest.com/pin/create/button/?url={{url}}&media={{image}}&description={{text}}";
        Curator.Utils.popup(Curator.Utils.tinyparser(url, obj), 'pintrest', '600', '270', '0');
    }
};