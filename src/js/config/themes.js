import configWaterfall from './widget-waterfall';
import configCarousel from './widget-carousel';
import configGridCarousel from './widget-grid-carousel';
import configGrid from './widget-grid';
import configPanel from './widget-panel';
import configList from './widget-list';


let generalSydney = function (bgColor, textColor) {
    return {
        config: {
            post: {
                template: 'post-general'
            },
        },
        styles: {
            post : {
                backgroundColor:bgColor,
                borderColor:bgColor,
                borderWidth:'2px',
                color:textColor
            },
            postText: {
                color:textColor
            },
            postTextLink: {
                color:textColor
            },
            postName: {
                color:textColor,
                textDecoration:'none'
            },
            postUsername: {
                color:textColor
            },
            postIcon: {
                color:textColor
            },
            postComments : {
                color:textColor
            },
            postShareIcons: {
                color:textColor
            },
            postDate: {
                color:textColor
            },
        }
    };
};

let generalBerlin = function (bgColor, textColor) {
    return {
        config: {
            post: {
                template: 'post-general-berlin'
            },
        },
        styles: {
            post : {
                backgroundColor:bgColor,
                borderColor:bgColor,
                borderWidth:'2px',
                color:textColor
            },
            postText: {
                color:textColor
            },
            postTextLink: {
                color:textColor
            },
            postName: {
                color:textColor,
                textDecoration:'none'
            },
            postUsername: {
                color:textColor
            },
            postIcon: {
                color:textColor
            },
            postComments : {
                color:textColor
            },
            postShareIcons: {
                color:textColor
            },
            postDate: {
                color:textColor
            },
        }
    };
};

let generalLondon = function (bgColor, textColor) {
    return {
        config: {
            post: {
                template: 'post-general-london'
            },
        },
        styles: {
            post : {
                backgroundColor:'transparent',
                borderColor:bgColor,
                borderWidth:'none',
                color:textColor
            },
            postText: {
                color:textColor
            },
            postTextLink: {
                color:textColor
            },
            postName: {
                color:textColor,
                textDecoration:'none'
            },
            postUsername: {
                color:textColor
            },
            postIcon: {
                color:textColor
            },
            postComments : {
                color:textColor
            },
            postShareIcons: {
                color:textColor
            },
            postDate: {
                color:textColor
            },
        }
    };
};

let gridSydney = function (bgColor, textColor) {
    return {
        config: {
            post: {
                template: 'post-grid'
            },
        },
        styles: {
        }
    };
};

let gridNewYork = function (bgColor, textColor) {
    return {
        config: {
            post: {
                template: 'post-grid-new-york'
            },
        },
        styles: {
        }
    };
};

let listSydney = function (bgColor, textColor) {
    return {
        config: {
            post: {
            },
        },
        styles: {
        }
    };
};

let themes = {
    widgetThemes (widgetType) {
        if (themes.widgetThemeOptions[widgetType]) {
            return Object.keys(themes.widgetThemeOptions[widgetType]);
        } else {
            console.error ('Unknown Widget Type: '+widgetType);
            return [];
        }
    },

    defaultTheme (widgetType) {
        let options = themes.widgetThemes(widgetType);
        if (options) {
            return options[0];
        } else {
            console.error ('Unknown Widget Type: '+widgetType);
            return 'sydney';
        }

    },

    typeConfig (widgetType) {
        if (themes.widgetConfigs[widgetType]) {
            return themes.widgetConfigs[widgetType];
        } else
        {
            return {};
        }
    },

    themeConfig (widgetType, widgetTheme, bgColor, textColor) {
        if (themes.widgetThemeOptions[widgetType]) {
            if (themes.widgetThemeOptions[widgetType][widgetTheme]) {
                return themes.widgetThemeOptions[widgetType][widgetTheme](bgColor, textColor);
            } else {
                return {};
            }
        }
    },

    widgetConfigs : {
        'Waterfall': configWaterfall,
        'Carousel': configCarousel,
        'Panel': configPanel,
        'Grid': configGrid,
        'GridCarousel': configGridCarousel,
        'List': configList

    },

    widgetThemeOptions: {
        'Waterfall': {
            'sydney': generalSydney,
            'berlin': generalBerlin,
            'london': generalLondon,
        },
        'Carousel': {
            'sydney': generalSydney,
            'berlin': generalBerlin,
            'london': generalLondon,
        },
        'Panel': {
            'sydney': generalSydney,
            'berlin': generalBerlin,
            'london': generalLondon,
        },
        'Grid': {
            'sydney' : gridSydney,
            'new-york' : gridNewYork
        },
        'GridCarousel': {
            'sydney' : gridSydney,
            'new-york' : gridNewYork
        },
        'List': {
            'listSydney': listSydney
        }
    }
};

export default themes;