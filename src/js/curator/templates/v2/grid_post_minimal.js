

const template = `
<div class="crt-grid-post crt-grid-post-minimal crt-grid-post-v2 crt-post-<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>" data-post="<%=id%>"> \
    <div class="crt-post-c"> 
        <div class="crt-post-content"> 
            <div class="crt-hitarea" > 
                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="crt-spacer" /> 
                <div class="crt-grid-post-image">
                    <div class="crt-post-content-image" style="background-image: url(<%=image%>);"> </div> 
                    <a href="javascript:;" class="crt-play"><i class="crt-play-icon"></i></a> 
                    <span class="crt-social-icon crt-social-icon-normal"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> 
                    <div class="crt-image-carousel"><i class="crt-icon-image-carousel"></i></div> 
                </div>
                <div class="crt-grid-post-text">
                    <div class="crt-grid-post-text-wrap"> 
                        <div><%=this.parseText(text)%></div> 
                    </div> 
                    <span class="crt-social-icon crt-social-icon-normal"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> 
                </div>
                <div class="crt-post-hover">
                    <div>
                        <div class="crt-post-header">
                            <span class="crt-social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span>  
                        </div> 
                        <div class="crt-post-minimal-stats"> 
                            <span class="crt-likes"><i class="crt-icon-heart"></i>&nbsp;<%=likes%></span>
                            <span class="crt-comments"><i class="crt-icon-comment"></i>&nbsp;<%=comments%></span>
                        </div> 
                    </div> 
                </div> 
            </div> 
        </div> 
    </div>
</div>`;

export default template;