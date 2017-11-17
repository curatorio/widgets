

import v2GridPostTemplate from "./v2/grid_post";
import v2GridFeedTemple from "./v2/grid_feed";
import v1PopupUnderlayTemplate from "./v1/popup_underlay";
import v1PopupWrapperTemplate from "./v1/popup_wrapper";
import v1PopupTemplate from "./v1/popup";
import v1FilterTemplate from "./v1/filter";
import v1gridPostTemplate from "./v1/grid_post";
import v1PostTemplate from "./v1/post";
import v2PostTemplate from "./v2/post";

let Templates = {
    // V1
    'v1-post'            : v1PostTemplate,
    'v1-filter'          : v1FilterTemplate,
    'v1-popup'           : v1PopupTemplate,
    'v1-popup-underlay'  : v1PopupUnderlayTemplate,
    'v1-popup-wrapper'   : v1PopupWrapperTemplate,
    'v1-grid-post'       : v1gridPostTemplate,

    // V2
    'v2-post'            : v2PostTemplate,
    'v2-filter'          : v1FilterTemplate,
    'v2-popup'           : v1PopupTemplate,
    'v2-popup-underlay'  : v1PopupUnderlayTemplate,
    'v2-popup-wrapper'   : v1PopupWrapperTemplate,

    'v2-grid-post'       : v2GridPostTemplate,
    'v2-grid-feed'       : v2GridFeedTemple,
};

export default Templates;




