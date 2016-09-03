// Test jQuery exists

var Curator = {
    debug:false,
    SOURCE_TYPES : ['twitter','instagram'],

    log:function (s) {

        if (window.console && Curator.debug) {
            window.console.log(s);
        }
    },

    alert:function (s) {
        if (window.alert) {
            window.alert(s);
        }
    },

    checkContainer:function (container) {
        Curator.log("Curator->checkContainer: "+container);
        if (jQuery(container).length === 0) {
            if (window.console) {
                window.console.log('Curator could not find the element ' + container + '. Please ensure this element existings in your HTML code. Exiting.');
            }
            return false;
        }
        return true;
    },

    checkPowered : function (jQuerytag) {
        Curator.log("Curator->checkPowered");
        var h = jQuerytag.html ();
        // Curator.log (h);
        if (h.indexOf('Curator') > 0) {
            return true;
        } else {
            Curator.alert ('Container is missing Powered by Curator');
            return false;
        }
    },

    augment:augment
};

if (jQuery === undefined) {
    Curator.alert ('Curator requires jQuery. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}


