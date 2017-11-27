/* globals window */

let Logger = {
    debug: false,

    log: function (s) {

        if (window.console && Logger.debug) {
            window.console.log(s);
        }
    }
};

export default Logger;