// Test jQuery exists

var global = window;

if (jQuery == global.undefined) {
    window.alert ('Curator requires jQuery. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}

var Curator = {
    SOURCE_TYPES : ['twitter','instagram'],

    log:function (s) {
        if (global.console) {
            global.console.log(s);
        }
    }
};


