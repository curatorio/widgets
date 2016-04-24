/* global FB */


Curator.SocialFacebook = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        var cb =  function(){};

        FB.ui({
            method: 'feed',
            link: obj.url,
            picture: obj.image,
            name: obj.user_screen_name,
            description: obj.text
        }, cb);
    }
};