import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    post: {
        template: 'post-general',
        animate: true,
        maxHeight: 0
    },
    widget: {
        template: 'widget-waterfall',
        colWidth: 300,
        colGutter: 0,
        showLoadMore: true,
        continuousScroll: false,
    },
});

export default config;