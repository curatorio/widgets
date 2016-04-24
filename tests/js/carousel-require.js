requirejs.config({
    paths: {
        jquery:     'vendor/jquery.min',
        slick:      'vendor/slick',
        curator:    '../../dist/js/curator.widget.carousel.noslick' 
    }
});


requirejs(['jquery','curator'],function($, Curator) {

    Curator.debug = true;

    var widget = new Curator.Carousel({
        container:'#feed1',
        feedId:window.FEED_ID,
        debug:true,
        apiEndpoint:window.API_ENDPOINT,
        slick: {
            autoplay:false
        }
    });
});

