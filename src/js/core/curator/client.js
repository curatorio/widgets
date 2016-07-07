
Curator.Client = augment.extend(Object, {
    constructor : function () {
        console.log('Client->construct');

    },
    init : function (options, defaults) {
        
        this.options = jQuery.extend({}, defaults,options);

        Curator.log(this.options);

        if (!Curator.checkContainer(this.options.container)) {
            return false;
        }

        this.$container = jQuery(this.options.container);

        if (!Curator.checkPowered(this.$container)) {
            return false;
        }

        this.createFeed();

        return true;
    },

    createFeed : function () {
        this.feed = new Curator.Feed ({
            debug:this.options.debug,
            feedId:this.options.feedId,
            postsPerPage:this.options.postsPerPage,
            apiEndpoint:this.options.apiEndpoint,
            onLoad:this.onLoadPosts.bind(this),
            onFail:this.onLoadPostsFail.bind(this)
        });
    },

    loadPost: function (postJson) {
        var post = new Curator.Post(postJson);
        jQuery(post).bind('postClick',jQuery.proxy(this.onPostClick, this));
        return post;
    },

    onLoadPosts: function (posts) {
        console.log('Client->onLoadPosts');
    },

    onLoadPostsFail: function (data) {
        console.log('Client->onLoadPostsFail');
    },

    onPostClick: function (ev,post) {
        this.popupManager.showPopup(post);
    }
});
//
// Curator.Waterfall = augment.extend(Curator.Client, {
//     constructor : function () {
//         console.log('Waterfall->construct');
//         console.log(this.uber);
//     }
// });

//
//
//
// var client = new Curator.Client(1);
// console.log(client.name());
//
//
// console.log(Curator.Waterfall);
//
// var client2 = new Curator.Waterfall(1);
// console.log(client2.name());
//



console.log('-=-=-=-=-=-=-=-=-');