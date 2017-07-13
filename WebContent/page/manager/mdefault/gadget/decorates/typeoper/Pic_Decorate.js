/**
* @namespace
* @name Pic_Decorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/TypeDecorate");
    FW.register({
        "name": "Pic_Decorate",
        "extends": ["TypeDecorate"],
        /**
        *@function
        *@memberOf Pic_Decorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {},
        "public": {
            /**
            *@function
            *@memberOf Pic_Decorate
            *@name public$getTypeDecorateEditData
            *@description
            *@param metadata 描述数据
            *@param data 显示数据
            */
            "getTypeDecorateEditData": function(metadata, data) {
                if (!metadata) {
                    alert("Pic_Decorate描述数据不可以为空！");
                    return;
                }
                var _type = this.gadgetName.replace("_Decorate", "");
                var _data = {
                    metadata: metadata,
                    data: data,
                    appId: this.id
                };
                return this.API.show("Pic_Decorate", _data, "_");
            },
            /**
            *@function
            *@memberOf Pic_Decorate
            *@name public$getTypeDecorateData
            *@description
            */
            "getTypeDecorateData": function() {
                var query = "div[data-value='" + this.id + "']>div>input[name='fId_hidden']";
                return $(query).val();
            },
            /**
            *@function
            *@memberOf Pic_Decorate
            *@name public$getTypeDecorateDisplayData
            *@description
            */
            "getTypeDecorateDisplayData": function(data, metadata) {
                if (!metadata) {
                    alert("Pic_Decorate描述数据不可以为空！");
                    return;
                }
                if (typeof data != "undefined" && data != "undefined" && data != "") {
                    return "<img style='max-height:90px;max-width:90px;' src='" + Cfg.baseUrl + "/" + data + "'></src>";
                } else {
                    return "";
                }
            },
            /**
            *@function
            *@memberOf Pic_Decorate
            *@name public$getTableHeadDisplayData
            *@description
            */
            "getTableHeadDisplayData": function(title, fieldName, id, status) {
                //初始变量
                var result = null;
                //根据状态显示不同的箭头
                var statusStr = "";
                if (status == 1) {
                    statusStr = "<a href='#' onclick=\"var app = FW.getAPP('" + id + "');app.changeListOrderBy('" + fieldName + "');return false;\"><apan class='pull-right glyphicon glyphicon-arrow-up'></span></a>"
                } else if (status == 2) {
                    statusStr = "<a href='#' onclick=\"var app = FW.getAPP('" + id + "');app.changeListOrderBy('" + fieldName + "');return false;\"><apan class='pull-right glyphicon glyphicon-arrow-down'></span></a>"
                }
                //合并结果并返回
                result = "<th> <a href='#' onclick=\"var app = FW.getAPP('" + id + "');app.changeListOrderBy('" + fieldName + "');return false;\">" + title + "</a>" + statusStr + "</th>";
                return result;
            }
        },
        view: {
            'Pic_Decorate': require("./resource/Pic_Decorate/Pic_Decorate.tpl")
        }

    },
    module);
    return FW;
});