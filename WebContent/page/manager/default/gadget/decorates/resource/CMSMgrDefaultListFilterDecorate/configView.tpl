<div  id="modListMask"  class="modal fade in" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="false" style="display: block;padding-top:53px">
	<div class="modal-dialog" style="min-width:1000px">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true" onClick="FireEvent.closeAddNew();">×</button>
				<h4 class="modal-title" id="H2">详情页按钮编辑</h4>
                <h6>
                当类型是“单值过滤”时，这个配置用于进行某个字段的多值过滤，比如制作订单列表页面，要按照订单的不同状态进行数据过滤，就用到这里的配置。
                这个配置中“显示名称”就是过滤字段的显示内容，比如订单状态；筛选字段名，就是要进行查询筛选的字段值，例如status字段；最后一个参数，就是通过Name-Value
                来筛选不同的按钮名称和值。Name用于显示，Value用于页面点击后的查询关键字
                </h6>
                
                <h6>
                当类型是：“多字段查询”时，这个配置用于呈现出页面按照某几个字段进行查询。这个种情况下，“显示名称”代表点击查询按钮后，要调用的control的函数名，默认的查询方法名是searchMultField；
                “筛选字段名”就是调用这个函数后，传递给这个函数的参数常量；最后一个字段，仍然用Name-Value表示，要查询的输入框显示出来的名称，以及代表查询的字段名，
                其中，Name表示显示出来的名称，Value表示要查询的字段名
                
                </h6>
			</div>
			<div class="modal-body">
				<table class="table table-striped table-bordered table-hover dataTable no-footer" aria-describedby="dataTables-example_info">
					<thead>
						<tr role="row">
							<th style='width:60px;' class='center'>选择</th>
                            <th>筛选类型</th>
							<th>显示名称</th>
							<th>筛选字段名</th>
							<th>值组的[{Name:'',Value:''}]对</th>
						</tr>
					</thead>
					<tbody>
						<tr>
                            
							<td style='width:30px;' class='center'>
								<label>
									<input type='checkbox' name="rowCheckbox"/>
									<span class='lbl'></span>
								</label>
							</td>
                            
                            <td attr-d="type">
								<select class="form-control">
                                  <option value="filter">单值过滤</option>
                                  <option value="search">多字段查询</option>
                                </select>
							</td>
							<td attr-d="displayName">
								<input class="form-control"></input>
							</td>
							<td attr-d="filterName">
								<input class="form-control"></input>
							</td>
							<td attr-d="filterValue">
								<textarea class="form-control"></textarea>
							</td>
						</tr>
						<tr class="list-tr-hidden" style="display:none">
							<td style='width:30px;' class='center'>
								<label>
									<input type='checkbox' name="rowCheckbox"/>
									<span class='lbl'></span>
								</label>
							</td>
                            
                            <td attr-d="type">
								<select class="form-control">
                                  <option>单值过滤</option>
                                  <option>多字段查询</option>
                                </select>
							</td>
							<td attr-d="displayName">
								<input class="form-control"></input>
							</td>
							<td attr-d="filterName">
								<input class="form-control"></input>
							</td>
							<td attr-d="filterValue">
								<textarea class="form-control"></textarea>
							</td>
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
			</div>
			<div class="modal-footer">
				<input type="button" class="btn btn-success btn-lg btn-rect" value="确认提交" title="确认提交" onClick="FireEvent.saveAddNew();">
				<input type="button" class="btn btn-primary btn-lg btn-rect" value="取消编辑" title="取消编辑"  onClick="FireEvent.closeAddNew();">
            			</div>
        		</div>
    	</div>
</div>