
import {} from './libraries/nanoajax';
import {} from './libraries/es6shim-array-fill';
import {} from './libraries/es5shim-object-keys';
import {} from './libraries/twitter-text-regex';

import EventBus from '/curator/core/bus';
import Globals from '/curator/core/globals';

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
    if (typeof window.onCuratorBeforeBootstrap === 'function') {
        window.onCuratorBeforeBootstrap();
    }
    if (window.jQuery) {
        window.jQuery(window).trigger('curatorCssLoaded');
    }
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
