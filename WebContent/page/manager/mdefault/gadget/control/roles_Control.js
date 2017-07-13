/**
* @namespace
* @name roles_Control 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("./CMSMgrDefaultListControl");
	require("./roleactiongroupSingle_Control");
	require("./roleactiongroup_Control");
    FW.register({
        "name": "roles_Control",
        "extends": ["CMSMgrDefaultListControl"],
        "param": {
            /**
            *@memberOf roles_Control
            *@name alias
            *@description comments
            */
            "alias": "roles"
        },
        "public": {
            /**
            *@function
            *@memberOf roles_Control
            *@name public$openGroup
            *@description
            *@param param
            *@param cid
            */
            "openGroup": function(param, cid) {
                var url = "";
				
				//用父节点查询参数
				url = FW.page.param2url(this.param,['nodeid','type']);
				
                url += "&nodeid=" + cid;
                url += "&type=roleactiongroup";
                FW.page.createControl(url);
            }
        }
    },module);
    return FW;
});