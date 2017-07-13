<!--$formatDate = data.data ? FW.use("DateTime").formatTimeStamp(data.data, "yyyy-MM-dd hh:mm:ss") : "";-->



		<div class="input-group bootstrap-timepicker">
			<input type="text" class="form-control datetimepickerset" value="${formatDate}" data-date-format="yyyy-mm-dd hh:ii:ss">
            <input type="hidden" class="realValue" name="${data.appId}" value="${data.data ||''}" >
			<span class="input-group-addon add-on"><i class="glyphicon glyphicon glyphicon-time"></i></span>
		</div>

