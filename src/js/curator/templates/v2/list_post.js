

const template = `
<div class="crt-list-post crt-post-<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>" data-post="<%=id%>"> \
    <div class="crt-post-c"> 
        <div class="crt-post-content"> 
            <div class="crt-list-post-image">
                <div>
                <img class="crt-post-content-image" src="<%=image%>" alt="Image from <%=this.networkName()%>" /> 
                <a href="javascript:;" class="crt-play"><i class="crt-play-icon"></i></a> 
                <span class="crt-social-icon crt-social-icon-normal"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> 
                <span class="crt-image-carousel"><i class="crt-icon-image-carousel"></i></span>
                </div> 
            </div>
            <div class="crt-list-post-text">
                <div class="crt-post-header"> 
                    <div class="crt-post-fullname"><%=id%> - <a href="<%=this.userUrl()%>" target="_blank"><%=user_full_name%></a></div>
                </div> 
                <div class="crt-list-post-text-wrap"> 
                    <div><%=this.parseText(text)%></div> 
                </div> 
                <span class="crt-social-icon crt-social-icon-normal"><i class="crt-icon-<%=this.networkIcon()%>"></i></span>
                 <div class="crt-post-footer">
                    <img class="crt-post-userimage" src="<%=user_image%>" alt="Profile image for <%=user_full_name%>"/> 
                    <span class="crt-post-username"><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></span>
                    <span class="crt-date"><%=this.prettyDate(source_created_at)%></span> 
                    <div class="crt-post-share"><span class="crt-share-hint"></span><a href="#" class="crt-share-facebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="crt-share-twitter"><i class="crt-icon-twitter"></i></a></div>
                </div>  
            </div>
        </div> 
    </div>
</div>`;

export default template;