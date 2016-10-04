

/**
* ==================================================================
* Post
* ==================================================================
*/




Curator.Post = augment.extend(Object, {
    templateId:'#post-template',
    defaultTemplateId:'#post-template',

    constructor:function (postJson, options) {
        this.options = options;
        this.templateId = this.defaultTemplateId;
        // this.templateId = templateId || this.defaultTemplateId;

        this.json = postJson;
        this.$el = Curator.Template.render(this.templateId, postJson);

        this.$el.find('.shareFacebook').click($.proxy(this.onShareFacebookClick,this));
        this.$el.find('.shareTwitter').click($.proxy(this.onShareTwitterClick,this));
        this.$el.find('.crt-hitarea').click($.proxy(this.onPostClick,this));
        this.$el.find('.crt-post-read-more-button').click($.proxy(this.onReadMoreClick,this));
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
        return false;
    },

    onShareTwitterClick : function (ev) {
        ev.preventDefault();
        Curator.SocialTwitter.share(this.json);
        return false;
    },

    onPostClick : function (ev) {
        ev.preventDefault();
        $(this).trigger('postClick',this, this.json, ev);
    },

    onImageLoaded : function () {
        this.$image.animate({opacity:1});

        if (this.options.waterfall && this.options.waterfall.maxHeight > 0 && this.$post.height() > this.options.waterfall.maxHeight) {
            this.$post
                .css({maxHeight: this.options.waterfall.maxHeight})
                .addClass('crt-post-max-height');
        }
    },

    onReadMoreClick : function (ev) {
        ev.preventDefault();
        $(this).trigger('postReadMoreClick',this, this.json, ev);
    }
});