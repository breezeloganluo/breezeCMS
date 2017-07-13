<div class="form-group">
	<label class="control-label col-lg-2">${data.metadata.title}</label>
	<div class="col-lg-6" data-value="${data.appId}" data-type="${data.metadata.type}">
		<div class="input-group bootstrap-timepicker">
			<input type="text" class="form-control datepickerset" value="${data.data||''}" data-date-format="yyyy-mm-dd">
			<span class="input-group-addon add-on"><i class="glyphicon glyphicon glyphicon-time"></i></span>
		</div>
	</div>
</div>