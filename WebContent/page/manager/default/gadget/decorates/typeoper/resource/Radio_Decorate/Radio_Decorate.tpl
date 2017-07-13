<div class="form-group">
	<label class="control-label col-lg-2">${data.metadata&&data.metadata.title}</label>
	<div class="col-lg-6" data-value="${data.appId}" data-type="${data.metadata.type}">
		<!--$var radioData = data.metadata.valueRange;-->
		<!--$for(var j=0;j<radioData.length;j++){-->
            <!--$var first = true;-->
			<!--$for(var k in radioData[j]){-->
				<!--$if((data.data && data.data == radioData[j][k]) || (!data.data && j==0 && first)){-->
							<label class="radio-inline">
								<input name="${data.appId}" checked="checked" type="radio" value="${radioData[j][k]}">${k}</input>
							</label>
					
				<!--$}else{-->
					<label class="radio-inline">
						<input name="${data.appId}" type="radio" value="${radioData[j][k]}">${k}</input>
					</label>
				<!--$}-->
                <!--$ first = false;-->
			<!--$}-->
		<!--$}-->
	</div>
</div>