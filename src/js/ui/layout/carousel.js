import CommonUtils from '../../utils/common';
import EventBus from '../../core/bus';
import Logger from '../../core/logger';
import Events from '../../core/events';
import z from '../../core/lib';

const LayoutCarouselSettings = {
    infinite: false,
    speed: 5000,
    duration: 700,
    minWidth: 250,
    panesVisible: null,
    moveAmount: 0,
    autoPlay: false,
    useCss : true
};

if (z.zepto) {
    LayoutCarouselSettings.easing = 'ease-in-out';
}

class LayoutCarousel extends EventBus {
    constructor (widget, container, options) {
        Logger.log('LayoutCarousel->construct');

        super ();

        this.id = CommonUtils.uId ();
        this.widget = widget;
        this.currentPost = 0;
        this.animating = false;
        this.autoPlayTimeout = null;
        this.PANES_VISIBLE = 0;
        this.PANE_WIDTH = 0;
        this.posts = [];
        this.paneCache = {};
        this.$panes = [];

        this.options = z.extend({}, LayoutCarouselSettings, options);

        // Validate options
        if (!this.options.minWidth || this.options.minWidth < 100) {
            this.options.minWidth = LayoutCarouselSettings.minWidth;
        }

        this.$viewport = z(container); // <div> slider, known as $viewport

        this.$stage = z('<div class="crt-carousel-stage"></div>').appendTo(this.$viewport);
        this.$paneSlider = z('<div class="crt-carousel-slider"></div>').appendTo(this.$stage);

        if (!z.zepto) {
            this.$paneSlider[0].crtTransformX = 0;
        }

        if (this.options.matchHeights) {
            this.$stage.addClass('crt-match-heights');
        }

        this.addControls();
        this.createHandlers();
    }

    addControls () {
        this.$viewport.append('<button type="button" data-role="none" class="crt-panel-prev crt-panel-arrow" aria-label="Previous" role="button" aria-disabled="false">Previous</button>');
        this.$viewport.append('<button type="button" data-role="none" class="crt-panel-next crt-panel-arrow" aria-label="Next" role="button" aria-disabled="false">Next</button>');

        this.$viewport.on('click', '.crt-panel-prev', this.prev.bind(this));
        this.$viewport.on('click', '.crt-panel-next', this.next.bind(this));

        this.controlsHideShow();
    }

    createHandlers () {
        z(window).on('resize.'+this.id, CommonUtils.debounce( () => {
            this.updateLayout ();
        }, 100));
    }

    destroyHandlers () {

        z(window).off('resize.'+this.id);
        // z(window).off('curatorCssLoaded.'+id);
        // z(document).off('ready.'+id);
    }

    addPosts (posts) {
        Logger.log('LayoutCarousel->addPosts '+posts.length);
        let firstLoad = this.posts.length === 0;
        this.posts = this.posts.concat(posts);

        if (firstLoad) {
            this.calcSizes();

            this.currentPost = 0;

            this.updatePanes();


            let x = this.getX();
            this.$paneSlider.width (this.PANE_WIDTH * (this.PANES_VISIBLE * 3));
            this.setSliderX (x);

            this.updateHeight();

            if (this.options.autoPlay) {
                this.autoPlayStart();
            }
        }
    }

    calcSizes () {

        this.VIEWPORT_WIDTH = this.$viewport.width();
        Logger.log('VIEWPORT_WIDTH = '+this.VIEWPORT_WIDTH);

        if (this.options.panesVisible) {
            // TODO - change to check if it's a function or a number
            this.PANES_VISIBLE = this.options.panesVisible();
            this.PANE_WIDTH = (this.VIEWPORT_WIDTH / this.PANES_VISIBLE);
        } else {
            this.PANES_VISIBLE = this.VIEWPORT_WIDTH < this.options.minWidth ? 1 : Math.floor(this.VIEWPORT_WIDTH / this.options.minWidth);
            this.PANE_WIDTH = (this.VIEWPORT_WIDTH / this.PANES_VISIBLE);
        }
    }

    updatePanes () {

        let panes = this.createPanes();

        this.$paneSlider.empty();

        let currentIds = [];

        for(let pane of panes) {
            this.$paneSlider.append(pane.$el);
            currentIds.push(pane.paneIndex);
        }

        this.currentPanes = panes;

        // TODO - clean up cache - needs work
        // console.log('----- clean cache -----');
        // // clean up cache
        // let keys = Object.keys(this.paneCache);
        // let start  = this.currentPost - (this.PANES_VISIBLE * 2);
        // let end  = this.currentPost + (this.PANES_VISIBLE * 3);
        // console.log('start '+start);
        // console.log('end '+end);
        // for (let key of keys) {
        //     let pos = key.replace('idx','');
        //     if (pos < start || pos > end) {
        //         console.log('cleaning '+key);
        //         if (this.paneCache[key]) {
        //             this.paneCache[key].destroy();
        //             delete this.paneCache[key];
        //         }
        //     } else {
        //         console.log('keeping '+key);
        //     }
        // }
    }

    createPanes () {

        let panes = [];

        if (this.PANES_VISIBLE < this.posts.length) {
            let start = this.currentPost - this.PANES_VISIBLE;
            for (let counter = 0; counter < this.PANES_VISIBLE * 3; counter++) {
                let postObject = this.getPane(start + counter);

                z(postObject.$el).css({width: this.PANE_WIDTH + 'px'});

                panes.push(postObject);
            }
        } else {
            for (let counter = 0; counter < this.posts.length; counter++) {
                let postObject = this.getPane(counter);

                z(postObject.$el).css({width: this.PANE_WIDTH + 'px'});

                panes.push(postObject);
            }
        }

        return panes;
    }

    getPane (paneIndex) {

        let postToLoad = paneIndex;
        if (paneIndex < 0) {
            postToLoad = this.posts.length + paneIndex;
        } else if (paneIndex > this.posts.length - 1) {
            postToLoad = paneIndex % this.posts.length;
        }

        // console.log(paneIndex + " : " + postToLoad );

        let pane = null;
        if (this.paneCache['idx'+paneIndex]) {
            // console.log('cache hit '+paneIndex);
            pane = this.paneCache['idx'+paneIndex];
        } else {
            // console.log('cache miss '+paneIndex);
            let post = this.posts[postToLoad];
            // console.log(post);
            pane = this.widget.createPostElement(post);
            pane.on(Events.POST_LAYOUT_CHANGED,this.onPostLayoutChanged.bind(this));
            this.paneCache['idx'+paneIndex] = pane;
        }

        pane.paneIndex = 'idx'+paneIndex;
        return pane;
    }

    resize () {
        let oldPanesVisible = this.PANES_VISIBLE;

        this.calcSizes();

        this.$paneSlider.width (this.PANE_WIDTH * (this.PANES_VISIBLE * 3));

        if (oldPanesVisible !== this.PANES_VISIBLE)
        {
            // layout needs changing
            this.updatePanes();
        } else {
            // just resize current panes
            for (let i = 0 ; i < this.currentPanes.length ; i++) {
                this.currentPanes[i].$el.css( {width: this.PANE_WIDTH+'px'});
            }
        }

        let x = this.getX();
        this.$paneSlider.width (this.PANE_WIDTH * (this.PANES_VISIBLE * 3));
        this.setSliderX (x);
    }

    updateLayout () {
        this.resize();
        this.move (0, true);

        this.controlsHideShow();

        // reset animation timer
        if (this.options.autoPlay) {
            this.autoPlayStart();
        }
    }

    getX () {
        if (this.canRotate()) {
            return 0-(this.PANES_VISIBLE * this.PANE_WIDTH);
         } else {
            return 0;
        }
    }

    canRotate () {
        return this.PANES_VISIBLE < this.posts.length;
    }

    autoPlayStart () {
        window.clearTimeout(this.autoPlayTimeout);
        if (this.canRotate()) {
            this.autoPlayTimeout = window.setTimeout(() => {
                this.next();
            }, this.options.speed);
        }
    }

    controlsHideShow() {
        if (!this.canRotate()) {
            this.$viewport.addClass('crt-carousel-hide-controls');
        } else {
            this.$viewport.removeClass('crt-carousel-hide-controls');
        }
    }

    next () {
        let move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE ;
        this.move(move, false);
    }

    prev () {
        let move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE ;
        this.move(0 - move, false);
    }

    move (moveAmt, noAnimate) {
        Logger.log('LayoutCarousel->move currentPost:'+this.currentPost+' moveAmt:'+moveAmt);
        let previousPost = this.currentPost;
        let newPost = this.currentPost + moveAmt;
        this.animating = true;

        if (this.options.infinite) {
            if (newPost < 0) {
                newPost = this.posts.length + newPost;
            } else if (newPost > this.posts.length) {
                newPost = newPost - this.posts.length;
            }
        } else {
            if (newPost < 0) {
                newPost = 0;
            } else if (newPost > (this.posts.length - this.PANES_VISIBLE)) {
                newPost = this.posts.length - this.PANES_VISIBLE;
            }
            moveAmt = newPost - previousPost;
        }

        this.currentPost = newPost;

        if (moveAmt) {

            let x = (0 - (this.PANES_VISIBLE * this.PANE_WIDTH)) - (moveAmt * this.PANE_WIDTH);

            if (noAnimate) {
                this.$paneSlider.removeClass('crt-animate-transform');
                this.setSliderX (x);
                this.moveComplete();
            } else {
                let options = {
                    duration: this.options.duration,
                    complete: this.moveComplete.bind(this),
                    // easing:'asd'
                };
                if (this.options.easing) {
                    options.easing = this.options.easing;
                }

                if (z.zepto) {
                    this.$paneSlider.addClass('crt-animate-transform');
                    this.$paneSlider.animate({'transform': 'translate3d('+x+'px, 0px, 0px)'},
                        options
                    );
                } else {
                    // Jquery doesn't animate transform
                    options.step = function(now, fx) {
                        // console.log(fx);
                        if (fx.prop === 'crtTransformX' ) {
                            // console.log('step:'+now);
                            z(this).css('-webkit-transform','translate3d('+now+'px, 0px, 0px)');
                            z(this).css('-moz-transform','translate3d('+now+'px, 0px, 0px)');
                            z(this).css('transform','translate3d('+now+'px, 0px, 0px)');
                        }
                    };

                    this.$paneSlider.addClass('crt-animate-transform');
                    this.$paneSlider.animate({'crtTransformX': x},
                        options
                    );
                }
            }
        }
    }

    moveComplete () {
        Logger.log('LayoutCarousel->moveComplete');

        this.updatePanes();

        // reset x position
        let x = 0-(this.PANES_VISIBLE * this.PANE_WIDTH);
        this.setSliderX (x);

        // trigger change event
        this.trigger(Events.CAROUSEL_CHANGED, this, this.currentPost);

        if (this.options.autoPlay) {
            this.autoPlayStart();
        }

        this.moveCompleteTO = window.setTimeout(() => {
            Logger.log('LayoutCarousel->moveComplete TO');
            this.updateHeight();
        }, 50);
    }

    updateHeight () {
        Logger.log('LayoutCarousel->updateHeight');

        let paneMaxHeight = this.getMaxHeight();

        if (this.$stage.height() !== paneMaxHeight) {
            this.$stage.animate({height: paneMaxHeight}, 300);
        }

        if (this.options.matchHeights) {
            this.setPaneHeights ();
        }
    }

    setPaneHeights () {
        Logger.log('LayoutCarousel->setPaneHeights ');

        if (this.options.matchHeights) {
            let paneMaxHeight = this.getMaxHeight();
            let h = paneMaxHeight - 2;

            for (let pane of this.currentPanes)
            {
                let $pane = pane.$el;
                // TODO - could move this to ui.post
                $pane.find('.crt-post-c').animate({height: h}, 300);
            }
        }
    }

    getMaxHeight () {
        // Logger.log('LayoutCarousel->getMaxHeight ');

        let paneMaxHeight = 0;
        let min = this.canRotate() ? this.PANES_VISIBLE : 0;
        let max = min + this.PANES_VISIBLE;
        for (let i = min; i < max; i++)
        {
            if (this.currentPanes[i]) {
                let h = this.currentPanes[i].getHeight();

                if (h > paneMaxHeight) {
                    paneMaxHeight = h;
                }
            }
        }

        return paneMaxHeight;
    }

    setSliderX(x) {
        this.$paneSlider.css({'transform': 'translate3d('+x+'px, 0px, 0px)'});
        if (!z.zepto) {
            this.$paneSlider[0].crtTransformX = x;
        }
    }

    onPostLayoutChanged (post) {
        window.clearTimeout(this.postLayoutChangedTO);
        this.postLayoutChangedTO = window.setTimeout(()=>{
            this.updateHeight ();
        },100);
    }

    reset () {
        window.clearTimeout(this.autoPlayTimeout);
        window.clearTimeout(this.postLayoutChangedTO);
        window.clearTimeout(this.moveCompleteTO);
        this.$paneSlider.empty();
        this.setSliderX (0);
        this.posts = [];
        this.currentPost = 0;
        this.paneCache = [];
    }

    destroy () {
        Logger.log('LayoutCarousel->destroy ');
        this.destroyHandlers ();
        this.$paneSlider.stop(true, false);
        window.clearTimeout(this.autoPlayTimeout);
        window.clearTimeout(this.postLayoutChangedTO);
        window.clearTimeout(this.moveCompleteTO);

        delete this.$viewport;
        delete this.$stage;
        delete this.$paneSlider;
    }
}

export default LayoutCarousel;