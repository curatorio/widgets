
import Logger from '/curator/core/logger';
import SocialFacebook from '/curator/social/facebook';
import SocialTwitter from '/curator/social/twitter';
import StringUtils from '/curator/utils/string';
import TemplatingUtils from '/curator/core/templating';
import z from '/curator/core/lib';
import CommonUtils from "/curator/utils/common";

/**
 * ==================================================================
 * Popup
 * ==================================================================
 */

class Popup {
    
    constructor (popupManager, post, widget) {
        Logger.log("Popup->init ");
 
        this.popupManager = popupManager;
        this.json = post;
        this.widget = widget;

        let templateId = this.widget.options.templatePopup;
        this.videoPlaying=false;

        this.$popup = TemplatingUtils.renderTemplate(templateId, this.json);
        this.$left = this.$popup.find('.crt-popup-left');

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

            let youTubeId = StringUtils.youtubeVideoId(this.json.video);

            let src = `<div class="crt-responsive-video"><iframe id="ytplayer" src="https://www.youtube.com/embed/${youTubeId}?autoplay=0&rel=0&showinfo" frameborder="0" allowfullscreen></iframe></div>`;

            this.$popup.find('.crt-video-container img').remove();
            this.$popup.find('.crt-video-container a').remove();
            this.$popup.find('.crt-video-container').append(src);
        } else if (this.json.video && this.json.video.indexOf('vimeo') >= 0 )
        {
            // youtube
            this.$popup.find('video').remove();
            // this.$popup.removeClass('has-image');

            let vimeoId = StringUtils.vimeoVideoId(this.json.video);

            if (vimeoId) {
                let src = `<div class="crt-responsive-video"><iframe src="https://player.vimeo.com/video/${vimeoId}?color=ffffff&title=0&byline=0&portrait=0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`;
                this.$popup.find('.crt-video-container img').remove();
                this.$popup.find('.crt-video-container a').remove();
                this.$popup.find('.crt-video-container').append(src);
            }
        }

        if (this.json.images)
        {
            this.$page = this.$popup.find('.crt-pagination ul');
            for (let i = 0;i < this.json.images.length;i++) {
                this.$page.append('<li><a href="" data-page="'+i+'"></a></li>');
            }
            this.$page.find('a').click(this.onPageClick.bind(this));
            this.currentImage = 0;
            this.$page.find('li:nth-child('+(this.currentImage+1)+')').addClass('selected');
        }

        this.$popup.on('click',' .crt-close', this.onClose.bind(this));
        this.$popup.on('click',' .crt-previous', this.onPrevious.bind(this));
        this.$popup.on('click',' .crt-next', this.onNext.bind(this));
        this.$popup.on('click',' .crt-play', this.onPlay.bind(this));
        this.$popup.on('click','.crt-share-facebook',this.onShareFacebookClick.bind(this));
        this.$popup.on('click','.crt-share-twitter',this.onShareTwitterClick.bind(this));

        z(window).on('resize.crt-popup',CommonUtils.debounce(this.onResize.bind(this),50));

        this.onResize ();
    }

    onResize () {
        Logger.log('Popup->onResize');
        let windowWidth = z(window).width ();
        let padding = 60;
        let paddingMobile = 40;
        let rightPanel = 335;
        let leftPanelMax = 600;

        if (windowWidth > 1055) {
            this.$left.width(leftPanelMax+rightPanel);
        } else if (windowWidth > 910) {
            this.$left.width(windowWidth-(padding*2));
        } else if (windowWidth > leftPanelMax+(paddingMobile*2)) {
            this.$left.width(600);
        } else {
            this.$left.width(windowWidth-(paddingMobile*2));
        }
    }

    onPageClick (ev) {
        ev.preventDefault();
        let a = z(ev.target);
        let page = a.data('page');

        let image = this.json.images[page];

        this.$popup.find('.crt-image img').attr('src',image.url);
        this.currentImage = page;

        this.$page.find('li').removeClass('selected');
        this.$page.find('li:nth-child('+(this.currentImage+1)+')').addClass('selected');
    }

    onShareFacebookClick (ev) {
        ev.preventDefault();
        SocialFacebook.share(this.json);
        this.widget.track('share:facebook');
        return false;
    }

    onShareTwitterClick (ev) {
        ev.preventDefault();
        SocialTwitter.share(this.json);
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
        Logger.log('Popup->onPlay');
        e.preventDefault();

        this.videoPlaying = !this.videoPlaying;

        if (this.videoPlaying) {
            this.$popup.find('video')[0].play();
            this.widget.track('video:play');
        } else {
            this.$popup.find('video')[0].pause();
            this.widget.track('video:pause');
        }

        Logger.log(this.videoPlaying);

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
            //     z('.popup .content').fadeIn('slow');
            // });
        });
    }
    
    hide (callback) {
        Logger.log('Popup->hide');
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

        z(window).off('resize.crt-popup');

        delete this.$popup;
    }
}

export default Popup;