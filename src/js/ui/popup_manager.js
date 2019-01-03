
import Logger from '../core/logger';
import Control from './controls/control';
import Popup from './popup';
import z from '../core/lib';


class PopupManager extends Control {
    constructor (widget) {
        Logger.log("PopupManager->init ");
        super();

        this.widget = widget;

        this.templateId = this.widget.config('popup.templateWrapper');
        this.render();

        z('body').append(this.$el);
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
        this.popup = new Popup(this, post, this.widget);
        this.$refs.container.append(this.popup.$el);

        this.$el.show();

        if (this.$refs.underlay.css('display') !== 'block') {
            this.$refs.underlay.fadeIn();
        }
        this.popup.show();

        z('body').addClass('crt-popup-visible');

        this.currentPostNum = 0;
        for(let i=0;i < this.posts.length;i++)
        {
            if (post.id === this.posts[i].id) {
                this.currentPostNum = i;
                Logger.log('Found post '+i);
                break;
            }
        }

        this.widget.track('popup:show');
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

        this.showPopup(this.posts[this.currentPostNum]);
    }

    onNext () {
        this.currentPostNum+=1;
        this.currentPostNum = this.currentPostNum<this.posts.length?this.currentPostNum:0; // loop back to start

        this.showPopup(this.posts[this.currentPostNum]);
    }

    onUnderlayClick () {
        Logger.log('PopupManager->onUnderlayClick');

        if (this.popup) {
            this.popup.hide(() => {
                this.hide();
            });
        }
    }

    hide () {
        Logger.log('PopupManager->hide');
        this.widget.track('popup:hide');
        z('body').removeClass('crt-popup-visible');
        this.currentPostNum = 0;
        this.popup = null;
        this.$refs.underlay.fadeOut(() => {
            this.$refs.underlay.css({'display':'','opacity':''});
            this.$el.hide();
        });
    }
    
    destroy () {

        this.$refs.underlay.remove();

        super.destroy();
    }
}

export default PopupManager;