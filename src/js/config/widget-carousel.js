import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    autoPlay:true,
    autoLoad:true,
    infinite:false,
    matchHeights:false,
    post: {
        template:'post-general'
    },
    templateWidget:'widget-carousel',
});

export default config;