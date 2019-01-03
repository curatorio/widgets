import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    templateWidget:'widget-waterfall',
    colGutter: 0,
    colWidth: 300,
    showLoadMore:true,
    continuousScroll:false,
    animate:true,
    post: {
        template: 'post-general'
    },
    selector: '.crt-post-c',
    animationSpeed: 200,
    animationDuration: 300,
    animationEffect: 'fadeInOnAppear',
    animationQueue: true,
    animationComplete: function () {}
});

export default config;