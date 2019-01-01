

import popupWrapperTemplate from './general/popup_wrapper';
import popupTemplate from './general/popup';

import filterTemplate from './general/filter';

import gridPost from "./grid/post";
import gridFeed from "./grid/feed";
import gridPostMinimal from "./grid/post-minimal";
import gridPostRetro from "./grid/post-retro";

import listFeed from "./list/feed";
import listPost from "./list/post";

import waterfallFeed from "./waterfall/feed";
import waterfallPost from "./waterfall/post";
import waterfallPostMalibu from "./waterfall/post-malibu";
import waterfallPostRetro from "./waterfall/post-retro";

import carouselPost from "./carousel/post";
import carouselFeed from "./carousel/feed";

import gridCarouselPost from "./grid-carousel/post";
import gridCarouselFeed from "./grid-carousel/feed";

let Templates = {
    // General
    'filter'                : filterTemplate,
    'popup'                 : popupTemplate,
    'popup-wrapper'         : popupWrapperTemplate,

    // Waterfall
    'waterfall-feed'        : waterfallFeed,
    'waterfall-post'        : waterfallPost,
    'waterfall-post-malibu' : waterfallPostMalibu,
    'waterfall-post-retro'       : waterfallPostRetro,

    // Carousel
    'carousel-post'         : carouselPost,
    'carousel-feed'         : carouselFeed,

    // Gid
    'grid-feed'             : gridFeed,
    'grid-post'             : gridPost,
    'grid-post-minimal'     : gridPostMinimal,
    'grid-post-retro'       : gridPostRetro,

    // List
    'list-feed'             : listFeed,
    'list-post'             : listPost,

    // Grid Carousel
    'grid-carousel-post'    : gridCarouselPost,
    'grid-carousel-feed'    : gridCarouselFeed
};

export default Templates;




