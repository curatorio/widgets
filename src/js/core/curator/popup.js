/**
* ==================================================================
* Popup
* ==================================================================
*/

Curator.Popup = function (json,feed) {
    this.init(json,feed);
};

jQuery.extend(Curator.prototype, {
    underlay: '',
    bigPost: null,
    templateId:'#popup',

    init: function (post, feed) {
        var that = this;

        this.json = post;
        this.feed = feed;

        this.underlay = jQuery('#popup-underlay');
        this.$el = jQuery('.popup');
        this.wrapper = jQuery('#popup-wrapper');

        jQuery('#popup-underlay, .popup .close').click(function (e) {
            e.preventDefault();
            that.hide();
        });

        /**
         * Mark as inappropriate - icon hover
         */
        jQuery('.mark-icon a').hover(function () {
            jQuery('img', this).stop().animate({top: '-35px'}, {queue: false, duration: 200});
        },function () {
            jQuery('img', this).stop().animate({top: '0px'}, {queue: false, duration: 200});
        }).click(function (e) {
            e.preventDefault();
            that.inappropriatePopup = new Curator.PopupInappropriate(this.json,this.feed);
        });
    },

    show: function () {
        var that = this;

        var post = this.json;
        var mediaUrl = post.image,
            text = post.text;

        if (mediaUrl) {
            var $imageWrapper = that.$el.find('div.main-image-wrapper');
            this.loadMainImage(mediaUrl, $imageWrapper, ['main-image']);
        }

        var $socialIcon = this.$el.find('.social-icon');
        $socialIcon.attr('class', 'social-icon');
        $socialIcon.addClass(Curator.SOURCE_TYPES[post.sourceType]);

        //format the date
        var date = Curator.Utils.dateAsDayMonthYear(post.sourceCreateAt);

        this.$el.find('input.discovery-id').val(post.id);
        this.$el.find('div.full-name span').html(post.user_full_name);
        this.$el.find('div.username span').html('@' + post.user_screen_name);
        this.$el.find('div.date span').html(date);
        this.$el.find('div.love-indicator span').html(post.loves);
        this.$el.find('div.side-text span').html(text);

        this.wrapper.show();
        this.underlay.fadeIn();
        this.$el.fadeIn(function () {
            that.$el.animate({width: '624px',height: '424px'}, function () {
                jQuery('.popup .content').fadeIn('slow');
            });
        });

    },
    
    /**
     * Load the main image in the Big Post
     */
    loadMainImage: function (source, $wrapper, classes, removeWrapperClass) {
        $wrapper.show(); //show the wrapper in case it has a pre-loader image

        var img = new root.Image();

        source = source.replace(/http:/, 'https:');

        for (var i in classes) {
            if (classes.hasOwnProperty(i)) {
                jQuery(img).addClass(classes[i]); //console.log(classes[i]);
            }
        }

        img.onload = function () {

            if (removeWrapperClass) {
                $wrapper.removeClass(removeWrapperClass);
            }

            $wrapper.append(this);

            jQuery(this).imgscale({
                fade: 1000,
                width: img.width,
                height: img.height
            });
        };
        img.onerror = function () {
            if (removeWrapperClass) {
                $wrapper.removeClass(removeWrapperClass);
            }
        };
        img.src = source;
    },


    hide: function () {

    }
});