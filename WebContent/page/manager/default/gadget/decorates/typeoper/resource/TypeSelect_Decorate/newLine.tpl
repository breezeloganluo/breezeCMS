<tr class="gradeA odd ">
                    
					<td style="width:30px;" class="center">
                          <label>
							<input type="checkbox" idx="${data}">
							<span class="lbl"></span>
						  </label>
					</td>

                        
                    <td>
                          <div class="dropdown">
                            <input type="text" id="field_typeName_${data}" data-toggle="dropdown" name="type[${data}].name" class="form-control" value="">
                            <ul class="dropdown-menu" aria-labelledby="field_typeName_${data}">
                                <li><a href="#" onclick="$('#field_typeName_${data}').val('default')">默认</a></li>
                                <li><a href="#" onclick="$('#field_typeName_${data}').val('single')">single</a></li>
                                <li><a href="#" onclick="$('#field_typeName_${data}').val('list')">list</a></li>
                            </ul>
                          </div>
                     </td>
                        
                     <td>
                         <div class="dropdown">
                            <input type="text" id="field_typeValue_${data}" data-toggle="dropdown" name="type[${data}].value" class="form-control" value="">
                            <ul class="dropdown-menu" aria-labelledby="field_typeValue_${data}">
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('Hidden')">Hidden</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('Text')">Text</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('SelectText')">SelectText</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('TextArea')">TextArea</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('Html')">Html</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('CheckBox')">CheckBox</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('Radio')">Radio</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('ReadOnly')">ReadOnly</a></li>
                                
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('DatePicker')">DatePicker</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('DateTimePicker')">DateTimePicker</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('TimePicker')">TimePicker</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('File')">File</a></li>
                                
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('Pic')">Pic</a></li>
                                <li><a href="#" onclick="$('#field_typeValue_${data}').val('Pics')">Pics</a></li>
                                
                            </ul>
                          </div>
                     </td>
				</tr>