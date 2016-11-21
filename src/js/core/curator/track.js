
Curator.Track = {

    track : function (action)
    {
        $.ajax({
            url: this.getUrl('/posts'),
            dataType: 'json',
            data: params,
            success: function (data) {
                Curator.log('Feed->_loadPosts success');

                if (data.success) {
                    that.postCount = data.postCount;
                    that.postsLoaded += data.posts.length;

                    that.posts = that.posts.concat(data.posts);

                    if (that.options.onPostsLoaded) {
                        that.options.onPostsLoaded(data.posts);
                    }
                } else {
                    if (that.options.onPostsFail) {
                        that.options.onPostsFail(data);
                    }
                }
                that.loading = false;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Curator.log('Feed->_loadPosts fail');
                Curator.log(textStatus);
                Curator.log(errorThrown);

                if (that.options.onPostsFail) {
                    that.options.onPostsFail();
                }
                that.loading = false;
            }
        });
    },

    getUrl : function (trail) {
        return this.feedBase+'/'+this.options.feedId+trail;
    }
};

