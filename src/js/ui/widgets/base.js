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
// import objectAssign from 'object-assign-deep';

class Widget extends Control {

    constructor () {
        Logger.log('Widget->construct');

        super ();

        this.id = CommonUtils.uId();
        this.feed = null;
        this.$container = null;
        this.options = {};
        this.autoLoadTimeout = null;
        this.autoLoading = false;
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
            console.log('Found style for '+className);
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
            let current = this.options;
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
        this.feed = new FeedCursor(this);
        this.feed.on(Events.POSTS_LOADED, this.onPostsLoaded.bind(this));
        this.feed.on(Events.POSTS_FAILED, this.onPostsFail.bind(this));
        this.feed.on(Events.FEED_LOADED, this.onFeedLoaded.bind(this));
    }

    createPopupManager () {
        this.popupManager = new PopupManager(this);
    }

    createFilter () {
        Logger.log('Widget->createFilter');

        if (this.options.filter && (this.options.filter.showNetworks || this.options.filter.showSources)) {
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
            this.$container.addClass('crt-widget-unbranded');
        } else {
            this.$container.addClass('crt-widget-branded');
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
                Logger.log('Feed->track fail');
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