let Events = {
    FEED_LOADED             :'feed:loaded',
    FEED_FAILED             :'feed:failed',

    FILTER_CHANGED          :'filter:changed',

    POSTS_LOADED             :'posts:loaded',
    POSTS_FAILED             :'posts:failed',
    POSTS_RENDERED           :'posts:rendered',

    POST_CREATED            :'post:created',
    POST_CLICK              :'post:click',
    POST_CLICK_READ_MORE    :'post:clickReadMore',
    POST_IMAGE_LOADED       :'post:imageLoaded',
    POST_IMAGE_FAILED       :'post:imageFailed',
    POST_LAYOUT_CHANGED     :'post:layoutChanged',

    CAROUSEL_CHANGED        :'carousel:changed',
    GRID_HEIGHT_CHANGED     :'grid:heightChanged',

    PANE_HEIGHT_CHANGED     :'pane:heightChanged',

    WIDGET_RESIZE           : 'widget:resize'
};

export default Events;