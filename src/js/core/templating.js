
// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

import Templates from '../templates/templates';
import helpers from './templating_helpers';
import Logger from './logger';
import z from './lib';

let _rendererTmplCache = {};

let Templating = {
    renderTemplate (templateId, data, options) {

        if (options) {
            data.options = options;
        }

        let source = '';
        let $t = z('#'+templateId);

        if ($t.length===1)
        {
            source = $t.html();
        } else if (Templates[templateId] !== undefined)
        {
            source = Templates[templateId];
        }

        if (source === '')
        {
            throw new Error ('Could not find template '+templateId);
        }

        return Templating.renderDiv(source, data);
    },

    renderDiv (source, data) {
        let tmpl = Templating.render(source, data);
        if (z.parseHTML) {
            // breaks with jquery < 1.8
            tmpl = z.parseHTML(tmpl);
        }
        return z(tmpl).filter('div');
    },

    render (str, data) {
        let err = "";
        try {
            let func = _rendererTmplCache[str];
            if (!func) {
                let strComp =
                    str.replace(/[\r\t\n]/g, " ")
                        .replace(/'(?=[^%]*%>)/g, "\t")
                        .split("'").join("\\'")
                        .split("\t").join("'")
                        .replace(/<%=(.+?)%>/g, "',this._s($1),'")
                        .replace(/<!=(.+?)!>/g, "',$1,'")
                        .split("<%").join("');")
                        .split("%>").join("p.push('");

                // note - don't change the 'var' in the string to 'let'!!!
                let strFunc =
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +
                    "with(obj){p.push('" + strComp + "');}return p.join('');";

                func = new Function("obj", strFunc);  // jshint ignore:line
                _rendererTmplCache[str] = func;
            }
            helpers.data = data;
            return func.call(helpers, data);
        } catch (e) {
            Logger.error ('Template parse error: ' +e.message);
            err = e.message;
        }
        return " # ERROR: " + err + " # ";
    }
};

export default Templating;

