/**
* @namespace
* @name CMSMgrDefaultTagDecorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/CMSMgrTagDecorate");
    FW.register({
        "name": "CMSMgrDefaultTagDecorate",
        "extends": ["CMSMgrTagDecorate"],
        view: {
            'CMSMgrDefaultTagResourceView': require("./resource/CMSMgrDefaultTagDecorate/CMSMgrDefaultTagResourceView.tpl")
        }
    },module);
    return FW;
});