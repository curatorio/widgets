/**
* ==================================================================
* Popup Manager
* ==================================================================
*/

import Logger from '/curator/core/logger';
import Popup from './popup';
import TemplatingUtils from '/curator/core/templating';
import z from '/curator/core/lib';


class PopupManager {
    
    constructor (widget) {
        Logger.log("PopupManager->init ");

        this.widget = widget;
        let templateId = this.widget.options.templatePopupWrapper;

        this.$wrapper = TemplatingUtils.renderTemplate(templateId, {});
        this.$popupContainer = this.$wrapper.find('.crt-popup-container');
        this.$underlay = this.$wrapper.find('.crt-popup-underlay');

        z('body').append(this.$wrapper);
        this.$underlay.click(this.onUnderlayClick.bind(this));
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
        this.$popupContainer.append(this.popup.$popup);

        this.$wrapper.show();

        if (this.$underlay.css('display') !== 'block') {
            this.$underlay.fadeIn();
        }
        this.popup.show();

        z('body').addClass('crt-popup-visible');

        this.currentPostNum = 0;
        for(let i=0;i < this.posts.length;i++)
        {
            // console.log (post.json.id +":"+this.posts[i].id);
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

    onUnderlayClick (e) {
        Logger.log('PopupManager->onUnderlayClick');
        e.preventDefault();

        if (this.popup) {
            this.popup.hide(function () {
                this.hide();
            }.bind(this));
        }
    }

    hide () {
        Logger.log('PopupManager->hide');
        this.widget.track('popup:hide');
        z('body').removeClass('crt-popup-visible');
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

export default PopupManager;