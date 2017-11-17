
let ConfigWidgetBase = {
    apiEndpoint: 'https://api.curator.io/v1.1',
        feedId:'',
        postsPerPage:12,
        maxPosts:0,
        templatePost:'v2-post',
        templatePopup:'v1-popup',
        templatePopupWrapper:'v1-popup-wrapper',
        templateFilter:'v1-filter',
        showPopupOnClick:true,
        onPostsLoaded: function () {

    },
    filter: {
        showNetworks: false,
            networksLabel: 'Networks:',

            showSources: false,
            sourcesLabel: 'Sources:',
    }
};

export default ConfigWidgetBase;