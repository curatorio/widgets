
const template = `<div class="crt-filter"> 
<div class="crt-filter-networks" ref="networks">
<ul class="crt-networks" ref="networksUl"> 
    <li class="crt-filter-label"><label><%=this._t('filter')%>:</label></li>
    <li class="active"><a href="#" data-network="0"> <%=this._t('all')%></a></li>
</ul>
</div> 
<div class="crt-filter-sources" ref="sources">
<ul class="crt-sources" ref="sourcesUl"> 
    <li class="crt-filter-label"><label><%=this._t('filter')%>:</label></li>
    <li class="active"><a href="#" data-source="0"> <%=this._t('all')%></a></li>
</ul>
</div> 
</div>`;

export default  template;