

import ConfigWidgetBase from './widget_base';
import z from '/curator/core/lib';

let ConfigWidgetGrid = z.extend({}, ConfigWidgetBase, {
    templatePost:'grid-post-v2',
    templateFeed:'grid-feed-v2',
    animate:false,
    grid: {
        minWidth:200,
        rows:3,
        showLoadMore:false,
        rowsToAdd:1,
        continuousScroll:false,
        continuousScrollOffset:50,
        hover:{
            showName:true,
            showFooter:true,
            showText:true,
        }
    }
});

export default ConfigWidgetGrid;