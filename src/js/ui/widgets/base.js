import CommonUtils from '../../utils/common';
import Logger from '../../core/logger';
import HtmlUtils from '../../utils/html';
import Feed from '../../core/feed';
import ajax from '../../core/ajax';
import Events from '../../core/events';
import Post from '../post/base';
import Filter from '../filter';
import PopupManager from '../popup_manager';
import z from '../../core/lib';
import translate from '../../core/translate';
import Globals from '../../core/globals';
import Control from '../controls/control';

class Widget extends Control {

    constructor () {
        Logger.log('Widget->construct');

        super ();

        this.id = CommonUtils.uId();
        this.feed = null;
        this.$container = null;
        this.options = {};
    }

    setOptions (options, defaults) {
        if (!options) {
            Logger.error('options missing');
            return false;
        }

        this.options = z.extend(true, {}, defaults, options);

        if(!this.options.container) {
            Logger.error('options.container missing');
            return false;
        }

        if (!HtmlUtils.checkContainer(this.options.container)) {
            return false;
        }
        this.$container = z(options.container);

        if (!this.options.feedId) {
            Logger.error('options.feedId missing');
        }

        // get inline options
        let inlineOptions = [
            'lang',
            'debug'
        ];
        for (let option of inlineOptions) {
            let val = this.$container.data('crt-'+option);
            if (val) {
                this.options[option] = val;
            }
        }

        if (this.options.debug) {
            Logger.debug = true;
        }

        this.updateResponsiveOptions ();

        Logger.log ('Setting language to: '+this.options.lang);
        translate.setLang(this.options.lang);
    }

    init (options, defaults) {

        this.setOptions(options, defaults);

        this.$container.addClass('crt-feed');
        this.$container.addClass('crt-feed-container');

        if (HtmlUtils.isTouch()) {
            this.$container.addClass('crt-touch');
        } else {
            this.$container.addClass('crt-no-touch');
        }

        this.checkPoweredBy ();
        this.createFeed();
        this.createFilter();
        this.createPopupManager();

        let crtEvent = {
            name:'crt:widget:created',
            data:{
                feedId:options.feedId
            }
        };

        window.postMessage(crtEvent, '*');

        return true;
    }

    updateResponsiveOptions () {
        if (!this.options.responsive) {
            this.responsiveOptions = z.extend(true, {}, this.options);
            return;
        }

        let width = z(window).width();
        let keys = Object.keys(this.options.responsive);
        keys = keys.map(x => parseInt(x));
        keys = keys.sort((a, b) => {
            return a - b;
        });
        keys = keys.reverse();

        let foundKey = null;
        for (let key of keys) {
            if (width <= key) {
                foundKey = key;
            }
        }
        if (!foundKey) {
            this.responsiveKey = null;
            this.responsiveOptions = z.extend(true, {}, this.options);
        }

        if (this.responsiveKey !== foundKey) {
            // console.log('CHANGING RESPONSIVE SETTINGS '+foundKey);
            this.responsiveKey = foundKey;
            this.responsiveOptions = z.extend(true, {}, this.options, this.options.responsive[foundKey]);
        }
    }

    config(path, defaultValue) {
        if (path.indexOf('.')>0) {
            // let pathParts = path.split('.');
            // window.console.log(pathParts);
            // throw new Error('NOT IMPLEMENTED');
            path = path.split('.');
            var current = this.options;
            while(path.length) {
                if(typeof current !== 'object') {
                    return defaultValue || null;
                }
                current = current[path.shift()];
            }
            return current;
        } else {
            let r = this.responsiveOptions[path];
            if (r === undefined) {
                return defaultValue || null;
            } else {
                return r;
            }
        }
    }

    createFeed () {
        this.feed = new Feed (this);
        this.feed.on(Events.POSTS_LOADED, this.onPostsLoaded.bind(this));
        this.feed.on(Events.POSTS_FAILED, this.onPostsFail.bind(this));
        this.feed.on(Events.FEED_LOADED, this.onFeedLoaded.bind(this));
    }

    createPopupManager () {
        this.popupManager = new PopupManager(this);
    }

    createFilter () {
        Logger.log('Widget->createFilter');
        Logger.log(this.options.filter);

        if (this.options.filter && (this.options.filter.showNetworks || this.options.filter.showSources)) {
            this.filter = new Filter(this);
        }
    }

    loadPosts (page) {
        this.feed.loadPosts(page);
    }

    createPostElements (posts)
    {
        let that = this;
        let postElements = [];
        z(posts).each(function(){
            let p = that.createPostElement(this);
            postElements.push(p.$el);
        });
        return postElements;
    }

    createPostElement (postJson) {
        let post = new Post(this, postJson, this.options);
        post.on(Events.POST_CLICK,this.onPostClick.bind(this));
        post.on(Events.POST_CLICK_READ_MORE,this.onPostClickReadMore.bind(this));
        post.on(Events.POST_IMAGE_LOADED, this.onPostImageLoaded.bind(this));

        this.trigger(Events.POST_CREATED, post);

        return post;
    }

    onPostsLoaded (event, posts) {
        Logger.log('Widget->onPostsLoaded');
        Logger.log(event);
        Logger.log(posts);
    }

    onPostsFail (event, data) {
        Logger.log('Widget->onPostsLoadedFail');
        Logger.log(event);
        Logger.log(data);
    }

    onPostClick (ev, post) {
        Logger.log('Widget->onPostClick');
        Logger.log(ev);
        Logger.log(post);

        this.trigger(Events.POST_CLICK, post);

        if (this.options.postClickAction === Globals.POST_CLICK_ACTION_OPEN_POPUP) {
            this.popupManager.showPopup(post.json);
        } else if (this.options.postClickAction === Globals.POST_CLICK_ACTION_GOTO_SOURCE) {
            window.open(post.json.url);
        }
    }

    onPostClickReadMore (ev, post) {
        Logger.log('Widget->onPostClickReadMore');
        Logger.log(ev);
        Logger.log(post);

        this.trigger(Events.POST_CLICK_READ_MORE, post);

        if (this.options.postClickReadMoreAction === Globals.POST_CLICK_ACTION_OPEN_POPUP) {
            this.popupManager.showPopup(post.json);
        } else if (this.options.postClickAction === Globals.POST_CLICK_ACTION_GOTO_SOURCE) {
            window.open(post.json.url);
        }
    }

    onPostImageLoaded (ev, post) {
        // Logger.log('Widget->onPostImageLoaded');
        // Logger.log(event);
        // Logger.log(post);
    }

    onFeedLoaded (ev, response) {
        if (this.options.hidePoweredBy && response.account.plan.unbranded === 1) {
            //<a href="http://curator.io" target="_blank" class="crt-logo crt-tag">Powered by Curator.io</a>
            this.$container.addClass('crt-feed-unbranded');
        } else {
            this.$container.addClass('crt-feed-branded');
        }
    }

    track (a) {
        Logger.log('Feed->track '+a);

        ajax.get (
            this.getUrl('/track/'+this.options.feedId),
            {a:a},
            (data) => {
                Logger.log('Feed->track success');
                Logger.log(data);
            },
            (jqXHR, textStatus, errorThrown) => {
                Logger.log('Feed->_loadPosts fail');
                Logger.log(textStatus);
                Logger.log(errorThrown);
            }
        );
    }

    getUrl (trail) {
        return this.options.apiEndpoint+trail;
    }

    _t (s) {
        return translate.t (s);
    }

    checkPoweredBy () {
        let html = this.$container.text().trim();

        this.hasPoweredBy = html.indexOf('Powered by Curator.io') > -1;
    }

    destroy () {
        Logger.log('Widget->destroy');

        super.destroy();

        if (this.feed) {
            this.feed.destroy();
        }
        if (this.filter) {
            this.filter.destroy();
        }
        if (this.popupManager) {
            this.popupManager.destroy();
        }
        this.$container.removeClass('crt-feed');
        this.$container.removeClass('crt-feed-unbranded');
        this.$container.removeClass('crt-feed-branded');
    }
}

export default Widget;