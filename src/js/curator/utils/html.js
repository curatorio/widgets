import Logger from '/curator/core/logger';
import z from '/curator/core/lib';

const HtmlUtils = {
    checkContainer: function (container) {
        Logger.log("Curator->checkContainer: " + container);
        if (z(container).length === 0) {
            if (window.console) {
                window.console.log('Curator could not find the element ' + container + '. Please ensure this element existings in your HTML code. Exiting.');
            }
            return false;
        }
        return true;
    },

    checkPowered: function (jQuerytag) {
        Logger.log("Curator->checkPowered");
        let h = jQuerytag.html();
        // Logger.log (h);
        if (h.indexOf('Curator') > 0) {
            return true;
        } else {
            window.alert('Container is missing Powered by Curator');
            return false;
        }
    },

    addCSSRule: function (sheet, selector, rules, index) {
        index = index || 0;
        if ('insertRule' in sheet) {
            sheet.insertRule(selector + '{' + rules + '}', 0);
        }
        else if ('addRule' in sheet) {
            sheet.addRule(selector, rules);
        }
    },

    createSheet: function () {
        let style = document.createElement("style");
        // WebKit hack :(
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);
        return style.sheet;
    },

    loadCSS: function () {
        // not used!
    }
};


export default HtmlUtils;