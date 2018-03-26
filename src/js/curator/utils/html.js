import Logger from '/curator/core/logger';
import z from '/curator/core/lib';

const HtmlUtils = {
    checkContainer (container) {
        Logger.log("Curator->checkContainer: " + container);
        if (z(container).length === 0) {
            if (window.console) {
                window.console.log('Curator could not find the element ' + container + '. Please ensure this element existings in your HTML code. Exiting.');
            }
            return false;
        }
        return true;
    },

    checkPowered (jQuerytag) {
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

    addCSSRule (sheet, selector, rules, index) {
        index = index || 0;
        if ('insertRule' in sheet) {
            sheet.insertRule(selector + '{' + rules + '}', 0);
        }
        else if ('addRule' in sheet) {
            sheet.addRule(selector, rules);
        }
    },

    createSheet () {
        let style = document.createElement("style");
        // WebKit hack :(
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);
        return style.sheet;
    },

    loadCSS () {
        // not used!
    },

    isTouch () {
        let b = false;
        try {
            b = ("ontouchstart" in document.documentElement);
        } catch (e) {
        }

        return b;
    },
    
    isVisible (el) {
        if(el.css('display')!=='none' && el.css('visibility')!=='hidden' && el.width()>0) {
            return true;
        } else {
            return false;
        }
    }
};


export default HtmlUtils;