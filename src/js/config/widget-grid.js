import base from './widget-base';
import z from '../core/lib';

let config = z.extend({}, base, {
    templatePost:'post-grid',
    templateWidget:'widget-grid',
    animate:false,
    minWidth:200,
    rows:3,
    showLoadMore:false,
    loadMoreRows:1,
    continuousScroll:false,
    continuousScrollOffset:50,
    hover:{
        showName:true,
        showFooter:true,
        showText:true,
    },
    responsive:{
        480:{
            loadMoreRows:4
        },
        768:{
            loadMoreRows:2
        }
    },
    post : {
        imageHeight:'100%'
    }
});

export default config;