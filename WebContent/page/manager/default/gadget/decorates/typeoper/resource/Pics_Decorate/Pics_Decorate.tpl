
		<textarea name="${data.appId}" class="form-control" style="display:none">${data&&data.data && FW.use().toJSONString(data.data)||""}</textarea>
		<div style="margin-top:5px;" class="btn btn-mini btn-info" href="javascript:void(0);">
			<i class="icon-search bigger-120"></i>
			<span id="spanButtonPlaceholder"></span>
		</div>
		<div id="divFileProgressContainer" class="ProgressContainer"></div>
		<div class="PicsClass row"  id="result_${data.appId}">
			<!--$if(data.data){-->
				<!--$for(var i=0;i<data.data.length;i++){-->
					<div class="col-sm-6 col-md-4">
                        <div class="thumbnail">
                          <img src="${Cfg.baseUrl}/${data.data[i].picUrl}"  srcValue="${data.data[i].picUrl}" alt="${data.data[i].alt}">
                          <div class="caption">
                            <h3>${data.data[i].alt}</h3>
                            <p><a href="#" class="btn btn-primary btn-xs" role="button"  onclick="FireEvent.removeOne('${i}')">删除</a></p>
                          </div>
                        </div>
                      </div>				
				<!--$}-->
			<!--$}-->
		</div>

