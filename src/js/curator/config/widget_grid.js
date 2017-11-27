

import ConfigWidgetBase from "./widget_base";
import z from "../core/lib";

let ConfigWidgetGrid = z.extend({}, ConfigWidgetBase, {
    templatePost:'grid-post-v2',
    templateFeed:'grid-feed-v2',
    animate:false,
    grid: {
        minWidth:200,
        rows:3
    }
});

export default ConfigWidgetGrid;