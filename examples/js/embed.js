
(function () {
	var feedId      = "6dab8d1e-abe9-4fb7-8475-99ab8d5e";
	// var scriptSrc   = '../dist/js/curator.js';
	// var cssSrc      = '../dist/css/curator.css';
	var scriptSrc   = 'https://cdn.curator.io/1.1/js/curator.js';
	var cssSrc      = 'https://cdn.curator.io/1.1/css/curator.css';
	var widgetClass = 'Grid';
	var customCss   = '';

	// Add CSS
	var css = document.createElement("link");
	css.rel = 'stylesheet';
	css.href = cssSrc;
	jQuery("head").append(css);


	// Launch widget
	function loadCurator () {
		// Curator.debug = true;

		var config = {
			container: '#curator-feed',
			feedId: feedId,
			postsPerPage: 8
		};
		jQuery.extend(config,window.curatorConfig);

		var Constructor = window.Curator[widgetClass];
		var widget = new Constructor(config);
	}

	// Add Script
	var s = document.createElement("script");
	s.type = "text/javascript";
	document.body.appendChild(s);

	s.onload = function () {
		loadCurator();
	};
	s.src = scriptSrc;

})();