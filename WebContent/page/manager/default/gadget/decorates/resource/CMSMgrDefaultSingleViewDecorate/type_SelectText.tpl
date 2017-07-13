<!--$var selectData = data.metadata.valueRange;-->
<div class="dropdown">
  
  
  <input type="text" id="field_${data.appId}" data-toggle="dropdown" name="${data.appId}" class="form-control" value="${p:("parserValueData",data.data)}">
  <ul class="dropdown-menu" aria-labelledby="field_${data.appId}">
          <!--$for (var i=0;i<selectData.length;i++){-->
          <!--$for(var k in selectData[i]){-->
               <li><a href="#" onclick="$('#field_${data.appId}').val('${p:("parserValueData",selectData[i][k])}')">${k}</a></li>
          <!--$}-->
          <!--$}-->
  </ul>
</div>