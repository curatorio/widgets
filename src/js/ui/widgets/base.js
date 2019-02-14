import Logger from '../../core/logger';
import CommonUtils from '../../utils/common';
import HtmlUtils from '../../utils/html';
import StringUtils from '../../utils/string';
import ajax from '../../core/ajax';
import Events from '../../core/events';
import Post from '../posts/general';
import Filter from '../filter';
import PopupManager from '../popup_manager';
import z from '../../core/lib';
import translate from '../../core/translate';
import Globals from '../../core/globals';
import Control from '../controls/control';
import FeedCursor from "../../core/feed-cursor";
import Tracker from "../../core/tracker";

class Widget extends Control {

    constructor () {
        Logger.log('Widget->construct');

        super ();

        this.id = CommonUtils.uId();
        this.feed = null;
        this.$container = null;
        this._config = {};
        this._responsiveConfig = null;
        this.autoLoadTimeout = null;
        this.autoLoading = false;
    }

    setOptions (options, defaults) {
        if (!options) {
            Logger.error('options missing');
            return false;
        }

        this._config = z.extend(true, {}, defaults, options);

        if(!this.config('container')) {
            Logger.error('options.container missing');
            return false;
        }

        if (!HtmlUtils.checkContainer(this.config('container'))) {
            return false;
        }
        this.$container = z(options.container);

        this.configLoadInline();

        if (!this.config('feed.id')) {
            Logger.error('options.feedId missing');
        }

        if (this.config('debug')) {
            Logger.debug = true;
        }

        Logger.log ('Setting language to: '+this.config('lang'));
        translate.setLang(this.config('lang'));


    }

    init (options, defaults) {

        this.setOptions(options, defaults);

        this.$container.addClass('crt-widget');

        if (HtmlUtils.isTouch()) {
            this.$container.addClass('crt-touch');
        } else {
            this.$container.addClass('crt-no-touch');
        }

        this.checkPoweredBy ();
        this.createFeed();
        this.createFilter();
        this.createPopupManager();
        this.createTracker();

        // this.setStyles({});

        let crtEvent = {
            name:'crt:widget:created',
            data:{
                feedId:options.feedId
            }
        };

        window.postMessage(crtEvent, '*');


        return true;
    }

    setStyles (styles) {
        if (!this.sheet) {
            this.sheet = HtmlUtils.createSheet();
        }

        this.addStyle(this.sheet, styles.popup, '.crt-popup');
        this.addStyle(this.sheet, styles.widget, '.crt-widget');
        this.addStyle(this.sheet, styles.loadMore, '.crt-widget .crt-load-more');
        this.addStyle(this.sheet, styles.post, '.crt-widget .crt-post');
        this.addStyle(this.sheet, styles.postText, '.crt-widget .crt-post-text');
        this.addStyle(this.sheet, styles.postTextLink, '.crt-widget .crt-post-text a');
        this.addStyle(this.sheet, styles.postName, '.crt-widget .crt-post-fullname a');
        this.addStyle(this.sheet, styles.postUsername, '.crt-widget .crt-post-username a');
        this.addStyle(this.sheet, styles.postIcon, '.crt-widget .crt-social-icon i');
        this.addStyle(this.sheet, styles.postComments, '.crt-widget .crt-comments-likes');
        this.addStyle(this.sheet, styles.postShareIcons, '.crt-widget .crt-post-footer .crt-post-share a');
        this.addStyle(this.sheet, styles.postDate, '.crt-widget .crt-post-date a');
    }

    addStyle(sheet, stylesObj, className) {
        if (stylesObj) {
            // console.log('Found style for '+className);
            let rules = [];
            for (let key in stylesObj) {
                if (stylesObj.hasOwnProperty(key)) {
                    let ruleName = StringUtils.camelToDash(key);
                    let rule = ruleName + ': ' + stylesObj[key];
                    rules.push(rule);
                }
            }
            if (rules.length > 0) {
                HtmlUtils.addCSSRule(sheet, className, rules.join(';'));
            }
        }
    }

    updateResponsiveOptions ()
    {
        if (!this._config.responsive) {
            this._responsiveConfig = z.extend(true, {}, this._config);
            return;
        }

        let width = z(window).width();
        let keys = Object.keys(this._config.responsive);
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
            this._responsiveConfig = z.extend(true, {}, this._config);
        }

        if (this.responsiveKey !== foundKey) {
            // console.log('CHANGING RESPONSIVE SETTINGS '+foundKey);
            this.responsiveKey = foundKey;
            this._responsiveConfig = z.extend(true, {}, this._config, this._config.responsive[foundKey]);
        }
    }

    configLoadInline ()
    {
        // get inline options
        let inlineOptions = [
            'lang',
            'debug'
        ];
        for (let option of inlineOptions) {
            let val = this.$container.data('crt-'+option);
            if (val) {
                this._config[option] = val;
            }
        }
    }

    config(fullPath, defaultValue) {
        defaultValue = defaultValue === undefined ? null : defaultValue;
        if (!this._responsiveConfig) {
            this.updateResponsiveOptions();
        }
        if (fullPath.indexOf('.') > 0) {
            // let pathParts = path.split('.');
            // window.console.log(pathParts);
            // throw new Error('NOT IMPLEMENTED');
            let path = fullPath.split('.');
            let current = this._responsiveConfig;
            while (path.length) {
                if (typeof current !== 'object') {
                    console.log('CONFIG ERROR: '+fullPath);
                    return defaultValue || null;
                }
                current = current[path.shift()];
            }
            if (current === undefined) {
                console.log('CONFIG ERROR: '+fullPath+ ' returning: '+defaultValue);
                return defaultValue;
            } else {
                return current;
            }
        } else {
            let current = this._responsiveConfig[fullPath];
            if (current === undefined) {
                console.log('CONFIG ERROR: '+fullPath);
                return defaultValue;
            } else {
                return current;
            }
        }
    }

    createFeed () {
        this.feed = new FeedCursor(this);
        this.feed.on(Events.POSTS_LOADED, this.onPostsLoaded.bind(this));
        this.feed.on(Events.POSTS_FAILED, this.onPostsFail.bind(this));
        this.feed.on(Events.FEED_LOADED, this.onFeedLoaded.bind(this));
    }

    createPopupManager () {
        this.popupManager = new PopupManager(this);
    }

    createTracker () {
        this.tracker = new Tracker(this);
    }

    createFilter () {
        Logger.log('Widget->createFilter');

        if (this.config('filter') && (this.config('filter.showNetworks') || this.config('filter.showSources'))) {
            this.filter = new Filter(this);

            this.$container.append(this.filter.$el);
        }
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
        let post = new Post(this, postJson);
        post.on(Events.POST_CLICK, this.onPostClick.bind(this));
        post.on(Events.POST_CLICK_READ_MORE, this.onPostClickReadMore.bind(this));
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

        if (this.config('post.clickAction') === Globals.POST_CLICK_ACTION_OPEN_POPUP) {
            this.popupManager.showPopup(post.json);
        } else if (this.config('post.clickAction') === Globals.POST_CLICK_ACTION_GOTO_SOURCE) {
            window.open(post.json.url);
        }
    }

    onPostClickReadMore (ev, post) {
        Logger.log('Widget->onPostClickReadMore');
        Logger.log(ev);
        Logger.log(post);

        this.trigger(Events.POST_CLICK_READ_MORE, post);

        if (this.config('post.clickReadMoreAction') === Globals.POST_CLICK_ACTION_OPEN_POPUP) {
            this.popupManager.showPopup(post.json);
        } else if (this.config('post.clickReadMoreAction') === Globals.POST_CLICK_ACTION_GOTO_SOURCE) {
            window.open(post.json.url);
        }
    }

    onPostImageLoaded (ev, post) {
        // Logger.log('Widget->onPostImageLoaded');
        // Logger.log(event);
        // Logger.log(post);
    }

    onFeedLoaded (ev, response) {
        if (this.config('hidePoweredBy') && response.account.plan.unbranded === 1) {
            //<a href="http://curator.io" target="_blank" class="crt-logo crt-tag">Powered by Curator.io</a>
            this.$container.addClass('crt-widget-unbranded');
        } else {
            this.$container.addClass('crt-widget-branded');
        }
    }

    track (a) {
        Logger.log('Feed->track '+a);

        this.tracker.track(a);
    }

    getUrl (postfix) {
        this.feedBase = this.config('feed.apiEndpoint')+'/restricted/feed';
        return this.feedBase+postfix;
    }

    _t (s) {
        return translate.t (s);
    }

    checkPoweredBy () {
        let html = this.$container.text().trim();

        this.hasPoweredBy = html.indexOf('Powered by Curator.io') > -1;
    }

    startAutoLoad () {
        Logger.log('Widget->startAutoLoad');

        this.autoLoading = true;
        this.autoLoadTimeout = window.setTimeout(this.onAutoLoadFire.bind(this), 1000 * 30);
    }

    stopAutoLoad () {
        Logger.log('Widget->stopAutoLoad');
        this.autoLoading = false;
        window.clearTimeout(this.autoLoadTimeout);
    }

    onAutoLoadFire () {
        Logger.log('Widget->onAutoLoadFire');

        this.feed.loadBefore();

        this.autoLoadTimeout = window.setTimeout(this.onAutoLoadFire.bind(this), 1000 * 30);
    }

    destroy () {
        Logger.log('Widget->destroy');

        super.destroy();

        if (this.feed) {
            this.feed.destroy();
            delete this.feed;
        }
        if (this.filter) {
            this.filter.destroy();
            delete this.filter;
        }
        if (this.popupManager) {
            this.popupManager.destroy();
            delete this.popupManager;
        }

        this.$container.removeClass('crt-widget');
        this.$container.removeClass('crt-widget-unbranded');
        this.$container.removeClass('crt-widget-branded');
        this.$container.removeClass('crt-no-touch');
    }
}

export default Widget;