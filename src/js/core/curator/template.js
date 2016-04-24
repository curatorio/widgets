

Curator.Templates = {};

Curator.Template = {
    camelize: function (s) {
        return s.replace (/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },
    render: function (templateId, data) {
        var cam = this.camelize(templateId).substring(1);
        var source = '';

        if (Curator.Templates[cam] !== undefined)
        {
            source = Curator.Templates[cam];
        } else if (jQuery(templateId).length===1) {
            source = jQuery(templateId).html();
        }

        if (source === '')
        {
            throw new Error ('could not find template '+templateId+'('+cam+')');
        }

        var tmpl = root.parseTemplate(source, data);
        tmpl = jQuery.parseHTML(tmpl);
        return jQuery(tmpl).filter('div');
    }
};

