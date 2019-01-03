import base from './widget-base';
import z from '../core/lib';

let config = z.extend({}, base, {
    autoPlay:true,
    autoLoad:true,
    infinite:false,
    matchHeights:false,
    templatePost:'post-general',
    templateWidget:'widget-carousel',
});

export default config;