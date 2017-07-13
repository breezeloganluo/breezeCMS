/**
* @namespace
* @name Text_Decorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/TypeDecorate");
    FW.register({
        "name": "Text_Decorate",
        "extends": ["TypeDecorate"],
        /**
        *@function
        *@memberOf Text_Decorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {},
        "public": {
            /**
            *@function
            *@memberOf Text_Decorate
            *@name public$getTypeDecorateEditData
            *@description
            *@param metadata 描述数据
            *@param data 显示数据
            */
            "getTypeDecorateEditData": function(metadata, data) {
                if (!metadata) {
                    alert("Text_Decorate描述数据不可以为空！");
                    return;
                }
                var _type = this.gadgetName.replace("_Decorate", "");
                var _data = {
                    metadata: metadata,
                    data: data,
                    appId: this.id
                };
                return this.API.show("Text_Decorate", _data, "_");
            },
            /**
            *@function
            *@memberOf Text_Decorate
            *@name public$getTypeDecorateData
            *@description 返回Text值
            */
            "getTypeDecorateData": function() {
                var query = "div[data-value='" + this.id + "']>input";
                return $(query).val();
            },
            /**
            *@function
            *@memberOf Text_Decorate
            *@name public$getTypeDecorateDisplayData
            *@description
            */
            "getTypeDecorateDisplayData": function(data, metadata) {
                if (!metadata) {
                    alert("Text_Decorate描述数据不可以为空！");
                    return;
                }
                return data || "";
            },
            /**
            *@function
            *@memberOf Text_Decorate
            *@name public$getTableHeadDisplayData
            *@description
            *@param title 标题
            *@param fieldName 字段名
            *@param id 创建者的id给事件用
            *@param status 当前状态
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
            'Text_Decorate': require("./resource/Text_Decorate/Text_Decorate.tpl")
        }

    },
    module);
    return FW;
});