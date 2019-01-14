/*jshint unused:false*/

import CommonUtils from '../../utils/common';
import EventBus from '../../core/bus';
import Logger from '../../core/logger';
import Events from '../../core/events';
import z from '../../core/lib';
import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver.es';

const LayoutCarouselSettings = {
    infinite: false,
    speed: 5000,
    duration: 700,
    minWidth: 250,
    panesVisible: null,
    moveAmount: 0,
    autoPlay: false,
    useCss : true,
    matchHeights : false,
    controlsOver: true,
    controlsShowOnHover: true,
};

if (z.zepto) {
    LayoutCarouselSettings.easing = 'ease-in-out';
}

class LayoutCarousel extends EventBus {
    constructor (widget, $viewport, $stage, $slider, options) {
        Logger.log('LayoutCarousel->construct');

        super ();

        this.id = CommonUtils.uId ();
        this.widget = widget;
        this.currentPane = 0;
        this.animating = false;
        this.autoPlayTimeout = null;
        this.PANES_VISIBLE = 0;
        this.PANES_LENGTH = 0;
        this.PANE_WIDTH = 0;
        this.paneCache = {};
        this.$panes = [];

        this.options = z.extend({}, LayoutCarouselSettings, options);

        // Validate options
        if (!this.options.minWidth || this.options.minWidth < 100) {
            this.options.minWidth = LayoutCarouselSettings.minWidth;
        }

        this.$viewport = $viewport;
        this.$stage = $stage;
        this.$slider = $slider; // <div> slider

        if (!z.zepto) {
            this.$slider[0].crtTransformX = 0;
        }

        if (this.options.matchHeights) {
            this.$stage.addClass('crt-match-heights');
        }

        if (this.widget.config('controlsOver')) {
            this.widget.$container.addClass('crt-controls-over');
        }

        if (this.widget.config('controlsShowOnHover')) {
            this.widget.$container.addClass('crt-controls-show-on-hover');
        }

        this.controlsHideShow();
        this.createHandlers();
    }

    createHandlers () {
        this._resize = CommonUtils.debounce(() => {
            this.updateLayout ();
        }, 100);

        this.ro = new ResizeObserver((entries) => {
            if (entries.length > 0) {
                // let entry = entries[0];
                this._resize();
            }
        });

        this.ro.observe(this.$viewport[0]);
    }

    destroyHandlers () {
        if (this.ro) {
            this.ro.disconnect();
            this.ro = null;
        }
    }

    setPanesLength (panesLength) {
        Logger.log('LayoutCarousel->setPanesLength '+panesLength);

        let firstLoad = this.PANES_LENGTH === 0;
        this.PANES_LENGTH = panesLength;

        if (firstLoad) {
            this.calcSizes();

            this.currentPane = 0;

            this.updatePanes();

            let x = this.getX();
            this.$slider.width (this.PANE_WIDTH * (this.PANES_VISIBLE * 3));
            this.setSliderX (x);

            this.updateHeight();

            if (this.options.autoPlay) {
                this.autoPlayStart();
            }

            this.controlsHideShow();
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

        this.$slider.empty();

        let currentIds = [];

        for(let pane of panes) {
            this.$slider.append(pane.$el);
            currentIds.push(pane.paneIndex);
        }

        this.currentPanes = panes;

        // TODO - clean up cache - needs work
        // console.log('----- clean cache -----');
        // // clean up cache
        // let keys = Object.keys(this.paneCache);
        // let start  = this.currentPane - (this.PANES_VISIBLE * 2);
        // let end  = this.currentPane + (this.PANES_VISIBLE * 3);
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

        if (this.PANES_VISIBLE < this.PANES_LENGTH) {
            let start = this.currentPane - this.PANES_VISIBLE;
            for (let counter = 0; counter < this.PANES_VISIBLE * 3; counter++) {
                let postObject = this.getPane(start + counter);

                z(postObject.$el).css({width: this.PANE_WIDTH + 'px'});

                panes.push(postObject);
            }
        } else {
            for (let counter = 0; counter < this.PANES_LENGTH; counter++) {
                let postObject = this.getPane(counter);

                z(postObject.$el).css({width: this.PANE_WIDTH + 'px'});

                panes.push(postObject);
            }
        }

        return panes;
    }

    getPane (paneIndex) {
        let pane = null;
        if (this.paneCache['idx'+paneIndex]) {
            // console.log('cache hit '+paneIndex);
            pane = this.paneCache['idx'+paneIndex];
        } else {

            pane = this.widget.createPane(paneIndex);
            pane.on(Events.PANE_HEIGHT_CHANGED, this.onPaneHeightChanged.bind(this));

            this.paneCache['idx'+paneIndex] = pane;
        }

        pane.paneIndex = 'idx'+paneIndex;
        return pane;
    }

    resize () {
        let oldPanesVisible = this.PANES_VISIBLE;

        this.calcSizes();

        this.$slider.width (this.PANE_WIDTH * (this.PANES_VISIBLE * 3));

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
        this.$slider.width (this.PANE_WIDTH * (this.PANES_VISIBLE * 3));
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
        return this.PANES_VISIBLE < this.PANES_LENGTH;
    }

    autoPlayStart () {
        window.clearTimeout(this.autoPlayTimeout);
        if (this.canRotate()) {
            this.autoPlayTimeout = window.setTimeout(() => {
                this.next();
            }, this.options.speed);
        }
    }

    controlsHideShow () {
        if (!this.canRotate()) {
            this.$viewport.addClass('crt-hide-controls');
        } else {
            this.$viewport.removeClass('crt-hide-controls');
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
        Logger.log('LayoutCarousel->move currentPane:'+this.currentPane+' moveAmt:'+moveAmt);

        let previousPost = this.currentPane;
        let newPane = this.currentPane + moveAmt;
        this.animating = true;

        if (this.options.infinite) {
            if (newPane < 0) {
                newPane = this.PANES_LENGTH + newPane;
            } else if (newPane > this.PANES_LENGTH) {
                newPane = newPane - this.PANES_LENGTH;
            }
        } else {
            if (newPane < 0) {
                newPane = 0;
            } else if (newPane > (this.PANES_LENGTH - this.PANES_VISIBLE)) {
                newPane = this.PANES_LENGTH - this.PANES_VISIBLE;
            }
            moveAmt = newPane - previousPost;
        }

        this.currentPane = newPane;

        if (moveAmt) {

            let x = (0 - (this.PANES_VISIBLE * this.PANE_WIDTH)) - (moveAmt * this.PANE_WIDTH);

            if (noAnimate) {
                this.$slider.removeClass('crt-animate-transform');
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
                    this.$slider.addClass('crt-animate-transform');
                    this.$slider.animate({'transform': 'translate3d('+x+'px, 0px, 0px)'},
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

                    this.$slider.addClass('crt-animate-transform');
                    this.$slider.animate({'crtTransformX': x},
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
        this.trigger(Events.CAROUSEL_CHANGED, this, this.currentPane);

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

            for (let pane of this.currentPanes)
            {
                let $pane = pane.$el;
                // TODO - could move this to ui.post
                $pane.find('.crt-post-c').animate({height: paneMaxHeight}, 300);
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
        this.$slider.css({'transform': 'translate3d('+x+'px, 0px, 0px)'});
        if (!z.zepto) {
            this.$slider[0].crtTransformX = x;
        }
    }

    onPaneHeightChanged () {
        window.clearTimeout(this.postLayoutChangedTO);
        this.postLayoutChangedTO = window.setTimeout(() => {
            this.updateHeight ();
        },100);
    }

    reset () {
        window.clearTimeout(this.autoPlayTimeout);
        window.clearTimeout(this.postLayoutChangedTO);
        window.clearTimeout(this.moveCompleteTO);
        this.$slider.empty();
        this.setSliderX (0);
        this.currentPane = 0;
        this.paneCache = [];
        this.currentPanes = [];
    }

    destroy () {
        Logger.log('LayoutCarousel->destroy ');
        this.destroyHandlers ();
        this.$slider.stop(true, false);
        window.clearTimeout(this.autoPlayTimeout);
        window.clearTimeout(this.postLayoutChangedTO);
        window.clearTimeout(this.moveCompleteTO);

        for(let paneId in this.paneCache) {
            if (this.paneCache.hasOwnProperty(paneId)) {
                this.paneCache[paneId].destroy();
            }
        }

        this.paneCache = null;
        this.currentPanes = null;

        delete this.$viewport;
        delete this.$stage;
        delete this.$slider;
    }
}

export default LayoutCarousel;