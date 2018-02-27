

import ConfigWidgetBase from './widget_base';
import z from '/curator/core/lib';

let ConfigWidgetWaterfall = z.extend({}, ConfigWidgetBase, {
    waterfall: {
        showLoadMore:true,
        continuousScroll:false,
        gridWidth:300,
        animate:true,
        animateSpeed:400
    }
});

export default ConfigWidgetWaterfall;