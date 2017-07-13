/**
* @namespace
* @name CMSMgrDefaultListViewDecorate 
* @description  列表显示页面，注意，关于类型，这个类的父类，是继承了typedecorate的，所以，页面的反向函数调用处理，是调用了typedecorate实现的    
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/CMSMgrListViewDecorate");
    FW.register({
        "name": "CMSMgrDefaultListViewDecorate",
        "extends": ["CMSMgrListViewDecorate"],
        "private": {
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name private$sStyle
            *@description [功能]根据索引数据，获取风格字符串
            *[思路]传入的是索引，返回值就行
            *@param idx 0,1,2,3
            */
            "sStyle": function(idx) {
                //设置最基本信息
                var styleSetting = ["btn-default", "btn-primary", "btn-primary", "btn-success", "btn-info", "btn-warning", "btn-danger", "btn-link"];
                //获取配置信息的值
                var allSettingStr = systemCtx["pagesetting_" + window.systemCtx.Template];
                if (allSettingStr == null) {
                    return styleSetting[idx];
                }
                var allSetting = eval("(" + allSettingStr + ")");
                if (allSetting == null) {
                    return styleSetting[idx];
                }

                if (allSetting.listOperButtonStyle) {
                    styleSetting = eval("(" + allSetting.listOperButtonStyle + ")");
                }
                //返回对应的值
                return styleSetting[idx];
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name private$sIcon
            *@description [功能]返回对应的图标
            *[思路]根据基本设置返回图标信息
            *[接口.this.MY.xxx]这里描述内部全局变量定义
            *[接口.service.pkg.name.param]{这里描述服务pkg.name要传入参数内容}
            *[接口.service.pkg.name.return]{这里描述doserver返回值的json的结构}
            */
            "sIcon": function(idx) {
                //设置最基本信息
                var styleSetting = ["glyphicon glyphicon-edit", "glyphicon glyphicon-trash"];
                //设置最基本信息
                var styleSetting = ["btn-default", "btn-primary", "btn-primary", "btn-success", "btn-info", "btn-warning", "btn-danger", "btn-link"];
                //获取配置信息的值
                var allSettingStr = systemCtx["pagesetting_" + window.systemCtx.Template];
                if (allSettingStr == null) {
                    return styleSetting[idx];
                }
                var allSetting = eval("(" + allSettingStr + ")");
                if (allSetting == null) {
                    return styleSetting[idx];
                }

                if (allSetting.listOperButtonIcon) {
                    styleSetting = eval("(" + allSetting.listOperButtonIcon + ")");
                }
                //返回对应的值
                return styleSetting[idx];
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name private$getTypeValue
            *@description [功能]根据传入的type类型，取出对应的值
            *[思路]查阅metadata里面的type和传入的比较，然后获取data中的值
            *@param allData 传入的对象
            {
            data:[
            {
            字段1:"值"
            }
            ],
            metadata:{
            字段1:{
            type:"类型"
            }
            }
            }
            *@param type 要取的type的名字
            *@param idx value的索引号
            *@return 对应的值
            */
            "getTypeValue": function(allData, type, idx) {
                //获取字段名
                var field = null;
                for (var n in allData.metadata) {
                    var one = allData.metadata[n];
                    if (one.type == type) {
                        field = n;
                        break;
                    }
                }
                //获取并返回对应的值
                return allData.data[idx][field];
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name FireEvent$selectAll
            *@description 弹出的蒙板层，进行全选，该方法给模型设计的alias给作为alias统一配置时，默认页面的方法使用
            *@param dom 被选中的事件dom节点
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
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name FireEvent$selectAdd
            *@description 弹出的蒙板层新添加一行，该方法给模型设置给作为alias统一配置时，默认页面的方法使用
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
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name FireEvent$selectChange
            *@description 弹出层的反选功能，该功能给模型设计时给作为alias统一配置时，默认页面的方法使用
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
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name FireEvent$selectDelete
            *@description 弹出层的删除记录，该功能在模型设计时,给作为alias统一配置时，默认页面的方法使用
            *@param dom 事件的dom节点
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
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name FireEvent$saveAddNew
            *@description 给作为alias统一配置时，默认页面的方法使用
            */
            "saveAddNew": function() {
                //调用父类进行设置
                this.configCtr.saveAddNew(this.getCfgInfo().sig);
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name FireEvent$closeAddNew
            *@description 响应关闭，该方法只用于模型定制
            *@param dom 事件节点处理
            */
            "closeAddNew": function(dom) {
                //关闭窗口
                this.configCtr.closeAddNew();
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name FireEvent$listSelectAll
            *@description [功能]普通列表页面复选框全选使用
            *[思路]页面的jquery操作
            *[接口.this.MY.xxx]这里描述内部全局变量定义
            *[接口.service.pkg.name.param]{这里描述服务pkg.name要传入参数内容}
            *[接口.service.pkg.name.return]{这里描述doserver返回值的json的结构}
            *@param dom 当前的dom节点
            */
            "listSelectAll": function(dom) {
                //直接全选
                var checked = dom.checked;
                $("input[type='checkbox']").each(function() {
                    if (this.id == "selectCtr") {
                        return;
                    }
                    if (/listMultiSelect/.test(this.name)) {
                        this.checked = checked;
                    }
                });
            }
        },
        view: {
            'CMSMgrDefaultListViewResourceView': require("./resource/CMSMgrDefaultListViewDecorate/CMSMgrDefaultListViewResourceView.tpl"),
            'CMSMgrDefaultMaskListViewResourceView': require("./resource/CMSMgrDefaultListViewDecorate/CMSMgrDefaultMaskListViewResourceView.tpl"),
            'configView': require("./resource/CMSMgrDefaultListViewDecorate/configView.tpl")
        }

    },
    module);
    return FW;
});