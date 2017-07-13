/**
* @namespace
* @name CMSMgrDefaultListSearchDecorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/CMSMgrListSearchDecorate");
    FW.register({
        "name": "CMSMgrDefaultListSearchDecorate",
        "extends": ["CMSMgrListSearchDecorate"],
        view: {
            'CMSMgrDefaultListSearchResourceView': require("./resource/CMSMgrDefaultListSearchDecorate/CMSMgrDefaultListSearchResourceView.tpl")
        }
    },module);
    return FW;
});