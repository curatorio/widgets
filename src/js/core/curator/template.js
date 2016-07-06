

Curator.Templates = {

    postTemplate : ' \
<div class="crt-post-c">\
    <div class="crt-post post<%=id%>"> \
        <div class="crt-post-header"> \
            <span class="social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
        </div> \
        <div class="crt-post-content"> \
            <div class="image hitarea crt-post-content-image <%=this.contentImageClasses()%>" > \
                <img src="<%=image%>" /> \
            </div> \
            <div class="text crt-post-content-text <%=this.contentTextClasses()%>"> \
                <%=this.parseText(text)%> \
            </div> \
        </div> \
        <div class="crt-post-share">Share <a href="#" class="shareFacebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="shareTwitter"><i class="crt-icon-twitter-bird"></i></a> </div> \
    </div>\
</div>',


    popupTemplate : ' <div class="crt-popup-wrapper"> \
<div class="crt-popup-underlay"></div> \
<div class="crt-popup"> \
    <a href="#" class="close">Close</a> \
    <div class="crt-popup-left">  \
        <img src="<%=image%>" /> \
    </div> \
    <div class="crt-popup-right"> \
        <div class="crt-popup-header"> \
            <span class="social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
        </div> \
        <div class="crt-popup-text <%=this.contentTextClasses()%>"> \
            <%=this.parseText(text)%> \
        </div> \
    </div> \
</div> \
</div>',


    popupUnderlayTemplate : ''
};

Curator.Template = {
    camelize: function (s) {
        return s.replace (/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },
    render: function (templateId, data) {
        var cam = this.camelize(templateId).substring(1);
        var source = '';

        if (jQuery(templateId).length===1)
        {
            source = jQuery(templateId).html();
        } else if (Curator.Templates[cam] !== undefined)
        {
            source = Curator.Templates[cam];
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

