<div  id="modListMask"  class="modal fade in" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="false" style="display: block;padding-top:53px">
	<div class="modal-dialog" style="min-width:1000px">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true" onClick="FireEvent.closeAddNew();">×</button>
				<h4 class="modal-title" id="H2">列表页功能按钮定制</h4>
                <h6>注意，一旦填写该值，原先默认的添加按钮也将被取代。原来的设置如下：
                     {
                      authority（CMS权限名）: "addContent"
                      name: "添加内容"
                      onclick: "openAdd"
                      param: "single"
                     }
                </h6>
				<h6>
				  注意，如果Name填写为null那么该页面将没有任何头部的按钮
				</h6>
			</div>
			<div class="modal-body">
				<table class="table table-striped table-bordered table-hover dataTable no-footer" aria-describedby="dataTables-example_info">
					<thead>
						<tr role="row">
							<th style='width:60px;' class='center'>选择</th>
							<th>显示名称</th>
							<th>单击事件</th>
							<th>单击参数</th>
							<th>CMS权限名</th>
							<th>权限标识名</th>
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
							<td attr-d="name">
								<input class="form-control"></input>
							</td>
							<td attr-d="onclick">
								<input class="form-control"></input>
							</td>
							<td attr-d="type">
								<input class="form-control"></input>
							</td>
							<td attr-d="authority">
								<input class="form-control"></input>
							</td>
							<td attr-d="actionKey">
								<input class="form-control"></input>
							</td>
						</tr>
						<tr class="list-tr-hidden" style="display:none">
							<td style='width:30px;' class='center'>
								<label>
									<input type='checkbox' name="rowCheckbox"/>
									<span class='lbl'></span>
								</label>
							</td>
							<td attr-d="name">
								<input class="form-control"></input>
							</td>
							<td attr-d="onclick">
								<input class="form-control"></input>
							</td>
							<td attr-d="type">
								<input class="form-control"></input>
							</td>
							<td attr-d="authority">
								<input class="form-control"></input>
							</td>
							<td attr-d="actionKey">
								<input class="form-control"></input>
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