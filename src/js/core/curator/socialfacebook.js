/* global FB */

Curator.SocialFacebook = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        var cb =  function(){};

        if (window.FB) {
            window.FB.ui({
                method: 'feed',
                link: obj.url,
                picture: obj.image,
                name: obj.user_screen_name,
                description: obj.text
            }, cb);
        } else {
            var url = "https://www.facebook.com/sharer/sharer.php?u={{url}}&d={{text}}";
            var url2 = Curator.Utils.tinyparser(url, obj);
            console.log(obj);
            console.log(url);
            console.log(url2);
            Curator.Utils.popup(url2, 'twitter', '600', '430', '0');
        }
    }
};
