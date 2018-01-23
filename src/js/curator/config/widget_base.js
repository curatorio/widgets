
let ConfigWidgetBase = {
    apiEndpoint: 'https://api.curator.io/v1.1',
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    templatePost:'post-v2',
    templatePopup:'popup',
    templatePopupWrapper:'popup-wrapper',
    templateFilter:'filter',
    showPopupOnClick:true,
    lang:'en',
    debug:false,
    postClickAction:'open-popup',     // open-popup | goto-source | nothing
    filter: {
        showNetworks: false,
        showSources: false,
    }
};

export default ConfigWidgetBase;