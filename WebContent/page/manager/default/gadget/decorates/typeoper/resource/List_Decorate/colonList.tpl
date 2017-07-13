<!--$for(var j in data.metadata){-->
						<!--$var data_list_value = data.appId + "[_999_]." + j; -->
						<!--$var data_list_type = data.metadata[j].type;-->
						<!--$var oneMetadata = data.metadata[j];-->
                        
                        <!--$if (oneMetadata.islist == "0"){-->
                        	<td data-list-value="${data_list_value}" data-list-type="${data_list_type}" data-list-key="${j}" style="display:none">
                               <input class="form-control" name="${data.appId}[_999_].${j}" value="">
                            </td>
                        <!--$}else{-->
                            <td data-list-value="${data_list_value}" data-list-type="${data_list_type}" data-list-key="${j}">
                               ${p:("createTypeDecorateEditData",data_list_value, oneMetadata.type, oneMetadata, '')}
                            </td>
                        <!--$}-->
<!--$}-->