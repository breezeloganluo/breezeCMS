<div   style="display: block;overflow-y: auto;max-height: 600px;overflow-x: hidden; padding-top: 30px;padding-bottom: 50px;">
<form class="form-horizontal" id="mask_listForm">
  ${data.html}
  
  <div class="form-actions no-margin-bottom" style="text-align:center;">
		<input type="button" class="btn btn-success btn-lg btn-rect" value="确认提交" title="确认提交" onclick="FireEvent.maskOk('${data.idx}');">
		<input type="button" class="btn btn-primary btn-lg btn-rect" value="返回列表" title="返回列表" onclick="FW.unblockUI();">
</form>
</div>