

/**
* ==================================================================
* Post
* ==================================================================
*/




Curator.Post = augment.extend(Object, {
    templateId:'#post-template',
    defaultTemplateId:'#post-template',

    constructor:function (postJson, templateId) {
        this.templateId = templateId || this.defaultTemplateId;

        this.json = postJson;
        this.$el = Curator.Template.render(this.templateId, postJson);

        this.$el.find('.shareFacebook').click($.proxy(this.onShareFacebookClick,this));
        this.$el.find('.shareTwitter').click($.proxy(this.onShareTwitterClick,this));
        this.$el.find('.crt-hitarea').click($.proxy(this.onPostClick,this));

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
    }
});