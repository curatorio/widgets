
(function($) {
	// Default styling
	var defaults = {
		circular: false,
		speed: 5000,
		easing: 'ease-in-out',
		duration: 700,
		minWidth: 300,
		moveAmount: 4,
		autoPlay:false
	};

	var css = {
		viewport: {
			'width': '100%', // viewport needs to be fluid
			// 'overflow': 'hidden',
			'position': 'relative'
		},

		pane_stage: {
			'width': '100%', // viewport needs to be fluid
			'overflow': 'hidden',
			'position': 'relative'
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

	var Carousel = function (item, options) {
		this.init (item, options);
	};

	$.extend(Carousel.prototype,{
		current_position:0,
		animating:false,
		timeout:null,

		init : function (item, options) {
			// console.log('init');

			var that = this;

			this.options = options;

			this.$item = $(item);
			this.$viewport = this.$item; // <div> slider, known as $viewport

			this.$panes = this.$viewport.children();
			this.$panes.detach();

			this.$pane_stage = $('<div class="ctr-carousel-stage"></div>').appendTo(this.$viewport);
			this.$pane_slider = $('<div class="ctr-carousel-slider"></div>').appendTo(this.$pane_stage);
			// this.$pane_slider = this.$item;

			this.$panes.appendTo(this.$pane_slider);

			this.$viewport.css(css.viewport); // set css on viewport
			this.$pane_slider.css( css.pane_slider ); // set css on pane slider
			this.$pane_stage.css( css.pane_stage ); // set css on pane slider

			this.update ();
			this.addControls();

			$(window).smartresize(function () {
				// console.log('resize');
				that.resize();

				that.move (that.current_position, false);

				// reset animation timer
				if (that.options.autoPlay) {
					that.animate();
				}
			})
		},

		update : function () {
			this.$panes = this.$pane_slider.children(); // <li> list items, known as $panes
			this.NUM_PANES = this.options.circular ? (this.$panes.length + 1) : this.$panes.length;

			if (this.NUM_PANES > 0) {
				this.resize();

				if (!this.animating) {
					if (this.options.autoPlay) {
						this.animate();
					}
				}
			}
		},

		add : function ($els) {
			this.$pane_slider.append($els);
		},

		resize: function () {
			// total panes (+1 for circular illusion)
			var PANE_WRAPPER_WIDTH = (this.NUM_PANES * 100) + '%'; // % width of slider (total panes * 100)

			this.VIEWPORT_WIDTH = this.$viewport.width();
			var mod = Math.floor(this.VIEWPORT_WIDTH/this.options.minWidth);

			this.$pane_slider.css({width: PANE_WRAPPER_WIDTH}); // set css on pane slider

			this.PANE_WIDTH = (this.VIEWPORT_WIDTH/mod);
			// console.log (this.VIEWPORT_WIDTH);

			var that = this;
			this.$panes.forEach(function (item, index) { // apply css to each pane and their children (h2, img)
				var $item = $(item);
				$item.css( $.extend(css.pane, {width: that.PANE_WIDTH+'px'}) );
			});
		},

		animate : function () {
			this.animating = true;
			var that = this;
			clearTimeout(this.timeout);
			this.timeout = setTimeout(function () {
				that.next();
			}, this.options.speed);
		},

		next : function () {
			this.move(this.current_position + this.options.moveAmount, false);
		},

		prev : function () {
			this.move(this.current_position - this.options.moveAmount, false);
		},

		move : function (i, noAnimate) {

			this.current_position = i;

			var left = this.PANE_WIDTH * this.current_position;
			var max = (this.PANE_WIDTH * this.NUM_PANES) - this.VIEWPORT_WIDTH;

			// console.log(left+":"+max);

			if (left < 0) {
				this.currentLeft = 0;
			} else if (left > max) {
				this.currentLeft = max;
			} else {
				this.currentLeft = left;
			}


			// console.log(paneOffset);
			// console.log(paneOffset.left);
			// console.log(this.currentLeft);

			if (noAnimate) {
				this.$pane_slider.css(
					{
						left: ((0 - this.currentLeft) + 'px')
					});
			} else {
				var that = this;
				this.$pane_slider.animate(
					{
						left: ((0 - this.currentLeft) + 'px')
					},
					{
						duration: this.options.duration,
						easing: this.options.easing,
						complete: function () {
							that.moveComplete();
						}
					}
				);
			}
		},

		moveComplete : function () {

			// circular illusion: reset to first slide without user noticing
			// var max = (this.PANE_WIDTH * this.NUM_PANES) - this.VIEWPORT_WIDTH;
			//  if (this.currentLeft >= max) {
			// 	this.$pane_slider.css({left:0});
			// 	this.current_position = 0;
			// 	this.currentLeft = 0;
			// }

			this.$item.trigger('carousel:changed', [this, this.current_position]);

			this.animate ();
		},

		addControls : function () {
			this.$viewport.append('<button type="button" data-role="none" class="slick-prev slick-arrow" aria-label="Previous" role="button" aria-disabled="false">Previous</button>');
			this.$viewport.append('<button type="button" data-role="none" class="slick-next slick-arrow" aria-label="Next" role="button" aria-disabled="false">Next</button>');


			this.$viewport.on('click','.slick-prev', this.prev.bind(this));
			this.$viewport.on('click','.slick-next', this.next.bind(this));
		},

		method : function () {
			var m = arguments[0];
			// var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
			if (m == 'update') {
				this.update();
			} else if (m == 'add') {
				this.add(arguments[1]);
			} else {

			}


		}
	});


	var carousels = {};
	function rand () {
		return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
	}

	$.extend($.fn, { 
		carousel: function (opts) {
			var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
			var options = $.extend([], defaults, opts);

			$.each(this, function(index, item) {
				var id = $(item).data('carousel');
				// console.log(id);

				if (carousels[id]) {
					carousels[id].method.apply(carousels[id], args);
				} else {
					id = rand();
					// console.log(id);
					carousels[id] = new Carousel(item, options);
					$(item).data('carousel', id);
				}
			});

			return this;
		}
	});
})($);

