/**
* ==================================================================
* Filter
* ==================================================================
*/


class Filter {

    constructor (client) {
        Curator.log('Filter->construct');

        this.client = client;
        this.options = client.options;

        this.$filter = Curator.Template.render('#filterTemplate', {});
        this.$filterNetworks =  this.$filter.find('.crt-filter-networks');
        this.$filterNetworksUl =  this.$filter.find('.crt-filter-networks ul');
        this.$filterSources =  this.$filter.find('.crt-filter-sources');
        this.$filterSourcesUl =  this.$filter.find('.crt-filter-sources ul');

        this.client.$container.append(this.$filter);

        this.$filterNetworks.find('label').text(this.client.options.filter.networksLabel);
        this.$filterSources.find('label').text(this.client.options.filter.sourcesLabel);

        this.$filter.on('click','.crt-filter-networks a',(ev)=>{
            ev.preventDefault();
            let t = $(ev.target);
            let networkId = t.data('network');

            this.$filter.find('.crt-filter-networks li').removeClass('active');
            t.parent().addClass('active');

            Curator.EventBus.trigger('crt:filter:change');

            if (networkId) {
                this.client.feed.loadPosts(0, {network_id: networkId});
            } else {
                this.client.feed.loadPosts(0, {});
            }
        });

        this.$filter.on('click','.crt-filter-sources a',(ev)=>{
            ev.preventDefault();
            let t = $(ev.target);
            let sourceId = t.data('source');

            this.$filter.find('.crt-filter-sources li').removeClass('active');
            t.parent().addClass('active');

            Curator.EventBus.trigger('crt:filter:change');

            if (sourceId) {
                this.client.feed.loadPosts(0, {source_id:sourceId});
            } else {
                this.client.feed.loadPosts(0, {});
            }
        });

        this.client.on(Curator.Events.FEED_LOADED, (event) => {
            this.onPostsLoaded(event.target);
        });
    }

    onPostsLoaded (data) {

        if (!this.filtersLoaded) {

            if (this.options.filter.showNetworks) {
                this.$filterNetworksUl.append('<li class="crt-filter-label"><label>'+this.client.options.filter.networksLabel+'</label></li>');
                this.$filterNetworksUl.append('<li class="active"><a href="#" data-network="0"> All</a></li>');

                for (let id of data.networks) {
                    let network = Curator.Networks[id];
                    if (network) {
                        this.$filterNetworksUl.append('<li><a href="#" data-network="' + id + '"><i class="' + network.icon + '"></i> ' + network.name + '</a></li>');
                    } else {
                        console.log(id);
                    }
                }
            } else {
                this.$filterNetworks.hide();
            }

            if (this.options.filter.showSources) {
                this.$filterSourcesUl.append('<li class="crt-filter-label"><label>'+this.client.options.filter.sourcesLabel+'</label></li>');
                this.$filterSourcesUl.append('<li class="active"><a href="#" data-source="0"> All</a></li>');
                for (let source of data.sources) {
                    let network = Curator.Networks[source.network_id];
                    if (network) {
                        this.$filterSourcesUl.append('<li><a href="#" data-source="' + source.id + '"><i class="' + network.icon + '"></i> ' + source.name + '</a></li>');
                    } else {
                        console.log(source.network_id);
                    }
                }
            } else {
                this.$filterSources.hide();
            }

            this.filtersLoaded = true;
        }
    }
}

Curator.Filter = Filter;