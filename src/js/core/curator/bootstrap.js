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
    }
};

if (jQuery === undefined) {
    Curator.alert ('Curator requires jQuery. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}


