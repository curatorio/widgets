;(function(root, factory) {
	// no amd or require code because this is supposed to run stand alone!
	root.Curator = factory(window);
}(this, function(root) {
	
// copy Zepto to our current scope as $
var $ = window.Zepto;


	root.Curator = Curator;
	return Curator;
}));