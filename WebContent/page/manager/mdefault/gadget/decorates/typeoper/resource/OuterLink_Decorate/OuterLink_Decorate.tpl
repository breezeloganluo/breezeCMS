<div class="form-group">
	<!--$var alias = data.metadata.ourterLink.split(".")[0];-->
	<label class="control-label col-lg-2">${data.metadata.title}</label>
	<div class="col-lg-6 input-group" data-value="${data.appId}" data-type="${data.metadata.type}" outer-data="${data.metadata.ourterLink}" style="padding-left: 15px;padding-right: 15px;">
		<input type="text" readonly class="form-control" value="${data.data||''}"  onClick="FW.trigerEvent('openMask','${alias}','mask');">
		<span class="input-group-addon outerLinkEdit" style="cursor:pointer" onClick="FW.trigerEvent('openMask','${alias}','mask');">选择</span>
	</div>
</div>