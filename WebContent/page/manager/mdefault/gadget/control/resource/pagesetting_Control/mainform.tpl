<div class="page-header">
	<h1>
		页面设置
	</h1>
	<form class="form-horizontal" id="pagesetting">
    <!--$for(var n in data){-->
    <h2>${n}</h2>
        <!--$for (var nn in data[n]){-->
            <!--$if (data[n][nn].type == null || /text/i.test(data[n][nn].type)){-->
                <div class="form-group">
                    <label class="col-sm-2 control-label">${data[n][nn].title}</label>
                    <div class="col-sm-6">
                      	<input name="${nn}" type="text" class="form-control" placeholder="${data[n][nn].desc}">
                    </div>
                    <span id="helpBlock" class="col-sm-4 help-block">${data[n][nn].desc}</span>
                </div>
            <!--$}else if(/select/i.test(data[n][nn].type)){-->
                <div class="form-group">
                    <label class="col-sm-2 control-label">${data[n][nn].title}</label>
                    <div class="col-sm-6">
                      	<select class="form-control" name="${nn}">
                            <!--$for(var i=0;i<data[n][nn].valueRange.length;i++){-->
                            <!--$for(var nnn in data[n][nn].valueRange[i]){-->
                                <option value="${data[n][nn].valueRange[i][nnn]}">${nnn}</option>
                            <!--$}-->
                            <!--$}-->
                        </select>
                    </div>
                    <span id="helpBlock" class="col-sm-4 help-block">${data[n][nn].desc}</span>
                </div>
            <!--$}else if(/Pic/i.test(data[n][nn].type)){-->
                <div class="form-group">
                    <label class="col-sm-2 control-label">${data[n][nn].title}</label>
                    <div class="col-sm-4">
                        <input type="hidden" name="${nn}" >
                        <input class="form-control" type="file" id="img_${n}_${nn}" name="upload"
                        onchange="this.id = this.id.replace(/]/ig,'_');this.id = this.id.replace(/[[.]/ig,'_');var tmpid=this.id;var tmpi='#'+tmpid;$.ajaxFileUpload({url:Cfg.ajaxFileUpLoadUrl,secureuri:false,fileElementId:tmpid,dataType: 'json',success: function (data, status){$(tmpi).prevAll('input').val(data.succUrl);$(tmpi).parent().parent().find('img').attr('src',Cfg.baseUrl+'/'+data.succUrl);}})"
                        >                        
                    </div>
                   <span id="helpBlock" class="col-sm-2 help-block"><img width="100%" ></span>
                   <span id="helpBlock" class="col-sm-4 help-block">${data[n][nn].desc}</span>
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