<!--$if(data&&data.metadata){-->
	<!--$var metadata = data.metadata;-->
    <!--$var _data = data.data || null;-->
	<form class="form-horizontal" id="singleFormData">
		${p:("createMainForm",metadata,_data)}
        
		<!--$if(data.btnData){-->
			<!--$var btnData = data.btnData;-->
			<!--$__btnData = btnData;-->
			<div class="form-actions no-margin-bottom" style="text-align:center;">
				<!--$for(var i =0;i<btnData.length;i++){-->
					<!--$var fun ="FW.trigerEvent('" + btnData[i].onclick + "',__btnData[" + i+ "].type";-->
					<!--$if(btnData[i].dom){-->
						<!--$fun += ",this";-->
					<!--$}-->
					<!--$fun +=")";-->
					<!--$if(btnData[i].authority){-->
						<input type="button" authority="${btnData[i].authority}" style="display:none" class="btn ${btnData[i].style}" value="${btnData[i].name}" title="${btnData[i].title}" onclick="FireEvent.btnEvent(${i},this);">
					<!--$}else if(btnData[i].actionKey){-->
						<input type="button" actionKey="${btnData[i].actionKey}" style="display:none" class="btn ${btnData[i].style}" value="${btnData[i].name}" title="${btnData[i].title}" onclick="FireEvent.btnEvent(${i},this);">
					<!--$}else{-->
						<input type="button" class="btn ${btnData[i].style}" value="${btnData[i].name}" title="${btnData[i].title}" onclick="FireEvent.btnEvent(${i},this);">
					<!--$}-->
				<!--$}-->
			</div>
		<!--$}-->
	</form>
<!--$}-->