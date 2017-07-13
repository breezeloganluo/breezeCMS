/**
* @namespace
* @name CMSMgrDecorate 
* @version 1.0 罗光瑜 这个版本主要是添加了initAfterShow机制，能够实现在html显示后，进行后续的js初始化工作
* @description  decorate api接口提供一些基本的decorate方法。
*一个decorate就是一个组件，包含了组件本身的基本数据处理的相关内容
*另外，组件本身也支持，设定到数据模型中进行设定和定义。
*相关的方法：getCfgInfo这个是入口方法，如果返回为null则表示不用数据模型设置
*getDisplayCfg获取用于模型设置时的显示页面表单
*getCfgSetting用于获取配置设置信息
*进行模型设置，将会给实例添加几个公有变量：configCtr创建和控制本实例的模型配置数据类型      
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    FW.register({
        "name": "CMSMgrDecorate",
        /**
        *@function
        *@memberOf CMSMgrDecorate
        *@name onCreate$onCreate
        *@description undefined
        */
        "onCreate": function() {},
        "public": {
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name public$getDisplayData
            *@description 返回HTML数据 用于普通decorate组件
            *会返回当前及当前组建所有子组件的HTML数据
            */
            "getDisplayData": function() {
                //获取数据
                var _allData = this.MY.data;
                //返回片段数据
                return this.API.show(this.param.view, _allData, "_");
            },
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name public$setData
            *@description 设置初始化的数据，放置在[ths.MY.data]中
            *@param data 设置的数据
            *@param setChild 开关，如果为true则设置儿子否则只设置自己
            */
            "setData": function(data, setChild) {
                //设置数据
                this.MY.data = this.API.private('processingData', data);
                //给儿子也设置数据
                if (this.param.decorates && setChild) {
                    for (var i = 0; i < this.param.decorates.length; i++) {
                        FW.getApp(this.param.decorates[i].instance).setData(data, setChild);
                    }
                }
            },
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name public$getCfgInfo
            *@description 获取系统配置的信息，默认返回是null，即没有配置
            */
            "getCfgInfo": function() {
                //返回空
                return null;
            },
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name public$getDisplayCfg
            *@description 返回显示显示配置的html片段
            *@param cfgObj 配置对象
            *@return 显示的html片段
            */
            "getDisplayCfg": function(cfgObj) {
                //显示配置信息
                return null;
            },
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name public$getCfgSetting
            *@description 由页面配置获取配置内容，提供默认方法，这种方法页面元素有前提要求：
            *$(domSelector).find("tr").not(".list-tr-hidden").find("td").not(".center")
            *并且值的标签使用属性attr-d来标识属性名的
            *@param domSelector 进行判断的jqueryselector
            *@return 返回设置的对象
            */
            "getCfgSetting": function(domSelector) {
                return null;
            },
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name public$initAfterShow
            *@description [功能]在外部大的html显示后，进行统一的处理，因为有可能会有部分的功能是需要在html出来后，进行js的初始化的，例如树组件
            *[思路]这里有两个处理，本处理给上层调用，而本调用由两个子函数组成，一个是负责真正初始化，另外一个是调用子decorate，所以这个方法不要重载
            */
            "initAfterShow": function(data) {
                //调用私有方法进行afterShow的初始化
                this.API.private('afterShowProcessor',data);
                //调用子类进行aftershow操作
                this.API.private('childrenAfterShow');
            }
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name private$getChildrenApp
            *@description
            */
            "getChildrenApp": function(id) {
                if (this.param.decorates) {
                    return FW.getApp(this.param.decorates[id].instance);
                }
            },
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name private$childrenData
            *@description 被模板调用，设置混合儿子的页面信息
            *@param idx 第几个儿子
            *@return 儿子的信息字符串
            */
            "childrenData": function(idx) {
                var app = this.API.private('getChildrenApp', idx);
                return app.getDisplayData();
            },
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name private$processingData
            *@description 处理数据
            *@param data 输入数据
            */
            "processingData": function(data) {
                return data;
            },
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name private$afterShowProcessor
            *@description [功能]这个类就是给公有方法initAfterShow调用的，进行真正的show后初始化。默认是空函数，给子类去实现
            *[思路]给子类实现的空函数
            */
            "afterShowProcessor": function(data) {
                //toDo
            },
            /**
            *@function
            *@memberOf CMSMgrDecorate
            *@name private$childrenAfterShow
            *@description [功能]这个函数主要是进行afterShow的初始工作，他的职责是调用子类的initAfterShow函数，让子类继续去afterShow。这个函数也将被childrenAfterShow去实现
            *[思路]这里描述实现的基本思路
            *[接口.this.MY.xxx]这里描述内部全局变量定义
            *[接口.service.pkg.name.param]{这里描述服务pkg.name要传入参数内容}
            *[接口.service.pkg.name.return]{这里描述doserver返回值的json的结构}
            */
            "childrenAfterShow": function() {
                //给儿子也设置数据
                if (this.param.decorates) {
                    for (var i = 0; i < this.param.decorates.length; i++) {
                        FW.getApp(this.param.decorates[i].instance).initAfterShow();
                    }
                }
            }
        }
    },
    module);
    return FW;
});