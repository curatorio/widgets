
// Note the .crt-feed-spacer below was added to fix issues where the feed didn't fill the full width of a browser when it (the feed
// is a child of a flex-box that doesn't grow correctly ... pretty hacky but it works :|
const template = `
<div class="crt-feed-scroll">
<div class="crt-feed"><div class="crt-feed-spacer">-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- </div></div>
</div>
<div class="crt-load-more"><a href="#"><span><%=this._t("load-more")%></span></a></div>
`;

export default template;