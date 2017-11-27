
// import EventBus from './curator/events'
import {} from './libraries/nanoajax';
import {} from './libraries/es6shim-array-fill';
import {} from './libraries/twitter-text-regex';

import EventBus from './curator/core/bus';

import Post from './curator/ui/post';
import Waterfall from "./curator/widgets/waterfall";
import HtmlUtils from "./curator/utils/html";
import Grid from "./curator/widgets/grid";
import Carousel from "./curator/widgets/carousel";
import Panel from "./curator/widgets/panel";
import Templating from "./curator/core/templating";
import Logger from "./curator/core/logger";
import Events from "./curator/core/events";
import z from "./curator/core/lib";

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
    Events : Events,
    Logger : Logger,

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
