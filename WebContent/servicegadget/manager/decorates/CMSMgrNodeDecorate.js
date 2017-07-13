/**
* @namespace
* @name CMSMgrNodeDecorate 
* @version 0,01 罗光瑜 2016-08-23 罗光瑜修改 treeSelect不应该有保留cid否则编辑页面切换回来列表就不对
* @description  左边菜单树，点击的时候，默认是不给type或者照操原来的参数
*但是param中的clickType参数，是可以强制指定对应的参数的。这个参数，没有默认值，所以没有在类中声明，但是会出现在代码中，treeSelectct中       
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("../CMSMgrDecorate");
    FW.register({
        "name": "CMSMgrNodeDecorate",
        "extends": ["CMSMgrDecorate"],
        /**
        *@function
        *@memberOf CMSMgrNodeDecorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            //toDO
        },
        "public": {
            /**
            *@function
            *@memberOf CMSMgrNodeDecorate
            *@name public$makeTreeData
            *@description
            *@param data 原始数据 请求后的未经过处理的数据
            */
            "makeTreeData": function(data) {
                var temp = {};
                var tree_data = [];

                for (var i = 0; i < data.cmsdata.length; i++) {
                    var t_cid = data.cmsdata[i].cid;
                    var t_alias = data.cmsdata[i].alias;
                    var t_nodeID = (data.cmsdata[i].nodeid || "");
                    var t_displayName = data.cmsdata[i].displayName;
                    var t_icon = data.cmsdata[i].icon;
                    if (data.cmsdata[i].ctalias) {
                        var t_ctalias = data.cmsdata[i].ctalias;
                    }
                    var selfData = {
                        name: t_displayName,
                        type: 'item',
                        cid: t_cid
                    };
                    var nodeid = (this.control.param.queryParam && this.control.param.queryParam.nodeid);
                    if (nodeid != null && nodeid == t_cid) {
                        selfData.selected = true;
                    }
                    if (t_ctalias) selfData.ctalias = t_ctalias;

                    if (temp[t_cid]) {
                        selfData.type = 'folder';
                        selfData.children = temp[t_cid].children;
                    }

                    temp[t_cid] = selfData;
                    if (t_nodeID == "" || t_nodeID == "0" || t_nodeID == "-1") {
                        tree_data.push(selfData);
                        continue;
                    }

                    var parent = temp[t_nodeID];
                    if (!parent) {
                        parent = {};
                        temp[t_nodeID] = parent;
                    }

                    parent.type = 'folder';
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(selfData);
                }
                return tree_data;
            }
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrNodeDecorate
            *@name private$processingData
            *@description 覆盖父类处理数据方法
            *@param data 数据
            */
            "processingData": function(data) {
                var treeSign = this.control.param.alias;
                var select = this.control.param.queryParam && this.control.param.queryParam.nodeid;
                //有缓存就从缓存中取数据
                var cacheData = FW.use().load("treedata_" + treeSign);
                if (cacheData) {
                    cacheData.select = select;
                    return cacheData;
                }
                //查询数据
                var tmpdata = null;
                if (data.orgData.data.cmsmetadata.parentAlias && data.orgData.data.cmsmetadata.alias != data.orgData.data.parentAlias && !this.control.param.mode) {
                    var _queryNodeData = this.control.queryData(this.control.param.alias, "-", null, null, null, 'father');
                    tmpdata = _queryNodeData
                }
                //整理数据
                if (tmpdata && tmpdata.data && tmpdata.data.cmsdata) {
                    var treeData = this.makeTreeData(tmpdata.data);
                    //++这是做什么的？   
                    return {
                        "treeData": treeData,
                        "select": select,
                        "treeSign": treeSign
                    };
                }
                return null;
            },
            /**
            *@function
            *@memberOf CMSMgrNodeDecorate
            *@name private$treeSelect
            *@description 点击某个节点后，处理对应的显示对象
            *@param cid 对应的cid
            */
            "treeSelect": function(cid) {
                //初始化变量url
                var url = "abc?";
                var first = true;
                //用父节点查询参数
                url = FW.page.param2url(this.control.param, ['start', 'length', 'type', 'nodeid', 'parentAlias', 'cid']);
                var myType = this.control.param.type;
                if (/single/i.test(myType)) {
                    var curCtr = FW.page.MY.curControl;
                    var lastCtr = FW.page.getLastControl(curCtr.alias, curCtr.type);
                    if (lastCtr && lastCtr.type) {
                        myType = lastCtr.type;
                    }
                }
                url += "&type=" + myType;
                //增加node节点标识
                url += "&nodeid=" + cid;
                //if (有父亲同时在tag页中的其他页面，这时要把parentAlias记录便于返回){
                if (this.control.MY.metadata.parentAlias && this.control.MY.metadata.parentAlias == this.control.MY.metadata.alias && this.control.param.type == "single") {
                    url += "&parentAlias=" + this.control.MY.metadata.alias;
                }
                //}
                //if(alias自己等于自己){强制设置type
                if (!this.param.clickType && this.control.MY.metadata.parentAlias && this.control.MY.metadata.parentAlias == this.control.MY.metadata.alias) {
                    //设置type信息
                    url += ("&type=single");
                }
                //}
                FW.page.createControl(url);
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf CMSMgrNodeDecorate
            *@name FireEvent$treeAdd
            *@description 添加顶级节点
            */
            "treeAdd": function() {
                //先清除缓存
                FW.use().save("treedata_" + this.MY.data.treeSign, null);
                var cid = $(".tree-selected");
                var url = "";
                //用父节点查询参数
                url = FW.page.param2url(this.control.param, ['type', 'queryObj', 'parentAlias', 'cpc_oper', 'mid']);

                url += "&type=single";
                url += "&queryObj=father";
                url += "&parentAlias=" + this.control.MY.metadata.parentAlias;
                //标识出这是添加父节点的操作
                url += "&cpc_oper=addNode";
                //判断添加节点
                //--这是做什么的，还请名剑解释，区分是添加顶节点还是子节点，如果存在是添加子节点，现在和cpc_oper重复了，可能没有用，要看一下保存事件有没有使用mid
                if (this.param.queryParam && this.control.MY.metadata.parentAlias && this.control.MY.metadata.parentAlias == this.control.MY.metadata.alias && this.control.param.queryParam && this.control.param.queryParam.nodeid && this.control.param.type == "single") {
                    url += "&mid=" + this.param.queryParam.nodeid;
                }

                FW.page.createControl(url);
            },
            /**
            *@function
            *@memberOf CMSMgrNodeDecorate
            *@name FireEvent$treeTopAdd
            *@description 添加顶级节点
            */
            "treeTopAdd": function() {
                //先清除缓存
                FW.use().save("treedata_" + this.MY.data.treeSign, null);
                var cid = $(".tree-selected");
                var url = "";
                //用父节点查询参数
                url = FW.page.param2url(this.control.param, ['nodeid', 'type', 'queryObj', 'parentAlias', 'cpc_oper', 'mid']);

                url += "&type=single";
                url += "&queryObj=father";
                url += "&parentAlias=" + this.control.MY.metadata.parentAlias;
                //标识出这是添加父节点的操作
                url += "&cpc_oper=addNode";
                //判断添加节点
                //--这是做什么的，还请名剑解释，区分是添加顶节点还是子节点，如果存在是添加子节点，现在和cpc_oper重复了，可能没有用，要看一下保存事件有没有使用mid
                if (this.param.queryParam && this.control.MY.metadata.parentAlias && this.control.MY.metadata.parentAlias == this.control.MY.metadata.alias && this.control.param.queryParam && this.control.param.queryParam.nodeid && this.control.param.type == "single") {
                    url += "&mid=" + this.param.queryParam.nodeid;
                }

                FW.page.createControl(url);
            },
            /**
            *@function
            *@memberOf CMSMgrNodeDecorate
            *@name FireEvent$treeMod
            *@description 树节点的修改
            */
            "treeMod": function() {
                //先清除缓存
                FW.use().save("treedata_" + this.MY.data.treeSign, null);
                var url = "";
                //用父节点查询参数
                url = FW.page.param2url(this.control.param, ['type', 'queryObj', 'parentAlias', 'cid']);

                url += "&type=single";
                url += "&queryObj=father";
                url += "&parentAlias=" + this.control.MY.metadata.parentAlias;
                url += "&cid=" + this.control.param.queryParam.nodeid;

                FW.page.createControl(url);
            },
            /**
            *@function
            *@memberOf CMSMgrNodeDecorate
            *@name FireEvent$treeDel
            *@description 删除一个树节点
            */
            "treeDel": function() {
                //先清除缓存
                FW.use().save("treedata_" + this.MY.data.treeSign, null);
                var nodeid = this.control.param.queryParam && this.control.param.queryParam.nodeid;
                var _this = this;

                if (nodeid) {
                    var param = {
                        "alias": this.control.param.alias,
                        "param": {
                            "cid": nodeid
                        }
                    };
                    if (confirm("确定要删除吗？")) {
                        var code = this.API.doServer("deleteNode", "cms", param).code;
                        if (code == 0) {
                            var url = "";
                            //用父节点查询参数
                            url = FW.page.param2url(this.control.param, ['nodeid', 'queryObj', 'parentAlias']);

                            FW.page.createControl(url);
                        }
                    }
                }
            }
        }
    },
    module);
    return FW;
});