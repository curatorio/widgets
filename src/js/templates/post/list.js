

const template = `
<div class="crt-list-post crt-post-<%=id%> <%=this.contentImageClasses()%> <%=this.contentTextClasses()%>" data-post="<%=id%>"> 
    <div class="crt-post-c" ref="postC" c-on:click="onPostClick"> 
        <div class="crt-post-content"> 
            <div class="crt-list-post-image" ref="imageCol">
                <div ref="imageContainer">
                    <img class="crt-post-content-image" src="<%=image%>" ref="image" alt="Image posted by <%=user_screen_name%> to <%=this.networkName()%>" /> 
                    <a href="javascript:;" class="crt-play"><i class="crt-play-icon"></i></a> 
                    <span class="crt-social-icon crt-social-icon-normal"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> 
                    <span class="crt-image-carousel"><i class="crt-icon-image-carousel"></i></span>
                </div> 
            </div>
            <div class="crt-list-post-text">
                <div class="crt-post-header"> 
                    <div class="crt-post-fullname"><a href="<%=this.userUrl()%>" target="_blank"><%=user_full_name%></a></div>
                </div> 
                <div class="crt-list-post-text-wrap"> 
                    <div><%=this.parseText(text)%></div> 
                    <div class="crt-comments-likes">
                        <span class="crt-likes"><%=likes%> <span><%=this._t("likes", likes)%></span></span> <span class="crt-sep"></span> <span class="crt-comments"><%=comments%> <span><%=this._t("comments", comments)%></span></span> 
                    </div>
                </div> 
                 <div class="crt-post-footer">
                    <img class="crt-post-userimage" src="<%=user_image%>" alt="Profile image for <%=user_full_name%>" /> 
                    <span class="crt-post-username"><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></span>
                    <span class="crt-post-date"><%=this.dateUrl()%></span> 
                    <div class="crt-post-share">
                        <span class="crt-share-hint"></span>
                        <a class="crt-share-facebook" c-on:click="onShareFacebookClick()"><i class="crt-icon-facebook"></i></a>  
                        <a class="crt-share-twitter" c-on:click="onShareTwitterClick()"><i class="crt-icon-twitter"></i></a>
                    </div>
                </div>  
            </div>
        </div> 
    </div>
</div>`;

export default template;