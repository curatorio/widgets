requirejs.config({
    paths: {
        jquery:                 'vendor/jquery.min',
        slick:                  'vendor/slick',
        'curator':              '../../dist/js/curator.core',
        'curator-carousel':     '../../dist/js/Curator.Widgets.Carousel'
    }
});


requirejs(['jquery','curator','curator-carousel'],function($, Curator, CuratorCarousel) {

    Curator.Logger.debug = true;

    var widget = new CuratorCarousel({
        container:'#curator-feed',
        feedId:window.FEED_ID,
        debug:true,
        apiEndpoint:window.API_ENDPOINT,
        slick: {
            autoplay:false
        }
    });
});

