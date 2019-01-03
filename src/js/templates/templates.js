

import popupWrapper from './general/popup_wrapper';
import popup from './general/popup';

import filter from './general/filter';

import postGrid from "./post/grid";
import postGridMinimal from "./post/grid-minimal";
import postGridRetro from "./post/grid-retro";
import postGeneral from "./post/general";
import postGeneralMalibu from "./post/general-malibu";
import postGeneralRetro from "./post/general-retro";

import widgetCarousel from "./widgets/carousel";
import widgetWaterfall from "./widgets/waterfall";
import widgetGrid from "./widgets/grid";
import widgetGridCarousel from "./widgets/grid-carousel";
import widgetList from "./widgets/list";

let Templates = {
    // General
    'filter'                : filter,
    'popup'                 : popup,
    'popup-wrapper'         : popupWrapper,

    // Post
    'post-general'          : postGeneral,
    'post-general-retro'    : postGeneralRetro,
    'post-general-malibu'   : postGeneralMalibu,
    'post-grid'             : postGrid,
    'post-grid-minimal'       : postGridMinimal,
    'post-grid-retro'       : postGridRetro,

    // Widgets
    'widget-carousel'       : widgetCarousel,
    'widget-waterfall'      : widgetWaterfall,
    'widget-grid'           : widgetGrid,
    'widget-grid-carousel'  : widgetGridCarousel,
    'widget-list'           : widgetList,
};

export default Templates;




