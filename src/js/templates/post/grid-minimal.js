

const template = `
<div class="crt-grid-post crt-grid-post-v2 crt-post-<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>" data-post="<%=id%>"> \
    <div class="crt-post-c" ref="postC" c-on:click="onPostClick"> 
        <div class="crt-post-content"> 
            <div class="crt-hitarea" > 
                <div class="crt-grid-post-spacer" ref="spacer"></div> 
                <div class="crt-grid-post-image">
                    <div class="crt-post-content-image" style="background-image:url('<%=image%>');"></div> 
                    <span class="crt-play"><i class="crt-play-icon"></i></span> 
                    <span class="crt-social-icon crt-social-icon-normal"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> 
                    <div class="crt-image-carousel"><i class="crt-icon-image-carousel"></i></div> 
                </div>
                <video preload="none" loop muted ref="video">
                    <source src="<%=video%>" type="video/mp4">
                </video>
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
                            <div class="crt-post-fullname"><a href="<%=this.userUrl()%>" target="_blank"><%=user_full_name%></a></div>
                        </div> 
                    </div>
                </div> 
            </div> 
        </div> 
    </div>
</div>`;

export default template;