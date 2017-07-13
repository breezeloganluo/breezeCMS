/**
* @namespace
* @name CMSMgrHeaderDecorate 
* @description   
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("../CMSMgrDecorate");
    FW.register({
        "name": "CMSMgrHeaderDecorate",
        "extends": ["CMSMgrDecorate"],
        /**
        *@function
        *@memberOf CMSMgrHeaderDecorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            //toDO
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrHeaderDecorate
            *@name private$processingData
            *@description processingData
            *@param data 输入数据
            */
            "processingData": function(data) {
                //头部描述区显示数据
                var _titileData = data.orgData.data.cmsmetadata.displayName;
                var _listBtnData = [{
					authority: "addContent",
					name: "添加内容",
					onclick: "openAdd",
					param: "single",
				}]
				
                if (window.customized && window.customized[data.alias] && window.customized[data.alias].listButton) {
                    _listBtnData = FW.use().evalJSON(window.customized[data.alias].listButton);
					if (!_listBtnData[0] || /Null/i.test(_listBtnData[0].name)){
						_listBtnData = [];
					}
                }
				
                var result = {
                    titleData: _titileData,
                    btnData: _listBtnData
                };
                for (var i = result.btnData.length; i--;) {
                    if (result.btnData[i].type == "menu") {
                        delete result.btnData[i].type;
                    }
                }
                return result;
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf CMSMgrHeaderDecorate
            *@name FireEvent$clickEvn
            *@description 触发点击事件，首先检查本函数是否有对应的方法，如果没有转向control去调用。
            *@param btnIdx 按钮的索引
            */
            "clickEvn": function(btnIdx) {
				//获取按钮对象
				var oneBtn = this.MY.data.btnData[btnIdx];
				var eventType = oneBtn.onclick;
				var param = oneBtn.type;
                //if (公有方法存在){先调用自己的公有方法
                if (this[eventType]) {
                    if (param && param != "undefined") {
                        this[eventType](param);
                    } else {
                        this[eventType]();
                    }
                    return;
                }
                //}
                //if (私有方法存在){
                if (this["private"][eventType]) {
                    if (param && param != "undefined") {
                        this.API.private(eventType, param);
                    } else {
                        this.API.private(eventType);
                    }
                    return;
                }
                //}
                //if (公有方法中存在){
                if (this.control[eventType]) {
                    if (param && param != "undefined") {
                        this.control[eventType](param);
                    } else {
                        this.control[eventType]();
                    }
                    return;
                }
                //}
            }
        }
    },
    module);
    return FW;
});