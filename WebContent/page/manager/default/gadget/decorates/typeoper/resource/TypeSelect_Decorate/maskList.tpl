<table id="typeSelectForm" class="table table-striped table-bordered table-hover dataTable no-footer" aria-describedby="dataTables-example_info">
        
			<thead>
				<tr role="row">
					<th style="width:60px;" class="center">选择</th>
                    <th>Control的type类型</th>
					<th>字段类型</th>
				</tr>
			</thead>
            
            
            
			<tbody>
                <!--$var j=-1;-->
                <!--$for (var n in data.data){-->
                <!--$j++;-->
                <tr class="gradeA odd ">
                    
					<td style="width:30px;" class="center">
                          <label>
							<input type="checkbox" idx="${j}">
							<span class="lbl"></span>
						  </label>
					</td>

                        
                    <td>
                          <div class="dropdown">
                            <input type="text" id="field_typeName_${j}" data-toggle="dropdown" name="type[${j}].name" class="form-control" value="${n}">
                            <ul class="dropdown-menu" aria-labelledby="field_typeName_${j}">
                                <li><a href="#" onclick="$('#field_typeName_${j}').val('default')">默认</a></li>
                                <li><a href="#" onclick="$('#field_typeName_${j}').val('list')">list</a></li>
                                <li><a href="#" onclick="$('#field_typeName_${j}').val('single')">single</a></li>
                                <li><a href="#" onclick="$('#field_typeName_${j}').val('single_mod')">single_mod</a></li>
                                <li><a href="#" onclick="$('#field_typeName_${j}').val('single_add')">single_add</a></li>
                            </ul>
                          </div>
                     </td>
                        
                     <td>
                         <div class="dropdown">
                            <input type="text" id="field_typeValue_${j}" data-toggle="dropdown" name="type[${j}].value" class="form-control" value="${data.data[n]}">
                            <ul class="dropdown-menu" aria-labelledby="field_typeValue_${j}">
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('Hidden')">Hidden</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('TextArea')">TextArea</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('Text')">Text</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('Select')">Select</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('SelectText')">SelectText</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('OuterLink')">OuterLink</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('Html')">Html</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('CheckBox')">CheckBox</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('Radio')">Radio</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('ReadOnly')">ReadOnly</a></li>
                                
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('DatePicker')">DatePicker</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('DateTimePicker')">DateTimePicker</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('TimePicker')">TimePicker</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('File')">File</a></li>
                                
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('Pic')">Pic</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${j}').val('Pics')">Pics</a></li>
                                
                            </ul>
                          </div>
                     </td>
				</tr>
                <!--$}-->
                
				
                
				
			</tbody>
</table>

<div style="width:220px;" class="hidden-phone visible-desktop btn-group pull-left">
			<button type="button" class="btn btn-xs btn-success btn-add-con" onclick="FireEvent.selectAdd(this);">
				<i class="icon-plus bigger-120"> 增加</i>
			</button>
			<button type="button" class="btn btn-xs btn-info btn-sel-all" onclick="FireEvent.selectAll(this);">
				<i class="icon-ok bigger-120"> 全选</i>
			</button>
			<button type="button" class="btn btn-xs btn-warning btn-sel-oppo" onclick="FireEvent.selectChange(this);">
				<i class="icon-remove bigger-120"> 反选</i>
			</button>
			<button type="button" class="btn btn-xs btn-danger btn-del" onclick="FireEvent.selectDelete(this);">
				<i class="icon-trash bigger-120"> 删除</i>
			</button>
</div>




<div class="form-actions no-margin-bottom" style="text-align:center;">
		<input type="button" class="btn btn-success btn-lg btn-rect" value="确认提交" title="确认提交" onclick="FireEvent.maskOk();">
		<input type="button" class="btn btn-primary btn-lg btn-rect" value="返回列表" title="返回编辑" onclick="FW.unblockUI();">

</div>