

/**
* ==================================================================
* Post
* ==================================================================
*/


class Post {

    constructor (postJson, options, widget) {
        this.options = options;
        this.widget = widget;

        this.templateId = this.options.postTemplate;

        this.json = postJson;
        this.$el = Curator.Template.render(this.templateId, postJson);

        this.$el.find('.crt-share-facebook').click($.proxy(this.onShareFacebookClick,this));
        this.$el.find('.crt-share-twitter').click($.proxy(this.onShareTwitterClick,this));
        // this.$el.find('.crt-hitarea').click($.proxy(this.onPostClick,this));
        this.$el.find('.crt-post-read-more-button').click($.proxy(this.onReadMoreClick,this));
        // this.$el.on('click','.crt-post-text-body a',$.proxy(this.onLinkClick,this));
        this.$el.click($.proxy(this.onPostClick,this));
        this.$post = this.$el.find('.crt-post');
        this.$image = this.$el.find('.crt-post-image');
        this.$image.css({opacity:0});

        this.$image.on('load',$.proxy(this.onImageLoaded,this));

        this.$post = this.$el.find('.crt-post');

        if (this.json.video) {
            this.$post.addClass('has-video');
        }
    }

    onShareFacebookClick (ev) {
        ev.preventDefault();
        Curator.SocialFacebook.share(this.json);
        this.widget.track('share:facebook');
        return false;
    }

    onShareTwitterClick (ev) {
        ev.preventDefault();
        Curator.SocialTwitter.share(this.json);
        this.widget.track('share:twitter');
        return false;
    }

    onPostClick (ev) {

        let target = $(ev.target);

        if (target.is('a') && target.attr('href') !== '#') {
            this.widget.track('click:link');
            console.log ('link');
        } else {
            ev.preventDefault();
            console.log('post');
            $(this).trigger('postClick', this, this.json, ev);
        }

    }

    onImageLoaded () {
        this.$image.animate({opacity:1});

        if (this.options.maxHeight && this.options.maxHeight > 0 && this.$post.height() > this.options.maxHeight) {
            this.$post
                .css({maxHeight: this.options.maxHeight})
                .addClass('crt-post-max-height');
        }
    }

    onReadMoreClick (ev) {
        ev.preventDefault();
        this.widget.track('click:read-more');
        $(this).trigger('postReadMoreClick',this, this.json, ev);
    }
}

Curator.Post = Post;