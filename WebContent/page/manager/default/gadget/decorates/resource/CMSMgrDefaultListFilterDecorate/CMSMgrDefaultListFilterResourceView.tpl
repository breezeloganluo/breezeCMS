<!--$if(data && data.filterData && data.filterData.length){-->
<div id="fitlerLocation_mainAppWithFilter">
		<!--$var filterSet = data.filterData;-->
		
			<!--$for(var i=0;i<filterSet.length;i++){-->
            <form class="form-inline ">

                    <!--$var _data=filterSet[i];-->

                            <!--$if(!filterSet[i].type || filterSet[i].type == "filter"){-->
                            	<div class="form-group">
                                  <label class=" control-label">${filterSet[i].displayName}</label>

                                  <!--$for(var j=0;j<filterSet[i].filterValue.length;j++){-->
                                      <!--$if(data.selectData&& ((data.selectData[filterSet[i].filterName]&&data.selectData[filterSet[i].filterName]==_data.filterValue[j].Value) || (data.selectData["%"+filterSet[i].filterName+"%"]&&data.selectData["%"+filterSet[i].filterName+"%"]==_data.filterValue[j].Value))){-->
                                          <a type="checkbox" class="btn btn-default btn-line btn-sm active" name="${_data.filterName}" value="${_data.filterValue[j].Value}" onClick="FireEvent.chooseFilter('${filterSet[i].filterName}','${_data.filterValue[j].Value}');">${_data.filterValue[j].Name}</a>
                                      <!--$}else{-->
                                          <a type="checkbox" class="btn btn-default btn-line btn-sm" name="${_data.filterName}" value="${_data.filterValue[j].Value}" onClick="FireEvent.chooseFilter('${filterSet[i].filterName}','${_data.filterValue[j].Value}');">${_data.filterValue[j].Name}</a>
                                      <!--$}-->
                                  <!--$}-->

                                </div>
                            <!--$}-->

                            <!--$if(filterSet[i].type == "search"){-->
                                <!--$for(var j=0;j<filterSet[i].filterValue.length;j++){-->
                                    <div class="form-group">
                                        <div class="input-group">
                                            <div class="input-group-addon">${_data.filterValue[j].Name}</div>
									        <input type="text" name="${_data.filterValue[j].Value}" class="form-control fieldSearch"  value="${p:("filterShowStr",_data.filterValue[j].fieldValue)}">
                                        </div>
                                    </div>
                                <!--$}-->
                                    <div class="form-group">
                                        <button class="btn btn-default" onclick="FireEvent.search('${filterSet[i].displayName}','${filterSet[i].filterName}');return false;">查询</button>
                                    </div>
                            <!--$}-->
                
            </form>
			<!--$}-->
		
</div>
<!--$}-->
${p:("childrenData",0)}