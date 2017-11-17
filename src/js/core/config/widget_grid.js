

import ConfigWidgetBase from "./widget_base";
import z from "../core/lib";

let ConfigWidgetGrid = z.extend({}, ConfigWidgetBase, {
    templatePost:'v2-grid-post',
    templateFeed:'v2-grid-feed',
    animate:false,
    grid: {
        minWidth:200,
        rows:3
    }
});

export default ConfigWidgetGrid;