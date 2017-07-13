<div class="page-header">
	<h1>
		页面设置
	</h1>
	<form class="form-horizontal" id="pagesetting">
    <!--$for(var n in data.datadesc){-->
    <h2>${n}</h2>
        <!--$for (var nn in data.datadesc[n]){-->
            <!--$if (data.datadesc[n][nn].type == null || /text/i.test(data.datadesc[n][nn].type)){-->
                <div class="form-group">
                    <label class="col-sm-2 control-label">${data.datadesc[n][nn].title}</label>
                    <div class="col-sm-6">
                      	<input name="${nn}" type="text" class="form-control" placeholder="${data.datadesc[n][nn].desc}" value="${p:('parserNull',data.data[nn])}">
                    </div>
                    <span id="helpBlock" class="col-sm-4 help-block">${data.datadesc[n][nn].desc}</span>
                </div>
            <!--$}else if(/select/i.test(data.datadesc[n][nn].type)){-->
                <div class="form-group">
                    <label class="col-sm-2 control-label">${data.datadesc[n][nn].title}</label>
                    <div class="col-sm-6">
                      	<select class="form-control" name="${nn}">
                            <!--$for(var i=0;i<data.datadesc[n][nn].valueRange.length;i++){-->
                            <!--$for(var nnn in data.datadesc[n][nn].valueRange[i]){-->
                                <!--$if (data.datadesc[n][nn].valueRange[i][nnn] != data.data[nn]){-->
                                	<option value="${data.datadesc[n][nn].valueRange[i][nnn]}">${nnn}</option>
                                <!--$}else{-->
                                    <option value="${data.datadesc[n][nn].valueRange[i][nnn]}" selected="true">${nnn}</option>
                                <!--$}-->
                            <!--$}-->
                            <!--$}-->
                        </select>
                    </div>
                    <span id="helpBlock" class="col-sm-4 help-block">${data.datadesc[n][nn].desc}</span>
                </div>
            <!--$}else if(/Pic/i.test(data.datadesc[n][nn].type)){-->
                <div class="form-group">
                    <label class="col-sm-2 control-label">${data.datadesc[n][nn].title}</label>
                    <div class="col-sm-4">
                        <input type="hidden" name="${nn}" value="${p:('parserNull',data.data[nn])}">
                        <input class="form-control" type="file" id="img_${n}_${nn}" name="upload"
                        onchange="this.id = this.id.replace(/]/ig,'_');this.id = this.id.replace(/[[.]/ig,'_');var tmpid=this.id;var tmpi='#'+tmpid;$.ajaxFileUpload({url:Cfg.ajaxFileUpLoadUrl,secureuri:false,fileElementId:tmpid,dataType: 'json',success: function (data, status){$(tmpi).prevAll('input').val(data.succUrl);$(tmpi).parent().parent().find('img').attr('src',Cfg.baseUrl+'/'+data.succUrl);}})"
                        >                        
                    </div>
                   <span id="helpBlock" class="col-sm-2 help-block"><img width="100%" src="${Cfg.baseUrl}/${p:('parserNull',data.data[nn])}"></span>
                   <span id="helpBlock" class="col-sm-4 help-block">${data.datadesc[n][nn].desc}</span>
                </div>
            <!--$}-->
          
        <!--$}-->
    <!--$}-->
                <div class="form-group">
                    <div class="col-sm-offset-2 col-sm-10">
                    	<button type="button" class="btn btn-default" onclick="FireEvent.setValue();">确定</button>
                    </div>
                </div>
    </form>
	
</div>