
// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

import Templates from '../templates/templates';
import helpers from './templating_helpers';
import Logger from './logger';
import z from './lib';
import StringUtils from '../utils/string';

let _rendererTmplCache = {};

let Templating = {
    renderTemplate (templateId, data, options) {
        if (options) {
            data.options = options;
        }

        return Templating.renderDiv(templateId, data);
    },

    renderDiv (source, data) {
        let tmpl = Templating.render(source, data);
        if (z.parseHTML) {
            // breaks with jquery < 1.8
            tmpl = z.parseHTML(tmpl);
        }
        return z(tmpl).filter('div');
    },

    loadTemplate: function (templateId) {
        let source = '', $t = '';
        templateId = templateId.trim();
        try {
            $t = z('#' + templateId);
        } catch (e) {
        }

        if ($t.length === 1) {
            source = $t.html();
        } else if (Templates[templateId] !== undefined) {
            source = Templates[templateId];
        } else if (StringUtils.isHtml(templateId)) {
            source = templateId;
        }

        if (source === '') {
            throw new Error('Could not find template ' + templateId);
        }
        return source;
    }, render (templateId, data) {
        let func = _rendererTmplCache[templateId];
        if (!func) {
            let source = this.loadTemplate(templateId);

            try {
                let strComp = source.replace(/[\r\t\n]/g, " ")
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
                _rendererTmplCache[templateId] = func;
            } catch (e) {
                Logger.error ('Template parse error: ' +e.message);
                throw new Error ('Template parse error: ' +e.message +' for template: '+templateId);
            }
        }

        try {
            helpers.data = data;
            return func.call(helpers, data);
        } catch (e) {
            // console.log(e);
            Logger.error ('Template render error: ' +e.message +' for template: '+templateId);
            window.console.log (data);
            throw new Error ('Template render error: ' +e.message +' for template: '+templateId);
        }
    }
};

export default Templating;

