
let base = {
    apiEndpoint: 'https://api.curator.io/v1.1',
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    lang:'en',
    debug:false,
    autoLoadNew:true,
    postClickAction:'open-popup',             // open-popup | goto-source | nothing
    postClickReadMoreAction:'open-popup',     // open-popup | goto-source | nothing
    filter: {
        template:'filter',
        showNetworks: false,
        showSources: false,
    },
    post: {
        template: 'post-general',
        showShare: true,
        autoPlayVideos: true,
    },
    popup : {
        template: 'popup',
        templateWrapper: 'popup-wrapper',
        autoPlayVideos: false
    }
};

export default base;