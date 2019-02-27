import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    post: {
        template: 'post-general',
        matchHeights: false,
        showComments: false,
        showLikes: false,
        maxHeight: 0,
        minWidth: 2000,
    },
    widget: {
        template: 'widget-carousel',
        autoPlay: true,
        autoLoad: true,
        infinite: false,
        controlsOver: true,
        controlsShowOnHover: true,
        speed: 5000,
        duration: 700,
        panesVisible: null,
        useCss: true,
        moveAmount: 0,
        easing: null,
    },
});

if (z.zepto) {
    config.widget.easing = 'ease-in-out';
}

export default config;