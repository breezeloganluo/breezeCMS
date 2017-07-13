/**
* @namespace
* @name head 
* @version 0.01 罗光瑜 初始化版本
* @description  集成了所有head相关的函数    
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    FW.register({
        "name": "head",
        /**
        *@function
        *@memberOf head
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            //显示头部信息
            this.showHead();
        },
        "public": {
            /**
            *@function
            *@memberOf head
            *@name public$showHead
            *@description [功能]显示头部信息
            *[思路]直接show，没有其他方式
            *[接口.this.MY.xxx]这里描述内部全局变量定义
            *[接口.service.pkg.name.param]{这里描述服务pkg.name要传入参数内容}
            *[接口.service.pkg.name.return]{这里描述doserver返回值的json的结构}
            */
            "showHead": function() {
                //设置头部信息
                var data = {
                    logo: "../assets/default/img/logo.png",
                    title: "BreezeCMS"
                };
                //获取设置信息
                var allSettingStr = systemCtx["pagesetting_" + window.systemCtx.Template];
                if (allSettingStr == null) {
                    this.API.show("mainHead", data);
                    return;
                }
                var allSetting = eval("(" + allSettingStr + ")");
                if (allSetting == null) {
                    this.API.show("mainHead", data);
                    return;
                }
                //设置logo
                if (allSetting.logo) {
                    data.logo = Cfg.baseUrl + "/" + allSetting.logo;
                }
                //头部标题
                if (allSetting.headTitle) {
                    data.title = allSetting.headTitle;
                }
                //显示头部信息
                this.API.show("mainHead", data);
                //设置css
                this.API.private('setCss', data, allSetting);
            },
            /**
            *@function
            *@memberOf head
            *@name public$_getMgrPagetSetting
            *@description [功能]获取要配置的内容
            */
            "_getMgrPagetSetting": function() {
                //直接返回信息
                return {
                    logo: {
                        title: "logo",
                        type: "Pic",
                        desc: "文件上传"
                    },
                    headTitle: {
                        title: "头部的标题",
                        type: "Text",
                        desc: "头部的标题,默认的是BreezeCMS"
                    },
                    headColor: {
                        title: "头部的颜色",
                        type: "Text",
                        desc: "默认就是黑色"
                    }
                }
            }
        },
        "private": {
            /**
            *@function
            *@memberOf head
            *@name private$setCss
            *@description [功能]这里描述基本功能
            *[思路]这里描述实现的基本思路
            *[接口.this.MY.xxx]这里描述内部全局变量定义
            *[接口.service.pkg.name.param]{这里描述服务pkg.name要传入参数内容}
            *[接口.service.pkg.name.return]{这里描述doserver返回值的json的结构}
            */
            "setCss": function(data, allCfg) {
                //设置头部颜色
                if (allCfg.headColor) {
                    $("#top").css("background-color", allCfg.headColor);
                }
            }
        },
        view: {
            'mainHead': require("./resource/head/mainHead.tpl")
        }

    },
    module);
    return FW;
});