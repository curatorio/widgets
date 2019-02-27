import Control from '../controls/control';
import z from '../../core/lib';
import Events from "../../core/events";

class LayoutCarouselPane extends Control {
    constructor () {
        super ();

        this.posts = [];

        this.$el = z('<div class="crt-carousel-pane"></div>');
    }

    addPost (post) {
        post.on(Events.POST_LAYOUT_CHANGED, this.onPostLayoutChanged.bind(this));

        this.$el.append(post.$el);

        this.posts.push(post);
    }

    onPostLayoutChanged () {
        this.trigger(Events.PANE_HEIGHT_CHANGED);
    }

    getHeight () {
        console.log('LayoutCarouselPane->getHeight ');
        let height = 0;

        for (let post of this.posts) {
            height += post.getHeight();
        }

        return height;
    }

    forceHeight (height) {
        for (let post of this.posts) {
            post.forceHeight (height);
        }

        return this.$el.height();
    }

    destroy () {
        for (let post of this.posts) {
            post.destroy();
        }

        super.destroy();
    }
}

export default LayoutCarouselPane;