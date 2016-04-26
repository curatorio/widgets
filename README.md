Curator.io Social Feed Widgets
===


#### Demo

[Curator.io](http://curator.io/showcase)

#### Setup

Sign up to [Curator.io](http://admin.curator.io/auth/register) to set up a social feed - it's free :)
You'll need your unique `FEED_ID` to use the widgets.

#### CDN

CDN hosted Curator.io Widgets are a great way to get up and running quickly:

In your `<head>` add:

```html
<link rel="stylesheet" type="text/css" href="//cdn.curator.io/1.0/css/curator.widget.waterfall.css"/>
```

In your ```<body>``` where you want the feed to appear:
```html
<div id="curator-feed">
    <a href="https://curator.io" target="_blank" class="crt-logo">Powered by Curator.io</a>
</div>
```
Then, before your closing ```<body>``` tag add:

```html
<script type="text/javascript" src="//cdn.curator.io/1.0/js/curator.widget.waterfall.js"></script>
<script type="text/javascript">
	// While you're testing
    Curator.debug = true;

    // Change FEED_ID to your unique FEED_ID
    var widget = new Curator.Waterfall({
        container:'#curator-feed',
        feedId:FEED_ID
    });
</script>
```
