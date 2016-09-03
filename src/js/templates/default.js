;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		// Cheeky wrapper to add root to the factory call
		var factoryWrap = function () {
			var argsCopy = [].slice.call(arguments);
			argsCopy.unshift(root);
			return factory.apply(this, argsCopy);
		};
		define(['jquery', 'curator'], factoryWrap);
	} else if (typeof exports === 'object') {
		module.exports = factory(root, require('jquery'));
	} else {
		root.Curator = factory(root, root.jQuery || root.Zepto);
	}
}(this, function(root, jQuery) {

	<%= contents %>

	return Curator;
}));
