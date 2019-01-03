
let base = {
    apiEndpoint: 'https://api.curator.io/v1.1',
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    templatePost:'post-general',
    templatePopup:'popup',
    templatePopupWrapper:'popup-wrapper',
    templateFilter:'filter',
    lang:'en',
    debug:false,
    autoPlayVideos:false,
    postClickAction:'open-popup',             // open-popup | goto-source | nothing
    postClickReadMoreAction:'open-popup',     // open-popup | goto-source | nothing
    filter: {
        showNetworks: false,
        showSources: false,
    }
};

export default base;