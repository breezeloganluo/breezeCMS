


		<div class="input-group">
			<!--$if(data.data){-->
				<input type="text" class="inp_file_val form-control" name="${data.appId}" value="${data.data}" >
			<!--$}else{-->
				<input type="text" class="inp_file_val form-control" name="${data.appId}">
			<!--$}-->
			<span class="btn btn-sm btn-info thumbBtn input-group-addon">上传</span>
			<input style="opacity:0; cursor:pointer; filter:alpha(opacity=0);width:54px;height:40px;left:-54px; margin-top:-18px; overflow:hidden; position:relative;  zindex:10;" id="${data.appId}" name="upload" type="file" />
		</div>

