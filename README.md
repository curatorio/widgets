Curator.io Social Feed Widgets
===


### Demo

[Curator.io](http://curator.io/showcase)

### Setup

Sign up to [Curator.io](http://admin.curator.io/auth/register) to set up a social feed - it's free :)
You'll need your unique `FEED_ID` to use the widgets.

### CDN

CDN hosted Curator.io Widgets are a great way to get up and running quickly:

In your `<head>` add:

```html
<link rel="stylesheet" type="text/css" href="//cdn.curator.io/1.4/css/curator.css"/>
```

In your ```<body>``` where you want the feed to appear:
```html
<div id="curator-feed">
    <a href="https://curator.io" target="_blank" class="crt-logo">Powered by Curator.io</a>
</div>
```
Then, before your closing ```<body>``` tag add:

```html
<script type="text/javascript" src="//cdn.curator.io/1.4/js/curator.js"></script>
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

### Widgets

There are 4 main widgets in the Curator library:


**Waterfall**
```js
var widget = new Curator.Waterfall({
    // ...
});
```

**Carousel**
```js
var widget = new Curator.Carousel({
    // ...
});
```

**Grid**
```js
var widget = new Curator.Grid({
    // ...
});
```

**Panel**
```js
var widget = new Curator.Panel({
    // ...
});
```

### Customisation

### Widget Options

Each of the widgets can be passed a set of options to customise the widget

**Waterfall**
```js
var widget = new Curator.Waterfall({
    // ...
    waterfall: {
        gridWidth:250,    // sets the desired column width
        animate:true,     // should the posts animate in?
        animateSpeed:400  
    }
});
```

**Carousel**
```js
var widget = new Curator.Carousel({
    // ...
    carousel:{
       autoPlay:true,    // carousel will auto rotate
       autoLoad:true     // carusel will auto load new when it reaches the end of the current page of posts
    }
});
```

**Grid**
```js
var widget = new Curator.Grid({
    // ...
    grid: {
        minWidth:200,  // minimum width of a square in the grid
        rows:3         // desired number of rows in the grid
    }
});
```

**Panel**
```js
var widget = new Curator.Panel({
    // ...
    panel: {
        autoPlay: true,    // carousel will auto rotate
        autoLoad: true,    // carousel will auto load new when it reaches the end of the current page of posts
        moveAmount:1,      // number of posts to move at a time
        infinite:true      // if the last post is reached should it rotate back to the start
    }
});
```

#### Changing Post HTML

The HTML structure of a post can be modified by passing the widget a custom post template. The template uses a basic 
templating language similar to Handlebars or EJS. 


For example: 
```html
<script type="text/javascript">

Curator.Templates.postTemplate = ' \
<div class="crt-post-c">\
    <div class="crt-post post<%=id%> crt-post-<%=this.networkIcon()%>"> \
        <div class="crt-post-header"> \
            <span class="social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name">\
            <div class="crt-post-fullname"><%=user_full_name%></div>\
            <div class="crt-post-username"><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div>\
            </div> \
        </div> \
        <div class="crt-post-content"> \
            <div class="image crt-hitarea crt-post-content-image <%=this.contentImageClasses()%>" > \
                <img src="<%=image%>" class="crt-post-image" /> \
                <a href="javascript:;" class="crt-play"><i class="play"></i></a> \
            </div> \
            <div class="text crt-post-content-text <%=this.contentTextClasses()%>"> \
                <div class="crt-post-text-body"><%=this.parseText(text)%></div> \
            </div> \
        </div> \
        <div class="crt-post-footer">\
            <div class="crt-date"><%=this.prettyDate(source_created_at)%></div> \
            <div class="crt-post-share"><span class="ctr-share-hint"></span><a href="#" class="crt-share-facebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="crt-share-twitter"><i class="crt-icon-twitter"></i></a></div>\
        </div> \
        <div class="crt-post-read-more"><a href="#" class="crt-post-read-more-button">Read more</a> </div> \
    </div>\
</div>';

    // Change FEED_ID to your unique FEED_ID
    var widget = new Curator.Waterfall({
        container:'#curator-feed',
        feedId:FEED_ID
    });
</script>
```

See the [template.js](https://github.com/curatorio/widgets/blob/master/src/js/core/curator/template.js) file for the HTML templates.

Following templates are predefined:
 - Curator.Templates.postTemplate
 - Curator.Templates.popupTemplate
 - Curator.Templates.popupWrapperTemplate

