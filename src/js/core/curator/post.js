

/**
* ==================================================================
* Post
* ==================================================================
*/


Curator.Post = function (json) {

    this.init(json);
};

jQuery.extend(Curator.Post.prototype,{
    templateId:'#post-template',

    init:function (postJson) {
        this.json = postJson;
        this.$el = Curator.Template.render(this.templateId, postJson);

        this.$el.find('.shareFacebook').click(jQuery.proxy(this.onShareFacebookClick,this));
        this.$el.find('.shareTwitter').click(jQuery.proxy(this.onShareTwitterClick,this));
        this.$el.find('.crt-hitarea').click(jQuery.proxy(this.onPostClick,this));
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