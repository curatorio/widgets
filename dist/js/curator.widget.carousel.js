;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Curator = factory();
  }
}(this, function() {

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

(function(){
    var _tmplCache = {};

    var helpers = {
        userUrl:function () {
            return this.data.network_id==='1'?'http://twitter.com/'+this.data.user_screen_name:'http://instagram.com/'+this.data.user_screen_name;
        },
        parseText:function(s) {
            if (this.data.network_id===1 || this.data.network_id==='1') {
                // twitter
                s = Curator.StringUtils.linksToHref(s);
                s = Curator.StringUtils.twitterLinks(s);
            } else if (this.data.network_id===2 || this.data.network_id==='2') {
                // instagram
                s = Curator.StringUtils.linksToHref(s);
                s = Curator.StringUtils.instagramLinks(s);
            }

            return s;
        }
    };

    this.parseTemplate = function(str, data) {
        /// <summary>
        /// Client side template parser that uses &lt;#= #&gt; and &lt;# code #&gt; expressions.
        /// and # # code blocks for template expansion.
        /// NOTE: chokes on single quotes in the document in some situations
        ///       use &amp;rsquo; for literals in text and avoid any single quote
        ///       attribute delimiters.
        /// </summary>
        /// <param name="str" type="string">The text of the template to expand</param>
        /// <param name="data" type="var">
        /// Any data that is to be merged. Pass an object and
        /// that object's properties are visible as variables.
        /// </param>
        /// <returns type="string" />
        var err = "";
        try {
            var func = _tmplCache[str];
            if (!func) {
                var strComp =
                    str.replace(/[\r\t\n]/g, " ")
                        .replace(/'(?=[^%]*%>)/g, "\t")
                        .split("'").join("\\'")
                        .split("\t").join("'")
                        .replace(/<%=(.+?)%>/g, "',$1,'")
                        .split("<%").join("');")
                        .split("%>").join("p.push('");
                var strFunc =
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +
                        "with(obj){p.push('" + strComp + "');}return p.join('');";
                func = new Function("obj", strFunc);  // jshint ignore:line
                _tmplCache[str] = func;
            }
            helpers.data = data;
            return func.call(helpers, data);
        } catch (e) {
            global.console.log ('Template parse error: ' +e.message);
            err = e.message;
        }
        return " # ERROR: " + err + " # ";
    };
})();
// jQuery.XDomainRequest.js
// Author: Jason Moon - @JSONMOON
// IE8+
// https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest/blob/master/jQuery.XDomainRequest.js


if (!jQuery.support.cors && jQuery.ajaxTransport && window.XDomainRequest) {
    var httpRegEx = /^https?:\/\//i;
    var getOrPostRegEx = /^get|post$/i;
    var sameSchemeRegEx = new RegExp('^'+global.location.protocol, 'i');
    var htmlRegEx = /text\/html/i;
    var jsonRegEx = /\/json/i;
    var xmlRegEx = /\/xml/i;

    // ajaxTransport exists in jQuery 1.5+
    jQuery.ajaxTransport('text html xml json', function(options, userOptions, jqXHR){
        jqXHR = jqXHR;
        // XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
        if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(options.url) && sameSchemeRegEx.test(options.url)) {
            var xdr = null;
            var userType = (userOptions.dataType||'').toLowerCase();
            return {
                send: function(headers, complete){
                    xdr = new window.XDomainRequest();
                    if (/^\d+$/.test(userOptions.timeout)) {
                        xdr.timeout = userOptions.timeout;
                    }
                    xdr.ontimeout = function(){
                        complete(500, 'timeout');
                    };
                    xdr.onload = function(){
                        var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
                        var status = {
                            code: 200,
                            message: 'success'
                        };
                        var responses = {
                            text: xdr.responseText
                        };
                        try {
                            if (userType === 'html' || htmlRegEx.test(xdr.contentType)) {
                                responses.html = xdr.responseText;
                            } else if (userType === 'json' || (userType !== 'text' && jsonRegEx.test(xdr.contentType))) {
                                try {
                                    responses.json = jQuery.parseJSON(xdr.responseText);
                                } catch(e) {
                                    status.code = 500;
                                    status.message = 'parseerror';
                                    //throw 'Invalid JSON: ' + xdr.responseText;
                                }
                            } else if (userType === 'xml' || (userType !== 'text' && xmlRegEx.test(xdr.contentType))) {
                                var doc = new window.ActiveXObject('Microsoft.XMLDOM');
                                doc.async = false;
                                try {
                                    doc.loadXML(xdr.responseText);
                                } catch(e) {
                                    doc = undefined;
                                }
                                if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                                    status.code = 500;
                                    status.message = 'parseerror';
                                    throw 'Invalid XML: ' + xdr.responseText;
                                }
                                responses.xml = doc;
                            }
                        } catch(parseMessage) {
                            throw parseMessage;
                        } finally {
                            complete(status.code, status.message, responses, allResponseHeaders);
                        }
                    };
                    // set an empty handler for 'onprogress' so requests don't get aborted
                    xdr.onprogress = function(){};
                    xdr.onerror = function(){
                        complete(500, 'error', {
                            text: xdr.responseText
                        });
                    };
                    var postData = '';
                    if (userOptions.data) {
                        postData = (jQuery.type(userOptions.data) === 'string') ? userOptions.data : jQuery.param(userOptions.data);
                    }
                    xdr.open(options.type, options.url);
                    xdr.send(postData);
                },
                abort: function(){
                    if (xdr) {
                        xdr.abort();
                    }
                }
            };
        }
    });
}
// Test jQuery exists

if (jQuery == global.undefined) {
    window.alert ('Curator requires jQuery. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}

var Curator = {
    SOURCE_TYPES : ['twitter','instagram'],

    log:function (s) {
        if (global.console) {
            global.console.log(s);
        }
    }
};



jQuery.support.cors = true;

var defaults = {
    postsToFetch:24,
    feedId:'xxx',
    debug:false,
    apiEndpoint:'http://api.curator.io/v1'
};

Curator.Feed = function (options) {
    this.init(options);
};

jQuery.extend(Curator.Feed.prototype,{
    loading: false,
    postsLoaded:0,
    feedBase:'',

    init: function (options) {
        Curator.log ('Feed->init with options');

        this.options = jQuery.extend({},defaults,options);

        Curator.log(this.options);

        this.feedBase = this.options.apiEndpoint+'/feed';
    },

    getUrl : function (trail) {
        return this.feedBase+'/'+this.options.feedId+trail;
    },

    loadPost : function (id, successCallback, failCallback) {
        failCallback = failCallback || function(){};
        jQuery.get(this.getUrl('/post/' + id), {}, function (data) {
            if (data.success) {
                successCallback (data.post);
            } else {
                failCallback ();
            }
        });
    },

    inappropriatePost: function (id, reason, success, failure) {
        var params = {
            reason: reason
            // where: {
            //     id: {'=': id}
            // }
        };

        jQuery.post(this.getUrl('/post/' + id + '/inappropriate'), params, function (data, textStatus, jqXHR) {
            data = jQuery.parseJSON(data);

            if (data.success === true) {
                success();
            }
            else {
                failure(jqXHR);
            }
        });
    },

    lovePost: function (id, success, failure) {
        var params = {};

        jQuery.post(this.getUrl('/post/' + id + '/love'), params, function (data, textStatus, jqXHR) {
            data = jQuery.parseJSON(data);

            if (data.success === true) {
                success(data.loves);
            }
            else {
                failure(jqXHR);
            }
        });
    },

    loadPosts: function (successCallback, failCallback) {
        failCallback = failCallback || function(data) {
            Curator.log('Feed->loadPosts failed with message');
            Curator.log(data.message);
        };
        Curator.log ('Feed->loadPosts '+this.loading);
        if (this.loading) {
            return false;
        }
        var params = {
            limit : this.options.postsToFetch
        };

        this._loadPosts (params,successCallback, failCallback);
    },

    loadMorePosts : function (successCallback, failCallback) {
        if (this.loading) {
            return false;
        }
        var params = {
            limit : this.options.postsToFetch,
            offset : this.postsLoaded
        };

        this._loadPosts (params,successCallback, failCallback);
    },

    _loadPosts : function (params,successCallback, failCallback) {
        Curator.log ('Feed->_loadPosts');
        var that = this;

        this.loading = true;

        jQuery.ajax({
            url: this.getUrl('/posts'),
            dataType: 'json',
            data: {params:params}
        })
        .success(function (data) {

            Curator.log ('Feed->_loadPosts success');
            if (data.success) {
                that.postsLoaded += data.posts.length;
                successCallback (data.posts);
            } else {
                failCallback(data);
            }
            that.loading = false;
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            Curator.log ('Feed->_loadPosts fail');
            Curator.log(textStatus);
            Curator.log(errorThrown);

        });
    },

    checkPowered : function (jQuerytag) {
        var h = jQuerytag.html ();
        return h.indexOf('Curator') > 0;
    }
});
/**
* ==================================================================
* Popup
* ==================================================================
*/


Curator.PopupInappropriate = function (post,feed) {
    this.init(post,feed);
};

jQuery.extend(Curator.PopupInappropriate.prototype, {
    feed: null,
    post:null,

    init: function (post,feed) {
        var that = this;

        this.feed = feed;
        this.post = post;
        
        this.jQueryel = jQuery('.mark-bubble');

        jQuery('.mark-close').click(function (e) {
            e.preventDefault();
            jQuery(this).parent().fadeOut('slow');
        });

        jQuery('.mark-bubble .submit').click(function () {
            var $input = that.$el.find('input.text');

            var reason = jQuery.trim($input.val());

            if (reason) {
                $input.disabled = true;
                jQuery(this).hide();

                that.$el.find('.waiting').show();

                feed.inappropriatePost(that.post.id, reason,
                    function () {
                        $input.val('');
                        that.$el.find('.waiting').hide();
                        that.$el.find('.title').html('Thank you');
                        that.$el.find('input.text').hide();
                        that.$el.find('input.text').html('');
                        that.$el.find('.success-message').html('This message has been marked as inappropriate').show();
                    },
                    function () {
                        that.$el.find('.waiting').hide();
                        that.$el.find('.title').html('Oops');
                        that.$el.find('input.text').hide();
                        that.$el.find('input.text').html('');
                        that.$el.find('.success-message').html('It looks like a problem has occurred. Please try again later').show();
                    }
                );
            }
        });

        this.$el.fadeIn('slow');
    }
});
/**
* ==================================================================
* Popup
* ==================================================================
*/

Curator.Popup = function (json,feed) {
    this.init(json,feed);
};

jQuery.extend(Curator.prototype, {
    underlay: '',
    bigPost: null,
    templateId:'#popup',

    init: function (post, feed) {
        var that = this;

        this.json = post;
        this.feed = feed;

        this.underlay = jQuery('#popup-underlay');
        this.$el = jQuery('.popup');
        this.wrapper = jQuery('#popup-wrapper');

        jQuery('#popup-underlay, .popup .close').click(function (e) {
            e.preventDefault();
            that.hide();
        });

        /**
         * Mark as inappropriate - icon hover
         */
        jQuery('.mark-icon a').hover(function () {
            jQuery('img', this).stop().animate({top: '-35px'}, {queue: false, duration: 200});
        },function () {
            jQuery('img', this).stop().animate({top: '0px'}, {queue: false, duration: 200});
        }).click(function (e) {
            e.preventDefault();
            that.inappropriatePopup = new Curator.PopupInappropriate(this.json,this.feed);
        });
    },

    show: function () {
        var that = this;

        var post = this.json;
        var mediaUrl = post.image,
            text = post.text;

        if (mediaUrl) {
            var $imageWrapper = that.$el.find('div.main-image-wrapper');
            this.loadMainImage(mediaUrl, $imageWrapper, ['main-image']);
        }

        var $socialIcon = this.$el.find('.social-icon');
        $socialIcon.attr('class', 'social-icon');
        $socialIcon.addClass(Curator.SOURCE_TYPES[post.sourceType]);

        //format the date
        var date = Curator.Utils.dateAsDayMonthYear(post.sourceCreateAt);

        this.$el.find('input.discovery-id').val(post.id);
        this.$el.find('div.full-name span').html(post.user_full_name);
        this.$el.find('div.username span').html('@' + post.user_screen_name);
        this.$el.find('div.date span').html(date);
        this.$el.find('div.love-indicator span').html(post.loves);
        this.$el.find('div.side-text span').html(text);

        this.wrapper.show();
        this.underlay.fadeIn();
        this.$el.fadeIn(function () {
            that.$el.animate({width: '624px',height: '424px'}, function () {
                jQuery('.popup .content').fadeIn('slow');
            });
        });

    },
    
    /**
     * Load the main image in the Big Post
     */
    loadMainImage: function (source, $wrapper, classes, removeWrapperClass) {
        $wrapper.show(); //show the wrapper in case it has a pre-loader image

        var img = new global.Image();

        source = source.replace(/http:/, 'https:');

        for (var i in classes) {
            if (classes.hasOwnProperty(i)) {
                jQuery(img).addClass(classes[i]); //console.log(classes[i]);
            }
        }

        img.onload = function () {

            if (removeWrapperClass) {
                $wrapper.removeClass(removeWrapperClass);
            }

            $wrapper.append(this);

            jQuery(this).imgscale({
                fade: 1000,
                width: img.width,
                height: img.height
            });
        };
        img.onerror = function () {
            if (removeWrapperClass) {
                $wrapper.removeClass(removeWrapperClass);
            }
        };
        img.src = source;
    },


    hide: function () {

    }
});


/**
* ==================================================================
* Post
* ==================================================================
*/


Curator.Post = function (json) {

    this.init(json);
};

jQuery.extend(Curator.prototype,{
    templateId:'#post-template',

    init:function (postJson) {
        this.json = postJson;
        var $post = Curator.Template.render(this.templateId, postJson);
        this.el = $post;

        this.el.find('.shareFacebook').click(jQuery.proxy(this.onShareFacebookClick,this));
        this.el.find('.shareTwitter').click(jQuery.proxy(this.onShareTwitterClick,this));
        this.el.find('.hitarea').click(jQuery.proxy(this.onPostClick,this));
    },

    onShareFacebookClick : function (ev) {
        ev.preventDefault();
        Curator.SocialFacebook.share(this.json);
        return false;
    },

    onShareTwitterClick : function (ev) {
        ev.preventDefault();
        Curator.SocialTwitter.share(this.json);
        return false;
    },

    onPostClick : function (ev) {
        ev.preventDefault();
        jQuery(this).trigger('postClick',this, this.json, ev);
    }
});
/* global FB */


Curator.SocialFacebook = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        var cb =  function(){};

        FB.ui({
            method: 'feed',
            link: obj.url,
            picture: obj.image,
            name: obj.user_screen_name,
            description: obj.text
        }, cb);
    }
};

Curator.SocialPinterest = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        var url = "http://pinterest.com/pin/create/button/?url={{url}}&media={{image}}&description={{text}}";
        Curator.Utils.popup(Curator.Utils.tinyparser(url, obj), 'pintrest', '600', '270', '0');
    }
};


Curator.SocialTwitter = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);

        var url = "http://twitter.com/share?url={{url}}&text={{text}}&hashtags={{hashtags}}";
        Curator.Utils.popup(Curator.Utils.tinyparser(url, obj), 'twitter', '600', '430', '0');
    }
};


Curator.Templates = {};

Curator.Template = {
    camelize: function (s) {
        return s.replace (/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },
    render: function (templateId, data) {
        var cam = this.camelize(templateId).substring(1);
        var source = '';

        if (Curator.Templates[cam] !== undefined)
        {
            source = Curator.Templates[cam];
        } else if (jQuery(templateId).length===1) {
            source = jQuery(templateId).html();
        }

        if (source === '')
        {
            throw new Error ('could not find template '+templateId+'('+cam+')');
        }

        var tmpl = global.parseTemplate(source, data);
        tmpl = jQuery.parseHTML(tmpl);
        return jQuery(tmpl).filter('div');
    }
};



Curator.Utils = {
    /**
     * Format the date as DD/MM/YYYY
     */
    dateAsDayMonthYear: function (strEpoch) {
        var myDate = new Date(parseInt(strEpoch, 10));
        // console.log(myDate.toGMTString()+"<br>"+myDate.toLocaleString());

        var day = myDate.getDate() + '';
        var month = (myDate.getMonth() + 1) + '';
        var year = myDate.getFullYear() + '';

        day = day.length === 1 ? '0' + day : day;
        month = month.length === 1 ? '0' + month : month;

        var created = day + '/' + month + '/' + year;

        return created;
    },

    /**
     * Convert the date into a time array
     */
    dateAsTimeArray: function (strEpoch) {
        var myDate = new Date(parseInt(strEpoch, 10));

        var hours = myDate.getHours() + '';
        var mins = myDate.getMinutes() + '';
        var ampm;

        if (hours >= 12) {
            ampm = 'PM';
            if (hours > 12) {
                hours = (hours - 12) + '';
            }
        }
        else {
            ampm = 'AM';
        }

        hours = hours.length === 1 ? '0' + hours : hours; //console.log(hours.length);
        mins = mins.length === 1 ? '0' + mins : mins; //console.log(mins);

        var array = [
            parseInt(hours.charAt(0), 10),
            parseInt(hours.charAt(1), 10),
            parseInt(mins.charAt(0), 10),
            parseInt(mins.charAt(1), 10),
            ampm
        ];

        return array;
    },

    postUrl : function (post)
    {
        if (post.url && post.url !== "")
        {
            // instagram
            return post.url;
        }

        if (post.network_id==="1")
        {
            // twitter
            return 'https://twitter.com/'+post.user_screen_name+'/status/'+post.sourceIdentifier;
        }

        return '';
    },

    center : function (elementWidth, elementHeight, bound) {
        var s = global.screen,
            b = bound || {},
            bH = b.height || s.height,
            bW = b.width || s.height,
            w = elementWidth,
            h = elementHeight;

        return {
            top: (bH) ? (bH - h) / 2 : 0,
            left: (bW) ? (bW - w) / 2 : 0
        };
    },

    popup :  function (mypage, myname, w, h, scroll) {

        var
            position = this.center(w, h),
            settings = 'height=' + h + ',width=' + w + ',top=' + position.top +
                ',left=' + position.left + ',scrollbars=' + scroll +
                ',resizable';

        global.window.open(mypage, myname, settings);
    },

    tinyparser : function (string, obj) {

        return string.replace(/\{\{(.*?)\}\}/g, function (a, b) {
            return obj && typeof obj[b] !== "undefined" ? obj[b] : "";
        });
    }
};

Curator.StringUtils = {

    twitterLinks : function (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return Curator.StringUtils.url("http://twitter.com/"+username,u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            var tag = t.replace("#","%23");
            return Curator.StringUtils.url("https://twitter.com/search?q="+tag,t);
        });

        return s;
    },

    instagramLinks : function (s)
    {
        s = s.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
            return Curator.StringUtils.url(url);
        });

        return s;
    },

    linksToHref : function (s)
    {
        s = s.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
            return Curator.StringUtils.url(url);
        });

        return s;
    },

    url : function (s,t) {
        t = t || s;
        return '<a href="'+s+'" target="_blank">'+t+'</a>';
    }
};



var feedDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'http://api.curator.io/v1',
    scroll:'more',
    slick:{
        dots: false,
        speed: 500,
        cssEase: 'ease-in-out',
        infinite: false,
        autoplay: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            },
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    }
};

var Client = function (options) {
    this.init(options);
    this.totalPostsLoaded = 0;
    this.allLoaded = false;
};

Curator.Templates.postTemplate = ' \
<div class="crt-post-c">\
<div class="crt-post post<%=id%>"> \
    <div class="crt-post-header"> \
        <span class="social-icon"><i class="<%=network_id==1?\'crt-icon-twitter-bird\':\'crt-icon-instagram\'%>"></i></span> \
        <img src="<%=user_image%>"  /> \
        <div class="crt-post-name"><%=user_full_name%><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
    </div> \
    <div class="crt-post-content <%=image?\'crt-post-content-image\':\'crt-post-content-text\'%>"> \
        <div class="image"> \
            <img src="<%=image%>" /> \
        </div> \
        <div class="text"> \
            <%=this.parseText(text)%> \
        </div> \
    </div> \
    <div class="crt-post-share">Share <a href="#" class="shareFacebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="shareTwitter"><i class="crt-icon-twitter-bird"></i></a> </div> \
</div>\
</div>';

jQuery.extend(Client.prototype,{
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],

    init: function (options) {
        Curator.log("Carousel->init with options:");

        this.options = jQuery.extend({},feedDefaults,options);

        Curator.log(this.options);

        var that = this;

        this.feed = new Curator.Feed ({
            debug:this.options.debug,
            feedId:this.options.feedId,
            postsToFetch:this.options.postsPerPage,
            apiEndpoint:this.options.apiEndpoint
        });
        this.$container = jQuery(this.options.container);
        //this.$scroll = jQuery('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
        this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$container);
        this.$container.addClass('crt-carousel');

        if (!this.feed.checkPowered(this.$container)){
            global.alert ('Container is missing Powered by Curator');
        } else {
            this.feed.loadPosts(jQuery.proxy(this.onLoadPosts, this),jQuery.proxy(this.onLoadPostsFail, this));

            that.$feed.slick(this.options.slick).on('afterChange', function(event, slick, currentSlide) {

                if (!that.allLoaded) {
                    //console.log(currentSlide + '>' + (that.totalPostsLoaded - 4));

                    if (currentSlide >= that.totalPostsLoaded - 4) {
                        that.feed.loadMorePosts(jQuery.proxy(that.onLoadPosts, that), jQuery.proxy(that.onLoadPostsFail, that));
                    }
                }
            });
        }
    },

    onLoadPosts: function (posts) {
        Curator.log("loadPosts");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
            this.totalPostsLoaded += posts.length;

            var that = this;
            //var postElements = [];
            jQuery(posts).each(function(){
                var p = that.loadPost(this);
                //postElements.push(p.el);
                that.$feed.slick('slickAdd',p.el);
            });
        }
    },

    onLoadPostsFail: function (data) {
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    },

    onPostClick: function (ev,postJson) {
        var popup = new Curator.Popup(postJson, this.feed);
        popup.show();
    },

    loadPost: function (postJson) {
        var post = new Curator.Post(postJson);
        jQuery(post).bind('postClick',jQuery.proxy(this.onPostClick, this));
        return post;
    },

    destroy : function () {
        this.$feed.slick('unslick');
        this.$feed.remove();
        this.$container.removeClass('crt-carousel');

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }

});

Curator.Carousel = Client;

return Curator;
}));
