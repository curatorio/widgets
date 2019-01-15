

const template = `
<div>
    <button c-on:click="loadBefore">Load Newer</button>
<div class="crt-feed-window" ref="feedWindow">
    <div class="crt-feed" ref="feed"></div>
</div>
<div class="crt-load-more-container" ref="loadMore"><button c-on:click="onMoreClick" class="crt-load-more"><span><%=this._t("load-more")%></span></button></div>
</div>
`;

export default template;