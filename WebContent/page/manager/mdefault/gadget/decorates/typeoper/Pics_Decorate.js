/**
* @namespace
* @name Pics_Decorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/TypeDecorate");
    FW.register({
        "name": "Pics_Decorate",
        "extends": ["TypeDecorate"],
        /**
        *@function
        *@memberOf Pics_Decorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {},
        "public": {
            /**
            *@function
            *@memberOf Pics_Decorate
            *@name public$getTypeDecorateEditData
            *@description
            *@param metadata 描述数据
            *@param data 显示数据
            */
            "getTypeDecorateEditData": function(metadata, data) {
                //整理数据
                if (!metadata) {
                    alert("Pics_Decorate描述数据不可以为空！");
                    return;
                }
                var _type = this.gadgetName.replace("_Decorate", "");
                var _data = {
                    metadata: metadata,
                    data: data,
                    appId: this.id
                };
                //保存数据
                this.param.data = data;
                //显示
                return this.API.show("Pics_Decorate", _data, "_");
            },
            /**
            *@function
            *@memberOf Pics_Decorate
            *@name public$getTypeDecorateData
            *@description
            */
            "getTypeDecorateData": function() {
                var value = [];
                var query = "#result_" + this.id.replace(/([\.])/ig, "\\$1");
                $(query).find("img").each(function() {
                    var url = $(this).attr("srcValue");
                    var alt = $(this).attr("alt");
                    var one = {
                        picUrl: url,
                        alt: alt
                    }
                    value.push(one);
                });

                return value;
            },
            /**
            *@function
            *@memberOf Pics_Decorate
            *@name public$getTableHeadDisplayData
            *@description
            */
            "getTableHeadDisplayData": function(title) {
                return "";
            },
            /**
            *@function
            *@memberOf Pics_Decorate
            *@name public$showResult
            *@description [功能]这里描述基本功能
            *[思路]这里描述实现的基本思路
            *[接口.this.MY.xxx]这里描述内部全局变量定义
            *[接口.service.pkg.name.param]{这里描述服务pkg.name要传入参数内容}
            *[接口.service.pkg.name.return]{这里描述doserver返回值的json的结构}
            *@param data 用于显示的图片数据
            */
            "showResult": function(data) {
                //将当前的值保存起来，便于做删除操作
                this.param.data = data;
                //直接显示
                this.API.show("pics_imgs", {
                    data: data
                },
                "result");
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf Pics_Decorate
            *@name FireEvent$removeOne
            *@description [功能]删除其中一个图片
            *[思路]数据已经保存到data中，直接对其进行数组删除即可
            *@param idx 传入的要删除索引
            */
            "removeOne": function(idx) {
                //直接删除要删除的索引
                this.param.data.splice(idx, 1);
                //重新显示
                this.showResult(this.param.data);
            }
        },
        view: {
            'Pics_Decorate': require("./resource/Pics_Decorate/Pics_Decorate.tpl"),
            'pics_imgs': require("./resource/Pics_Decorate/pics_imgs.tpl")
        }

    },
    module);
    return FW;
});