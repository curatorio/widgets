

const template = ` 
<div class="crt-popup"> 
    <a c-on:click="onClose" class="crt-close crt-icon-cancel"></a> 
    <a c-on:click="onPrevious" class="crt-next crt-icon-right-open"></a> 
    <a c-on:click="onNext" class="crt-previous crt-icon-left-open"></a> 
    <div class="crt-popup-left" ref="left">  
        <div class="crt-video"> 
            <div class="crt-video-container">
                <video preload="none" ref="video">
                <source src="<%=video%>" type="video/mp4">
                </video>
                <img src="<%=image%>" alt="Image posted by <%=this.userScreenName()%> to <%=this.networkName()%>" />
                <ac rt-click="onPlay" class="crt-play"><i class="crt-play-icon"></i></a> 
            </div> 
        </div> 
        <div class="crt-image"> 
            <img src="<%=image%>" alt="Image posted by <%=this.userScreenName()%> to <%=this.networkName()%>" /> 
        </div> 
        <div class="crt-pagination"><ul></ul></div>
    </div> 
    <div class="crt-popup-right"> 
        <div class="crt-popup-header"> 
            <span class="crt-social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> 
            <img src="<%=user_image%>" alt="Profile image for <%=user_full_name%>"  /> 
            <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank"><%=this.userScreenName()%></a></div> 
        </div> 
        <div class="crt-popup-text <%=this.contentTextClasses()%>"> 
            <div class="crt-popup-text-container"> 
                <p class="crt-date"><%=this.dateUrl()%></a></p> 
                <div class="crt-popup-text-body"><%=this.parseText(text)%></div> 
            </div> 
        </div> 
        <div class="crt-popup-read-more">
            <a href="<%=url%>" target="_blank" class="crt-button">Goto original post</a> 
        </div>
        <div class="crt-popup-footer">
            <div class="crt-popup-stats"><span><%=likes%></span> <%=this._t("likes", likes)%> <i class="sep"></i> <span><%=comments%></span> <%=this._t("comments", comments)%></div> 
            <div class="crt-post-share"><span class="ctr-share-hint"></span>
            <a c-on:click="onShareFacebookClick" class="crt-share-facebook"><i class="crt-icon-facebook"></i></a>  
            <a c-on:click="onShareTwitterClick" class="crt-share-twitter"><i class="crt-icon-twitter"></i></a>
            </div>
        </div> 
    </div> 
</div>`;

export default template;