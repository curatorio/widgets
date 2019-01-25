import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    autoPlay:true,
    autoLoad:true,
    infinite:true,
    matchHeights:false,
    rows:1,
    controlsOver: true,
    controlsShowOnHover: true,
    post: {
        template: 'post-grid',
    },
    templateWidget:'widget-grid-carousel',
});

export default config;