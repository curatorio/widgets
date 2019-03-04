
import EventBus from '../../core/bus';
import Templating from '../../core/templating';
import z from '../../core/lib';
import strings from '../../utils/string';

class Control extends EventBus {
    constructor () {
        super();

        this.$refs = {};
    }

    render () {
        let options = this.widget ? this.widget.options : {};
        let data = this.json ? this.json : {};
        let $el = Templating.renderTemplate(this.templateId, data, options);

        this.onHandler($el, 'c-on:click', 'click');
        this.onHandler($el, 'c-on:blur', 'blur');
        this.onHandler($el, 'c-on:change', 'change');
        this.onHandler($el, 'c-on:load', 'load');
        this.onHandler($el, 'c-on:error', 'error');

        // Setup refs
        let refs = $el.find('[ref]');
        for (let refEl of refs) {
            let refName = z(refEl).attr('ref');
            this.$refs[refName] = z(refEl);
        }

        if (this.$el) {
            // TODO - If we're re-rendering we really need to reattach the event listeners ...  
            this.$el.replaceWith($el);
        } else {
            this.$el = $el;
        }
    }

    _fnName (fnSig) {
        fnSig = fnSig.replace('(','');
        fnSig = fnSig.replace(')','');
        return fnSig;
    }

    onHandler ($el, selector, action) {
        let attr = selector;
        selector = strings.replaceAll(selector, ':', '\\:');

        for (let el of $el.find('['+selector+']')) {
            let fnName = this._fnName(z(el).attr(attr));
            // console.log(fnSig);
            let fn = this[fnName] ? this[fnName] : function () { console.error (fnName+'() does not exist ');}; // jshint ignore:line
            z(el).on(action, (ev) => { // jshint ignore:line
                ev.preventDefault();
                ev.stopPropagation();
                fn.call(this, ev);
            });
        }
    }

    testInFrame (h) {
        let item = this.$el[0];
        // console.log(h);
        let postRect = item.getBoundingClientRect();
        // console.log(postRect.y);
        let postTop = postRect.y;
        let postBottom = (postRect.y + postRect.height);

        // if (i === 0 && j === 2) {
        //     console.log(postRect.y+":"+postTop + ":" + postBottom + " " + visible);
        // console.log(postTop + ":" + postBottom + " " + visible);
        // console.log(i + ":" + j + " - " + h + " - " + postTop + ":" + postBottom + " " + visible);
        //     if(visible) {
        //         stop = true;
        //     }
        // }

        // if (visible) {
        //     this.$el.trigger('crt-visible');
        // }

        return postBottom > 0 && postTop < h;
    }

    checkRefs (refNames) {
        for (let refName of refNames) {
            if (!this.$refs[refName]) {
                throw new Error('Curator Widget Error: Missing ref: '+refName);
            }
        }
    }
}

export default Control;