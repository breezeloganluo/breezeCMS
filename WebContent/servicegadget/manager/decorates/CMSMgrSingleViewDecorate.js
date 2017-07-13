/**
* @namespace
* @name CMSMgrSingleViewDecorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("../CMSMgrDecorate");
    FW.register({
        "name": "CMSMgrSingleViewDecorate",
        "extends": ["CMSMgrDecorate"],
        /**
        *@function
        *@memberOf CMSMgrSingleViewDecorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            //toDO
        },
        "public": {
            /**
            *@function
            *@memberOf CMSMgrSingleViewDecorate
            *@name public$listShow
            *@description
            *@return toDo
            *@example toDO
            */
            "listShow": function(metadata, data, key) {
                alert("这个函数是listShow但是有问题，源代码中，没找到视图listView,只有视图listShow");
                //"listShow":require("./CMSMgrControlResource/CMSMgrList.tpl"),
                return this.API.show("listView", {
                    "metadata": metadata,
                    "data": data,
                    "key": key
                },
                "_");
            },
            /**
            *@function
            *@memberOf CMSMgrSingleViewDecorate
            *@name public$customizedType
            *@description 显示自定义type类型
            *对应tpl为tpye加cusomizedTpl e.g. sss_customerTpl
            *@param metadata 元数据
            *@param data 真实值
            *@param type type名称
            */
            "customizedType": function(metadata, data, type) {
                alert("CMSMgrSingleViewDecorate.customizedType不知道做什么的");
                var showData = {
                    "metadata": metadata,
                    "data": data
                };
                if (metadata.valueRange && metadata.valueRange.length > 0 && metadata.valueRange[0]) {
                    var __appName = metadata.valueRange[0];
                    var __gadgetName = type + "_Decorate";
                    var __resourceAPP = {};
                    var __useAppName = metadata.valueRange[0];
                    var app = FW.createApp(__appName, __gadgetName, __resourceAPP, __useAppName);
                    var valueRange = [];
                    for (var i = 1; i < metadata.valueRange.length; i++) {
                        valueRange.push(metadata.valueRange[i]);
                    }
                    return app.getDecorateDisplayData(valueRange, data);
                } else {
                    alert("自定义type参数不全，请仔细检查！");
                }
            }
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrSingleViewDecorate
            *@name private$processingData
            *@description processingData
            *@param data 输入数据
            */
            "processingData": function(data) {
                var param = {};
                if (this.control.param.queryParam && this.control.param.queryParam.cid) {
                    param.cid = this.control.param.queryParam.cid;
                }
                if (this.control.param.parentAlias && this.control.param.parentAlias == this.control.param.alias && this.control.param.queryParam && this.control.param.queryParam.nodeid) {
                    param.cid = this.control.param.queryParam.nodeid;
                    if (this.control.param.mid) {
                        delete param.cid;
                    }
                }
                var _btnData = FW.use().evalJSON(window.systemCtx.singleButton);
                if (window.customized && window.customized[data.alias] && window.customized[data.alias].singleButton) {
                    _btnData = FW.use().evalJSON(window.customized[data.alias].singleButton);
                }
                if ((this.control.param.queryParam && this.control.param.queryParam.cpc_oper == 'addNode') || !this.control.param.queryParam || (!this.control.param.queryParam.cid && !param.cid) || (!this.control.param.cid && this.control.param.mid)) {
                    data.data = null;
                }
                var CMSMgrSingleViewDecorate = {
                    data: data.data,
                    metadata: data.metadata,
                    btnData: _btnData
                };
                return CMSMgrSingleViewDecorate;
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf CMSMgrSingleViewDecorate
            *@name FireEvent$btnEvent
            *@description 处理绑定的事件。将参数整理后触发TregerEvent方法
            *@param btnIdx 按钮的索引
            *@param dom 节点dom对象
            */
            "btnEvent": function(btnIdx, dom) {
                //获取节点
                var btnData = this.MY.data.btnData[btnIdx];
                //设置参数
                var funName = btnData.onclick;
                var type = btnData.type;
                var data = this.getData();
                //if (公有方法存在){先调用自己的公有方法
                if (this[funName]) {
                    this[funName](type, data, dom);
                    return;
                }
                //}
                //if (私有方法存在){
                if (this["private"][funName]) {
                    this.API.private(type, data, dom);
                    return;
                }
                //}
                //if (control公有方法中存在){
                if (this.control[funName]) {
                    this.control[funName](type, data, dom);
                    return;
                }
                //}
                //若全都没找到 执行triger
                FW.trigerEvent(funName, type, data, dom);
            },
            /**
            *@function
            *@memberOf CMSMgrSingleViewDecorate
            *@name FireEvent$selectAll
            *@description 弹出的蒙板层，全选功能，该功能给模型设计时使用
            *@param dom 事件的dom节点
            */
            "selectAll": function(dom) {
                $(dom).parent().prev().find(">tbody>tr").not(".list-tr-hidden").each(function() {
                    var cbox = $(this).find(">td:eq(0) input[type='checkbox']");
                    if (!cbox.is(':checked')) {
                        cbox.click();
                    }
                });
            },
            /**
            *@function
            *@memberOf CMSMgrSingleViewDecorate
            *@name FireEvent$selectAdd
            *@description 弹出蒙板层新添加一行，该方法给模型设计时使用
            *@param dom dom节点
            */
            "selectAdd": function(dom) {
                //克隆空白行
                var lcwnone = $(dom).parent().parent().find("table>tbody>tr.list-tr-hidden");
                var cloneCol = lcwnone.clone(true).removeClass("list-tr-hidden");
                cloneCol.insertBefore(lcwnone);
                cloneCol.html(cloneCol.html()).show();
            },
            /**
            *@function
            *@memberOf CMSMgrSingleViewDecorate
            *@name FireEvent$selectChange
            *@description 反选功能
            *@param dom 事件的dom节点
            */
            "selectChange": function(dom) {
                $(dom).parent().prev().find(">tbody>tr").not(".list-tr-hidden").each(function() {
                    var cbox = $(this).find(">td:eq(0) input[type='checkbox']");
                    cbox.click();
                });
            },
            /**
            *@function
            *@memberOf CMSMgrSingleViewDecorate
            *@name FireEvent$selectDelete
            *@description 弹出的蒙板层，进行记录删除，该方法只用于模型设计时
            *@param dom 点击事件的dom节点
            */
            "selectDelete": function(dom) {
                $(dom).parent().prev().find(">tbody>tr").each(function() {
                    var cbox = $(this).find(">td:eq(0) input[type='checkbox']");
                    if (cbox.is(':checked')) {
                        $(this).remove();
                    }
                });
                if ($(dom).parent().prev().find(">tbody>tr").length == 1) {
                    var lcwnone = $(dom).parent().parent().find("table>tbody>tr.list-tr-hidden");
                    var cloneCol = lcwnone.clone(true).removeClass("list-tr-hidden");
                    cloneCol.insertBefore(lcwnone);
                    cloneCol.html(cloneCol.html()).show();
                }
            }
        },
        "TrigerEvent": {
            /**
            *@function
            *@memberOf CMSMgrSingleViewDecorate
            *@name TrigerEvent$openMask
            *@description
            */
            "openMask": function(alias) {
                var url = "alias=" + alias;
                url += "&type=mask";
                FW.page.createMaskControl(url);
            }
        }
    },
    module);
    return FW;
});