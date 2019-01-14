import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    post: {
        template: 'post-list',
    },
    widget : {
        template:'widget-list',
        animate:false,
        showLoadMore:true,
        continuousScroll:false,
    }
});

export default config;