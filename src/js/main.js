
import {} from './libraries/nanoajax';
import {} from './libraries/es6shim-array-fill';
import {} from './libraries/es5shim-object-keys';
import {} from './libraries/twitter-text-regex';

import EventBus from './core/bus';
import Globals from './core/globals';

import Post from './ui/post';
import StringUtils from './utils/string';
import HtmlUtils from './utils/html';
import Templating from './core/templating';
import Templates from './templates/templates';
import Logger from './core/logger';
import Events from './core/events';
import z from './core/lib';
import translate from './core/translate';

import Waterfall from './widgets/waterfall';
import List from './widgets/list';
import Grid from './widgets/grid';
import Carousel from './widgets/carousel';
import Panel from './widgets/panel';

let findContainer = function (config) {
    // find with data-crt-feed-id
    let container = z('[data-crt-feed-id="'+config.feedId+'"]');
    if (container.length > 0) {
        return container.get(0);
    }

    // could not find container ... try using the class feedId
    container = z('.crt-feed-'+config.feedId);
    if (container.length > 0) {
        return container.get(0);
    }

    // could not find container ... try using the feedId
    container = z('#curator-'+config.feedId);
    if (container.length > 0) {
        return container.get(0);
    }

    container = z(config.container);
    if (container.length) {
        return container.get(0);
    }
    return false;
};

let loadWidget = function (config) {
    let container = findContainer (config);

    if (!container) {
        Logger.error('Curator - could not find container');
        return false;
    } else {
        config.container = container;
        let ConstructorClass = Crt.Widgets[config.type];
        return new ConstructorClass(config);
    }
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
    Globals: Globals,

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
