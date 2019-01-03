import base from './widget-base';
import z from '../core/lib';

let config = z.extend({}, base, {
    templatePost:'post-list',
    templateWidget:'widget-list',
    animate:false,
    list: {
        showLoadMore:true,
    }
});

export default config;