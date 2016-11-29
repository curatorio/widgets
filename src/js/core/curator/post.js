

/**
* ==================================================================
* Post
* ==================================================================
*/




Curator.Post = augment.extend(Object, {
    templateId:'#post-template',
    defaultTemplateId:'#post-template',

    constructor:function (postJson, options, widget) {
        this.options = options;
        this.widget = widget;

        this.templateId = options.postTemplate ? options.postTemplate : this.defaultTemplateId;
        // this.templateId = templateId || this.defaultTemplateId;

        this.json = postJson;
        this.$el = Curator.Template.render(this.templateId, postJson);

        this.$el.find('.crt-share-facebook').click($.proxy(this.onShareFacebookClick,this));
        this.$el.find('.crt-share-twitter').click($.proxy(this.onShareTwitterClick,this));
        this.$el.find('.crt-hitarea').click($.proxy(this.onPostClick,this));
        this.$el.find('.crt-post-read-more-button').click($.proxy(this.onReadMoreClick,this));
        this.$el.on('click','.crt-post-text-body a',$.proxy(this.onLinkClick,this));
        this.$post = this.$el.find('.crt-post');
        this.$image = this.$el.find('.crt-post-image');
        this.$image.css({opacity:0});

        this.$image.on('load',$.proxy(this.onImageLoaded,this));

        this.$post = this.$el.find('.crt-post');

        if (this.json.video) {
            this.$post.addClass('has-video');
        }
    },

    onShareFacebookClick : function (ev) {
        ev.preventDefault();
        Curator.SocialFacebook.share(this.json);
        this.widget.track('share:facebook');
        return false;
    },

    onShareTwitterClick : function (ev) {
        ev.preventDefault();
        Curator.SocialTwitter.share(this.json);
        this.widget.track('share:twitter');
        return false;
    },

    onPostClick : function (ev) {
        ev.preventDefault();
        $(this).trigger('postClick',this, this.json, ev);
    },

    onLinkClick : function (ev) {
        this.widget.track('click:link');
    },

    onImageLoaded : function () {
        this.$image.animate({opacity:1});

        if (this.options.maxHeight && this.options.maxHeight > 0 && this.$post.height() > this.options.maxHeight) {
            this.$post
                .css({maxHeight: this.options.maxHeight})
                .addClass('crt-post-max-height');
        }
    },

    onReadMoreClick : function (ev) {
        ev.preventDefault();
        this.widget.track('click:read-more');
        $(this).trigger('postReadMoreClick',this, this.json, ev);
    }
});