import base from './widget-base';
import z from '../core/lib';

let config = z.extend(true, {}, base, {
    post: {
        template: 'post-grid',
        imageHeight:'100%',
        minWidth:250,
    },
    widget:{
        animate:false,
        continuousScroll:false,
        continuousScrollOffset:50,
        rows:3,
        template:'widget-grid',
        showLoadMore:false,
        loadMoreRows:1,
    },
    responsive:{
        480:{
            widget : {
                loadMoreRows: 4
            }
        },
        768:{
            widget : {
                loadMoreRows: 2
            }
        }
    },
});

export default config;