// Test jQuery exists

var Curator = {
    debug:false,
    SOURCE_TYPES : ['twitter','instagram'],

    log:function (s) {

        if (root.console && Curator.debug) {
            root.console.log(s);
        }
    },

    alert:function (s) {
        if (root.alert) {
            root.alert(s);
        }
    },

    checkContainer:function (container) {
        Curator.log("Curator->checkContainer: "+container);
        if (jQuery(container).length === 0) {
            Curator.alert ('Curator could not find the element '+container+'. Please ensure this element existings in your HTML code. Exiting.');
            return false;
        }
        return true;
    },

    checkPowered : function (jQuerytag) {
        Curator.log("Curator->checkPowered");
        var h = jQuerytag.html ();
        // Curator.log (h);
        if (h.indexOf('Curator') > 0) {
            return true
        } else {
            Curator.alert ('Container is missing Powered by Curator');
            return false;
        }
    }
};

if (jQuery === undefined) {
    Curator.alert ('Curator requires jQuery. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}


