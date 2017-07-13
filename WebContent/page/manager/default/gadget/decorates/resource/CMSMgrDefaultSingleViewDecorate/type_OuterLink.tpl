
	<!--$var alias = data.metadata.ourterLink.split(".")[0];-->

	<div class="input-group"  style="padding-left: 15px;padding-right: 15px;">
		<input type="text" readonly outer-data="${data.metadata.ourterLink}" name="${data.appId}" class="form-control" value="${data.data||''}"  onClick="FW.trigerEvent('openMask','${alias}','mask');">
		<span class="input-group-addon outerLinkEdit" style="cursor:pointer" onClick="FW.trigerEvent('openMask','${alias}','mask');">选择</span>
	</div>