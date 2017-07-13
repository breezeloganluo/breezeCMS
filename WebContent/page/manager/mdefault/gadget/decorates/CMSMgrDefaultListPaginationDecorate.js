/**
* @namespace
* @name CMSMgrDefaultListPaginationDecorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/CMSMgrListPaginationDecorate");
    FW.register({
        "name": "CMSMgrDefaultListPaginationDecorate",
        "extends": ["CMSMgrListPaginationDecorate"],
        view: {
            'CMSMgrDefaultListPaginationResourceView': require("./resource/CMSMgrDefaultListPaginationDecorate/CMSMgrDefaultListPaginationResourceView.tpl")
        }
    },module);
    return FW;
});