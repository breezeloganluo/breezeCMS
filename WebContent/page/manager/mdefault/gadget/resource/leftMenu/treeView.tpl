
<!--$for (var i=0;i<data.length;i++){-->
<a href="javascript:;" class="weui_tabbar_item" onclick="FireEvent.clkckmenu('${i}')">
  <div class="weui_tabbar_icon">
  	<img src="${p:('processImgDir',data[i]['icon-img'])}" alt="">
  </div>
  <p class="weui_tabbar_label">${data[i].name}</p>
</a>
<!--$}-->	
