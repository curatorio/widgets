;(function(root, factory) {
	// no amd or require code because this is supposed to run stand alone!
	root.Curator = factory(window);
}(this, function(root) {
	<%= contents %>

	root.Curator = Curator;
	return Curator;
}));
