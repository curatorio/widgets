import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    post: {
        template: 'post-grid',
        matchHeights: false,
        minWidth: 200,
        imageHeight:'100%'
    },
    widget: {
        template: 'widget-grid-carousel',
        autoPlay: true,
        autoLoad: true,
        infinite: true,
        rows: 1,
        controlsOver: true,
        controlsShowOnHover: true,

        speed: 5000,
        duration: 700,
        panesVisible: null,
        useCss: true,
        moveAmount: 0,
        easing: null,
    }
});

if (z.zepto) {
    config.widget.easing = 'ease-in-out';
}

export default config;