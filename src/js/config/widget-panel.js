import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    autoPlay:true,
    autoLoad:true,
    matchHeights:false,
    templateWidget:'widget-carousel',
    moveAmount:1,
    fixedHeight:false,
    infinite:true,
    minWidth:2000,
    post:{
        template:'post-general'
    },
});


export default config;