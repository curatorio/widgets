

Curator.Templates = {

    postTemplate : ' \
<div class="crt-post-c">\
    <div class="crt-post post<%=id%> crt-post-<%=this.networkIcon()%>"> \
        <div class="crt-post-header"> \
            <span class="social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
        </div> \
        <div class="crt-post-content"> \
            <div class="image crt-hitarea crt-post-content-image <%=this.contentImageClasses()%>" > \
                <img src="<%=image%>" class="crt-post-image" /> \
                <a href="javascript:;" class="crt-play"><i class="play"></i></a> \
            </div> \
            <div class="text crt-post-content-text <%=this.contentTextClasses()%>"> \
                <div class="crt-post-text-body"><%=this.parseText(text)%></div> \
            </div> \
        </div> \
        <div class="crt-post-footer">\
            <div class="crt-date"><%=this.prettyDate(source_created_at)%></div> \
            <div class="crt-post-share"><span class="ctr-share-hint"></span><a href="#" class="shareFacebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="shareTwitter"><i class="crt-icon-twitter"></i></a></div>\
        </div> \
        <div class="crt-post-read-more"><a href="#" class="crt-post-read-more-button">Read more</a> </div> \
    </div>\
</div>',

    popupWrapperTemplate : ' <div class="crt-popup-wrapper"> \
<div class="crt-popup-underlay"></div> \
<div class="crt-popup-wrapper-c"> \
<div class="crt-popup-container"></div> \
</div> \
</div>',

    popupTemplate : ' \
<div class="crt-popup"> \
    <a href="#" class="crt-close crt-icon-cancel"></a> \
    <a href="#" class="crt-next crt-icon-right-open"></a> \
    <a href="#" class="crt-previous crt-icon-left-open"></a> \
    <div class="crt-popup-left">  \
        <div class="crt-video"> \
            <div class="crt-video-container">\
                <video src="<%=video%>" type="video/mp3" preload="none"></video>\
                <img src="<%=image%>" />\
                <a href="javascript:;" class="crt-play"><i class="play"></i></a> \
            </div> \
        </div> \
        <div class="crt-image"> \
            <img src="<%=image%>" /> \
        </div> \
    </div> \
    <div class="crt-popup-right"> \
        <div class="crt-popup-header"> \
            <span class="social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
        </div> \
        <div class="crt-popup-text <%=this.contentTextClasses()%>"> \
            <p class="crt-date"><%=this.prettyDate(source_created_at)%></p> \
            <div class="crt-popup-text-body"><%=this.parseText(text)%></div> \
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

        if ($(templateId).length===1)
        {
            source = $(templateId).html();
        } else if (Curator.Templates[cam] !== undefined)
        {
            source = Curator.Templates[cam];
        }

        if (source === '')
        {
            throw new Error ('could not find template '+templateId+'('+cam+')');
        }

        var tmpl = window.parseTemplate(source, data);
        if ($.parseHTML) {
            // breaks with jquery < 1.8
            tmpl = $.parseHTML(tmpl);
        }
        return $(tmpl).filter('div');
    }

};

