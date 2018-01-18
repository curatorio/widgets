
import {} from './libraries/nanoajax';
import {} from './libraries/es6shim-array-fill';
import {} from './libraries/twitter-text-regex';

import EventBus from '/curator/core/bus';

import Post from '/curator/ui/post';
import Waterfall from './curator/widgets/waterfall';
import HtmlUtils from './curator/utils/html';
import StringUtils from './curator/utils/string';
import Grid from './curator/widgets/grid';
import Carousel from './curator/widgets/carousel';
import Panel from './curator/widgets/panel';
import Templating from './curator/core/templating';
import Templates from './curator/templates/templates';
import Logger from './curator/core/logger';
import Events from './curator/core/events';
import z from './curator/core/lib';
import translate from './curator/core/translate';

let loadWidget = function (config) {
    let ConstructorClass = Crt.Widgets[config.type];
    return new ConstructorClass(config);
};

let Crt = {

    loadWidget: loadWidget,
    loadCSS: () => {/* depreciated */},
    z: z,
    _t (s, n, lang) {
        return translate.t (s, n, lang);
    },

    Templates: Templates,
    Templating: Templating,
    EventBus: EventBus,
    Events: Events,
    Logger: Logger,

    Ui: {
        Post: Post,
    },

    Widgets: {
        Waterfall: Waterfall,
        Grid: Grid,
        Carousel: Carousel,
        Panel: Panel,
    },

    Utils: {
        Html: HtmlUtils,
        String: StringUtils
    },
};

export default Crt;
