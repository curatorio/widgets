import base from './widget-base';
import z from '../core/lib';

let config = z.extend({}, base, {
    autoPlay:true,
    autoLoad:true,
    matchHeights:false,
    templatePost:'post-general',
    templateWidget:'widget-carousel',
    moveAmount:1,
    fixedHeight:false,
    infinite:true,
    minWidth:2000
});


export default config;