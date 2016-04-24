/**
* ==================================================================
* Popup
* ==================================================================
*/


Curator.PopupInappropriate = function (post,feed) {
    this.init(post,feed);
};

jQuery.extend(Curator.PopupInappropriate.prototype, {
    feed: null,
    post:null,

    init: function (post,feed) {
        var that = this;

        this.feed = feed;
        this.post = post;
        
        this.jQueryel = jQuery('.mark-bubble');

        jQuery('.mark-close').click(function (e) {
            e.preventDefault();
            jQuery(this).parent().fadeOut('slow');
        });

        jQuery('.mark-bubble .submit').click(function () {
            var $input = that.$el.find('input.text');

            var reason = jQuery.trim($input.val());

            if (reason) {
                $input.disabled = true;
                jQuery(this).hide();

                that.$el.find('.waiting').show();

                feed.inappropriatePost(that.post.id, reason,
                    function () {
                        $input.val('');
                        that.$el.find('.waiting').hide();
                        that.$el.find('.title').html('Thank you');
                        that.$el.find('input.text').hide();
                        that.$el.find('input.text').html('');
                        that.$el.find('.success-message').html('This message has been marked as inappropriate').show();
                    },
                    function () {
                        that.$el.find('.waiting').hide();
                        that.$el.find('.title').html('Oops');
                        that.$el.find('input.text').hide();
                        that.$el.find('input.text').html('');
                        that.$el.find('.success-message').html('It looks like a problem has occurred. Please try again later').show();
                    }
                );
            }
        });

        this.$el.fadeIn('slow');
    }
});