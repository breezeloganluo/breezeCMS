/**
* @namespace
* @name CMSMgrTagDecorate 
* @version v0.01 罗光瑜 重新修复，同时增加tag在添加页面不显示tag分页的功能
* @description  tag页的处理类，原来的类脱离了编辑器，现在重新弄。
*这里有个坑：是否表单情况这里有一个坑，就是type一定是包含字符串single的才算是表单，是表单显示tag否则不显示的    
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("../CMSMgrDecorate");
    FW.register({
        "name": "CMSMgrTagDecorate",
        "extends": ["CMSMgrDecorate"],
        /**
        *@function
        *@memberOf CMSMgrTagDecorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            //toDO
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrTagDecorate
            *@name private$processingData
            *@description [功能]重载父类方法，处理列表中的一些数据
            *[思路]强制tag的时候，会传递mod参数，强制非tag的时候，也通过mod参数处理。剩余的就是默认情况，默认情况分成list和single两个情况分别处理。是否表单情况这里有一个坑，就是type一定是包含字符串single的才算是表单
            *@param data 传入的数据
            */
            "processingData": function(data) {
                //声明结果变量
                var CMSMgrTagDecorate = {};
                //if(mod==tag){根据本地存储更新tag
                if (this.control.param.mode && this.control.param.mode == "tag") {
                    //从本地存储中取数据
                    //--只要有tag就算是list类型也要显示
                    var tagInfo = FW.use().load("taginfo");
                    for (var i = 0; i < tagInfo.length; i++) {
                        if (tagInfo[i].alias == data.alias) {
                            tagInfo[i].selected = true;
                        } else {
                            tagInfo[i].selected = false;
                        }
                    }
                    CMSMgrTagDecorate.showData = tagInfo;
                }
                //}
                //else if(mode == node){将tag内容清除
                else if (this.control.param.mode && this.control.param.mode == "node") {
                    //清空
                    CMSMgrTagDecorate.showData = null;
                }
                //}
                //else{其他第一次的情况
                else {
                    //if (表单情况){处理tag页
                    if (/single/i.test(this.control.param.type)) {
                        //添加基本信息
                        CMSMgrTagDecorate.showData = [];
                        CMSMgrTagDecorate.showData.push({
                            type: "single",
                            alias: data.alias,
                            showName: "基本信息",
                            selected: true
                        });
                        //if (如果不是添加页面){把儿子循环出来
                        if (this.control.param.queryParam && this.control.param.queryParam.cid) {
                            //循环出儿子来
                            for (var i = 0; data.orgData.data.cmsmetadata.children && i < data.orgData.data.cmsmetadata.children.length; i++) {
                                CMSMgrTagDecorate.showData.push(data.orgData.data.cmsmetadata.children[i]);
                            }
                        }
                        //}
                        //保存本地存储
                        FW.use().save("taginfo", CMSMgrTagDecorate.showData);
                    }
                    //}
                    //else{清空数据
                    else {
                        CMSMgrTagDecorate.showData = null;
                    }
                    //}
                }
                //}
                //返回数据
                return CMSMgrTagDecorate;
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf CMSMgrTagDecorate
            *@name FireEvent$changeTag
            *@description [功能]点击tag页时的触发动作
            *[思路]待补充
            *@param direction 目标
            */
            "changeTag": function(direction) {
                //初始化参数
                //--isP当前是否为parentalias
                //--//miP判断目标是否为parentalias
                var url = "";
                var isP = false;
                var miP = false;
                //本地存储中取数据
                var tagInfo = FW.use().load("taginfo");
                //给isP和miP赋值
                //--isP当前是否为parentalias
                //--//miP判断目标是否为parentalias
                for (var i = 0; i < tagInfo.length; i++) {
                    if (this.control.param.alias == tagInfo[i].alias && tagInfo[i].type && tagInfo[i].type == "single") {
                        isP = true;
                    }
                    if (direction == tagInfo[i].alias && tagInfo[i].type && tagInfo[i].type == "single") {
                        miP = true;
                    }
                }
                //block(块){处理点击后的url
                //用父节点查询参数
                url = FW.page.param2url(this.control.param, ['mode', 'alias', 'type', 'nid', 'nodeid', 'cid']);
                for (var i in this.control.param) {
                    if (i == "queryParam") {
                        for (var j in this.control.param.queryParam) {
                            if (j == "cid") {
                                if (isP) {
                                    url += "&nodeid=" + this.control.param.queryParam[j];
                                } else if (miP) {
                                    continue;
                                } else {
                                    url += "&" + j + "=" + this.control.param.queryParam[j];
                                }
                            } else if (j == "nodeid") {
                                if (isP) {
                                    url += "&nid=" + this.control.param.queryParam[j];
                                } else if (miP) {
                                    url += "&cid=" + this.control.param.queryParam[j];
                                } else {
                                    url += "&" + j + "=" + this.control.param.queryParam[j];
                                }
                            } else {
                                url += "&" + j + "=" + this.control.param.queryParam[j];
                            }
                        }
                    } else {
                        if (i == "nid") {
                            if (isP) {
                                continue;
                            } else if (miP) {
                                url += "&nodeid=" + this.control.param[i];
                            } else {
                                url += "&" + i + "=" + this.control.param[i];
                            }
                        }
                    }
                }
                //目标alias
                url += "&alias=" + direction;
                //if (目标是父亲){type为single
                if (miP) {
                    //赋值type
                    //++这里是有问题的，因为父亲的type未必是single
                    url += "&type=single";
                }
                //}
                //else{type是list;mode是tag
                else {
                    //赋值type和mode
                    //++这里也是一样儿子的type未必是list
                    url += "&type=list";
                    url += "&mode=tag";
                }
                //}
                //}
                //还原single的history位置
                //--页面记录了每一次页面更换后的alias的位置，便于single返回list页面找到正确的list的type
                //--如果tag点击多次后返回最初的single页面，则需要手工将之前所有点击tag的history去除，保证下次返回，还是list页面
                if (miP) {

                    var controlObj = {
                        alias: direction,
                        control: "single"
                    };

                    var historyControl = FW.page.MY.controls.pop();

                    while (historyControl.type && historyControl.type == "mask") {
                        historyControl = FW.page.MY.controls.pop();
                    }

                    while (FW.page.MY.controls.length > 0 && (historyControl.alias != controlObj.alias || historyControl.type != controlObj.type)) {
                        if (/single/i.test(historyControl.type) && historyControl.alias == controlObj.alias) {
                            break;
                        }

                        historyControl = FW.page.MY.controls.pop();
                    }

                }
                //跳转
                FW.page.createControl(url);
            }
        }
    },
    module);
    return FW;
});