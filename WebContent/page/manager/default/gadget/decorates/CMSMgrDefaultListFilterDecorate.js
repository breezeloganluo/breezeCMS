/**
* @namespace
* @name CMSMgrDefaultListFilterDecorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/CMSMgrListFilterDecorate");
    FW.register({
        "name": "CMSMgrDefaultListFilterDecorate",
        "extends": ["CMSMgrListFilterDecorate"],
        "public": {
            /**
            *@function
            *@memberOf CMSMgrDefaultListFilterDecorate
            *@name public$getCfgInfo
            *@description 获取系统配置的信息
            */
            "getCfgInfo": function() {
                //返回对应的名称
                return {
                    name: "筛选器",
                    sig: "filterSet"
                }
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListFilterDecorate
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
            *@memberOf CMSMgrDefaultListFilterDecorate
            *@name public$getCfgSetting
            *@description 由页面配置获取配置内容，提供默认方法，这种方法页面元素有前提要求：
            *$(domSelector).find("tr").not(".list-tr-hidden").find("td").not(".center")
            *并且值的标签使用属性attr-d来标识属性名的
            *@param domSelector 进行判断的jqueryselector
            *@return 返回设置的对象
            */
            "getCfgSetting": function(domSelector) {
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
                        _data.filterValue = eval("(" + _data.filterValue + ")");
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
                    return null;
                }
                //整理数据
                _data.filterValue = eval("(" + _data.filterValue + ")");
                data.push(_data);
                return data;
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf CMSMgrDefaultListFilterDecorate
            *@name FireEvent$selectAll
            *@description 弹出的蒙板层进行全选，该方法给模型设计时使用
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
            *@memberOf CMSMgrDefaultListFilterDecorate
            *@name FireEvent$selectAdd
            *@description 弹出的蒙板层，新添加一行，该方法给模型设计时使用
            *@param dom 当前的dom节点
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
            *@memberOf CMSMgrDefaultListFilterDecorate
            *@name FireEvent$selectChange
            *@description 弹出蒙板层的反选按钮
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
            *@memberOf CMSMgrDefaultListFilterDecorate
            *@name FireEvent$selectDelete
            *@description 弹出层的删除功能，该功能在模型设计时使用
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
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListFilterDecorate
            *@name FireEvent$saveAddNew
            *@description 给作为alias统一配置时，默认页面的方法使用
            */
            "saveAddNew": function() {
                //调用父类进行设置
                this.configCtr.saveAddNew(this.getCfgInfo().sig);
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListFilterDecorate
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
            *@memberOf CMSMgrDefaultListFilterDecorate
            *@name FireEvent$search
            *@description [功能]查询关键字，这里重点是将页面上的值获取到并整理好
            *[思路]调用父类进行查询
            *[接口.this.MY.xxx]这里描述内部全局变量定义
            *[接口.service.pkg.name.param]{这里描述服务pkg.name要传入参数内容}
            *[接口.service.pkg.name.return]{这里描述doserver返回值的json的结构}
            *@param funName 函数名
            *@param funParam 函数参数
            */
            "search": function(funName, funParam) {
                //获取对应的值
                var searchObj = [];
                $(".fieldSearch").each(function() {
                    var name = this.name;
                    var value = this.value;
                    if (value != "" && value != null) {
                        searchObj.push({
                            fieldName: name,
                            fieldValue: value
                        });
                    }
                });
                this.search(funName, funParam, searchObj);
            },
			/**
            *@function
            *@memberOf CMSMgrListFilterDecorate
            *@name FireEvent$chooseFilter
            *@description 在实际filter页面中选中后触发的事件
            *@param key 关键字
            *@param value 值
            *@param type 类型
            *@return 无
            */
            "chooseFilter": function(key, value, type) {
				this.filter("filterMultField",type,{
					key:key,
					value:value
				});
            }
        },
        view: {
            'configView': require("./resource/CMSMgrDefaultListFilterDecorate/configView.tpl"),
            'CMSMgrDefaultListFilterResourceView': require("./resource/CMSMgrDefaultListFilterDecorate/CMSMgrDefaultListFilterResourceView.tpl")
        }

    },
    module);
    return FW;
});