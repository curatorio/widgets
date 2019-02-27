import Logger from '../core/logger';
import z from '../core/lib';

let sheetCounter = 0;

const HtmlUtils = {
    checkContainer (container) {
        Logger.log("Curator->checkContainer: " + container);
        if (z(container).length === 0) {
            Logger.error('Curator could not find the element ' + container + '. Please ensure this element existings in your HTML code. Exiting.');
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

    deleteCSSRules (sheet) {
        if (sheet.cssRules) { // all browsers, except IE before version 9
            for (let i = sheet.cssRules.length - 1; i > -1; i--) {
                sheet.deleteRule (i);
            }
        }
        else
        {  // Internet Explorer before version 9
            for (let j=0; j < sheet.rules.length; j++) {
                sheet.removeRule (j);
            }
        }
    },

    createSheet () {
        let style = document.createElement("style");
        // WebKit hack :(
        style.setAttribute('type','text/css');
        style.setAttribute('data-sheet-num', sheetCounter+'');
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);

        sheetCounter++;
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