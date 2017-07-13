<div class="weui_actionsheet" id="weui_actionsheet">
    <div class="weui_actionsheet_menu">
        <!--$for (var i=0;i<data.data.length;i++){-->
            <div class="weui_actionsheet_cell" onclick="FireEvent.clkckmenu('${data.idx}','${i}')">${data.data[i].name}</div>
        <!--$}-->
        
    </div>
    <div class="weui_actionsheet_action">
        <div class="weui_actionsheet_cell" id="actionsheet_cancel">取消</div>
    </div>
</div>