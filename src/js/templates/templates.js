

import popupUnderlayTemplate from './general/popup_underlay';
import popupWrapperTemplate from './general/popup_wrapper';
import popupTemplate from './general/popup';
import filterTemplate from './general/filter';

import v1gridPostTemplate from "./v1/grid_post";
import postTemplateV1 from "./v1/post";

import postTemplateV2 from "./v2/post";


import gridPost from "./grid/post";
import gridFeed from "./grid/feed";
import gridPostMinimal from "./grid/post-minimal";

import listFeed from "./v2/list_feed";
import listPost from "./v2/list_post";

import waterfallFeed from "./waterfall/feed";
import waterfallPost from "./waterfall/post";
import waterfallPostMalibu from "./waterfall/post-malibu";

let Templates = {
    'filter'                : filterTemplate,
    'popup'                 : popupTemplate,
    'popup-underlay'        : popupUnderlayTemplate,
    'popup-wrapper'         : popupWrapperTemplate,

    // V1
    'post-v1'               : postTemplateV1,
    'grid-post-v1'          : v1gridPostTemplate,

    // V2
    'post-v2'               : postTemplateV2,

    // Gid
    'grid-feed'             : gridFeed,
    'grid-post'             : gridPost,
    'grid-post-minimal'     : gridPostMinimal,

    // List
    'list-feed'             : listFeed,
    'list-post'             : listPost,

    // Waterfall
    'waterfall-feed'        : waterfallFeed,
    'waterfall-post'        : waterfallPost,
    'waterfall-post-malibu' : waterfallPostMalibu,
};

export default Templates;




