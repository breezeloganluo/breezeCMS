<div class="page-header">
	<h1>
		${data.titleData}
		<small>
		    <!--$if(data.btnData&&data.btnData.length){-->
			<!--$var _data = data.btnData;-->


	                <div class="pull-right ">
					<!--$__data = _data;-->
					<!--$for(var i=0;i<_data.length;i++){-->
						<!--$var oneMenuCtx = _data[i];-->
				
							<!--$if(oneMenuCtx.authority){-->
								<a  class="btn btn-default btn-sm"  style="display:none" authority="${oneMenuCtx.authority}" href="javascript:void(0);" onclick="FireEvent.clickEvn(${i})">${oneMenuCtx.name}</a>
							<!--$}else if(oneMenuCtx.actionKey){-->
								<a class="btn btn-default btn-sm"  style="display:none" actionKey="${oneMenuCtx.actionKey}" href="javascript:void(0);" onclick="FireEvent.clickEvn(${i})">${oneMenuCtx.name}</a>
							<!--$}else{-->
								<a class="btn btn-default btn-sm" href="javascript:void(0);" onclick="FireEvent.clickEvn(${i})">${oneMenuCtx.name}</a>
							<!--$}-->
				
					<!--$}-->
                    <div>
			<!--$}-->
		</small>
	</h1>
	
	
</div>