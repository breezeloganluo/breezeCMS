<div class="weui_panel_bd">
     <!--$for (var i=0;i<data.data.length;i++){-->
     		<a href="javascript:void(0);" class="weui_media_box weui_media_appmsg">
                <div class="weui_media_hd">
                    <img class="weui_media_appmsg_thumb" src="${Cfg.baseUrl}/${p:("getTypeValue",data,'icon',i)}" alt="">
                </div>
                <div class="weui_media_bd">
                    <h4 class="weui_media_title">${p:("getTypeValue",data,'title',i)}</h4>
                    <p class="weui_media_desc">${p:("getTypeValue",data,'desc',i)}</p>
                </div>
            </a>
     
     <!--$}-->
            
</div>