
Curator.Config.Custom = $.extend({}, Curator.Config.Defaults, {
});


class Custom extends Widget {

    constructor  (options) {
        super ();

        this.containerHeight=0;
        this.loading=false;
        this.feed=null;
        this.$container=null;
        this.$feed=null;
        this.posts=[];
        this.totalPostsLoaded=0;
        this.allLoaded=false;

        this.setOptions (options,  Curator.Config.Custom);

        Logger.log("Panel->init with options:");
        Logger.log(this.options);

        if (this.init (this)) {
            this.$feed = z('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-custom');

            this.loadPosts(0);
        }
    }

    onPostsLoaded (event, posts) {
        Logger.log("Custom->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            let that = this;
            let postElements = [];
            z(posts).each(function(){
                let p = that.createPostElement(this);
                postElements.push(p.$el);
                that.$feed.append(p.$el);
            });

            this.popupManager.setPosts(posts);
        }
    }

    onPostClick (ev,post) {
        this.popupManager.showPopup(post);
    }

    destroy  () {
        super.destroy();

        this.feed.destroy();

        this.$feed.remove();
        this.$container.removeClass('crt-custom');

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }
}
