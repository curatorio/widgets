Curator.UI.Layout.CarouselSettings = {
	circular: false,
	speed: 5000,
	duration: 700,
	minWidth: 250,
	panesVisible: null,
	moveAmount: 0,
	autoPlay: false,
	useCss : true
};

if ($.zepto) {
	Curator.UI.Layout.CarouselSettings.easing = 'ease-in-out';
}

class LayoutCarousel extends EventBus {
	constructor (container, options) {
		Curator.log('LayoutCarousel->construct');

        super ();

        this.id = Curator.Utils.uId ();
		this.current_position=0;
		this.animating=false;
		this.timeout=null;
		this.FAKE_NUM=0;
		this.PANES_VISIBLE=0;

		this.options = $.extend({}, Curator.UI.Layout.CarouselSettings, options);

		this.$viewport = $(container); // <div> slider, known as $viewport

		this.$panes = this.$viewport.children();
		this.$panes.detach();

		this.$stage = $('<div class="ctr-carousel-stage"></div>').appendTo(this.$viewport);
		this.$pane_slider = $('<div class="ctr-carousel-slider"></div>').appendTo(this.$stage);

		this.addControls();
		this.createHandlers();
        this.update ();
	}

    createHandlers () {
        $(window).on('resize.'+this.id, Curator.Utils.debounce( () => {
            this.updateLayout ();
        }, 100));
    }

    destroyHandlers () {

        $(window).off('resize.'+this.id);
        // $(window).off('curatorCssLoaded.'+id);
        // $(document).off('ready.'+id);
    }

	update () {
        Curator.log('LayoutCarousel->update ');
		this.$panes = this.$pane_slider.children(); // <li> list items, known as $panes
		this.NUM_PANES = this.options.circular ? (this.$panes.length + 1) : this.$panes.length;

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
        Curator.log('LayoutCarousel->add '+$els.length);

		this.$pane_slider.append($els);
		this.$panes = this.$pane_slider.children();
	}

	resize () {
		let PANE_WRAPPER_WIDTH = this.options.infinite ? ((this.NUM_PANES+1) * 100) + '%' : (this.NUM_PANES * 100) + '%'; // % width of slider (total panes * 100)

		this.$pane_slider.css({width: PANE_WRAPPER_WIDTH}); // set css on pane slider

		this.VIEWPORT_WIDTH = this.$viewport.width();

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
			$(pane).css( {width: this.PANE_WIDTH+'px'});
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
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
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
        Curator.log('LayoutCarousel->move '+i);
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

        Curator.log('LayoutCarousel->move x:'+x);
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
        Curator.log('LayoutCarousel->moveComplete');
		if (this.options.infinite && (this.current_position >= (this.NUM_PANES - this.PANES_VISIBLE))) {
			// infinite and we're off the end!
			// re-e-wind, the crowd says 'bo selecta!'
			this.$pane_slider.css({'transform': 'translate3d(0px, 0px, 0px)'});
			this.current_position = 0 - this.PANES_VISIBLE;
			this.currentLeft = 0;
		}
		setTimeout(() => {
			this.updateHeight();
		}, 50);

		this.trigger(Curator.Events.CAROUSEL_CHANGED, [this, this.current_position]);

		if (this.options.autoPlay) {
			this.animate();
		}
	}

	updateHeight () {
        Curator.log('LayoutCarousel->updateHeight');
        // Curator.log('LayoutCarousel->updateHeight infinite:'+this.options.infinite);
        // Curator.log('LayoutCarousel->updateHeight FAKE_NUM:'+this.FAKE_NUM);

        // Curator.log('    current_position: '+this.current_position);
        // Curator.log('    PANES_VISIBLE: '+this.PANES_VISIBLE);
        let paneMaxHeight = 0;
        let min = this.options.infinite ? this.current_position + this.FAKE_NUM: this.current_position;
        let max = min + this.PANES_VISIBLE;
        for (let i = min; i < max; i++)
        {
            let h = $(this.$panes[i]).height();
            // Curator.log('LayoutCarousel->updateHeight i: '+i+' = '+h);
            if (h > paneMaxHeight) {
                paneMaxHeight = h;
            }
        }
        // Curator.log('LayoutCarousel->updateHeight paneMaxHeight: '+paneMaxHeight);
        if (this.$stage.height() !== paneMaxHeight) {
            this.$stage.animate({height: paneMaxHeight}, 300);
        }
	}

	addControls () {
		this.$viewport.append('<button type="button" data-role="none" class="crt-panel-prev crt-panel-arrow" aria-label="Previous" role="button" aria-disabled="false">Previous</button>');
		this.$viewport.append('<button type="button" data-role="none" class="crt-panel-next crt-panel-arrow" aria-label="Next" role="button" aria-disabled="false">Next</button>');

		this.$viewport.on('click','.crt-panel-prev', this.prev.bind(this));
		this.$viewport.on('click','.crt-panel-next', this.next.bind(this));
	}

    destroy () {
        this.destroyHandlers ();
        clearTimeout(this.timeout);
    }
}


Curator.UI.Layout.Carousel = LayoutCarousel;