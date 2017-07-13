<!--$var _data = data.data || null;-->
<!--$var metadata = data.metadata;-->
		<!--$for(var i in metadata){-->
			<!--$var oneMetadata = metadata[i];-->
			<!--$var type = oneMetadata.type;-->
			<!--$var data_value = "" + i;-->
		    <!--$var display="";-->
            <!--$if(oneMetadata.type == "Hidden")display="style='display:none'";-->
            <div class="form-group" ${display}>
                <label class="control-label col-lg-2">${oneMetadata.title}</label>
                <div class="col-lg-10" id="field_${data.idPrefix}${data_value}" data-value="${data_value}" data-type="${oneMetadata.type}">
                    ${p:("createTypeDecorateEditData",data_value,type,oneMetadata,_data&&_data[i])}
                </div>
            </div>
		<!--$}-->