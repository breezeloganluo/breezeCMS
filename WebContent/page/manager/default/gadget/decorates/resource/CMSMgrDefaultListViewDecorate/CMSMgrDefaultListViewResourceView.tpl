<div>
		<!--$var lastType = "";-->
		<!--$var isFirst = true;-->
		<!--$var _data = data;-->
		<table id="view_formObj" class="table table-responsive table-striped table-bordered table-hover dataTable no-footer" >
			<thead>
				<tr>
                    <!--是否需要复选框-->
                            <!--$if (data.isListMultiSelect){-->
                               <td width="15px"><input type="checkbox" id="selectCtr" onclick="FireEvent.listSelectAll(this);"></td>
                            <!--$}-->
					<!--$for(var i in _data.metadata){-->
						<!--$var oneMetadata = _data.metadata[i];-->
						<!--$if(oneMetadata.islist!="1"){continue;}else{-->
							${p:("getTableHeadDisplayData",oneMetadata.type,oneMetadata.title,i)}
						<!--$}-->
					<!--$}-->
					<!--$if(_data.listOperBtns){-->
						<th>操作</th>
					<!--$}-->
				</tr>
			</thead>
			<tbody>
				<!--$if(_data.data){-->
					<!--$for(var i=0;i<_data.data.length;i++){-->
						<tr>
                            <!--是否需要复选框-->
                            <!--$if (data.isListMultiSelect){-->
                               <td><input type="checkbox" name="listMultiSelect${i}"></td>
                            <!--$}-->
						    <!--正常数据-->
							<!--$var oneData = _data.data[i];-->
							<!--$for(var j in _data.metadata){-->
								<!--$var data_value = j + "" +i;-->
								<!--$var oneMetadata = _data.metadata[j];-->
									<!--$if(oneMetadata.islist!="1"){continue;}else{-->
									${p:("createTypeDecorateListData",data_value,oneMetadata.type,oneMetadata,oneData&&oneData[j])}
                                    <!--$}-->
							<!--$}-->
							<!--控制按钮-->
							<!--$if(_data.listOperBtns){-->
								<!--$listOperBtns = _data.listOperBtns;-->
								<td class="td_editbtn td_Button" colspan="${_data.listOperBtns.length}">
									<!--$for(var j=0;j<_data.listOperBtns.length;j++){-->
										<!--$var oneBtn = _data.listOperBtns[j];-->
										<!--$var btnClass = oneBtn.style;-->
										<!--$var btnSize = "btn-xs";-->
										<!--$var _id = "data"+i;-->
										<!--$if(oneBtn.oper.fun=="deleteContent"){-->
											<!--$if(oneBtn.authority){-->
												<a title="${oneBtn.title}" style="display:none" authority="${oneBtn.authority}" class="btn ${btnSize} ${p:("sStyle",oneBtn.style)}"  href="javascript:void(0);" data-toggle="modal" data-target="#${_id}">
													<i class="${p:("sIcon",oneBtn.icon)}"></i>${oneBtn.title}
												</a>
											<!--$}else{-->
												<a title="${oneBtn.title}" class="btn ${btnSize} ${p:("sStyle",oneBtn.style)}"  href="javascript:void(0);" data-toggle="modal" data-target="#${_id}">
													<i class="${p:("sIcon",oneBtn.icon)}"></i>${oneBtn.title}
												</a>
											<!--$}-->
											<div class="col-lg-12">
												<div class="modal fade" id="${_id}" tabindex="-1" role="dialog"  aria-labelledby="myModalLabel" aria-hidden="true">
													<div class="modal-dialog">
														<div class="modal-content">
															<div class="modal-header">
																<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
																<h4 class="modal-title" id="H1">删除操作</h4>
															</div>
															<div class="modal-body">
																删除后不可恢复，您确定要删除吗？
															</div>
															<div class="modal-footer">
														    		<button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
														    		<button type="button" class="btn btn-primary" onclick="FireEvent.btnEvent(${i},${j},this)">确认删除</button>
															</div>
													    	</div>
													</div>
												</div>
											</div>
										<!--$}else{-->
											<!--$if(oneBtn.authority){-->
												<a title="${oneBtn.title}" style="display:none" authority="${oneBtn.authority}" class="btn ${btnSize} ${p:("sStyle",oneBtn.style)}"  onclick="FireEvent.btnEvent(${i},${j},this)" href="javascript:void(0);">
													<i class="${p:("sIcon",oneBtn.icon)}"></i>${oneBtn.title}
												</a>
											<!--$}else if(oneBtn.actionKey){-->
												<a title="${oneBtn.title}" style="display:none" actionKey="${oneBtn.actionKey}" class="btn ${btnSize} ${p:("sStyle",oneBtn.style)}"  onclick="FireEvent.btnEvent(${i},${j},this)" href="javascript:void(0);">
													<i class="${p:("sIcon",oneBtn.icon)}"></i>${oneBtn.title}
												</a>
											<!--$}else{-->
												<a title="${oneBtn.title}" class="btn ${btnSize} ${p:("sStyle",oneBtn.style)}"  onclick="FireEvent.btnEvent(${i},${j},this)" href="javascript:void(0);">
													<i class="${p:("sIcon",oneBtn.icon)}"></i>${oneBtn.title}
												</a>
											<!--$}-->
										<!--$}-->
									<!--$}-->
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
			</tbody>
		</table>
		<div class="row">
			<div class="col-sm-9">
				${p:("childrenData",0)}
			</div>
		</div>
</div>
