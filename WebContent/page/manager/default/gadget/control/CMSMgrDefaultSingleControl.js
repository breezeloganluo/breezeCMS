/**
* @namespace
* @name CMSMgrDefaultSingleControl 
* @version 1.01 FrankCheng 默认详情控制器初始版本
* @description  默认详情控制器                                                                   
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/CMSMgrControl");
    require("../decorates/CMSMgrDefaultNodeDecorate");
    require("../decorates/CMSMgrDefaultSingleViewDecorate");
    require("../decorates/CMSMgrDefaultTagDecorate");
    FW.register({
        "name": "CMSMgrDefaultSingleControl",
        "extends": ["CMSMgrControl"],
        /**
        *@function
        *@memberOf CMSMgrDefaultSingleControl
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            this.showContent("appMainView");
        },
        "public": {
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleControl
            *@name public$handleDataBefore
            *@description
            *@param data 数据
            *@param metadata 描述
            */
            "handleDataBefore": function(data, metadata) {
                var _data = this.API.father("handleDataBefore", data, metadata);
                return _data && _data[0];
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleControl
            *@name public$submit
            *@description 提交添加操作或者修改操作
            *@param type 操作的类型
            */
            "submit": function(type, data) {
                //防止被多次实例化时调用，比如在模型编辑的时候被调用 
                document.getElementById("maskLayer").style.display = "block";

                var _fun;
                var checkResult = true;
                //2015年11月3日16:10:56 FrankCheng 从描述数据中获取校验function使用eval进行执行
                //若该方法不存在、或者语法有错误 那么跳过执行 执行结果返回结果为false表示校验不通过 后续不会执行 其余返回结果表示成功
                if (this.MY.metadata.checkField) {
                    var fun = this.MY.metadata.checkField;
                    if (fun.indexOf("function") == 0) {
                        fun = "_fun=" + fun;
                    }
                    fun = "(" + fun + ")(data)";
                    try {
                        checkResult = eval(fun);
                    } catch(e) {
                        alert("您的校验方法有语法错误！");
                        //2015-12-07 FrankCheng 修复异常拦截
                        checkResult = false;
                    }
                }
                if (_fun && checkResult == false && _fun != void 0) {
                    //关闭遮罩层
                    document.getElementById("maskLayer").style.display = "none";
                    return;
                }

                if (this.param.parentAlias && this.param.queryObj && this.param.queryParam && this.param.queryParam.nodeid) {
                    data.nodeid = this.param.queryParam.nodeid;
                }
                //if (是自己挂接自己，而且是编辑操作){就强制删除nodeid
                if (this.param.parentAlias && this.param.parentAlias == this.param.alias && data.nodeid && this.param.queryParam.cpc_oper != "addNode") {
                    delete data.nodeid;
                }
                //}
                if (this.param.parentAlias && this.param.parentAlias == this.param.alias && this.param.mid) {
                    data.nodeid = this.param.mid;
                }
                if (this.param.type == "mask") {
                    this.MY._metadata = FW.use().load("singleMetadata");
                    this.param = FW.use().load("singleParam");
                    this.MY.metadata = FW.use().load("singleDataMetadata");
                    FW.use().save("singleMetadata", null);
                    FW.use().save("singleParam", null);
                    FW.use().save("singleDataMetadata", null);
                }

                if ((this.param.queryParam && this.param.queryParam.cid) || data.cid) {
                    var code = this.update(data);
                } else {
                    var code = this.addNew(data);
                }
                if (code == "0") {
                    FW.alert("操作成功!");
                    var url = "";
                    //用父节点查询参数
                    url = FW.page.param2url(this.param, ['queryObj', 'mid', 'type', 'cid']);

                    if (this.MY.metadata.parentAlias && this.MY.metadata.parentAlias == this.MY.metadata.alias) {
                        if (type) {
                            url += "&type=" + type;
                        } else {
                            url += "&type=single";
                        }
                    } else {
                        //if(参数传入type就用之){
                        if (type) {
                            url += "&type=" + type;
                        }
                        //}
                        //else{用堆栈返回
                        else {
                            var curCtr = FW.page.MY.curControl;
                            var lastCtr = FW.page.getLastControl(curCtr.alias, curCtr.type);
                            if (lastCtr && lastCtr.type) {
                                url += "&type=" + lastCtr.type;
                            }
                        }
                        //}
                    }
                    FW.page.createControl(url);
                } else if (code == 501) {
                    alert("你正在设置多表关键配置信息 值不能为空！");
                } else if (code == 502) {
                    alert("你正在设置多表关键配置信息 所配信息不符合标准或对应表不存在");
                } else if (code == 503) {
                    alert("你所修改的字段为存在多表关系 无法进行修改");
                } else if (code == 504) {
                    alert("你所设置的alias表必须为空表");
                } else if (code == 505) {
                    alert("若想删除多表关键字 必须确保没有多表模型！");
                } else if (code == 506) {
                    alert("你不能将多表关键表设置为多表模式！");
                } else if (code == 507) {
                    alert("你正在修改多表关键表，此表一经创建及配置 无法再次修改！");
                } else if (code == 508) {
                    alert("你正在操作关键表 此表只能添加数据！");
                }
                document.getElementById("maskLayer").style.display = "none";
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleControl
            *@name public$goBack
            *@description 返回列表页，
            *增加功能，在type为空的情况下，从control中返回对应的type值
            *@param type 返回的使用的control的type，这个值在统一的btnEvent中体现
            */
            "goBack": function(type) {
                var url = "";
                if (this.param.type == "mask") {
                    this.MY._metadata = FW.use().load("singleMetadata");
                    this.param = FW.use().load("singleParam");
                    this.MY.metadata = FW.use().load("singleDataMetadata");
                    FW.use().save("singleMetadata", null);
                    FW.use().save("singleParam", null);
                    FW.use().save("singleDataMetadata", null);
                }
                //用父节点查询参数
                url = FW.page.param2url(this.param, ['queryObj', 'type', 'cid']);
                //if(自己指向自己){强制变成single
                if (this.MY.metadata.parentAlias && this.MY.metadata.parentAlias == this.MY.metadata.alias) {
                    url += "&type=single";
                }
                //}
                //else{否则普通情况了
                else {
                    //if(参数传入type就用之){
                    if (type) {
                        url += "&type=" + type;
                    }
                    //}
                    //else{用堆栈返回
                    else {
                        var curCtr = FW.page.MY.curControl;
                        var lastCtr = FW.page.getLastControl(curCtr.alias, curCtr.type);
                        if (lastCtr && lastCtr.type) {
                            url += "&type=" + lastCtr.type;
                        }
                    }
                    //}
                }
                //}
                FW.page.createControl(url);
            }
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleControl
            *@name private$getDecorates
            *@description 所有getDecorates数据
            */
            "getDecorates": function() {
                return [{
                    gadgetName: "CMSMgrDefaultNodeDecorate",
                    view: "CMSMgrDefaultNodeResourceView",
                    dataId: "CMSMgrDefaultNodeDecorate",
                    instance: "CMSMgrDefaultNodeDecorate",
                    children: [{
                        gadgetName: "CMSMgrDefaultTagDecorate",
                        view: "CMSMgrDefaultTagResourceView",
                        dataId: "CMSMgrDefaultTagDecorate",
                        instance: "CMSMgrDefaultTagDecorate",
                        children: [{
                            gadgetName: "CMSMgrDefaultSingleViewDecorate",
                            view: "CMSMgrDefaultSingleViewResourceView",
                            dataId: "CMSMgrDefaultSingleViewDecorate",
                            instance: "CMSMgrDefaultSingleViewDecorate"
                        }]
                    }]
                }];
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleControl
            *@name private$checkData
            *@description 数据校验
            *@param data 页面数据
            */
            "checkData": function(data) {
                //toDo
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleControl
            *@name private$metadataSet
            *@description
            *@return toDo
            *@example toDO
            */
            "metadataSet": function() {
                var _this = this;
                var metadata = this.MY._metadata;
                outer: for (var i in metadata) {
                    if (metadata[i].ourterLink) {
                        FW.use().save("singleMetadata", metadata);
                        FW.use().save("singleParam", _this.param);
                        FW.use().save("singleDataMetadata", _this.MY.metadata);
                        break outer;
                    }
                }
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleControl
            *@name private$processorShowData
            *@description 处理显示数据
            */
            "processorShowData": function() {
                //定义所有数据
                var allData = null;
                //设定请求查询的参数
                //--single时使用
                var param = {};
                if (this.param.queryParam && this.param.queryParam.cid) {
                    param.cid = this.param.queryParam.cid;
                }
                if (this.param.parentAlias && this.param.parentAlias == this.param.alias && this.param.queryParam && this.param.queryParam.nodeid) {
                    param.cid = this.param.queryParam.nodeid;
                    if (this.param.mid) {
                        delete param.cid;
                    }
                }
                //请求当前alias数据
                var _queryData = this.queryData(this.param.alias, param);
                //查询结果判断
                if (!_queryData || _queryData.code != 0) {
                    if (!_queryData) {
                        FW.alert("访问数据失败");
                    } else if (_queryData.code == 25) {
                        FW.alert("您没有权限进行本操作");
                    } else if (_queryData.code = 20) {
                        FW.alert("由于长时间没有操作，请重新登录本系统");
                        location.reload();
                    } else {
                        FW.alert("操作错误,错误结果码是" + _queryData.code);
                    }
                    return null;
                }
                var _metadata = this.handleMetaDataBefore(_queryData.data);
                var _data = this.handleDataBefore(_queryData.data, _metadata);

                allData = {
                    alias: this.param.alias,
                    data: _data,
                    orgData: _queryData,
                    metadata: _metadata
                };
                //本gadget数据
                //--头部描述区显示数据
                var _titileData = _queryData.data.cmsmetadata.displayName;
                var _listBtnData = FW.use().evalJSON(window.systemCtx.listButton);
                if (window.customized && window.customized[_metadata.alias] && window.customized[_metadata.alias].listButton) {
                    _listBtnData = FW.use().evalJSON(window.customized[_metadata.alias].listButton);
                }

                allData.titleData = _titileData;
                allData.btnData = _listBtnData;
                return allData;
            }
        },
        view: {
            'appMainView': require("./resource/CMSMgrDefaultSingleControl/appMainView.tpl")
        }

    },
    module);
    return FW;
});