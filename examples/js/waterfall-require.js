requirejs.config({
    paths: {
        jquery:                 'vendor/jquery.min',
        slick:                  'vendor/slick',
        curator:                '../../dist/js/curator.core',
        'curator-waterfall':     '../../dist/js/curator.waterfall'
    }
});

requirejs(['jquery','curator','curator-waterfall'],function($, Curator, CuratorWaterfall) {

    Curator.debug = true;

    var widget = new CuratorWaterfall({
        container:'#curator-feed',
        feedId:window.FEED_ID,
        debug:true,
        apiEndpoint:window.API_ENDPOINT,
        slick: {
            autoplay:false
        }
    });
});


