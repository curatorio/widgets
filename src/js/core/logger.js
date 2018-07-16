/* globals window */

let Logger = {
    debug: false,

    log: function (s) {

        if (window.console && Logger.debug) {
            window.console.log(s);
        }
    },

    error: function (s) {
        if (window.console) {
            window.console.error(s);
        }
    }
};

export default Logger;