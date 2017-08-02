

Curator.Templates = {
    // V1
    'v1-post'            : v1PostTemplate,
    'v1-filter'          : v1FilterTemplate,
    'v1-popup'           : v1PopupTemplate,
    'v1-popup-underlay'  : v1PopupUnderlayTemplate,
    'v1-popup-wrapper'   : v1PopupWrapperTemplate,
    'v1-grid-post'       : gridPostTemplate,

    // V2
    'v2-post'            : v2PostTemple,
    'v2-filter'          : v1FilterTemplate,
    'v2-popup'           : v1PopupTemplate,
    'v2-popup-underlay'  : v1PopupUnderlayTemplate,
    'v2-popup-wrapper'   : v1PopupWrapperTemplate,

    'v2-grid-post'       : v2GridPostTemplate,
    'v2-grid-feed'       : v2GridFeedTemple,
};

Curator.Template = {
    render: function (templateId, data) {
        let source = '';

        if ($('#'+templateId).length===1)
        {
            source = $('#'+templateId).html();
        } else if (Curator.Templates[templateId] !== undefined)
        {
            source = Curator.Templates[templateId];
        }

        if (source === '')
        {
            throw new Error ('Could not find template '+templateId);
        }

        let tmpl = Curator.render(source, data);
        if ($.parseHTML) {
            // breaks with jquery < 1.8
            tmpl = $.parseHTML(tmpl);
        }
        return $(tmpl).filter('div');
    }
};

