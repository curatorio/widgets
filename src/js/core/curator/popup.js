/**
* ==================================================================
* Popup
* ==================================================================
*/


Curator.Popup = function (json,feed) {
    this.init(json,feed);
};



jQuery.extend(Curator.Popup.prototype, {
    templateId:'#popup-template',

    init: function (popupManager, post, feed) {
        Curator.log("Popup->init ");
 
        this.popupManager = popupManager;
        this.json = post.json;
        this.feed = feed;

        //
        // this.underlay = jQuery('#popup-underlay');
        // this.$el = jQuery('.popup');
        // this.wrapper = jQuery('#popup-wrapper');
        // /**
        //  * Mark as inappropriate - icon hover
        //  */
        // jQuery('.mark-icon a').hover(function () {
        //     jQuery('img', this).stop().animate({top: '-35px'}, {queue: false, duration: 200});
        // },function () {
        //     jQuery('img', this).stop().animate({top: '0px'}, {queue: false, duration: 200});
        // }).click(function (e) {
        //     e.preventDefault();
        //     that.inappropriatePopup = new Curator.PopupInappropriate(this.json,this.feed);
        // });
        // this.$underlay = Curator.Template.render(this.underlayTemplateId, this.post);
        this.$popup = Curator.Template.render(this.templateId, this.post);

        // jQuery('body').append(this.$underlay);

        // this.$popup.on('click',' .close', function (e) {
        //     e.preventDefault();
        //     that.hide();
        // });


        if (!this.post.image) {
            this.$popup.addClass('no-image');
        }

        this.$popup.on('click',' .crt-close', jQuery.proxy(this.onClose,this));
        this.$popup.on('click',' .crt-previous', jQuery.proxy(this.onPrevious,this));
        this.$popup.on('click',' .crt-next', jQuery.proxy(this.onNext,this));

    },

    onClose: function (e) {
        e.preventDefault();
        var that = this;
        this.hide(function(){
            that.destroy();
            that.popupManager.onClose();
        });
    },

    onPrevious: function (e) {
        e.preventDefault();

        this.popupManager.onPrevious();
    },

    onNext: function (e) {
        e.preventDefault();

        this.popupManager.onNext();
    },

    show: function () {
        //
        // var post = this.json;
        // var mediaUrl = post.image,
        //     text = post.text;
        //
        // if (mediaUrl) {
        //     var $imageWrapper = that.$el.find('div.main-image-wrapper');
        //     this.loadMainImage(mediaUrl, $imageWrapper, ['main-image']);
        // }
        //
        // var $socialIcon = this.$el.find('.social-icon');
        // $socialIcon.attr('class', 'social-icon');
        // $socialIcon.addClass(Curator.SOURCE_TYPES[post.sourceType]);
        //
        // //format the date
        // var date = Curator.Utils.dateAsDayMonthYear(post.sourceCreateAt);
        //
        // this.$el.find('input.discovery-id').val(post.id);
        // this.$el.find('div.full-name span').html(post.user_full_name);
        // this.$el.find('div.username span').html('@' + post.user_screen_name);
        // this.$el.find('div.date span').html(date);
        // this.$el.find('div.love-indicator span').html(post.loves);
        // this.$el.find('div.side-text span').html(text);
        //
        // this.wrapper.show();
        this.$popup.fadeIn(function () {
            // that.$popup.find('.crt-popup').animate({width:950}, function () {
            //     jQuery('.popup .content').fadeIn('slow');
            // });
        });
    },
    
    hide: function (callback) {
        Curator.log('Popup->hide');
        this.$popup.fadeOut(callback);
    },
    
    destroy: function () {
        this.$popup.remove();

        delete this.$popup;
    }
});