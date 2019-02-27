import configWaterfall from './widget-waterfall';
import configCarousel from './widget-carousel';
import configGridCarousel from './widget-grid-carousel';
import configGrid from './widget-grid';
import configPanel from './widget-panel';
import configList from './widget-list';

const defaultColors = {
    widgetBgColor:'transparent',
    bgColor:'#ffffff',
    borderColor:'#cccccc',
    textColor:'#222222',
    linkColor:'#999999',
};

let generalSydney = function (colors) {

    let bgColor = colors.bgColor;
    let textColor = colors.textColor;
    let linkColor = colors.linkColor;
    let borderColor = colors.borderColor;
    let widgetBgColor = colors.widgetBgColor;

    return {
        config: {
            post: {
                template: 'post-general'
            },
        },
        styles: {
            widget : {
                backgroundColor:widgetBgColor,
            },
            post : {
                backgroundColor:bgColor,
                borderColor:borderColor,
                borderWidth:'1px',
                color:textColor
            },
            postText: {
                color:textColor
            },
            postTextLink: {
                color:linkColor
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
            loadMore: {
                color:textColor,
                backgroundColor:bgColor,
                borderColor:borderColor
            }
        }
    };
};

let generalLondon = function (colors) {

    let bgColor = colors.bgColor;
    let textColor = colors.textColor;
    let linkColor = colors.linkColor;
    let borderColor = colors.borderColor;
    let widgetBgColor = colors.widgetBgColor;

    return {
        config: {
            post: {
                template: 'post-general-london'
            },
        },
        styles: {
            widget : {
                backgroundColor:widgetBgColor,
            },
            post : {
                backgroundColor:bgColor,
                borderColor:borderColor,
                borderWidth:'10px',
                color:textColor
            },
            postText: {
                color:textColor
            },
            postTextLink: {
                color:linkColor
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
            loadMore: {
                color:textColor,
                backgroundColor:bgColor,
                borderColor:borderColor
            }
        }
    };
};

let generalBerlin = function (colors) {
    let bgColor = colors.bgColor;
    let textColor = colors.textColor;
    let linkColor = colors.linkColor;
    let borderColor = colors.borderColor;
    let widgetBgColor = colors.widgetBgColor;

    return {
        config: {
            post: {
                template: 'post-general-berlin'
            },
        },
        styles: {
            widget : {
                backgroundColor:widgetBgColor,
            },
            post : {
                backgroundColor:'transparent',
                borderColor:'transparent',
                borderWidth:'0px',
                color:textColor
            },
            postText: {
                color:textColor
            },
            postTextLink: {
                color:linkColor
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
            loadMore: {
                color:textColor,
                backgroundColor:bgColor,
                borderColor:borderColor
            }
        }
    };
};

let gridSydney = function (colors) {
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

let gridNewYork = function (colors) {
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

let listSydney = function (colors) {
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
    defaultColors (widgetTheme) {
        let colors = {};

        // Very basic shallow clone ...
        for (let key in defaultColors) {
            colors[key] = defaultColors[key];
        }

        if (widgetTheme === 'berlin') {
            colors.bgColor = 'transparent';
        }

        if (widgetTheme === 'london') {
            colors.borderColor = colors.bgColor;
        }

        return colors;
    },

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

    themeConfig (widgetType, widgetTheme) {
        if (themes.widgetThemeOptions[widgetType] && themes.widgetThemeOptions[widgetType][widgetTheme]) {
            let config = themes.widgetThemeOptions[widgetType][widgetTheme]({});
            return config.config;
        } else {
            return {};
        }
    },

    themeStyles (widgetType, widgetTheme, colors) {
        if (themes.widgetThemeOptions[widgetType] && themes.widgetThemeOptions[widgetType][widgetTheme]) {
            let config = themes.widgetThemeOptions[widgetType][widgetTheme](colors);
            return config.styles;
        } else {
            return {};
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