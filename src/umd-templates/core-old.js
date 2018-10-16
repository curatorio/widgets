;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define('curator', ['jquery'], factory);
    } else if (typeof exports === 'object') {
		module.exports = factory(require('jquery'));
	} else {
		root.Curator = factory(root.jQuery || root.Zepto);
	}
}(this, function($local) {

	<%= contents %>

	return Curator;
}));
