/**
* @namespace
* @name CMSTreeLeftMenu 
* @version 0.01 罗光瑜 2014-06-1罗光瑜修改，增加对菜单状态的控制
0.02 罗光瑜 进行权限校验时，用了delete函数删除节点，但这个会导致节点长度不正确
0.03 罗光瑜 将该类移动到公有方法servicegadget中，取消了一些和页面相关的方法
* @description  处理左边的管理后台的菜单树，使用的alias是leftmenu                        
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    FW.register({
        "name": "CMSTreeLeftMenu",
        "param": {
            /**
            *@memberOf CMSTreeLeftMenu
            *@name displayName
            *@description 栏目树显示的栏目字段名 默认为displayName	格式{"xxxalias":"fieldName"};
            */
            "displayName": null,
            /**
            *@memberOf CMSTreeLeftMenu
            *@name alias
            *@description 左边菜单树的请求alias，通过此配置，可以让菜单树从不同的地方获取树节点结构
            */
            "alias": "leftmenu",
            /**
            *@memberOf CMSTreeLeftMenu
            *@name clearCach
            *@description 判断是否在onCreate的时候，清除缓存信息
            */
            "clearCach": false,
            /**
            *@memberOf CMSTreeLeftMenu
            *@name treeDate
            *@description 为空，则用传统的数据方式到数据口中查询数据
            *否则用本结构数据进行树显示
            *{
            *  "菜单名称",
            *  url:"如果是父节点则为空",
            *  "child":{
            *  }
            *}
            */
            "treeDate": null

        },
        /**
        *@function
        *@memberOf CMSTreeLeftMenu
        *@name onCreate$onCreate
        *@description 初始化方法
        */
        "onCreate": function() {
            this.showMenu();
        },
        "public": {
            /**
            *@function
            *@memberOf CMSTreeLeftMenu
            *@name public$showMenu
            *@description [功能]根据输入的数据，进行整体的菜单展现
            *[思路]显示菜单树
            */
            "showMenu": function() {
                //声明数据变量
                var treeData = [];
                //if(参数有传递数据内容){使用数据结构内容构造数据并显示
                if (this.param.treeDate) {
                    //block(递归){递归赋值
                    //--输入的是当前的节点    
                    //--输出的是本层的搞好的节点
                    var processData = function(pdata) {
                        var result = [];
                        for (var n in pdata) {
                            var oneData = pdata[n];
                            result.push({
                                name: n,
                                type: ((oneData.url) ? "item": "floder"),
                                cid: n,
                                url: oneData.url
                            });
                            if (oneData.children) {
                                result[n].children = processData(oneData.children);
                            }
                        }
                        return result;
                    }
                    //}
                    //调用这个函数，转换数据
                    treeData = processData(this.param.treeDate);
                }
                //}
                //else{创建树
                else {
                    //调用父类方法，创建树
                    treeData = this.API.private("createTreeData", this.param.alias);
                }
                //}
                this.API.private('menuDisplay', treeData);
            }
        },
        "private": {
            /**
            *@function
            *@memberOf CMSTreeLeftMenu
            *@name private$createTreeData
            *@description [功能]创建菜单数据结构
            *[思路]就是将以前doserver干的事情，拿过来在本地干一次，因为菜单数据已经在jsp中转换成脚本数据了
            *[cmsleftmenudata]左边菜单树
            */
            "createTreeData": function() {
                //预置数据
                var code = 0;
                var data = {
                    cmsdata: cmsleftmenudata
                };
                var result = [];
                //初始化栏目对象
                //--param: name , type , additionalParameters, children
                var temp = {};
                var tree_data = {};
                //for(遍历数据){整理每条数据
                for (var i = 0; i < data.cmsdata.length; i++) {
                    //block(--){整理参数
                    //栏目id
                    //--2014-05-23罗光瑜修改 cid 要用空格加上，这样才能保证排序顺序
                    var t_cid = " " + data.cmsdata[i].cid;
                    //栏目别名
                    var t_alias = data.cmsdata[i].alias;
                    //父栏目id
                    var t_nodeID = " " + (data.cmsdata[i].nodeid || "");
                    //栏目名称
                    var t_displayName = data.cmsdata[i]["displayName"];
                    //url
                    var t_url = data.cmsdata[i].menuUrl;
                    //图标相关
                    var t_iconclass = data.cmsdata[i].iconclass;
                    var t_iconimg = data.cmsdata[i].iconimg;
                    //处理模板
                    var template = data.cmsdata[i].template || "default";
                    if (template != this.param.template) {
                        continue;
                    }
                    //父亲节点处理
                    //--2013-11-26日罗光瑜修改，如果被挂接节点本身有父节点，也要正常显示,这是所有节点全部是父节点
                    //2014年7月29日 19:18:11 程明剑 屏蔽该验证
                    // var parentAlias = data.cmsmetadata && data.cmsmetadata.parentAlias;
                    // if (parentAlias && parentAlias != t_alias) {
                    //     t_nodeID = " " + 0;
                    //}
                    if (data.cmsdata[i].ctalias) {
                        var t_ctalias = data.cmsdata[i].ctalias;
                    }
                    //}
                    //block(块){整理自己
                    //创建初始化自己
                    var selfData = {
                        name: t_displayName,
                        type: 'item',
                        cid: t_cid,
                        url: t_url,
                        "icon-class": t_iconclass,
                        "icon-img": t_iconimg

                    };
                    if (t_ctalias) {
                        selfData.ctalias = t_ctalias;
                    }
                    //if (之前的假自己已经存在){将假自己合并过来到自己的真对象中
                    if (temp[t_cid]) {
                        //改变类型为folder类型，并合并儿子
                        selfData.type = 'folder';
                        selfData.children = temp[t_cid].children;
                    }
                    //}
                    //将整理好的自己，放入临时对象中
                    temp[t_cid] = selfData;
                    //处理图标，给出默认图标
                    if (t_iconclass == null || t_iconimg == null) {
                        if (selfData.type == "item") {
                            selfData["icon-class"] = "glyphicon glyphicon-leaf";
                            selfData.orgIconNull = true;
                        } else {
                            selfData["icon-class"] = "glyphicon glyphicon-list-alt";
                        }
                    }
                    //}
                    //block(块){处理父节点
                    //if(是顶级节点){结束单次遍历
                    if (t_nodeID == " " || t_nodeID == "0" || t_nodeID == " -1") {
                        //直接加入到临时列表中
                        tree_data[t_cid] = selfData;
                        //顶级节点直接加入到结果列表中
                        result.push(selfData);
                        //结束本次遍历
                        continue;
                    }
                    //}
                    //从临时对象中获取老爸
                    var parent = temp[t_nodeID];
                    //if (这个老爸不存在){造一个假老爸，并放入临时对象中
                    if (!parent) {
                        //造一个假老爸
                        parent = {
                            children: []
                        };
                        //丢到临时数据里面
                        temp[t_nodeID] = parent;
                    }
                    //}
                    //把自己加入到老爸中
                    //--老爸的结构是additionalParameters.children
                    parent.type = 'folder';
                    if (parent.orgIconNull == true) {
                        parent["icon-class"] = "glyphicon glyphicon-list-alt";

                    }
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(selfData);
                    //}
                }
                //}
                //校验权限
                this.API.private('checkLeftAuth', result);
                return result;
            },
            /**
            *@function
            *@memberOf CMSTreeLeftMenu
            *@name private$go2selector
            *@description 调用selector执行后续方法
            *@param param url参数
            */
            "go2selector": function(param) {
                var url4 = param.substring(0, 4);
                if (url4 == "http") {
                    window.open(param, "_blank");
                }
                FW.page.createControl(param);
            },
            /**
            *@function
            *@memberOf CMSTreeLeftMenu
            *@name private$checkLeftAuth
            *@description 左边菜单的权限校验
            *全局变量
            *window.authorityData ={
            *    "cms.modifyContent": [{ //这里是service权限，列出所有这个角色拥有的权限的service名称
            *        "actionid": 3,
            *        "actionName": "修改权限定义",
            *        "serviceName": "cms.modifyContent",
            *        "paramJson": {
            *            "alias": "action"
            *        },
            *        "paramJsonStr": "{alias:\u0027action\u0027}"
            *    }],
            *     "actionKey": [{//特殊的actionKey权限
            *        "actionid": 1196,
            *        "actionName": "项目统计",
            *        "serviceName": "actionKey",
            *        "actionKey": "projectStatistics"
            *    }]
            *}
            *这里是两套权限，任意一个有权限就是有权限了
            *@param treedata 树的数据
            */
            "checkLeftAuth": function(treedata) {
                //若不存在权限数据 将所有数据直接返回
                //--2014年12月13日16:07:06 FrankCheng 修改权限校验
                if (!authorityData) {
                    return treedata;
                }
                //block(块){声明一个递归的处理函数，每次分析一层
                //--反向遍历，因为这里要删除数组，反向遍历不受删除数组后的数组长度变化的影响
                function check(treedata) {
                    //for(当层的每一个节点){判断每个节点的权限
                    for (var i = treedata.length - 1; i >= 0; i--) {
                        //获取基本信息
                        var type = treedata[i].type;
                        var url = treedata[i].url;
                        var hasServiceAuth = false;
                        var hasActionAuth = false;
                        //if(是叶子节点){进行权限判断
                        if (type == "item") {
                            //获取基本信息
                            var norole = url && url.indexOf("norole");
                            if (!url) {
                                treedata.splice(i, 1);
                                continue;
                            }
                            if (norole != -1) {
                                continue;
                            }
                            var regexResult = /alias=(.+)&|alias=(.+)/ig.exec(url);
                            var alias = "";
                            if (regexResult != null) {
                                alias = regexResult[2];
                                if (alias == null) {
                                    alias = regexResult[1];
                                }
                            } else {
                                alias = url;
                            }
                            //进行第一次的service权限判断
                            var serverName = "cms.queryNode";
                            if (authorityData[serverName]) {
                                for (var j = 0; j < authorityData[serverName].length; j++) {
                                    if (authorityData[serverName][j].paramJson.alias == alias) {
                                        hasServiceAuth = true;
                                        break;
                                    }
                                }
                            }
                            //进行actionkey的权限判断
                            //--前面一个权限校验没有通过才进入此校验
                            if (!hasServiceAuth) {
                                regexResult = /actionKey=(.+)&|actionKey=(.+)/ig.exec(url);

                                var actionKey = "";
                                if (regexResult != null) {
                                    actionKey = regexResult[2];
                                    if (actionKey == null) {
                                        actionKey = regexResult[1];
                                    }
                                } else {
                                    actionKey = url;
                                }

                                var hasAuth = false;
                                outer: for (var k in authorityData) {
                                    if (k.indexOf("cms") != -1) {
                                        continue;
                                    }
                                    if (k == actionKey) {
                                        hasActionAuth = true;
                                        break;
                                    }
                                    for (var kk = 0; kk < authorityData[k].length; kk++) {
                                        if (authorityData[k][kk].actionKey && authorityData[k][kk].actionKey == actionKey) {
                                            hasActionAuth = true;
                                            break outer;
                                        }
                                    }
                                }
                            }
                            //进行无权限的删除操作
                            if (!hasActionAuth && !hasServiceAuth) {
                                treedata.splice(i, 1);
                            }
                        }
                        //}
                        //else{否则就递归
                        else if (type == "folder") {
                            check(treedata[i].children);
                        }
                        //}
                    }
                    //}
                    //遍历删除无子菜单目录
                    for (var i = 0; i < treedata.length; i++) {
                        if (treedata[i] && treedata[i].type == "folder" && treedata[i].children != null) {
                            var allLength = 0;
                            for (var j = 0; j < treedata[i].children.length; j++) {
                                if (!treedata[i].children[j]) {
                                    continue;
                                }
                                allLength++;
                            }
                            if (allLength == 0) {
                                treedata.splice(i, 1);
                            } else {
                                continue;
                            }
                        }
                    }

                }
                //}
                //进行校验
                check(treedata);

                return treedata;
            },
            /**
            *@function
            *@memberOf CMSTreeLeftMenu
            *@name private$menuDisplay
            *@description [功能]真正的页面显示功能，这个类是给子类使用的，由子类继承并实现该方法
            *[思路]这里给出默认的原来实现
            *@param treeData 树的数据
            */
            "menuDisplay": function(treeData) {
                alert("应该由子类实现");
            }
        }
    },
    module);
    return FW;
});