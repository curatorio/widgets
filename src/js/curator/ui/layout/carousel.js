import CommonUtils from '/curator/utils/common';
import EventBus from '/curator/core/bus';
import Logger from '/curator/core/logger';
import Events from '/curator/core/events';
import z from '/curator/core/lib';

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
	constructor (container, options) {
		Logger.log('LayoutCarousel->construct');

        super ();

        this.id = CommonUtils.uId ();
		this.current_position=0;
		this.animating=false;
		this.timeout=null;
		this.FAKE_NUM=0;
		this.PANES_VISIBLE=0;

		this.options = z.extend({}, LayoutCarouselSettings, options);

		// Validate options
        if (!this.options.minWidth || this.options.minWidth < 100) {
            this.options.minWidth = LayoutCarouselSettings.minWidth;
		}

		this.$viewport = z(container); // <div> slider, known as $viewport

		this.$panes = this.$viewport.children();
		this.$panes.detach();

		this.$stage = z('<div class="crt-carousel-stage"></div>').appendTo(this.$viewport);
		this.$pane_slider = z('<div class="crt-carousel-slider"></div>').appendTo(this.$stage);

		if (this.options.matchHeights) {
            this.$stage.addClass('crt-match-heights');
        }

		this.addControls();
		this.createHandlers();
        this.update ();
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

	update () {
        Logger.log('LayoutCarousel->update ');
		this.$panes = this.$pane_slider.children(); // <li> list items, known as $panes
		this.NUM_PANES = this.$panes.length;

		if (this.NUM_PANES > 0) {
			this.resize();
			this.move (this.current_position, true);

			if (!this.animating) {
				if (this.options.autoPlay) {
					this.animate();
				}
			}
		}
	}

	add ($els) {
        Logger.log('LayoutCarousel->add '+$els.length);

		this.$pane_slider.append($els);
		this.$panes = this.$pane_slider.children();
	}

	resize () {
		let PANE_WRAPPER_WIDTH = this.options.infinite ? ((this.NUM_PANES+1) * 100) + '%' : (this.NUM_PANES * 100) + '%'; // % width of slider (total panes * 100)

		this.$pane_slider.css({width: PANE_WRAPPER_WIDTH}); // set css on pane slider

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

		if (this.options.infinite) {

			this.$panes.filter('.crt-clone').remove();

			for(let i = this.NUM_PANES-1; i > this.NUM_PANES - 1 - this.PANES_VISIBLE; i--)
			{
				// console.log(i);
				let first = this.$panes.eq(i).clone();
				first.addClass('crt-clone');
				first.css('opacity','1');
				// Should probably move this out to an event
				first.find('.crt-post-image').css({opacity:1});
				this.$pane_slider.prepend(first);
				this.FAKE_NUM = this.PANES_VISIBLE;
			}
			this.$panes = this.$pane_slider.children();

		}

		this.$panes.each((index, pane) => {
			z(pane).css( {width: this.PANE_WIDTH+'px'});
		});
	}

	updateLayout () {
        this.resize();
        this.move (this.current_position, true);

        // reset animation timer
        if (this.options.autoPlay) {
            this.animate();
        }
	}

	animate () {
		this.animating = true;
		window.clearTimeout(this.timeout);
		this.timeout = window.setTimeout(() => {
			this.next();
		}, this.options.speed);
	}

	next () {
		let move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE ;
		this.move(this.current_position + move, false);
	}

	prev () {
		let move = this.options.moveAmount ? this.options.moveAmount : this.PANES_VISIBLE ;
		this.move(this.current_position - move, false);
	}

	move (i, noAnimate) {
        Logger.log('LayoutCarousel->move '+i);
		this.current_position = i;

		let maxPos = this.NUM_PANES - this.PANES_VISIBLE;

		if (this.current_position < 0) {
			this.current_position = 0;
		} else if (this.current_position > maxPos) {
			this.current_position = maxPos;
		}

		let curIncFake = (this.FAKE_NUM + this.current_position);
		let left = curIncFake * this.PANE_WIDTH;
		let max = this.options.infinite ? (this.PANE_WIDTH * this.NUM_PANES) : (this.PANE_WIDTH * this.NUM_PANES) - this.VIEWPORT_WIDTH;

		this.currentLeft = left;

		if (left < 0) {
			this.currentLeft = 0;
		} else if (left > max) {
			this.currentLeft = max;
		} else {
			this.currentLeft = left;
		}
        let x = (0 - this.currentLeft);

        Logger.log('LayoutCarousel->move x:'+x);
		if (noAnimate) {
			this.$pane_slider.css({'transform': 'translate3d('+x+'px, 0px, 0px)'});
			this.moveComplete();
		} else {
			// let options = {
			// 	duration: this.options.duration,
			// 	complete: this.moveComplete.bind(this),
			// 	// easing:'asd'
			// };
			// if (this.options.easing) {
			// 	options.easing = this.options.easing;
			// }
            // this.$pane_slider.addClass('crt-animate-transform');
			// this.$pane_slider.animate({'transform': 'translate3d('+x+'px, 0px, 0px)'},
			// 	options
			// );
			let options = {
				duration: this.options.duration,
				complete: this.moveComplete.bind(this),
				// easing:'asd'
			};
			if (this.options.easing) {
				options.easing = this.options.easing;
			}
            this.$pane_slider.addClass('crt-animate-transform');
			this.$pane_slider.animate({'transform': 'translate3d('+x+'px, 0px, 0px)'},
				options
			);
		}
	}

	moveComplete () {
        Logger.log('LayoutCarousel->moveComplete');
		if (this.options.infinite && (this.current_position >= (this.NUM_PANES - this.PANES_VISIBLE))) {
			// infinite and we're off the end!
			// re-e-wind, the crowd says 'bo selecta!'
			this.$pane_slider.css({'transform': 'translate3d(0px, 0px, 0px)'});
			this.current_position = 0 - this.PANES_VISIBLE;
			this.currentLeft = 0;
		}
		window.setTimeout(() => {
			this.updateHeight();
		}, 50);

		this.trigger(Events.CAROUSEL_CHANGED, [this, this.current_position]);

		if (this.options.autoPlay) {
			this.animate();
		}
	}

	updateHeight () {
        Logger.log('LayoutCarousel->updateHeight');

        let min = this.options.infinite ? this.current_position + this.FAKE_NUM: this.current_position;
        let paneMaxHeight = this.getMaxHeight(min);

        if (this.$stage.height() !== paneMaxHeight) {
            this.$stage.animate({height: paneMaxHeight}, 300);
        }

        if (this.options.matchHeights) {
        	this.setPaneHeights (min);
        	this.setPaneHeights (min + this.PANES_VISIBLE);
        }
	}

	setPaneHeights (min) {
        Logger.log('LayoutCarousel->setPaneHeights '+min);

        let max = min + this.PANES_VISIBLE;
        let paneMaxHeight = this.getMaxHeight(min);


        if (this.options.matchHeights) {
            for (let i = min; i < max; i++) {
                let $pane = z(this.$panes[i]);
                $pane.find('.crt-post-c').height((paneMaxHeight - 2));
            }
        }
	}

	getMaxHeight (min) {
        Logger.log('LayoutCarousel->getMaxHeight '+min);
        let paneMaxHeight = 0;
        let max = min + this.PANES_VISIBLE;
        for (let i = min; i < max; i++)
        {
        	if (this.$panes[i]) {
                let $pane = z(this.$panes[i]);

                let h = 0;
                if ($pane.hasClass('crt-post-max-height')) {
                    h = $pane.height();
                } else {
                    let contentHeight = $pane.find('.crt-post-content').height();
                    let footerHeight = $pane.find('.crt-post-footer').height();
                    h = contentHeight + footerHeight + 2;
                }
                // Logger.log('LayoutCarousel->updateHeight i: '+i+' = '+h);
                if (h > paneMaxHeight) {
                    paneMaxHeight = h;
                }
            }
        }

        return paneMaxHeight;
	}

	addControls () {
		this.$viewport.append('<button type="button" data-role="none" class="crt-panel-prev crt-panel-arrow" aria-label="Previous" role="button" aria-disabled="false">Previous</button>');
		this.$viewport.append('<button type="button" data-role="none" class="crt-panel-next crt-panel-arrow" aria-label="Next" role="button" aria-disabled="false">Next</button>');

		this.$viewport.on('click','.crt-panel-prev', this.prev.bind(this));
		this.$viewport.on('click','.crt-panel-next', this.next.bind(this));
	}

    destroy () {
        this.destroyHandlers ();
        window.clearTimeout(this.timeout);
    }
}

export default LayoutCarousel;