

import popupWrapper from './general/popup_wrapper';
import popup from './general/popup';

import filter from './general/filter';

import postGrid from "./post/grid";
import postGridTokyo from "./post/grid-tokyo";
import postGridMinimal from "./post/grid-minimal";
import postGridRetro from "./post/grid-retro";
import postGeneral from "./post/general";
import postGeneralLondon from "./post/general-london";
import postGeneralBerlin from "./post/general-berlin";
import postGridNewYork from "./post/grid-new-york";
import postList from "./post/list";

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
    'post-general-london'   : postGeneralLondon,
    'post-general-berlin'   : postGeneralBerlin,
    'post-grid'             : postGrid,
    'post-grid-new-york'    : postGridNewYork,
    'post-grid-minimal'     : postGridMinimal,
    'post-grid-tokyo'       : postGridTokyo,
    'post-grid-retro'       : postGridRetro,
    'post-list'             : postList,

    // Widgets
    'widget-carousel'       : widgetCarousel,
    'widget-waterfall'      : widgetWaterfall,
    'widget-grid'           : widgetGrid,
    'widget-grid-carousel'  : widgetGridCarousel,
    'widget-list'           : widgetList,
};

export default Templates;




