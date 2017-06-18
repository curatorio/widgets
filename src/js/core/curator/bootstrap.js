// Test $ exists

let Curator = {
    debug: false,
    SOURCE_TYPES: ['twitter', 'instagram'],

    log: function (s) {

        if (window.console && Curator.debug) {
            window.console.log(s);
        }
    },

    alert: function (s) {
        if (window.alert) {
            window.alert(s);
        }
    },

    checkContainer: function (container) {
        Curator.log("Curator->checkContainer: " + container);
        if ($(container).length === 0) {
            if (window.console) {
                window.console.log('Curator could not find the element ' + container + '. Please ensure this element existings in your HTML code. Exiting.');
            }
            return false;
        }
        return true;
    },

    checkPowered: function (jQuerytag) {
        Curator.log("Curator->checkPowered");
        let h = jQuerytag.html();
        // Curator.log (h);
        if (h.indexOf('Curator') > 0) {
            return true;
        } else {
            Curator.alert('Container is missing Powered by Curator');
            return false;
        }
    },

    loadCSS: function (config) {
        try {
            let sheet = Curator.createSheet(config);

            let headerBgs = '.crt-post .crt-post-header, .crt-post .crt-post-header .social-icon';
            let headerTexts = '.crt-post .crt-post-header, .crt-post .crt-post-share, .crt-post .crt-post-header .crt-post-name a, .crt-post .crt-post-share a, .crt-post .crt-post-header .social-icon i';
            let bodyBgs = '.crt-post';
            let bodyTexts = '.crt-post .crt-post-content-text';

            // add new rules
            Curator.addCSSRule(sheet, headerBgs, 'background-color:' + config.colours.headerBg);
            Curator.addCSSRule(sheet, headerTexts, 'color:' + config.colours.headerText);
            Curator.addCSSRule(sheet, bodyBgs, 'background-color:' + config.colours.bodyBg);
            Curator.addCSSRule(sheet, bodyTexts, 'color:' + config.colours.bodyText);
        }
        catch (err) {
            console.log('CURATOR UNABLE TO LOAD CSS');
            console.log(err.message);
        }
    },

    addCSSRule: function (sheet, selector, rules, index) {
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

    loadWidget: function (config, template) {
        if (template) {
            Curator.Templates.postTemplate = template;
        }

        let ConstructorClass = window.Curator[config.type];
        window.curatorWidget = new ConstructorClass(config);
    },

    Templates:{},

    Config:{
        Defaults : {
            apiEndpoint: 'https://api.curator.io/v1',
            feedId:'',
            postsPerPage:12,
            maxPosts:0,
            debug: false,
            templatePost:'#v2-post-template',
            templatePopup:'#v1-popup-template',
            templatePopupWrapper:'#v1-Popup-wrapper-template',
            onPostsLoaded: function () {
            },
            filter: {
                showNetworks: false,
                networksLabel: 'Networks:',

                showSources: false,
                sourcesLabel: 'Sources:',
            }
        }
    }
};

if ($ === undefined) {
    Curator.alert('Curator requires jQuery. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}


