
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
        this.options = widget.options;

        this.templateId = this.options.templateFilter;
        this.render ();

        this.widget.$container.append(this.$el);

        this.$el.on('click','.crt-filter-networks a', (ev) => {
            ev.preventDefault();
            let t = z(ev.target);
            let networkId = t.data('network');

            this.$el.find('.crt-filter-networks li').removeClass('active');
            t.parent().addClass('active');

            this.widget.trigger(Events.FILTER_CHANGED, this);

            if (networkId) {
                this.widget.feed.params.network_id = networkId;
            } else {
                this.widget.feed.params.network_id = 0;
            }

            this.widget.feed.loadPosts(0);
        });

        this.$el.on('click', '.crt-filter-sources a', (ev) => {
            ev.preventDefault();
            let t = z(ev.target);
            let sourceId = t.data('source');

            this.$el.find('.crt-filter-sources li').removeClass('active');
            t.parent().addClass('active');

            this.widget.trigger(Events.FILTER_CHANGED, this);

            if (sourceId) {
                this.widget.feed.params.source_id = sourceId;
            } else {
                this.widget.feed.params.source_id = 0;
            }

            this.widget.feed.loadPosts(0);
        });

        this.widget.on(Events.FEED_LOADED, this.onPostsLoaded.bind(this));
    }

    onPostsLoaded (event, data) {

        let networks = data.networks;
        let sources = data.sources;

        if (!this.filtersLoaded) {
            if (this.options.filter.showNetworks) {
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

            if (this.options.filter.showSources) {
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

    destroy () {
        this.$el.remove();
    }
}

export default Filter;