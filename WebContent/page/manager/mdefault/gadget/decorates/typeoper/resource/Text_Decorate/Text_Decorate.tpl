<div class="form-group">
	<label class="control-label col-lg-2">${data.metadata&&data.metadata.title}</label>
	<div class="col-lg-6" data-value="${data.appId}" data-type="${data.metadata.type}" outer-data="${data.metadata.ourterLink}">
		<input type="text" class="form-control" value="${data.data||''}">
	</div>
</div>