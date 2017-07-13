/**
* @namespace
* @name TypeDecorate 
* @version 0.01 罗光瑜 初始版本
0.02 罗光瑜 为支持点击字段后能够排序，所以getTableHead函数传入的字段要多出一个字段名，同时要把control传入到子类中
* @description  这是类型Decorate的父类，即模型定义中的类型显示父类，原来全部在CMSMgrDecorate中，还是把它抽出来了    
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    FW.register({
        "name": "TypeDecorate",
        /**
        *@function
        *@memberOf TypeDecorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            //toDO
        },
        "public": {
            /**
            *@function
            *@memberOf TypeDecorate
            *@name public$getTypeDecorateData
            *@description 获取type类型decorate数据
            */
            "getTypeDecorateData": function() {
                //toDo
            },
            /**
            *@function
            *@memberOf TypeDecorate
            *@name public$getTypeDecorateDisplayData
            *@description 获取type类型decorate数据显示数据
            */
            "getTypeDecorateDisplayData": function() {
                //toDo
            },
            /**
            *@function
            *@memberOf TypeDecorate
            *@name public$getTypeDecorateEditData
            *@description 获取type类型decorate可编辑HTML返回数据
            *@param metadata 描述数据
            *@param data 显示数据
            *@return 可编辑HTML返回数据
            */
            "getTypeDecorateEditData": function(metadata, data) {
                return null;
            },
            /**
            *@function
            *@memberOf TypeDecorate
            *@name public$createTypeDecorateEditData
            *@description 创建type类型decorate
            *@param appId 实例名
            *@param type type类型
            *@param metadata 描述数据
            *@param data 显示数据
            */
            "createTypeDecorateEditData": function(appId, type, metadata, data) {
                var appName = type + "_Decorate";
                var app = null;
                try {
                    app = FW.createApp(appId, appName, this, appId);
                    return app.getTypeDecorateEditData(metadata, data);
                } catch(e) {
                    return "<div style='display:none'></div>";
                }
            },
            /**
            *@function
            *@memberOf TypeDecorate
            *@name public$createTypeDecorateListData
            *@description
            */
            "createTypeDecorateListData": function(appId, type, metadata, data) {
                var appName = type + "_Decorate";
                var app = null;
                try {
                    app = FW.createApp(appId, appName, this, appId);
                    return app.getTypeDecorateDisplayData(metadata, data);
                } catch(e) {
                    return "<script>$(this).parent().hide();</script>";
                }
            },
            /**
            *@function
            *@memberOf TypeDecorate
            *@name public$changeListOrderBy
            *@description [功能]给子类形成列表页头部时点击改变排序用
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
            },
            /**
            *@function
            *@memberOf TypeDecorate
            *@name public$getTableHeadDisplayData
            *@description [功能]支持点击后进行排序，使用的字段为：orderby :[ { name:xxxx desc:true } ]
            *@param type 使用的类型
            *@param title 标题名称
            *@param fieldName 字段名
            */
            "getTableHeadDisplayData": function(type, title, fieldName) {
                //初始化信息
                var appName = type + "_Decorate";
                var app = null;
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
                    //创建表头
                    app = FW.createApp(type + "_thead", appName, {},
                    type + "_head");
                    return app.getTableHeadDisplayData(title, fieldName, this.id, status);
                } catch(e) {
                    return "<th style='display:none'>不支持的显示类型</th>";
                }
            }
        }
    },
    module);
    return FW;
});