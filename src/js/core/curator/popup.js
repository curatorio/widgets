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
    videoPlaying:false,

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
        this.$popup = Curator.Template.render(this.templateId, this.json);

        // jQuery('body').append(this.$underlay);

        // this.$popup.on('click',' .close', function (e) {
        //     e.preventDefault();
        //     that.hide();
        // });



        if (this.json.network_id === 8)
        {
            // youtube
            this.$popup.find('video').remove();

            var src = '<iframe id="ytplayer" type="text/html" width="615" height="615" \
            src="https://www.youtube.com/embed/'+this.json.source_identifier+'?autoplay=0&rel=0&showinfo" \
            frameborder="0"></iframe>';

            this.$popup.find('.crt-video-container img').remove();
            this.$popup.find('.crt-video-container a').remove();
            this.$popup.find('.crt-video-container').append(src);

        } else if (!this.json.image) {
            this.$popup.addClass('no-image');
        }

        if (this.json.video) {
            this.$popup.addClass('has-video');
        }

        this.$popup.on('click',' .crt-close', jQuery.proxy(this.onClose,this));
        this.$popup.on('click',' .crt-previous', jQuery.proxy(this.onPrevious,this));
        this.$popup.on('click',' .crt-next', jQuery.proxy(this.onNext,this));
        this.$popup.on('click',' .crt-play', jQuery.proxy(this.onPlay,this));

    },

    onClose: function (e) {
        e.preventDefault();
        var that = this;
        this.hide(function(){
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

    onPlay: function (e) {
        Curator.log('Popup->onPlay');
        e.preventDefault();

        this.videoPlaying = !this.videoPlaying;

        if (this.videoPlaying) {
            this.$popup.find('video')[0].play();
        } else {
            this.$popup.find('video')[0].pause();
        }

        Curator.log(this.videoPlaying);

        this.$popup.toggleClass('video-playing',this.videoPlaying );
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
        var that = this;
        this.$popup.fadeOut(function(){

            that.destroy();
            callback ();
        });
    },
    
    destroy: function () {
        if (this.$popup.length) {
            this.$popup.remove();

            if (this.$popup.find('video').length) {
                this.$popup.find('video')[0].pause();

            }
        }

        delete this.$popup;
    }
});