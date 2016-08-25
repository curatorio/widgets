

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

        this.$el.find('.shareFacebook').click(jQuery.proxy(this.onShareFacebookClick,this));
        this.$el.find('.shareTwitter').click(jQuery.proxy(this.onShareTwitterClick,this));
        this.$el.find('.crt-hitarea').click(jQuery.proxy(this.onPostClick,this));

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
        jQuery(this).trigger('postClick',this, this.json, ev);
    }
});