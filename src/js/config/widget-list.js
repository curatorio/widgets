import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    templateWidget:'widget-list',
    animate:false,
    post: {
        template: 'post-list',
    },
    list: {
        showLoadMore:true,
    }
});

export default config;