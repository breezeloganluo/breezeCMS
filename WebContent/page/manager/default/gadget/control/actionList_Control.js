/**
* @namespace
* @name actionList_Control 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("./CMSMgrDefaultListControl");
	require("./actionSingle_Control");
    FW.register({
        "name": "actionList_Control",
        "extends": ["CMSMgrDefaultListControl"],
		"private":{
			/**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name private$getDecorates
            *@description 所有getDecorates数据
            */
            "getDecorates": function() {
                var result = [{
                    gadgetName: "CMSMgrDefaultHeaderDecorate",
                    view: "CMSMgrDefaultHeaderResourceView",
                    instance: "CMSMgrDefaultHeaderDecorate"
                },{
                    gadgetName: "CMSMgrDefaultNodeDecorate",
                    view: "CMSMgrDefaultNodeResourceView",
                    instance: "CMSMgrDefaultNodeDecorate",                    
                    children: [{
                        gadgetName: "CMSMgrDefaultTagDecorate",
                        view: "CMSMgrDefaultTagResourceView",
                        instance: "CMSMgrDefaultTagDecorate",
                        children: [{
                            gadgetName: "CMSMgrDefaultListFilterDecorate",
                            view: "CMSMgrDefaultListFilterResourceView",
                            instance: "CMSMgrDefaultListFilterDecorate",
                            children: [{
                                gadgetName: "CMSMgrDefaultListViewDecorate",
                                view: "CMSMgrDefaultListViewResourceView",
                                instance: "CMSMgrDefaultListViewDecorate",
                                children: [{
                                    gadgetName: "CMSMgrDefaultListPaginationDecorate",
                                    view: "CMSMgrDefaultListPaginationResourceView",
                                    instance: "CMSMgrDefaultListPaginationDecorate"
                                }]
                            }]
                        }]
                    }]
                }];
                return result;
            },
		},
        "TrigerEvent": {
            /**
            *@function
            *@memberOf actionList_Control
            *@name TrigerEvent$openAdd
            *@description
            *@param param 别名
            */
            "openAdd": function(param) {
                var url = "";
                //统一使用全局方法整理url
				//--2016-05-08 修改
				url = FW.page.param2url(this.param,['type']);
                if (param == "normal") {
                    url += "&type=single";
                } else {
                    url += "&type=actionSingle";
                }

                FW.page.createControl(url);
            }
        }
    },module);
    return FW;
});