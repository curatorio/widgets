/**
* ==================================================================
* Filter
* ==================================================================
*/


Curator.Templates.filterTemplate = ' <div class="crt-filter"> \
<div class="crt-filter-network">\
<label>Show:</label> \
<ul class="networks">\
</ul>\
</div> \
</div>';

class Filter {

    constructor (client) {
        Curator.log('Filter->construct');

        this.client = client;

        this.$filter = Curator.Template.render('#filterTemplate', {});
        this.$filterNetworks =  this.$filter.find('.networks');

        this.client.$container.append(this.$filter);

        this.$filter.find('.crt-filter-network label').text(this.client.options.filter.label);

        this.$filter.on('click','.crt-filter-network a',(ev)=>{
            ev.preventDefault();
            console.log (ev);
            let t = $(ev.target);
            let networkId = t.data('network');

            this.$filter.find('.crt-filter-network li').removeClass('active');
            t.parent().addClass('active');

            Curator.EventBus.trigger('crt:filter:change');

            if (networkId) {
                this.client.feed.loadPosts(0, {network_id: networkId});
            } else {
                this.client.feed.loadPosts(0, {});
            }
        });

        this.client.feed.on('postsLoaded', (event) => {
            this.onPostsLoaded(event.target);
        });
    }

    onPostsLoaded () {
        console.log ("Asd");

        if (!this.filtersLoaded) {
            this.$filterNetworks.append('<li class="active"><a href="#" data-network="0"> All</a></li>');

            for (let id of this.client.feed.networks) {
                let network = Curator.Networks[id];
                console.log(network);
                this.$filterNetworks.append('<li><a href="#" data-network="' + id + '"><i class="' + network.icon + '"></i> ' + network.name + '</a></li>');
            }

            this.filtersLoaded = true;
        }
    }
}

Curator.Filter = Filter;