
(function($) {
	// Default styling

	let defaults = {
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
		defaults.easing = 'ease-in-out';
	}
	// console.log (defaults);

	let css = {
		viewport: {
			'width': '100%', // viewport needs to be fluid
			// 'overflow': 'hidden',
			'position': 'relative'
		},

		pane_stage: {
			'width': '100%', // viewport needs to be fluid
			'overflow': 'hidden',
			'position': 'relative',
            'height':0
		},

		pane_slider: {
			'width': '0%', // will be set to (number of panes * 100)
			'list-style': 'none',
			'position': 'relative',
			'overflow': 'hidden',
			'padding': '0',
			'left':'0'
		},

		pane: {
			'width': '0%', // will be set to (100 / number of images)
			'position': 'relative',
			'float': 'left'
		}
	};

	class Carousel {
		constructor (container, options) {
			Curator.log('Carousel->construct');

            this.current_position=0;
            this.animating=false;
            this.timeout=null;
            this.FAKE_NUM=0;
            this.PANES_VISIBLE=0;

			this.options = $.extend([], defaults, options);

			this.$viewport = $(container); // <div> slider, known as $viewport

            this.$panes = this.$viewport.children();
            this.$panes.detach();

			this.$pane_stage = $('<div class="ctr-carousel-stage"></div>').appendTo(this.$viewport);
			this.$pane_slider = $('<div class="ctr-carousel-slider"></div>').appendTo(this.$pane_stage);

			// this.$pane_slider.append(this.$panes);

			this.$viewport.css(css.viewport); // set css on viewport
			this.$pane_slider.css( css.pane_slider ); // set css on pane slider
			this.$pane_stage.css( css.pane_stage ); // set css on pane slider

            this.addControls();
            this.update ();

			$(window).smartresize(() => {
				this.resize();
				this.move (this.current_position, true);

				// reset animation timer
				if (this.options.autoPlay) {
					this.animate();
				}
			})
		}

		update () {
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
			let $panes = [];
            //
            // $.each($els,(i, $pane)=> {
            //     let p = $pane.wrapAll('<div class="crt-carousel-col"></div>').parent();
            //     $panes.push(p)
            // });

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
				$(pane).css( $.extend(css.pane, {width: this.PANE_WIDTH+'px'}) );
			});
		}

		destroy () {

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
			// console.log(i);

			this.current_position = i;

			let maxPos = this.NUM_PANES - this.PANES_VISIBLE;

			// if (this.options.infinite)
			// {
			// 	let mod = this.NUM_PANES % this.PANES_VISIBLE;
			// }

			if (this.current_position < 0) {
				this.current_position = 0;
			} else if (this.current_position > maxPos) {
				this.current_position = maxPos;
			}

			let curIncFake = (this.FAKE_NUM + this.current_position);
			let left = curIncFake * this.PANE_WIDTH;
			// console.log('move');
			// console.log(curIncFake);
			let panesInView = this.PANES_VISIBLE;
			let max = this.options.infinite ? (this.PANE_WIDTH * this.NUM_PANES) : (this.PANE_WIDTH * this.NUM_PANES) - this.VIEWPORT_WIDTH;


			this.currentLeft = left;

			//console.log(left+":"+max);

			if (left < 0) {
				this.currentLeft = 0;
			} else if (left > max) {
				this.currentLeft = max;
			} else {
				this.currentLeft = left;
			}

			if (noAnimate) {
				this.$pane_slider.css(
					{
						left: ((0 - this.currentLeft) + 'px')
					});
                this.moveComplete();
			} else {
				let options = {
					duration: this.options.duration,
					complete: () => {
						this.moveComplete();
					}
				};
				if (this.options.easing) {
					options.easing = this.options.easing;
				}
				this.$pane_slider.animate(
					{
						left: ((0 - this.currentLeft) + 'px')
					},
					options
				);
			}
		}

		moveComplete () {
			// console.log ('moveComplete');
			// console.log (this.current_position);
			// console.log (this.NUM_PANES - this.PANES_VISIBLE);
			if (this.options.infinite && (this.current_position >= (this.NUM_PANES - this.PANES_VISIBLE))) {
				// console.log('IIIII');
				// infinite and we're off the end!
				// re-e-wind, the crowd says 'bo selecta!'
				this.$pane_slider.css({left:0});
				this.current_position = 0 - this.PANES_VISIBLE;
				this.currentLeft = 0;
			}

			setTimeout(() =>{
                let paneMaxHieght = 0;
                for (let i=this.current_position;i<this.current_position + this.PANES_VISIBLE;i++)
                {
                	let p = $(this.$panes[i]).children('.crt-post');
                    let h = p.height();
                    if (h > paneMaxHieght) {
                        paneMaxHieght = h;
                    }
                    console.log(p);
                    console.log(i+":"+h);
                }
            	this.$pane_stage.animate({height:paneMaxHieght},300);
            }, 50);

			this.$viewport.trigger('curatorCarousel:changed', [this, this.current_position]);

			if (this.options.autoPlay) {
				this.animate();
			}
		}

		addControls () {
			this.$viewport.append('<button type="button" data-role="none" class="crt-panel-prev crt-panel-arrow" aria-label="Previous" role="button" aria-disabled="false">Previous</button>');
			this.$viewport.append('<button type="button" data-role="none" class="crt-panel-next crt-panel-arrow" aria-label="Next" role="button" aria-disabled="false">Next</button>');

			this.$viewport.on('click','.crt-panel-prev', this.prev.bind(this));
			this.$viewport.on('click','.crt-panel-next', this.next.bind(this));
		}

		method () {
			let m = arguments[0];
			// let args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
			if (m == 'update') {
				this.update();
			} else if (m == 'add') {
				this.add(arguments[1]);
			} else if (m == 'destroy') {
				this.destroy();
			} else {

			}
		}
	}

	let carousels = {};
	function rand () {
		return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
	}

	$.extend($.fn, { 
		curatorCarousel: function (options) {
			let args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));

			$.each(this, function(index, item) {
				let id = $(item).data('carousel');

				if (carousels[id]) {
					carousels[id].method.apply(carousels[id], args);
				} else {
					id = rand();
					carousels[id] = new Carousel(item, options);
					$(item).data('carousel', id);
				}
			});

			return this;
		}
	});

	window.CCarousel = Carousel;
})($);

