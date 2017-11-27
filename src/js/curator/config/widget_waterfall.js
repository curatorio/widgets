

import ConfigWidgetBase from "./widget_base";
import z from "../core/lib";

let ConfigWidgetWaterfall = z.extend({}, ConfigWidgetBase, {
    waterfall: {
        gridWidth:300,
        animate:true,
        animateSpeed:400
    }
});

export default ConfigWidgetWaterfall;