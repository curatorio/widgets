

import base from './widget_base';
import z from '../core/lib';

let config = z.extend({}, base, {
    templatePost:'waterfall-post',
    templateFeed:'waterfall-feed',
    colGutter: 0,
    colWidth: 300,
    showLoadMore:true,
    continuousScroll:false,
    animate:true,
    selector: '.crt-post-c',
    animationSpeed: 200,
    animationDuration: 300,
    animationEffect: 'fadeInOnAppear',
    animationQueue: true,
    animationComplete: function () {}
});

export default config;