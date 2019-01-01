

const template = `
<div>
<div class="crt-feed-window" ref="feedWindow">
    <div class="crt-feed" ref="feed"></div>
</div>
<div class="crt-load-more" ref="loadMore"><a c-on:click="onMoreClicked"><%=this._t("load-more")%></a></div>
</div>
`;

export default template;