/**
* @namespace
* @name CMSMgrListViewDecorate 
* @version 0.01 罗光瑜 取消对typedecorate的继承
* @description  这是列表修饰，实现一个完整列表的显示。
*在alias中可以接受定制信息：
*{"isListMultiSelect":false,"listSet":[{"title":"1","style":"2","icon":"3","oper":{"fun":"4"},"authority":"5","actionKey":"6"}]}
*其中isListMultiSelect表示是否是每一行前面都有一个复选框出来
*后面的是列表最后一栏，对应按钮的设置。注意，一旦设置，默认的编辑和删除按钮都将不存在    
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("../CMSMgrDecorate");
    FW.register({
        "name": "CMSMgrListViewDecorate",
        "extends": ["CMSMgrDecorate"],
        /**
        *@function
        *@memberOf CMSMgrListViewDecorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            //toDO
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrListViewDecorate
            *@name private$processingData
            *@description 重载父类方法，处理列表中的一些数据
            *@param data 传入的数据
            */
            "processingData": function(data) {
                var CMSMgrDefaultListViewDecorate = {
                    alias: this.param.alias,
                    data: data.data,
                    orgData: data.orgData,
                    metadata: data.metadata
                };
                //设定默认数据
                var _listOperBtns = [{
                    "title": "编辑",
                    "style": "3",
                    "icon": "0",
                    "authority": "modifyContent",
                    "rowId": "true",
                    "oper": {
                        "fun": "openMod"
                    },
                    "param": "single"
                },
                {
                    "title": "删除",
                    "style": "6",
                    "icon": "1",
                    "authority": "deleteContent",
                    "rowId": "true",
                    "dom": "true",
                    "oper": {
                        "fun": "deleteContent"
                    }
                }];
                //处理定制数据
                if (window.customized && window.customized[data.alias] && window.customized[data.alias].listOperBtns) {
                    var orgData = FW.use().evalJSON(window.customized[data.alias].listOperBtns);
                    if (orgData.listSet) {
                        _listOperBtns = orgData.listSet
                    }
                    CMSMgrDefaultListViewDecorate.isListMultiSelect = orgData.isListMultiSelect;
                }
                //设置数据
                CMSMgrDefaultListViewDecorate.listOperBtns = _listOperBtns;
                return CMSMgrDefaultListViewDecorate;
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf CMSMgrListViewDecorate
            *@name FireEvent$btnEvent
            *@description 处理点击消息
            *@param dataId 要处理的数据索引
            *@param evnId 处理的按钮索引
            *@param domObj 当前点击事件的dom组件
            */
            "btnEvent": function(dataId, evnId, domObj) {
                //获取点击信息
                var oneData = this.MY.data.data[dataId];
                var oneBtn = this.MY.data.listOperBtns[evnId];
                //处理调用函数的内容
                var funName = oneBtn.oper.fun;
                //block(块){处理调用的函数
                //处理param和初始化
                //--param表示配置传递的参数
                var param = oneBtn.param;
                //处理第几行
                var cid = oneData.cid;
                //处理domid参数
                var domid = "data" + dataId;
                //}
                //if (公有方法存在){先调用自己的公有方法
                if (this[funName]) {
                    this[funName](param, cid, domid, domObj);
                    return;
                }
                //}
                //if (私有方法存在){
                if (this["private"][funName]) {
                    this.API.private(funName, param, cid, domid, domObj);
                    return;
                }
                //}
                //if (control公有方法中存在){
                if (this.control[funName]) {
                    this.control[funName](param, cid, domid, domObj);
                    return;
                }
                //}
            }
        }
    },
    module);
    return FW;
});