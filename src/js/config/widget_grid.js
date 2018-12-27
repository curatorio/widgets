

import ConfigWidgetBase from './widget_base';
import z from '../core/lib';

let ConfigWidgetGrid = z.extend({}, ConfigWidgetBase, {
    templatePost:'grid-post',
    templateFeed:'grid-feed',
    animate:false,
    grid: {
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
        }
    },
    responsive:{
        480:{
            grid:{
                loadMoreRows:4
            }
        },
        768:{
            grid:{
                loadMoreRows:2
            }
        }
    }
});

export default ConfigWidgetGrid;