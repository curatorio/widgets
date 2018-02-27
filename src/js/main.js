
import {} from './libraries/nanoajax';
import {} from './libraries/es6shim-array-fill';
import {} from './libraries/es5shim-object-keys';
import {} from './libraries/twitter-text-regex';

import EventBus from '/curator/core/bus';

import Post from '/curator/ui/post';
import StringUtils from './curator/utils/string';
import HtmlUtils from './curator/utils/html';
import Templating from './curator/core/templating';
import Templates from './curator/templates/templates';
import Logger from './curator/core/logger';
import Events from './curator/core/events';
import z from './curator/core/lib';
import translate from './curator/core/translate';

import Waterfall from './curator/widgets/waterfall';
import List from './curator/widgets/list';
import Grid from './curator/widgets/grid';
import Carousel from './curator/widgets/carousel';
import Panel from './curator/widgets/panel';

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
        List: List,
    },

    Utils: {
        Html: HtmlUtils,
        String: StringUtils
    },
};

export default Crt;
