

const template = ` 
<div class="crt-post-v2 crt-post crt-post-<%=this.networkIcon()%> <%=this.contentTextClasses()%>  <%=this.contentImageClasses()%>" data-post="<%=id%>"> 
    <div class="crt-post-border">
        <div class="crt-post-c">
            <div class="crt-post-content">
                <div class="crt-image crt-hitarea crt-post-content-image" > 
                    <div class="crt-image-c"><img src="<%=image%>" class="crt-post-image" alt="Image posted by <%=user_screen_name%> to <%=this.networkName()%>" /></div>   
                    <span class="crt-play"><i class="crt-play-icon"></i></span> 
                    <div class="crt-image-carousel"><i class="crt-icon-image-carousel"></i></div> 
                </div> 
                <div class="crt-post-header"> 
                    <span class="crt-social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> 
                    <div class="crt-post-fullname"><a href="<%=this.userUrl()%>" target="_blank"><%=user_full_name%></a></div>
                </div> 
                <div class="text crt-post-content-text"> 
                    <%=this.parseText(text)%> 
                </div> 
            </div> 
            <% if (options.showComments || options.showLikes) { %>
                <div class="crt-comments-likes">
                    <% if (options.showLikes) { %><span><%=likes%></span> <%=this._t("likes", likes)%><% } %><% if (options.showComments && options.showLikes) { %> <span class="crt-sep"></span> <% } %><% if (options.showComments) { %><span><%=comments%></span> <%=this._t("comments", comments)%><% } %>
                </div>
            <% } %>
            <div class="crt-post-footer"> 
                <img class="crt-post-userimage" src="<%=user_image%>" alt="Profile image for <%=user_screen_name%>" /> 
                <span class="crt-post-username"><a href="<%=this.userUrl()%>" target="_blank"><%=this.userScreenName()%></a></span>
                <span class="crt-post-date"><%=this.dateUrl()%></span> 
                <div class="crt-post-share"><span class="crt-share-hint"></span>
                <a class="crt-share-facebook" crt-click="onShareFacebookClick()"><i class="crt-icon-facebook"></i></a>  
                <a class="crt-share-twitter" crt-click="onShareTwitterClick()"><i class="crt-icon-twitter"></i></a></div>
            </div> 
            <div class="crt-post-max-height-read-more"><a class="crt-post-read-more-button" crt-click="onReadMoreClick"><%=this._t("read-more")%></a></div> 
        </div> 
    </div> 
</div>`;

export default template;