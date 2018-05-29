
const filterTemplate = `<div class="crt-filter"> 
<div class="crt-filter-networks">
<ul class="crt-networks"> 
    <li class="crt-filter-label"><label><%=this._t('filter')%>:</label></li>
    <li class="active"><a href="#" data-network="0"> <%=this._t('all')%></a></li>
</ul>
</div> 
<div class="crt-filter-sources">
<ul class="crt-sources"> 
    <li class="crt-filter-label"><label><%=this._t('filter')%>:</label></li>
    <li class="active"><a href="#" data-source="0"> <%=this._t('all')%></a></li>
</ul>
</div> 
</div>`;

export default  filterTemplate;