


const postTemplate = ' \
<div class="crt-post-v1 crt-post-c">\
    <div class="crt-post-bg"></div> \
    <div class="crt-post post<%=id%> crt-post-<%=this.networkIcon()%>"> \
        <div class="crt-post-header"> \
            <span class="crt-social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name">\
            <div class="crt-post-fullname"><%=user_full_name%></div>\
            <div class="crt-post-username"><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div>\
            </div> \
        </div> \
        <div class="crt-post-content"> \
            <div class="crt-image crt-hitarea crt-post-content-image <%=this.contentImageClasses()%>" > \
                <div class="crt-image-c"><img src="<%=image%>" class="crt-post-image" /></div> \
                <span class="crt-play"><i class="crt-play-icon"></i></span> \
            </div> \
            <div class="text crt-post-content-text <%=this.contentTextClasses()%>"> \
                <div class="crt-post-text-body"><%=this.parseText(text)%></div> \
            </div> \
        </div> \
        <div class="crt-post-footer">\
            <div class="crt-date"><%=this.prettyDate(source_created_at)%></div> \
            <div class="crt-post-share"><span class="ctr-share-hint"></span><a href="#" class="crt-share-facebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="crt-share-twitter"><i class="crt-icon-twitter"></i></a></div>\
        </div> \
        <div class="crt-post-read-more"><a href="#" class="crt-post-read-more-button">Read more</a> </div> \
    </div>\
</div>';


const gridPostTemplate = ' \
<div class="crt-post-c">\
    <div class="crt-post post<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>"> \
        <div class="crt-post-content"> \
            <div class="crt-hitarea" > \
                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="spacer" /> \
                <div class="crt-post-content-image" style="background-image: url(<%=image%>);"> </div> \
                <div class="crt-post-content-text-c"> \
                    <div class="crt-post-content-text"> \
                        <%=this.parseText(text)%> \
                    </div> \
                </div> \
                <a href="javascript:;" class="crt-play"><i class="crt-play-icon"></i></a> \
                <span class="crt-social-icon crt-social-icon-normal"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
                <div class="crt-post-hover">\
                    <div class="crt-post-header"> \
                        <img src="<%=user_image%>"  /> \
                        <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
                    </div> \
                    <div class="crt-post-hover-text"> \
                        <%=this.parseText(text)%> \
                    </div> \
                    <span class="crt-social-icon crt-social-icon-hover"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
                </div> \
            </div> \
        </div> \
    </div>\
</div>';

const popupWrapperTemplate = ' \
<div class="crt-popup-wrapper"> \
    <div class="crt-popup-wrapper-c"> \
        <div class="crt-popup-underlay"></div> \
        <div class="crt-popup-container"></div> \
    </div> \
</div>';

const popupTemplate = ' \
<div class="crt-popup"> \
    <a href="#" class="crt-close crt-icon-cancel"></a> \
    <a href="#" class="crt-next crt-icon-right-open"></a> \
    <a href="#" class="crt-previous crt-icon-left-open"></a> \
    <div class="crt-popup-left">  \
        <div class="crt-video"> \
            <div class="crt-video-container">\
                <video preload="none">\
                <source src="<%=video%>" type="video/mp4" >\
                </video>\
                <img src="<%=image%>" />\
                <a href="javascript:;" class="crt-play"><i class="crt-play-icon"></i></a> \
            </div> \
        </div> \
        <div class="crt-image"> \
            <img src="<%=image%>" /> \
        </div> \
    </div> \
    <div class="crt-popup-right"> \
        <div class="crt-popup-header"> \
            <span class="crt-social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
        </div> \
        <div class="crt-popup-text <%=this.contentTextClasses()%>"> \
            <div class="crt-popup-text-container"> \
                <p class="crt-date"><%=this.prettyDate(source_created_at)%></p> \
                <div class="crt-popup-text-body"><%=this.parseText(text)%></div> \
            </div> \
        </div> \
        <div class="crt-popup-footer">\
            <div class="crt-post-share"><span class="ctr-share-hint"></span><a href="#" class="crt-share-facebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="crt-share-twitter"><i class="crt-icon-twitter"></i></a></div>\
        </div> \
    </div> \
</div>';

let popupUnderlayTemplate = '';

let filterTemplate = ' <div class="crt-filter"> \
<div class="crt-filter-networks">\
<ul class="crt-networks"> </ul>\
</div> \
<div class="crt-filter-sources">\
<ul class="crt-sources"> </ul>\
</div> \
</div>';

// V2

const v2PostTemple = ' \
<div class="crt-post-v2 crt-post crt-post-<%=this.networkIcon()%>" data-post="<%=id%>"> \
    <div class="crt-image crt-hitarea crt-post-content-image <%=this.contentImageClasses()%>" > \
        <div class="crt-image-c"><img src="<%=image%>" class="crt-post-image" /></div> \
        <span class="crt-play"><i class="crt-play-icon"></i></span> \
    </div> \
    <div class="crt-post-header"> \
        <span class="crt-social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
        <div class="crt-post-fullname"><%=user_full_name%></div>\
    </div> \
    <div class="text crt-post-content-text <%=this.contentTextClasses()%>"> \
        <div class="crt-post-text-body"><%=this.parseText(text)%></div> \
    </div> \
    <div class="crt-post-read-more"><a href="#" class="crt-post-read-more-button">Read more</a> </div> \
    <div class="crt-post-footer">\
        <img src="<%=user_image%>" /> \
        <a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a>\
        <span class="crt-date"><%=this.prettyDate(source_created_at)%></span> \
        <div class="crt-post-share"><span class="ctr-share-hint"></span><a href="#" class="crt-share-facebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="crt-share-twitter"><i class="crt-icon-twitter"></i></a></div>\
    </div> \
</div>';

Curator.Templates = {
    v1PostTemplate            : postTemplate,
    v1FilterTemplate          : filterTemplate,
    v1PopupTemplate           : popupTemplate,
    v1PopupUnderlayTemplate   : popupUnderlayTemplate,
    v1PopupWrapperTemplate    : popupWrapperTemplate,
    v1GridPostTemplate        : gridPostTemplate,
    v2PostTemplate            : v2PostTemple,

    v2FilterTemplate          : filterTemplate,
    v2PopupTemplate           : popupTemplate,
    v2PopupUnderlayTemplate   : popupUnderlayTemplate,
    v2PopupWrapperTemplate    : popupWrapperTemplate,
    v2GridPostTemplate        : gridPostTemplate,
};

Curator.Template = {
    camelize: function (s) {
        return s.replace (/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },
    render: function (templateId, data) {
        let cam = this.camelize(templateId).substring(1);
        let source = '';

        if (Curator.Templates[cam] !== undefined)
        {
            source = Curator.Templates[cam];
        } else if ($(templateId).length===1)
        {
            source = $(templateId).html();
        }

        if (source === '')
        {
            throw new Error ('Could not find template '+templateId+' ('+cam+')');
        }

        let tmpl = window.parseTemplate(source, data);
        if ($.parseHTML) {
            // breaks with jquery < 1.8
            tmpl = $.parseHTML(tmpl);
        }
        return $(tmpl).filter('div');
    }
};

