/**
* @namespace
* @name TypeSelect_Decorate 
* @version 0.01 罗光瑜 初始版本
* @description  用于在模型管理中，类型部分双击后，能够显示和弹出一个框，这个框可以显示列表方式添加和删除各种control下的类型 
*这个类的结果使用端是control的基类CMSMgrControl中handleMetaDataBefore函数处理的，他会根据结构化的数据对不同的type类型和当前传入的类型综合判断后，进行统一处理。
*而那里接受的数据结构如下：
*{
*   type类型:类型值
*}
*   
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    FW.register({
        "name": "TypeSelect_Decorate",
        /**
        *@function
        *@memberOf TypeSelect_Decorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            //toDO
        },
        "public": {
            /**
            *@function
            *@memberOf TypeSelect_Decorate
            *@name public$getTypeDecorateEditData
            *@description [功能]外部single页面的调用函数，这是一个接口。
            *[思路]简单的模拟text输入，只是有doubleclick响应事件处理
            *其他照抄传统例如List_Decorate的做法
            *@param metadata 描述数据
            *@param data 显示数据
            *@return html片段
            */
            "getTypeDecorateEditData": function(metadata, data) {
                if (!metadata) {
                    alert("List_Decorate描述数据不可以为空！");
                    console.log("List_Decorate描述数据不可以为空！");
                    return;
                }
                var title = metadata.title;
                this.MY.metadata = metadata;
                this.MY.data = data;
                this.MY.fieldId = this.fieldId;

                var _data = {
                    title: title,
                    metadata: metadata,
                    data: data,
                    appId: this.MY.fieldId
                };
                return this.API.show("main", _data, "_");
            }
        },
        "private": {
            /**
            *@function
            *@memberOf TypeSelect_Decorate
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
            *@memberOf TypeSelect_Decorate
            *@name FireEvent$openMask
            *@description [功能]打开蒙板层显示
            *@param dom 当前的标签
            */
            "openMask": function(dom) {
                //获取原来的数据
                var data = dom.value;
                this.MY.orgDom = dom;
                if (/\{/i.test(data)) {
                    data = eval("(" + data + ")");
                } else {
                    data = {
                        "default": data || ""
                    }
                }
                //显示标签
                this.API.mask("maskList", {
                    data: data
                },
                800, 600);
            },
            /**
            *@function
            *@memberOf TypeSelect_Decorate
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
            *@memberOf TypeSelect_Decorate
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
            *@memberOf TypeSelect_Decorate
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
            *@memberOf TypeSelect_Decorate
            *@name FireEvent$selectAdd
            *@description [功能]列表的添加功能
            *[思路]使用jquery的dom操作完成，原来这个函数在CMSMgrDefaultSingleControl中的，被移植到这里
            *@param dom 选中的dom信息
            */
            "selectAdd": function(dom) {
                //找到最后一行name[idx]
                var Col = $(dom).parent().prev().find(">tbody>tr");
                var lastCol = Col.eq(Col.length - 1);
                var idxDom = lastCol.find("[type=checkbox][idx]");
                var idx = parseInt(idxDom.attr("idx")) + 1;
                //克隆空白行
                var newLine = this.API.show("newLine", idx, "_");
                lastCol.after(newLine);
            },
            /**
            *@function
            *@memberOf TypeSelect_Decorate
            *@name FireEvent$maskOk
            *@description [功能]确认添加
            *[思路]获取对象，然后写入指定的值
            */
            "maskOk": function() {
                //获取对象值
                var typeObj = FW.use().getFormValue("typeSelectForm");
                //转换值类型
                var resultObj = {};
                for (var i = 0; i < typeObj.type.length; i++) {
                    resultObj[typeObj.type[i].name] = typeObj.type[i].value;
                }
                var result = FW.use().toJSONString(resultObj);
                this.MY.orgDom.value = result;
                FW.unblockUI();
            }
        },
        view: {
            'main': require("./resource/TypeSelect_Decorate/main.tpl"),
            'maskList': require("./resource/TypeSelect_Decorate/maskList.tpl"),
            'newLine': require("./resource/TypeSelect_Decorate/newLine.tpl")
        }

    },
    module);
    return FW;
});