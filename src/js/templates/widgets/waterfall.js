
// Note the .crt-feed-spacer below was added to fix issues where the feed didn't fill the full width of a browser when it (the feed
// is a child of a flex-box that doesn't grow correctly ... pretty hacky but it works :|
const template = `
<div class="crt-feed-scroll">
    <div class="crt-feed" ref="feed">
        <div class="crt-feed-spacer"> -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- </div>
    </div>
    <div class="crt-load-more-container" ref="loadMore"><button c-on:click="onMoreClick" class="crt-load-more"><span><%=this._t("load-more")%></span></button></div>
</div>
`;

export default template;