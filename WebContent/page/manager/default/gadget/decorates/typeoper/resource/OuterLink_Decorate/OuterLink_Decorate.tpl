<div class="input-group" outer-data="testfield.cid" style="padding-left: 15px;padding-right: 15px;">
		<input name="${data.appId}" type="text" readonly class="form-control" value="${data.data||''}"  onClick="FW.trigerEvent('openMask','${alias}','mask');">
		<span class="input-group-addon outerLinkEdit" style="cursor:pointer" onClick="FW.trigerEvent('openMask','${alias}','mask');">选1择</span>
</div>
-----
<div class="form-group has-success has-feedback">
  <label class="control-label sr-only" for="inputGroupSuccess4">Input group with success</label>
  <div class="input-group">
    <span class="input-group-addon">@</span>
    <input type="text" class="form-control" id="inputGroupSuccess4" aria-describedby="inputGroupSuccess4Status">
  </div>
  <span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>
  <span id="inputGroupSuccess4Status" class="sr-only">(success)</span>
</div>