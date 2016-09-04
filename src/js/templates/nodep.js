;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		// Cheeky wrapper to add root to the factory call
		var factoryWrap = function () {
			var argsCopy = [].slice.call(arguments);
			argsCopy.unshift(root);
			return factory.apply(this, argsCopy);
		};
		define([], factoryWrap);
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.Curator = factory(root);
	}
}(this, function(root) {

	<%= contents %>

	return Curator;
}));
