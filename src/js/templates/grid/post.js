

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
                        <div class="crt-post-content-text"> 
                            <%=this.parseText(text)%> 
                        </div> 
                        <div class="crt-post-read-more"><a href="#" class="crt-post-read-more-button"><%=this._t("read-more")%></a></div> 
                        <div class="crt-post-footer">
                            <img class="crt-post-userimage" src="<%=user_image%>" alt="Profile image for <%=user_full_name%>" /> 
                            <span class="crt-post-username"><a href="<%=this.userUrl()%>" target="_blank"><%=this.userScreenName()%></a></span>
                            <span class="crt-date"><%=this.prettyDate(source_created_at)%></span> 
                            <div class="crt-post-share">
                                <span class="crt-share-hint"></span>
                                <a class="crt-share-facebook" c-on:click="onShareFacebookClick"><i class="crt-icon-facebook"></i></a>  
                                <a class="crt-share-twitter" c-on:click="onShareTwitterClick"><i class="crt-icon-twitter"></i></a>
                            </div>
                        </div> 
                    </div>
                </div> 
            </div> 
        </div> 
    </div>
</div>`;

export default template;