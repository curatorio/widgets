/**
* ==================================================================
* Popup
* ==================================================================
*/


class Popup {
    
    constructor (popupManager, post, feed) {
        Curator.log("Popup->init ");
 
        this.popupManager = popupManager;
        this.json = post.json;
        this.feed = feed;

        this.templateId='#popup-template';
        this.videoPlaying=false;

        this.$popup = Curator.Template.render(this.templateId, this.json);

        if (this.json.image) {
            this.$popup.addClass('has-image');
        }

        if (this.json.video) {
            this.$popup.addClass('has-video');
        }

        if (this.json.video && this.json.video.indexOf('youtu') >= 0 )
        {
            // youtube
            this.$popup.find('video').remove();
            // this.$popup.removeClass('has-image');

            let youTubeId = Curator.StringUtils.youtubeVideoId(this.json.video);

            let src = '<iframe id="ytplayer" type="text/html" width="615" height="615" \
            src="https://www.youtube.com/embed/'+youTubeId+'?autoplay=0&rel=0&showinfo" \
            frameborder="0"></iframe>';

            this.$popup.find('.crt-video-container img').remove();
            this.$popup.find('.crt-video-container a').remove();
            this.$popup.find('.crt-video-container').append(src);

        }


        this.$popup.on('click',' .crt-close', $.proxy(this.onClose,this));
        this.$popup.on('click',' .crt-previous', $.proxy(this.onPrevious,this));
        this.$popup.on('click',' .crt-next', $.proxy(this.onNext,this));
        this.$popup.on('click',' .crt-play', $.proxy(this.onPlay,this));
        this.$popup.on('click','.crt-share-facebook',$.proxy(this.onShareFacebookClick,this));
        this.$popup.on('click','.crt-share-twitter',$.proxy(this.onShareTwitterClick,this));
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

    onClose (e) {
        e.preventDefault();
        let that = this;
        this.hide(function(){
            that.popupManager.onClose();
        });
    }

    onPrevious (e) {
        e.preventDefault();

        this.popupManager.onPrevious();
    }

    onNext (e) {
        e.preventDefault();

        this.popupManager.onNext();
    }

    onPlay (e) {
        Curator.log('Popup->onPlay');
        e.preventDefault();

        this.videoPlaying = !this.videoPlaying;

        if (this.videoPlaying) {
            this.$popup.find('video')[0].play();
            this.popupManager.client.track('video:play');
        } else {
            this.$popup.find('video')[0].pause();
            this.popupManager.client.track('video:pause');
        }

        Curator.log(this.videoPlaying);

        this.$popup.toggleClass('video-playing',this.videoPlaying );
    }

    show () {
        //
        // let post = this.json;
        // let mediaUrl = post.image,
        //     text = post.text;
        //
        // if (mediaUrl) {
        //     let $imageWrapper = that.$el.find('div.main-image-wrapper');
        //     this.loadMainImage(mediaUrl, $imageWrapper, ['main-image']);
        // }
        //
        // let $socialIcon = this.$el.find('.social-icon');
        // $socialIcon.attr('class', 'social-icon');
        // $socialIcon.addClass(Curator.SOURCE_TYPES[post.sourceType]);
        //
        // //format the date
        // let date = Curator.Utils.dateAsDayMonthYear(post.sourceCreateAt);
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
            //     $('.popup .content').fadeIn('slow');
            // });
        });
    }
    
    hide (callback) {
        Curator.log('Popup->hide');
        let that = this;
        this.$popup.fadeOut(function(){
            that.destroy();
            callback ();
        });
    }
    
    destroy () {
        if (this.$popup && this.$popup.length) {
            this.$popup.remove();

            if (this.$popup.find('video').length) {
                this.$popup.find('video')[0].pause();

            }
        }

        delete this.$popup;
    }
}

Curator.Popup = Popup;