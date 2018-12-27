
import EventBus from '../../core/bus';
import Templating from '../../core/templating';
import z from '../../core/lib';

class Control extends EventBus {
    constructor () {
        super();
    }

    render () {
        let options = this.widget ? this.widget.options : {};
        let $el = Templating.renderTemplate(this.templateId, this.json, options);

        let clicks = $el.find('[crt-click]');
        for (let el of clicks) {
            let fnSig = z(el).attr('crt-click');
            fnSig = fnSig.replace('(','');
            fnSig = fnSig.replace(')','');
            let fn = this[fnSig];
            if (fn) {
                z(el).on('click', fn.bind(this));
            }
        }

        if (this.$el) {
            // TODO - If we're re-rendering we really need to reattach the event listeners ...  
            this.$el.replaceWith($el);
        } else {
            this.$el = $el;
        }
    }
}

export default Control;