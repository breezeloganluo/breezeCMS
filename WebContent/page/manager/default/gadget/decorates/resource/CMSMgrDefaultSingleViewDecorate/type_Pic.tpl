


		<div class="input-group">
			<!--$if(data.data){-->
				<input type="text" class="inp_file_val form-control"  name="${data.appId}" value="${data.data}" >
			<!--$}else{-->
				<input type="text" class="inp_file_val form-control"  name="${data.appId}">
			<!--$}-->
			<span class="btn btn-sm btn-info thumbBtn input-group-addon">上传</span>
			<input style="opacity:0; cursor:pointer; filter:alpha(opacity=0);width:62px; margin-right:-42px; overflow:hidden; position:relative; left:-62px; zindex:10;" id="${data.appId}" name="upload" type="file" />
		</div>
		<div style="float:left; height:60px; width:90px; margin:0 10px 0 0; background:url(${Cfg.baseUrl}/images/nopic.gif) no-repeat; overflow:hidden;">
			<!--$if(data.data){-->
				<img alt="" name="imgFile" style="height:60px; width:90px;" src="${Cfg.baseUrl}/${data.data}" />
			<!--$}else{-->
				<img alt="" name="imgFile" style="height:60px; width:90px;" src="${Cfg.baseUrl}/images/nopic.gif" />
			<!--$}-->
		</div>

