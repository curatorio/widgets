/**
* ==================================================================
* Popup Manager
* ==================================================================
*/


class PopupManager {
    
    constructor (client) {
        Curator.log("PopupManager->init ");

        this.client = client;
        this.templateId='#popup-wrapper-template';

        this.$wrapper = Curator.Template.render(this.templateId, {});
        this.$popupContainer = this.$wrapper.find('.crt-popup-container');
        this.$underlay = this.$wrapper.find('.crt-popup-underlay');

        $('body').append(this.$wrapper);
        this.$underlay.click(this.onUnderlayClick.bind(this));
        //this.$popupContainer.click(this.onUnderlayClick.bind(this));

    }

    showPopup (post) {
        if (this.popup) {
            this.popup.hide(() => {
                this.popup.destroy();
                this.showPopup2(post);
            });
        } else {
            this.showPopup2(post);
        }

    }

    showPopup2 (post) {
        this.popup = new Curator.Popup(this, post, this.feed);
        this.$popupContainer.append(this.popup.$popup);

        this.$wrapper.show();

        if (this.$underlay.css('display') !== 'block') {
            this.$underlay.fadeIn();
        }
        this.popup.show();

        $('body').addClass('crt-popup-visible');

        this.currentPostNum = 0;
        for(let i=0;i < this.posts.length;i++)
        {
            // console.log (post.json.id +":"+this.posts[i].id);
            if (post.json.id == this.posts[i].id) {
                this.currentPostNum = i;
                Curator.log('Found post '+i);
                break;
            }
        }

        this.client.track('popup:show');
    }

    setPosts (posts) {
        this.posts = posts;
    }

    onClose  () {
        this.hide();
    }

    onPrevious () {
        this.currentPostNum-=1;
        this.currentPostNum = this.currentPostNum>=0?this.currentPostNum:this.posts.length-1; // loop back to start

        this.showPopup({json:this.posts[this.currentPostNum]});
    }

    onNext () {
        this.currentPostNum+=1;
        this.currentPostNum = this.currentPostNum<this.posts.length?this.currentPostNum:0; // loop back to start

        this.showPopup({json:this.posts[this.currentPostNum]});
    }

    onUnderlayClick (e) {
        Curator.log('PopupManager->onUnderlayClick');
        e.preventDefault();

        if (this.popup) {
            this.popup.hide(function () {
                this.hide();
            }.bind(this));
        }
    }

    hide () {
        Curator.log('PopupManager->hide');
        this.client.track('popup:hide');
        $('body').removeClass('crt-popup-visible');
        this.currentPostNum = 0;
        this.popup = null;
        this.$underlay.fadeOut(() => {
            this.$underlay.css({'display':'','opacity':''});
            this.$wrapper.hide();
        });
    }
    
    destroy () {

        this.$underlay.remove();

        delete this.$popup;
        delete this.$underlay;
    }
}

Curator.PopupManager = PopupManager; 