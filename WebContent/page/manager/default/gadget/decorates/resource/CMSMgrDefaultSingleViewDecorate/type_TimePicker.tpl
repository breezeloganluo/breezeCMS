<!--$formatDate = data.data ? FW.use("DateTime").formatTimeStamp(data.data, "hh:mm:ss") : "";-->



		<div class="input-group bootstrap-timepicker">
			<input class="timepickerset form-control" type="text" value="${formatDate}" data-date-format="hh:ii:ss">
            <input type="hidden" class="realValue" name="${data.appId}" value="${data.data ||''}" >
			<span class="input-group-addon add-on"><i class="glyphicon glyphicon glyphicon-time"></i></span>
		</div>

