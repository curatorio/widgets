;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define('curator', factory);
    } else if (typeof exports === 'object') {
		module.exports = factory(require('jquery'));
	} else {
		root.Curator = factory(root.jQuery || root.Zepto);
	}
}(this, function($local) {
	if ($local == undefined) {
		window.alert ("jQuery not found\n\nThe Curator Widget is running in dependency mode - this requires jQuery of Zepto. Try disabling DEPENDENCY MODE in the Admin on the Publish page." );
		return false;
	}

	<%= contents %>

	return Curator;
}));
