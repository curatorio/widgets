

const template = `
<div>
<div class="crt-feed-window" ref="feedWindow">
    <div class="crt-feed" ref="feed"></div>
</div>
<div class="crt-load-more-container" ref="loadMore"><a c-on:click="onMoreClick" class="crt-load-more"><span><%=this._t("load-more")%></span></a></div>>
</div>
`;

export default template;