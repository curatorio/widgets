;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
            define('curator', factory);
    } else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.Curator = factory();
	}
}(this, function() {
    <%= contents %>

	return Curator;
}));

