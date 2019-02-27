
import Control from './controls/control';
import Logger from '../core/logger';
import Events from '../core/events';
import Networks from '../config/networks';
import z from '../core/lib';

class Filter extends Control {

    constructor (widget) {
        Logger.log('Filter->construct');

        super();

        this.widget = widget;

        this.templateId = this.widget.config('filter.template');
        this.render ();

        this.$el.on('click', '.crt-filter-networks a', this.onNetworkClick.bind(this));
        this.$el.on('click', '.crt-filter-sources a', this.onSourceClick.bind(this));

        this.widget.on(Events.FEED_LOADED, this.onPostsLoaded.bind(this));
    }

    onPostsLoaded (event, data) {
        let networks = data.networks;
        let sources = data.sources;

        if (!this.filtersLoaded) {
            if (this.widget.config('filter.showNetworks')) {
                for (let id of networks) {
                    let network = Networks[id];
                    if (network) {
                        this.$refs.networksUl.append('<li><a href="#" data-network="' + id + '"><i class="' + network.icon + '"></i> ' + network.name + '</a></li>');
                    } else {
                        //console.log(id);
                    }
                }
            } else {
                this.$refs.networks.hide();
            }

            if (this.widget.config('filter.showSources')) {
                for (let source of sources) {
                    let network = Networks[source.network_id];
                    if (network) {
                        this.$refs.sourcesUl.append('<li><a href="#" data-source="' + source.id + '"><i class="' + network.icon + '"></i> ' + source.name + '</a></li>');
                    } else {
                        // console.log(source.network_id);
                    }
                }
            } else {
                this.$refs.sources.hide();
            }

            this.filtersLoaded = true;
        }
    }

    onSourceClick (ev) {
        ev.preventDefault();
        let t = z(ev.target);
        let sourceId = t.data('source');

        if (!t.parent().hasClass('active')) {
            this.$el.find('.crt-filter-sources li').removeClass('active');
            t.parent().addClass('active');
        } else {
            this.$el.find('.crt-filter-sources li').removeClass('active');
            sourceId = 0;
        }

        this.widget.trigger(Events.FILTER_CHANGED, this);

        if (sourceId) {
            this.widget.feed.params.source_id = sourceId;
        } else {
            delete this.widget.feed.params.source_id;
        }

        this.widget.feed.load();
    }

    onNetworkClick (ev) {
        ev.preventDefault();
        let t = z(ev.target);
        let networkId = t.data('network');

        if (!t.parent().hasClass('active')) {
            this.$el.find('.crt-filter-networks li').removeClass('active');
            t.parent().addClass('active');
        } else {
            this.$el.find('.crt-filter-networks li').removeClass('active');
            networkId = 0;
        }

        this.widget.trigger(Events.FILTER_CHANGED, this);

        if (networkId) {
            this.widget.feed.params.network_id = networkId;
        } else {
            delete this.widget.feed.params.network_id;
        }

        this.widget.feed.load();
    }

    destroy () {
        this.$el.remove();
    }
}

export default Filter;