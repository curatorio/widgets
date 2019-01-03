import base from './widget-base';
import z from '../core/lib';

let config = z.extend({}, base, {
    autoPlay:true,
    autoLoad:true,
    infinite:true,
    matchHeights:false,
    rows:1,
    templatePost:'post-grid',
    templateWidget:'widget-grid-carousel',
});

export default config;