/**
* @namespace
* @name CMSMgrListFilterDecorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("../CMSMgrDecorate");
    FW.register({
        "name": "CMSMgrListFilterDecorate",
        "extends": ["CMSMgrDecorate"],
        /**
        *@function
        *@memberOf CMSMgrListFilterDecorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            //toDO
        },
        "public": {
            /**
            *@function
            *@memberOf CMSMgrListFilterDecorate
            *@name public$getCfgSetting
            *@description 调用父类方法，真实key值部分，转换成对象
            *@param domSelector 进行判断的jqueryselector
            *@return 返回设置的对象
            */
            "getCfgSetting": function(domSelector) {
                var resultObj = this.API.father("getCfgSetting", domSelector);
                if (resultObj != null && resultObj != "") {
                    for (var i = 0; resultObj.length && i < resultObj.length; i++) {
                        if (resultObj[i].filterValue) {
                            resultObj[i].filterValue = eval("(" + resultObj[i].filterValue + ")");
                        }
                    }
                }
                return resultObj;
            },
            /**
            *@function
            *@memberOf CMSMgrListFilterDecorate
            *@name public$search
            *@description [功能]用传入的每个字段的关键字进行查询
            *[思路]调用父类进行查询
            *这里凡是要改变数据内容的操作，我真不觉得直接调用数据查询再进行ajax调用是什么好方法，我是觉得这种应该将查询的内容放入到所谓的url参数中，然后通过我们所谓的内部跳转去实现这个方法。这样会比较好。
            *最后，检查过java的方法，cms很固定param就是要查询的参数，直接写。另外加一个可选参数就是method，如果这个字段有值，任意一个值，他都将会改变成模糊查询的
            *@param funName 要调用的函数名
            *@param funParam 要调用的参数值
            *@param keyArray [
            {
            fieldName:"字段名",
            fieldValue:"要查询的关键字"
            }
            ]
            */
            "search": function(funName, funParam, keyArray) {
				//清除掉其他的查询参数
				if (this.control.param.queryParam){
					delete this.control.param.decoratorCtr;
				}
				
                //设置自己的参数
                this.control.param.decoratorCtr = {};
             
                this.control.param.decoratorCtr.searchObj = keyArray;
                //直接获取control里面的查询函数
                if (this.control[funName]) {
                    this.control[funName](funParam, keyArray);
                    return;
                }
            },
            /**
            *@function
            *@memberOf CMSMgrListFilterDecorate
            *@name public$filter
            *@description [功能]用传入的每个字段的关键字进行过滤查询
            *[思路]调用父类进行查询
            *这里凡是要改变数据内容的操作，我真不觉得直接调用数据查询再进行ajax调用是什么好方法，我是觉得这种应该将查询的内容放入到所谓的url参数中，然后通过我们所谓的内部跳转去实现这个方法。这样会比较好。
            *最后，检查过java的方法，cms很固定param就是要查询的参数，直接写。另外加一个可选参数就是method，如果这个字段有值，任意一个值，他都将会改变成模糊查询的
            *@param funName 要调用的函数名
            *@param funParam 要调用的参数值
            *@param keyArray [
            {
            fieldName:"字段名",
            fieldValue:"要查询的关键字"
            }
            ]
            */
            "filter": function(funName, funParam, keyArray) {
				//参数设置
				var key = keyArray.key;
				var value = keyArray.value;
				
				//如果进行了search查询，则删除所有查询条件
				if (this.control.param.method){
					delete this.control.param.method;
					this.control.param.queryParam = {};
					delete this.control.param.decoratorCtr.searchObj
				}
				
				//设置当前的数据
				if (!this.control.param.decoratorCtr){
					this.control.param.decoratorCtr = {};
				}
				if (!this.control.param.decoratorCtr.filterObj){
					this.control.param.decoratorCtr.filterObj = {};
				}
				//这里之所以要加%是因为兼容原来的设置，主要是视图显示的选中逻辑，懒得改了
				this.control.param.decoratorCtr.filterObj["%"+key+"%"] = value;
				
				//处理原来的条件
				if (this.control.param.queryParam){
					if (this.control.param.queryParam[key]){
						if (this.control.param.queryParam[key] == value){
							//完全一样的参数，就是取消过滤的操作
							delete this.control.param.queryParam[key];
							delete this.control.param.decoratorCtr.filterObj["%"+key+"%"];
							if (this.control[funName]) {
								this.control[funName](funParam, []);
								return;
							}
							return;
						}
						else{
							//把原来参数删除掉
							delete this.control.param.queryParam[key];
						}
					}
				}
				
				if (this.control[funName]) {
                    this.control[funName](funParam,  [{
						fieldName : key,
						fieldValue:value
					}]);
                    return;
                }
            }
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrListFilterDecorate
            *@name private$processingData
            *@description
            *@param data data
            */
            "processingData": function(data) {
                var CMSMgrDefaultListFilterDecorate = null;
				
                //筛选位置数据
				if (!this.control.param.decoratorCtr){
					this.control.param.decoratorCtr = {};
				}
                if (data.orgData.data.cmsmetadata.dataMemo && data.orgData.data.cmsmetadata.dataMemo.aliasCfg && data.orgData.data.cmsmetadata.dataMemo.aliasCfg.filterSet) {
                    CMSMgrDefaultListFilterDecorate = {
                        data: FW.use().evalJSON(data.orgData.data.cmsmetadata.dataMemo.aliasCfg.filterSet),
                        selectData: this.control.param.decoratorCtr.filterObj
                    };
                }
                //进一步处理
                var _data = {};
                _data.filterData = CMSMgrDefaultListFilterDecorate && CMSMgrDefaultListFilterDecorate.data;
                _data.selectData = CMSMgrDefaultListFilterDecorate && CMSMgrDefaultListFilterDecorate.selectData;
                //设置查询的值
                var searchData = this.control.param.decoratorCtr && this.control.param.decoratorCtr.searchObj;
                //把原来的查询的关键字设置回去
                if (searchData != null) {
                    for (i = 0; _data.filterData != null && i < _data.filterData.length; i++) {
                        var one = _data.filterData[i];
                        if (one.type == "search") {
                            for (var k = 0; k < one.filterValue.length; k++) {
                                for (var j = 0; j < searchData.length; j++) {

                                    if (searchData[j].fieldName == one.filterValue[k].Value) {
                                        one.filterValue[k].fieldValue = searchData[j].fieldValue;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                //2015年10月31日11:06:01 FrankCheng 添加描述数据 用于制作时间域选择
                if (data.metadata && CMSMgrDefaultListFilterDecorate != void 0) {
                    _data.metadata = data.metadata;
                }
                return CMSMgrDefaultListFilterDecorate && CMSMgrDefaultListFilterDecorate.data ? _data: null;
            },
            /**
            *@function
            *@memberOf CMSMgrListFilterDecorate
            *@name private$filterShowStr
            *@description [功能]过滤掉null的显示，用于魔板调用的方法
            *@param str 显示的字符串
            */
            "filterShowStr": function(str) {
                //判断字符串是否为空
                if (str == null) {
                    return "";
                }
                return str;
            }
        }
    },
    module);
    return FW;
});