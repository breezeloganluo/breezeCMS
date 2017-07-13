
<div  id="modListMask"  class="modal fade in" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="false" style="display: block;padding-top:53px">
	<div class="modal-dialog" style="width:80%">
		<div class="modal-content" style="padding-top: 10px;">
			${p:("components","CMSMgrDefaultListFilterDecorate")}
            <div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal" onClick="FW.trigerEvent('closeMask');">关闭</button>
                <button type="button" class="btn btn-primary" onClick="FW.trigerEvent('maskChooseData');">保存</button>
            </div>
        </div>
    </div>
</div>
