
// import EventBus from './core/events'
import {} from './libraries/nanoajax';
import {} from './libraries/es6shim-array-fill';
import {} from './libraries/twitter-text-regex';

import EventBus from './core/core/bus';

import Post from './core/ui/post';
import Waterfall from "./core/widgets/waterfall";
import HtmlUtils from "./core/utils/html";
import Grid from "./core/widgets/grid";
import Carousel from "./core/widgets/carousel";
import Panel from "./core/widgets/panel";
import Templating from "./core/core/templating";
import z from "./core/core/lib";

let loadWidget = function (config) {
    let ConstructorClass = Crt.Widgets[config.type];
    let widget = new ConstructorClass(config);
    return widget;
};

let Crt = {

    loadWidget : loadWidget,
    z : z,

    Templating : Templating,
    EventBus : EventBus,

    Ui : {
        Post : Post,
    },

    Widgets : {
        Waterfall : Waterfall,
        Grid : Grid,
        Carousel : Carousel,
        Panel : Panel,
    },

    Utils : {
        Html : HtmlUtils
    },
};

// Crt.Widgets.Carousel = Carousel;
// Crt.Widgets.Panel = Panel;

export default Crt;
