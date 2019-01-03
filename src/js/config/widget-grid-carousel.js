import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    autoPlay:true,
    autoLoad:true,
    infinite:true,
    matchHeights:false,
    rows:1,
    post: {
        template: 'post-grid',
    },
    templateWidget:'widget-grid-carousel',
});

export default config;