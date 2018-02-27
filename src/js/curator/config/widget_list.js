

import ConfigWidgetBase from './widget_base';
import z from '/curator/core/lib';

let ConfigWidgetList = z.extend({}, ConfigWidgetBase, {
    templatePost:'list-post',
    templateFeed:'list-feed',
    animate:false,
    list: {
        showLoadMore:true,
    }
});

export default ConfigWidgetList;