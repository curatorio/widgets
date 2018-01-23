
import EventBus from '../core/bus';
import Templating from "../core/templating";
import Logger from "../core/logger";
import Events from "../core/events";
import Networks from "../config/networks";
import z from "../core/lib";

/**
* ==================================================================
* Filter
* ==================================================================
*/

class Filter extends EventBus {

    constructor (widget) {
        Logger.log('Filter->construct');

        super();

        this.widget = widget;
        this.options = widget.options;

        this.$filter = Templating.renderTemplate(this.options.templateFilter, {});
        this.$filterNetworks =  this.$filter.find('.crt-filter-networks');
        this.$filterNetworksUl =  this.$filter.find('.crt-filter-networks ul');
        this.$filterSources =  this.$filter.find('.crt-filter-sources');
        this.$filterSourcesUl =  this.$filter.find('.crt-filter-sources ul');

        this.widget.$container.append(this.$filter);

        this.$filter.on('click','.crt-filter-networks a', (ev) => {
            ev.preventDefault();
            let t = z(ev.target);
            let networkId = t.data('network');

            this.$filter.find('.crt-filter-networks li').removeClass('active');
            t.parent().addClass('active');

            this.widget.trigger(Events.FILTER_CHANGED);

            if (networkId) {
                this.widget.feed.loadPosts(0, {network_id: networkId});
            } else {
                this.widget.feed.loadPosts(0, {});
            }
        });

        this.$filter.on('click','.crt-filter-sources a', (ev) => {
            ev.preventDefault();
            let t = z(ev.target);
            let sourceId = t.data('source');

            this.$filter.find('.crt-filter-sources li').removeClass('active');
            t.parent().addClass('active');

            this.widget.trigger(Events.FILTER_CHANGED);

            if (sourceId) {
                this.widget.feed.loadPosts(0, {source_id:sourceId});
            } else {
                this.widget.feed.loadPosts(0, {});
            }
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
                        this.$filterNetworksUl.append('<li><a href="#" data-network="' + id + '"><i class="' + network.icon + '"></i> ' + network.name + '</a></li>');
                    } else {
                        //console.log(id);
                    }
                }
            } else {
                this.$filterNetworks.hide();
            }

            if (this.options.filter.showSources) {
                for (let source of sources) {
                    let network = Networks[source.network_id];
                    if (network) {
                        this.$filterSourcesUl.append('<li><a href="#" data-source="' + source.id + '"><i class="' + network.icon + '"></i> ' + source.name + '</a></li>');
                    } else {
                        // console.log(source.network_id);
                    }
                }
            } else {
                this.$filterSources.hide();
            }

            this.filtersLoaded = true;
        }
    }

    destroy () {
        this.$filter.remove();
    }
}

export default Filter;