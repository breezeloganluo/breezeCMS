


		<select class="form-control" data-value="${data.appId}" name="${data.appId}" data-type="${data.metadata.type}">
			<!--$var selectData = data.metadata.valueRange;-->
			<!--$for(var j=0;j<selectData.length;j++){-->
				<!--$for(var k in selectData[j]){-->
					<!--$if(data.data && data.data == selectData[j][k]){-->
						<option value="${selectData[j][k]}" selected="selected">${k}</option>
					<!--$}else{-->
						<option value="${selectData[j][k]}" >${k}</option>
					<!--$}-->
				<!--$}-->
			<!--$}-->
		</select>
