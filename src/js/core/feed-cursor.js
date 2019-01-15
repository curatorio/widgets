

import Logger from './logger';
import Events from './events';
import EventBus from './bus';
import ajax from './ajax';
import z from './lib';

class FeedCursor extends EventBus {

    constructor(widget) {
        super ();

        Logger.log ('Feed->init with options');

        this.widget = widget;

        this.posts = [];
        this.postsLoaded = 0;
        this.postCount = 0;
        this.loading = false;
        this.allPostsLoaded = false;
        this.pagination = {
            after:null,
            before:null
        };

        this.options = this.widget.options;

        this.params = this.options.feedParams || {};
        this.params.limit = this.options.postsPerPage;
        this.params.hasPoweredBy = this.widget.hasPoweredBy;
        this.params.version = '1.2';

        this.feedBase = this.options.apiEndpoint+'/restricted/feed';
    }

    /**
     * First load - get's the most recent posts.
     * @param paramsIn - set parameters to send to API
     * @returns boolean
     */
    load (paramsIn) {
        Logger.log ('Feed->load '+this.loading);
        if (this.loading) {
            return false;
        }

        this.posts = [];
        this.postsLoaded = 0;

        let params = z.extend({}, this.params, paramsIn);

        params.limit = this.options.postsPerPage;

        return this._loadPosts (params, 'first-load');
    }

    /**
     * Loads older posts - after the current set
     * @returns {boolean}
     */
    loadAfter () {
        Logger.log ('Feed->loadAfter '+this.loading);

        if (this.loading) {
            return false;
        }

        let params = z.extend({},this.params);

        // TODO should we check we have after?
        if (this.pagination && this.pagination.after) {
            params.after = this.pagination.after;
            delete params.before;
        }

        return this._loadPosts (params, 'after');
    }
    loadMore () {
        return this.loadAfter();
    }
    loadOld () {
        return this.loadAfter();
    }

    /**
     * Loads new posts - before the current set
     * @returns {boolean}
     */
    loadBefore () {
        Logger.log ('Feed->loadBefore '+this.loading);

        if (this.loading) {
            return false;
        }

        let params = z.extend({}, this.params);

        if (this.pagination && this.pagination.before) {
            params.before = this.pagination.before;
            delete params.after;
        }

        return this._loadPosts (params, 'before');
    }
    loadNew () {
        return this.loadBefore();
    }


    loadPost (id, successCallback, failCallback) {
        failCallback = failCallback || function(){};
        ajax.get(
            this.getUrl('/post/' + id),
            {},
            (data) => {
                if (data.success) {
                    successCallback (data.post);
                } else {
                    failCallback ();
                }
            },
            (jqXHR, textStatus, errorThrown) => { /* jshint ignore:line */
                // FAIL
            });
    }

    _loadPosts (params, position) {
        Logger.log ('Feed->_loadPosts position:'+position);

        this.loading = true;

        params.rnd = (new Date ()).getTime();

        let url =  this.getUrl('/posts');

        return new Promise ((resolve, reject) => {
            ajax.get(url, params, (data) => {
                    Logger.log('Feed->_loadPosts success');
                    this.loading = false;

                    if (data.success) {
                        this.postCount = data.postCount;
                        this.postsLoaded += data.posts.length;
                        this.allPostsLoaded = this.postsLoaded >= this.postCount;

                        if (position === 'before') {
                            this.posts = data.posts.concat(this.posts);

                            if (data.pagination && data.pagination.before) {
                                this.pagination.before = data.pagination.before;
                            }
                        } else if (position === 'after') {
                            this.posts = this.posts.concat(data.posts);

                            if (data.pagination && data.pagination.after) {
                                this.pagination.after = data.pagination.after;
                            }
                        } else {
                            // first load
                            this.posts = this.posts.concat(data.posts);

                            if (data.pagination) {
                                this.pagination.after = data.pagination.after;
                                this.pagination.before = data.pagination.before;
                            }
                        }

                        this.networks = data.networks;

                        this.widget.trigger(Events.FEED_LOADED, data, position);
                        this.trigger(Events.FEED_LOADED, data, position);

                        this.widget.trigger(Events.POSTS_LOADED, data.posts, position);
                        this.trigger(Events.POSTS_LOADED, data.posts, position);

                        resolve (data, position);
                    } else {
                        this.trigger(Events.POSTS_FAILED, data, position);
                        this.widget.trigger(Events.POSTS_FAILED, data, position);

                        reject ();
                    }
                },
                (jqXHR, textStatus, errorThrown) => {
                    Logger.log('Feed->_loadPosts fail');
                    Logger.log(textStatus);
                    Logger.log(errorThrown);

                    this.loading = false;

                    this.trigger(Events.POSTS_FAILED, []);

                    reject ();
                }
            );
        });
    }

    inappropriatePost (id, reason, success, failure) {
        let params = {
            reason: reason
        };

        ajax.post(
            this.getUrl('/post/' + id + '/inappropriate'),
            params,
            function (data, textStatus, jqXHR) {
                data = z.parseJSON(data);

                if (data.success === true) {
                    success();
                }
                else {
                    failure(jqXHR);
                }
        }   );
    }

    lovePost (id, success, failure) {
        let params = {};

        z.post(this.getUrl('/post/' + id + '/love'), params, function (data, textStatus, jqXHR) {
            data = z.parseJSON(data);

            if (data.success === true) {
                success(data.loves);
            }
            else {
                failure(jqXHR);
            }
        });
    }

    getUrl (trail) {
        return this.feedBase+'/'+this.options.feedId+trail;
    }

    destroy () {
        super.destroy();
    }
}

export default FeedCursor;