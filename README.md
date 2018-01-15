# Curator.io Social Feed Widgets


### Demo

[Curator.io](https://curator.io/showcase)

## Setup

Sign up to [Curator.io](https://admin.curator.io/auth/register) to set up a social feed - it's free :)
You'll need your unique `FEED_ID` to use the widgets.

You can find the FEED_ID here:

![Screenshot of Curator Admin showing FEED ID](https://admin.curator.io/assets/images/github-feed-id.jpg)

### CDN

CDN hosted Curator.io Widgets are a great way to get up and running quickly:

In your `<head>` add:

```html
<link rel="stylesheet" type="text/css" href="//cdn.curator.io/3.0/css/curator.css"/>
```

In your ```<body>``` where you want the feed to appear:
```html
<div id="curator-feed">
    <a href="https://curator.io" target="_blank" class="crt-logo">Powered by Curator.io</a>
</div>
```
Then, before your closing ```<body>``` tag add:

```html
<script type="text/javascript" src="//cdn.curator.io/3.0/js/curator.js"></script>
<script type="text/javascript">
	// While you're testing
    Curator.debug = true;

    // Change FEED_ID to your unique FEED_ID
    var widget = new Curator.Widgets.Waterfall({
        container:'#curator-feed',
        feedId:FEED_ID
    });
</script>
```

## Widgets

There are 4 main widgets in the Curator library:


**Waterfall**
```js
var widget = new Curator.Widgets.Waterfall({
    // ...
});
```

**Carousel**
```js
var widget = new Curator.Widgets.Carousel({
    // ...
});
```

**Grid**
```js
var widget = new Curator.Widgets.Grid({
    // ...
});
```

**Panel**
```js
var widget = new Curator.Widgets.Panel({
    // ...
});
```

## Customisation

### Default Options

```js
var widget = new Curator.Widgets.Watterfall({    
    feedId: 'ABC123',                // FEED_ID to load
    postsPerPage: 12,                // number of posts per page
    debug: false,                    // turn debugging on or off
    lang: 'en',                      // translation used - en, de, it, nl, es
    filter: {
        showNetworks: false,         // show Networks filter bar
        networksLabel: 'Networks:',  // Networks filter bar label
        showSources: false,          // show Sources filter bar
        sourcesLabel: 'Sources:',    // Sources filter bar label
    }
});
```

### Widget Options

Each of the widgets can be passed a set of options to customise the widget

**Waterfall**
```js
var widget = new Curator.Widgets.Waterfall({
    // ...
    waterfall: {
        gridWidth: 250,    // sets the desired column width
        animate: true,     // should the posts animate in?
        animateSpeed: 400  
    }
});
```

**Carousel**
```js
var widget = new Curator.Widgets.Carousel({
    // ...
    carousel:{
       autoPlay: true,    // carousel will auto rotate
       autoLoad: true,    // carusel will auto load new when it reaches the end of the current page of posts
       minWidth: 250,     // the minimum width of the post, used when calculating responsive post width
       infinite: false    // if the last post is reached should it rotate back to the start
    }
});
```

**Grid**
```js
var widget = new Curator.Widgets.Grid({
    // ...
    grid: {
        minWidth: 200,  // minimum width of a square in the grid
        rows: 3         // desired number of rows in the grid
    }
});
```

**Panel**
```js
var widget = new Curator.Widgets.Panel({
    // ...
    panel: {
        autoPlay: true,     // carousel will auto rotate
        autoLoad: true,     // carousel will auto load new when it reaches the end of the current page of posts
        moveAmount: 1,      // number of posts to move at a time
        infinite: true      // if the last post is reached should it rotate back to the start
    }
});
```

### Changing Post HTML

Curator uses a basic templating language similar to Handlebars or EJS to define the layout of the posts, popup and various other elements.

You can override the templates using one of two methods: 
 
 
##### Method 1 - Via HTML Templates

You can override the templates by adding `<script type="text/html" id="TEMPLATE_ID">...</script>` tags do your HTML, 
and passing TEMPLATE_ID when you create the widget using the option `templatePost`.  

For example: 
```html
<!-- Template Code -->
<script type="text/html" id="my-post-template">
    <div class="crt-post-v2 crt-post crt-post-<%=this.networkIcon()%>" data-post="<%=id%>">
        <div class="crt-post-c">
            <%=this.parseText(text)%>
        </div>
    </div>
</script>

<!-- Javascript Code -->
<script type="text/javascript">

    // Change FEED_ID to your unique FEED_ID
    var widget = new Curator.Widgets.Waterfall({
        container:'#curator-feed',
        feedId:FEED_ID,
        templatePost:'my-post-template'
    });
</script>
```

##### Method 2 - Via Javascript

Alternatively you can override the templates via Javascript.  

For example: 
```html
<script type="text/javascript">

    Curator.Templates['post-v2'] = '\
    <div class="crt-post-v2 crt-post crt-post-<%=this.networkIcon()%>" data-post="<%=id%>"> \
        <div class="crt-post-c"> \
            <%=this.parseText(text)%> \
        </div> \
    </div>';

    // Change FEED_ID to your unique FEED_ID
    var widget = new Curator.Widgets.Waterfall({
        container:'#curator-feed',
        feedId:FEED_ID
    });
</script>
```

##### Current Templates

See the [templates directory](https://github.com/curatorio/widgets/blob/master/src/js/core/templates/) file for the HTML templates.

Following templates are predefined:
 - `Curator.Templates['post-v2']`
 - `Curator.Templates['popup']`
 - `Curator.Templates['popup-underlay']`
 - `Curator.Templates['popup-wrapper']`
 - `Curator.Templates['grid-post-v2']`
 - `Curator.Templates['grid-feed-v2']`

### Custom CSS

As the widget HTML is added directly to the HTML of the webpage (not using an IFRAME) the CSS styles of the widget can be overridden in the same way you'd override CSS on the page. You can use CSS Specificity (see [MDN Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)) to override the styles predefined by the curator.css file.

In the example below we use the ID selector of the div containing the widget '#curator-feed' to override the font-size of the post:

```css
#curator-feed .crt-post .crt-post-content-text {
   font-size:20px;
}
```

These styles can be placed in the websites main css file or a `<style>` tag in the actual HTML.

