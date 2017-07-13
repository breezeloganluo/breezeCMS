<!--$var hasMoreButton=false;-->

	
		<table class="table table-striped table-bordered table-hover dataTable no-footer" aria-describedby="dataTables-example_info">
        
			<thead>
				<tr role="row">
					<!--$var lastTitle="";-->
                    
					<th style='width:60px;' class='center'>选择</th>
					<!--$for(var i in data.metadata){-->
						<!--$var thTitle = data.metadata[i].title;-->
						<!--$var _id="data."+i;-->
						<!--$if(thTitle==lastTitle){continue;}-->
						<!--$lastTitle=thTitle;-->
                        
						<!--$if(data.metadata[i].type=="Hidden"){-->
							<th style="display:none">${thTitle}</th>
                            
						<!--$}else if(data.metadata[i].islist=="0"){-->
                            <!--$var hasMoreButton=true;-->
							<th style="display:none">${thTitle}</th>
                            
						<!--$}else{-->
							<th>${thTitle}</th>
						<!--$}-->
					<!--$}-->
                    <!--$if (hasMoreButton == true){-->
                        <th>更多</th>
                    <!--$}-->
				</tr>
			</thead>
            
            
            
			<tbody>
			<!--$if(data.data){-->
				<!--$for(var i=0;i<data.data.length;i++){-->
                
					<!--$if(i%2==0){-->
						<tr class="gradeA odd listdata_${data.appId}_${i}">
					<!--$}else{-->
						<tr class="gradeA even  listdata_${data.appId}_${i}">
					<!--$}-->
                    
					<td style='width:30px;' class='center'>
						<label>
							<input data-checkbox="${data.appId}[${i}]" type='checkbox' idx='${i}'/>
							<span class='lbl'></span>
						</label>
					</td>
                    
                    
					<!--$for(var j in data.metadata){-->
						<!--$var data_list_value = data.appId + "["+i+"]." + j; -->
						<!--$var data_list_type = data.metadata[j].type;-->
						<!--$var oneMetadata = data.metadata[j];-->
						<!--$var oneData = data.data[i][j];-->
						<!--$if(typeof oneData == "object"){oneData = FW.use().toJSONString(oneData);}-->
                        
                        
                        <!--$if (oneMetadata.islist == "0"){-->
                        	<td data-list-value="${data_list_value}" data-list-type="${data_list_type}" data-list-key="${j}" style="display:none">
                               <input class="form-control" name="${data.appId}[${i}].${j}" value="${p:("parserValueData",oneData)}">
                            </td>
                        <!--$}else{-->
                            <td data-list-value="${data_list_value}" data-list-type="${data_list_type}" data-list-key="${j}">
                               ${p:("createTypeDecorateEditData",data_list_value, oneMetadata.type, oneMetadata, oneData||'')}
                            </td>
                        <!--$}-->
					<!--$}-->
                    
                    <!--$if (hasMoreButton == true){-->
                        <td>
                        <button class="btn btn-primary" type="button" onclick="FireEvent.openModMask('${i}');">更多</button>
                        </td>
                    <!--$}-->
					</tr>
				<!--$}-->
			<!--$}else{-->
				<tr class="list-none">
					<td colspan="100" style="padding:40px; font-size:16px; color:orange; text-align:center;">暂无数据
						<input type="hidden" name="data.dataMemo"/>
					</td>
				</tr>
			<!--$}-->
				<tr class="list-tr-hidden " style="display:none">
                    <td style='width:30px;' class='center'>
						<label>
							<input data-checkbox="${data.appId}[${i}]" type='checkbox' idx='_999_'/>
							<span class='lbl'></span>
						</label>
					</td>
					${p:("parseColonLine",data.appId,data.metadata)}
                    <!--$if (hasMoreButton == true){-->
                        <td>
                        <button class="btn btn-primary" type="button" onclick="FireEvent.openModMask('_999_');">更多</button>
                        </td>
                    <!--$}-->
				</tr>
			</tbody>
		</table>
		<div style="width:220px;" class="hidden-phone visible-desktop btn-group pull-left">
			<button type="button" class="btn btn-xs btn-success btn-add-con" onClick="FireEvent.selectAdd(this);">
				<i class="icon-plus bigger-120"> 增加</i>
			</button>
			<button type="button" class="btn btn-xs btn-info btn-sel-all" onClick="FireEvent.selectAll(this);">
				<i class="icon-ok bigger-120"> 全选</i>
			</button>
			<button type="button" class="btn btn-xs btn-warning btn-sel-oppo" onClick="FireEvent.selectChange(this);">
				<i class="icon-remove bigger-120"> 反选</i>
			</button>
			<button type="button" class="btn btn-xs btn-danger btn-del" onClick="FireEvent.selectDelete(this);">
				<i class="icon-trash bigger-120"> 删除</i>
			</button>
		</div>

