/**
* ==================================================================
* Popup
* ==================================================================
*/
import z from '../core/lib';


class PopupInappropriate {
    constructor (post,feed) {
        let that = this;

        this.feed = feed;
        this.post = post;
        
        this.jQueryel = z('.mark-bubble');

        z('.mark-close').click(function (e) {
            e.preventDefault();
            z(this).parent().fadeOut('slow');
        });

        z('.mark-bubble .submit').click(function () {
            let $input = that.$el.find('input.text');

            let reason = z.trim($input.val());

            if (reason) {
                $input.disabled = true;
                z(this).hide();

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
}

export default PopupInappropriate;
