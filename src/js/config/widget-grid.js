import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    templateWidget:'widget-grid',
    animate:false,
    minWidth:200,
    rows:3,
    showLoadMore:false,
    loadMoreRows:1,
    continuousScroll:false,
    continuousScrollOffset:50,
    post: {
        template: 'post-grid',
        imageHeight:'100%'
    },
    responsive:{
        480:{
            loadMoreRows:4
        },
        768:{
            loadMoreRows:2
        }
    },
});

export default config;