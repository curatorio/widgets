let base = {
    lang: 'en',
    debug: false,
    hidePoweredBy: false,
    feed: {
        id: '',
        apiEndpoint: '',
        postsPerPage: 12,
        params: {}
    },
    widget: {
        autoLoadNew: false,
    },
    post: {
        template: 'post-general',
        showShare: true,
        showComments: false,
        showLikes: false,
        autoPlayVideos: true,
        clickAction: 'open-popup',             // open-popup | goto-source | nothing
        clickReadMoreAction: 'open-popup',     // open-popup | goto-source | nothing
    },
    popup: {
        template: 'popup',
        templateWrapper: 'popup-wrapper',
        autoPlayVideos: false
    },
    filter: {
        template: 'filter',
        showNetworks: false,
        showSources: false,
    },
};

export default base;