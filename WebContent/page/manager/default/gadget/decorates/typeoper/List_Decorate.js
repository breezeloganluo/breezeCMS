/**
* @namespace
* @name List_Decorate 
* @version 0.01 罗光瑜 修改：将视图部分的列表条件由原来的Hidden_改成用isList表示
0.02 罗光瑜 列表模型，添加时，正则表达式写死是当前的模型里面的前缀，导致这个只有模型编辑的列表能用，其他用不了
* @description  这个是独立的表单组件，这个组件是一个列表，列表的metadata结构如下：
*{
*   fieldName:{
*          title:"xxx",
*          type:"xxxx",
*          width:"xx",
*          islist:"1"
*   }
*}
*至于类型，如果是非表单内容的，就采用Hidden_[原来字段类型]的方式表示，例如：
*Hidden_Text            
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    FW.register({
        "name": "List_Decorate",
        /**
        *@function
        *@memberOf List_Decorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {},
        "public": {
            /**
            *@function
            *@memberOf List_Decorate
            *@name public$createTypeDecorateEditData
            *@description [功能]给页面反向调用，获取页面的一个输入单元的html片段
            *[思路]反向的调用附代码的createTypeDecorateEditData实现,
            *这个变量this.param.father中可以获取父亲的对象
            *@param appId 这个就是每个组件name所用的字符串，用于反解信息用
            *@param type type类型
            *@param metadata 描述数据
            *@param data 显示数据
            *@return html片段
            */
            "createTypeDecorateEditData": function(appId, type, metadata, data) {
                return this.myFather.createTypeDecorateEditData(appId, type, metadata, data);
            },
            /**
            *@function
            *@memberOf List_Decorate
            *@name public$getTypeDecorateEditData
            *@description 外部single页面的调用函数，这是一个接口。
            *@param metadata 描述数据
            *@param data 显示数据
            *@return html片段
            */
            "getTypeDecorateEditData": function(metadata, data) {
                if (!metadata) {
                    alert("List_Decorate描述数据不可以为空！");
                    return;
                }
                var title = metadata.title;
                metadata = metadata.valueRange[0];
                this.MY.metadata = metadata;
                this.MY.data = data;
                this.MY.fieldId = this.fieldId;

                var _data = {
                    title: title,
                    metadata: metadata,
                    data: data,
                    appId: this.MY.fieldId
                };
                return this.API.show("List_Decorate", _data, "_");
            }
        },
        "private": {
            /**
            *@function
            *@memberOf List_Decorate
            *@name private$parseColonLine
            *@description [功能]因为列表的添加实际是可弄一个list最后一行的内容，而最后一行的内容又涉及取值的name问题，所以这里要有一个专门处理被解析的独立行的功能，这个是给页面调用的
            *[思路]这里描述实现的基本思路
            *[接口.this.MY.xxx]这里描述内部全局变量定义
            *[接口.service.pkg.name.param]{这里描述服务pkg.name要传入参数内容}
            *[接口.service.pkg.name.return]{这里描述doserver返回值的json的结构}
            *@param appId 字段名
            *@param metadata 元数据
            */
            "parseColonLine": function(appId, metadata) {
                //获取对应克隆数据
                var colonData = this.API.show("colonList", {
                    appId: appId,
                    metadata: metadata
                },
                "_");
                //返回数据
                var result = colonData.replace(/name\s*=\s*['"][^'"]+['"]/ig,
                function(a) {
                    return "my_" + a;
                });
                return result;
            },
            /**
            *@function
            *@memberOf List_Decorate
            *@name private$parserValueData
            *@description [功能]过滤value的特殊字符如“”等
            *[思路]调用父方法实现
            *@param value 对应的值
            */
            "parserValueData": function(value) {
                return this.myFather.parserValueData(value);
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf List_Decorate
            *@name FireEvent$selectAdd
            *@description [功能]列表的添加功能
            *[思路]使用jquery的dom操作完成，原来这个函数在CMSMgrDefaultSingleControl中的，被移植到这里
            *@param dom 选中的dom信息
            */
            "selectAdd": function(dom) {
                if ($(dom).parent().prev().find(">tbody>tr.list-none").length) {
                    $(dom).parent().prev().find(">tbody>tr.list-none").remove();
                    var idx = 0;
                } else {
                    //找到最后一行name[idx]
                    var Col = $(dom).parent().prev().find(">tbody>tr");
                    var lastCol = Col.eq(Col.length - 2);
                    var exp = new RegExp("(data-list-value=[\"']?)(" + this.MY.fieldId + ".*?)([\"']?[\s>])", "i");
                    var arr = lastCol.html().match(exp)[2].split("[");
                    var idx = parseInt(arr[arr.length - 1].split("]")[0]) + 1;
                }
                //克隆空白行
                var lcwnone = $(dom).parent().parent().find("table>tbody>tr.list-tr-hidden");
                var cloneCol = lcwnone.clone(true).removeClass("list-tr-hidden");
                cloneCol.insertBefore(lcwnone);
                var oldHtml = cloneCol.html();
                var afterIdx = oldHtml.replace(/_999_/g, idx);
                var realHtml = afterIdx.replace(/my_(name\s*=\s*["'][^"']+["'])/ig,
                function(a, b) {
                    return b;
                });
                cloneCol.addClass("listdata_" + this.MY.fieldId + "_" + idx);
                cloneCol.html(realHtml).show();
                //为特定节点创建app
                //--这里为复制原理，但不排除有些类型是特殊定制的，所以这些定制的类型，还必须有配套的app因此这里要借此特殊处理
                //--显然，appid就是属性data-list-value中，而app的gadget名就来自data-list-type
                var _this = this;
                cloneCol.find("td[data-list-value][data-list-type]").each(function() {

                    var dom = $(this);
                    var type = dom.attr("data-list-type") + "_Decorate";
                    var appid = "field_" + dom.attr("data-list-value");
                    if (FW.getGadget(type)) {
                        var app = FW.createApp(appid, type, _this.myFather, true);
                        app.myFather = _this.myFather;
                        app.fieldId = _this.fieldId;
                    }
                });
            },
            /**
            *@function
            *@memberOf List_Decorate
            *@name FireEvent$selectAll
            *@description [功能]配合列表的全选按钮，进行全选
            *[思路]完全jquery的dom操作
            *@param dom dom节点操作
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
            *@memberOf List_Decorate
            *@name FireEvent$selectChange
            *@description [功能]相关列表的反选操作
            *[思路]用jquery的dom操作完成
            *@param dom 按钮的dom对象
            */
            "selectChange": function(dom) {
                $(dom).parent().prev().find(">tbody>tr").not(".list-tr-hidden").each(function() {
                    var cbox = $(this).find(">td:eq(0) input[type='checkbox']");
                    cbox.click();
                });
            },
            /**
            *@function
            *@memberOf List_Decorate
            *@name FireEvent$selectDelete
            *@description [功能]列表选中后的反选功能
            *[思路]用dom操作
            *@param dom 按钮的dom节点
            */
            "selectDelete": function(dom) {
                $(dom).parent().prev().find(">tbody>tr").each(function() {
                    var cbox = $(this).find(">td:eq(0) input[type='checkbox']");
                    if (cbox.is(':checked')) {
                        $(this).remove();
                    }
                });
                if ($(dom).parent().prev().find(">tbody>tr").length == 1) {
                    var _vname = $(dom).parent().prev().find(">tbody>tr").find("input[name]:eq(0)").attr("name");
                    _vname = _vname.split("[99]")[0];
                    $(dom).parent().prev().find(">tbody>tr").before("<tr class='list-none'><td colspan='100' style='padding:40px; font-size:16px; color:orange; text-align:center;'>暂无数据<input type='hidden' name='" + _vname + "' /></td></tr>");
                }
            },
            /**
            *@function
            *@memberOf List_Decorate
            *@name FireEvent$openModMask
            *@description [功能]相应页面的请求，打开一个蒙板层，填写单行的表单
            *[思路]调用会父亲的表单显示方法，显示具体的表单
            *@param idx 索引
            */
            "openModMask": function(idx) {
                //获取数据
                //--注意，要获取页面列表的修改数据
                var data = this.MY.data && this.MY.data[idx] || [];
                var listDom = $(".listdata_" + this.MY.fieldId + "_" + idx);
                if (listDom.length > 0) {
                    data = FW.use().getFormValue(listDom);
                    data = data[this.MY.fieldId][idx];
                }
                var metadata = this.MY.metadata;
                //显示蒙版
                //--调用父亲显示
                var html = this.myFather.createMainForm(metadata, data, this.MY.fieldId + "_");
                this.API.mask("maskList", {
                    html: html,
                    idx: idx
                },
                800, 600);
            },
            /**
            *@function
            *@memberOf List_Decorate
            *@name FireEvent$maskOk
            *@description [功能]蒙版层点击了ok按钮
            *[思路]先用函数获取对象值，然后遍历tar下input对象，逐个实施赋值
            *@param idx 要处理的索引
            */
            "maskOk": function(idx) {
                //获取值
                var oneData = FW.use().getFormValue("mask_listForm");
                //更改缓存的值
                if (this.MY.data == null) {
                    this.MY.data = [];
                }
                this.MY.data[idx] = oneData;
                //遍历tr下的每个表单
                $("[name^=" + this.MY.fieldId + "\\[" + idx + "\\]").each(function() {
                    var nameData = this.name.replace(/\w+\[\d+\]\.(\w+)/i,
                    function(a, b) {
                        return "oneData." + b;
                    });
                    var value = eval("(" + nameData + ")");
                    this.value = value;
                });
                //逐个赋值
                FW.unblockUI();
            }
        },
        view: {
            'List_Decorate': require("./resource/List_Decorate/List_Decorate.tpl"),
            'colonList': require("./resource/List_Decorate/colonList.tpl"),
            'maskList': require("./resource/List_Decorate/maskList.tpl")
        }

    },
    module, '0.02');
    return FW;
});