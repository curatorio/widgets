

/**
* ==================================================================
* Post
* ==================================================================
*/


class Post {

    constructor (postJson, options, widget) {
        this.options = options;
        this.widget = widget;

        let templateId = this.widget.options.templatePost;

        this.json = postJson;
        this.$el = Curator.Template.render(templateId, postJson);

        this.$el.find('.crt-share-facebook').click(this.onShareFacebookClick.bind(this));
        this.$el.find('.crt-share-twitter').click(this.onShareTwitterClick.bind(this));
        // this.$el.find('.crt-hitarea').click(this.onPostClick.bind(this));
        this.$el.find('.crt-post-read-more-button').click(this.onReadMoreClick.bind(this));
        // this.$el.on('click','.crt-post-text-body a',this.onLinkClick.bind(this));
        this.$el.click(this.onPostClick.bind(this));
        this.$post = this.$el.find('.crt-post');
        this.$image = this.$el.find('.crt-post-image');
        this.$imageContainer = this.$el.find('.crt-image-c');
        this.$image.css({opacity:0});

        if (this.json.image) {
            this.$image.on('load', this.onImageLoaded.bind(this));
            this.$image.on('error', this.onImageError.bind(this));
        } else {
            // no image ... call this.onImageLoaded
            setTimeout(() => {
                this.setHeight();
            },100)
        }

        if (this.json.image_width > 0) {
            let p = (this.json.image_height/this.json.image_width)*100;
            this.$imageContainer.addClass('crt-image-responsive')
                .css('padding-bottom',p+'%')
        }

        this.$image.data('dims',this.json.image_width+':'+this.json.image_height);

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
        } else {
            ev.preventDefault();
            $(this).trigger('postClick', this, this.json, ev);
        }

    }

    onImageLoaded () {
        this.$image.animate({opacity:1});

        this.setHeight();
    }

    onImageError () {
        // Unable to load image!!!
        this.$image.hide();

        this.setHeight();
    }

    setHeight () {
        let height = this.$post.height();
        if (this.options.maxHeight && this.options.maxHeight > 0 && height > this.options.maxHeight) {
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