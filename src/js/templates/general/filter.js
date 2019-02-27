
const template = `<div class="crt-filter"> 
<div class="crt-filter-networks" ref="networks">
<ul class="crt-networks" ref="networksUl"> 
    <li class="crt-filter-label"><label><%=this._t('filter')%> Network:</label></li>
</ul>
</div> 
<div class="crt-filter-sources" ref="sources">
<ul class="crt-sources" ref="sourcesUl"> 
    <li class="crt-filter-label"><label><%=this._t('filter')%> Source:</label></li>
</ul>
</div> 
</div>`;

export default  template;