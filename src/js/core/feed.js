

import Logger from './logger';
import Events from './events';
import EventBus from './bus';
import ajax from './ajax';
import z from './lib';

class Feed extends EventBus {

    constructor(widget) {
        super ();

        Logger.log ('Feed->init with options');

        this.widget = widget;

        this.posts = [];
        this.currentPage = 0;
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

        this.feedBase = this.options.apiEndpoint+'/feeds';
    }

    loadPosts (page, paramsIn) {
        page = page || 0;
        Logger.log ('Feed->loadPosts '+this.loading);
        if (this.loading) {
            return false;
        }
        this.currentPage = page;

        if (+this.currentPage === 0) {
            this.posts = [];
            this.postsLoaded = 0;
        }

        let params = z.extend({},this.params,paramsIn);

        params.limit = this.options.postsPerPage;
        params.offset = page * this.options.postsPerPage;

        this._loadPosts (params);
    }

    loadMorePaginated (paramsIn) {

        let params = z.extend({},this.params,paramsIn);

        if (this.pagination && this.pagination.after) {
            params.after = this.pagination.after;
        }

        // console.log (params);

        this._loadPosts (params);
    }

    loadMore (paramsIn) {
        Logger.log ('Feed->loadMore '+this.loading);
        if (this.loading) {
            return false;
        }

        let params = {
            limit:this.options.postsPerPage
        };
        z.extend(params,this.options.feedParams, paramsIn);

        params.offset = this.posts.length;

        this._loadPosts (params);
    }

    /**
     * First load - get's the most recent posts.
     * @param params - set parameters to send to API
     * @returns {boolean}
     */
    load (params) {
        Logger.log ('Feed->load '+this.loading);

        if (this.loading) {
            return false;
        }
        this.currentPage = 0;

        let loadPostParams = z.extend(this.params, params);

        this._loadPosts (loadPostParams);
    }

    /**
     * Loads posts after the current set
     * @returns {boolean}
     */
    loadAfter () {
        Logger.log ('Feed->loadAfter '+this.loading);

        if (this.loading) {
            return false;
        }
        this.currentPage = 0;

        let params = z.extend({},this.params);

        // TODO should we check we have after?
        if (this.pagination && this.pagination.after) {
            params.after = this.pagination.after;
            delete params.before;
        }

        this._loadPosts (params);
    }

    _loadPosts (params) {
        Logger.log ('Feed->_loadPosts');

        this.loading = true;

        params.rnd = (new Date ()).getTime();

        ajax.get(
            this.getUrl('/posts'),
            params,
            (data) => {
                Logger.log('Feed->_loadPosts success');

                if (data.success) {
                    this.postCount = data.postCount;
                    this.postsLoaded += data.posts.length;

                    this.allPostsLoaded = this.postsLoaded >= this.postCount;

                    this.posts = this.posts.concat(data.posts);
                    this.networks = data.networks;

                    if (data.pagination) {
                        this.pagination = data.pagination;
                    }

                    this.widget.trigger(Events.FEED_LOADED, data);
                    this.trigger(Events.FEED_LOADED, data);

                    this.widget.trigger(Events.POSTS_LOADED, data.posts);
                    this.trigger(Events.POSTS_LOADED, data.posts);
                } else {
                    this.trigger(Events.POSTS_FAILED, data);
                    this.widget.trigger(Events.POSTS_FAILED, data);
                }
                this.loading = false;
            },
            (jqXHR, textStatus, errorThrown) => {
                Logger.log('Feed->_loadPosts fail');
                Logger.log(textStatus);
                Logger.log(errorThrown);

                this.trigger(Events.POSTS_FAILED, []);
                this.loading = false;
            }
        );
    }

    /**
     * Loads new posts
     * @returns {boolean}
     */
    loadNewPosts () {
        Logger.log ('Feed->loadNewPosts '+this.loading);

        if (this.loading) {
            return false;
        }
        this.currentPage = 0;

        let params = z.extend({},this.params);

        // TODO should we check we have after?
        if (this.pagination && this.pagination.before) {
            params.before = this.pagination.before;
            delete params.after;
        }

        // console.log(params.before);

        return new Promise ((resolve, reject) => {
            this.loading = true;

            params.rnd = (new Date ()).getTime();

            ajax.get(
                this.getUrl('/posts'),
                params,
                (data) => {
                    Logger.log('Feed->_loadPosts success');
                    this.loading = false;


                    if (data.success) {
                        // this.postCount = data.postCount;
                        // this.postsLoaded += data.posts.length;
                        //
                        // this.allPostsLoaded = this.postsLoaded >= this.postCount;
                        //
                        // this.posts = this.posts.concat(data.posts);
                        // this.networks = data.networks;
                        //
                        if (data.pagination && data.pagination.before) {
                            this.pagination.before = data.pagination.before;
                        }
                        //
                        // this.widget.trigger(Events.FEED_LOADED, data);
                        // this.trigger(Events.FEED_LOADED, data);
                        //
                        // this.widget.trigger(Events.POSTS_LOADED, data.posts);
                        // this.trigger(Events.POSTS_LOADED, data.posts);

                        // add to the beginning
                        if (data.posts.length > 0) {
                            this.posts = data.posts.concat(this.posts);
                        }

                        resolve (data.posts);
                    } else {
                        // this.trigger(Events.POSTS_FAILED, data);
                        // this.widget.trigger(Events.POSTS_FAILED, data);
                        reject();
                    }
                },
                (jqXHR, textStatus, errorThrown) => {
                    Logger.log('Feed->_loadNewPosts fail');
                    Logger.log(textStatus);
                    Logger.log(errorThrown);

                    this.trigger(Events.POSTS_FAILED, []);
                    this.loading = false;
                }
            );
        });
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

export default Feed;