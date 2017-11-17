

import ConfigWidgetBase from "./widget_base";
import z from "../core/lib";

let ConfigWidgetWaterfall = z.extend({}, ConfigWidgetBase, {
    scroll:'more',
    waterfall: {
        gridWidth:300,
        animate:true,
        animateSpeed:400
    }
});

export default ConfigWidgetWaterfall;