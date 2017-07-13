/**
* @namespace
* @name CMSMgrDefaultListViewDecorate 
* @version 0.01 罗光瑜 简化typedecorate把typedecorate的方法移动到这边
0.02 罗光瑜 文本输入框支持超长后压缩字符，不让超长
* @description  列表显示页面，注意，关于类型，这个类的父类，是继承了typedecorate的，所以，页面的反向函数调用处理，是调用了typedecorate实现的     
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/CMSMgrListViewDecorate");
    FW.register({
        "name": "CMSMgrDefaultListViewDecorate",
        "extends": ["CMSMgrListViewDecorate"],
        "public": {
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name public$_getMgrPagetSetting
            *@description [功能]获取类配置
            *[思路]直接返回
            */
            "_getMgrPagetSetting": function() {
                //直接返回
                return {
                    listOperButtonIcon: {
                        title: "按钮图标",
                        type: "Text",
                        desc: "表格页面的操作按钮的图标，这是一个数组形式字符串，表示对应索引的图标例如['glyphicon glyphicon-edit', 'glyphicon glyphicon-trash']"
                    },
                    listOperButtonStyle: {
                        title: "按钮的样式",
                        type: "Text",
                        desc: "表格页面的操作按钮的样式（主要是颜色），这是一个数组形式字符串，表示对应索引的样式例如['btn-default', 'btn-primary', 'btn-primary', 'btn-success', 'btn-info', 'btn-warning', 'btn-danger', 'btn-link']"
                    }
                }
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name public$getCfgInfo
            *@description 获取系统配置的信息
            */
            "getCfgInfo": function() {
                //返回对应的名称
                return {
                    name: "列表页按钮",
                    sig: "listOperBtns"
                }
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name public$getDisplayCfg
            *@description 返回显示显示配置的html片段
            *@param cfgObj 配置对象
            *@return 显示的html片段
            */
            "getDisplayCfg": function(cfgObj) {
                //显示配置信息
                return this.API.show("configView", cfgObj, "_");
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name public$getCfgSetting
            *@description 由页面配置获取配置内容，提供默认方法，这种方法页面元素有前提要求：
            *$(domSelector).find("tr").not(".list-tr-hidden").find("td").not(".center")
            *并且值的标签使用属性attr-d来标识属性名的
            *@param domSelector 进行判断的jqueryselector
            *@return 返回设置的对象
            */
            "getCfgSetting": function(domSelector) {
                //获取复选框选项的值
                var selectedData = $("#isListMultiSelect").is(':checked');
                //设定初值变量
                var data = [];
                var _data = {};
                //block(dom里面所有的td){
                $(domSelector).find("tr").not(".list-tr-hidden").find("td").not(".center").each(function() {
                    //读入dom中值，兼容input,select,textarea情况
                    var text = $(this).find("input").val();
                    if (!text) {
                        text = $(this).find("textarea").val();
                    }
                    if (!text) {
                        text = $(this).find(":selected").val();
                    }
                    //if (用重复名称记录){记录当前行，新起一行
                    if (_data[$(this).attr("attr-d")]) {
                        //加入一行
                        data.push(_data);
                        //新起一行
                        _data = {};
                    }
                    //}
                    //处理读入的值，为空就退出，否则记录一条记录
                    if (!text) {
                        return;
                    }
                    if ($(this).attr("attr-d") == "fun") {
                        _data.oper = {};
                        _data.oper[$(this).attr("attr-d")] = text;
                    } else {
                        _data[$(this).attr("attr-d")] = text;
                    }

                });
                //}
                //补充记录最后一条记录，并返回
                var isNull = true;
                for (var i in _data) {
                    isNull = false;
                    break;
                }
                if (isNull) {
                    return {
                        isListMultiSelect: selectedData
                    }
                }
                data.push(_data);

                return {
                    isListMultiSelect: selectedData,
                    listSet: data
                }
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name public$createTypeDecorateListData
            *@description
            */
            "createTypeDecorateListData": function(appId, type, metadata, data) {
                //获取viewid
                var viewid = "type_" + type;
                //初始化结果
                var result = "";
                //如果在视图范围内的就显示
                if (this.view[viewid]) {
                    result = this.API.show(viewid, {
                        metadata: metadata,
                        data: data
                    },
                    "_");
                }
                return result;
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name public$getTableHeadDisplayData
            *@description [功能]支持点击后进行排序，使用的字段为：orderby :[ { name:xxxx desc:true } ]
            *@param type 使用的类型
            *@param title 标题名称
            *@param fieldName 字段名
            */
            "getTableHeadDisplayData": function(type, title, fieldName) {
                try {
                    //处理排序信息
                    var spes = this.control.param.spes;
                    var status = 0;
                    if (spes != null && spes.orderby != null && spes.orderby.length > 0) {
                        if (spes.orderby[0].desc && spes.orderby[0].name == fieldName) {
                            status = 1;
                        } else if (spes.orderby[0].name == fieldName) {
                            status = 2;
                        }
                    }
                    //初始化结果
                    var result = "";
                    //if (有对应type的视图){显示处理
                    if (this.view["type_" + type]) {
                        //调用视图处理result
                        result = this.API.show("tableHead", {
                            title: title,
                            status: status,
                            fieldName: fieldName
                        },
                        "_");
                    }
                    //}
                    //返回结果
                    return result;

                } catch(e) {
                    return "<th style='display:none'>不支持的显示类型</th>";
                }
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name public$cutDown
            *@description [功能]把字符串的长度超长部分缩短，变成...，容纳7个字
            *[思路]字符串操作即可，另外因为可能给子类用，所以变成公有方法
            *@param input 输入部分
            */
            "cutDown": function(input) {
                //如果不超长就返回
                if (input.length <= 10) {
                    return input;
                }
                //超长就截长返回
                var cutdown = input.substr(0, 10);
                return cutdown + "...";
            }
        },
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
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListViewDecorate
            *@name FireEvent$changeListOrderBy
            *@description [功能]表页头部时点击改变排序用
            *[思路]根据传入的字段名以及参数中的特殊字段进行判断状态以及内容
            *@param field 字段名
            */
            "changeListOrderBy": function(field) {
                //获取并改变当前状态
                var spes = this.control.param.spes;

                if (spes != null && spes.orderby && spes.orderby.length > 0) {
                    if (spes.orderby[0].name != field) {
                        this.control.param.spes = {
                            orderby: [{
                                name: field,
                                desc: true
                            }]
                        }
                    } else if (spes.orderby[0].desc) {
                        spes.orderby[0].desc = false;
                    } else {
                        delete this.control.param.spes.orderby;
                    }
                } else {
                    this.control.param.spes = {
                        orderby: [{
                            name: field,
                            desc: true
                        }]
                    }
                }
                //重新显示
                url = FW.page.param2url(this.control.param);
                FW.page.createControl(url);
            }
        },
        view: {
            'CMSMgrDefaultListViewResourceView': require("./resource/CMSMgrDefaultListViewDecorate/CMSMgrDefaultListViewResourceView.tpl"),
            'CMSMgrDefaultMaskListViewResourceView': require("./resource/CMSMgrDefaultListViewDecorate/CMSMgrDefaultMaskListViewResourceView.tpl"),
            'configView': require("./resource/CMSMgrDefaultListViewDecorate/configView.tpl"),
            'tableHead': require("./resource/CMSMgrDefaultListViewDecorate/tableHead.tpl"),
            'type_DatePicker': require("./resource/CMSMgrDefaultListViewDecorate/type_DatePicker.tpl"),
            'type_DateTimePicker': require("./resource/CMSMgrDefaultListViewDecorate/type_DateTimePicker.tpl"),
            'type_File': require("./resource/CMSMgrDefaultListViewDecorate/type_File.tpl"),
            'type_Pic': require("./resource/CMSMgrDefaultListViewDecorate/type_Pic.tpl"),
            'type_Radio': require("./resource/CMSMgrDefaultListViewDecorate/type_Radio.tpl"),
            'type_ReadOnly': require("./resource/CMSMgrDefaultListViewDecorate/type_ReadOnly.tpl"),
            'type_Select': require("./resource/CMSMgrDefaultListViewDecorate/type_Select.tpl"),
            'type_Text': require("./resource/CMSMgrDefaultListViewDecorate/type_Text.tpl"),
            'type_TextArea': require("./resource/CMSMgrDefaultListViewDecorate/type_TextArea.tpl"),
            'type_TimePicker': require("./resource/CMSMgrDefaultListViewDecorate/type_TimePicker.tpl"),
            'type_SelectText': require("./resource/CMSMgrDefaultListViewDecorate/type_SelectText.tpl")
        }

    },
    module);
    return FW;
});