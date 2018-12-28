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
        return this.$el.height();
    }

    destroy () {

    }
}

export default LayoutCarouselPane;