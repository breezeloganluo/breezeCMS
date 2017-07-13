/**
* @namespace
* @name CMSMgrDefaultListControl 
* @version 1.01 FrankCheng 基本列表控制器初始版本
1.02 罗光瑜 删除了aftershow函数，使用默认的基类实现
* @description  默认列表控制器                                                                                           
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/CMSMgrControl");
    require("./CMSMgrDefaultSingleControl");
    require("./CMSMgrDefaultMaskControl");
    require("./CMSMgrModSingleControl");
    require("./debugpage_Control");
    require("../decorates/CMSMgrDefaultHeaderDecorate");
    require("../decorates/CMSMgrDefaultListFilterDecorate");
    require("../decorates/CMSMgrDefaultListPaginationDecorate");
    require("../decorates/CMSMgrDefaultListSearchDecorate");
    require("../decorates/CMSMgrDefaultListViewDecorate");
    require("../decorates/CMSMgrDefaultNodeDecorate");
    require("../decorates/CMSMgrDefaultTagDecorate");
    FW.register({
        "name": "CMSMgrDefaultListControl",
        "extends": ["CMSMgrControl"],
        /**
        *@function
        *@memberOf CMSMgrDefaultListControl
        *@name onCreate$onCreate
        *@description undefined
        */
        "onCreate": function() {
            this.showContent("CMSMgrControl");
        },
        "public": {
            /**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name public$batchDel
            *@description [功能]批量删除所有内容
            *[思路]读取页面上的复选框，把选购的复选框读取到，然后获取数据调用父亲方法进行处理
            */
            "batchDel": function() {
                //用jquery获取，并进行非空判断
                var _this = this;
                var allResult = true;
                var allSelected = $('input:checkbox:checked');
                if (allSelected.length == 0) {
                    FW.alert("请选中要删除内容");
                    return;
                }
                //用模式确认框确认是否删除
                var deleteFlag = false;
                FW.confirm("是否真的要删除内容？",
                function(r) {
                    deleteFlag = r;
                });
                if (!deleteFlag) {
                    return;
                }
                //block(用jquery获取页面所有选中的按钮){处理所有内容
                allSelected.each(function() {
                    //获取id
                    var name = this.name;
                    var execResult = /listMultiSelect(\d+)/i.exec(name);
                    if (execResult == null) {
                        return;
                    }
                    var idx = execResult[1];
                    //获取对象
                    var one = _this.MY.allData.data[idx];
                    if (one == null) {
                        alert("第" + idx + "条数据未找到");
                        allResult = false;
                        return;
                    }
                    //调用父类进行删除
                    var result = _this.deleteContent(null, one.cid);
                    //如果失败则alert提示
                    if (result == null || result != 0) {
                        FW.alert("删除第" + idx + "失败");
                        allResult = false;
                        return;
                    }
                });
                //}
                //没有失败就提示成功
                if (allResult) {
                    FW.alert("批量删除成功");
                }
                //刷新页面
                window.window.location.reload();
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name public$searchMultField
            *@description [功能]对多个字段进行查询
            *[思路]这里只拼接url进行跳转，不做其他操作
            *@param otherParam 函数参数
            *@param funParam 函数参数
            */
            "searchMultField": function(otherParam, funParam) {
                var url = "abc?";
                //用上层的api完成url修改
                url = FW.page.param2url(this.param, ['queryParam', 'start', 'length', 'method']);
                //2016-05-08
                //处理查询参数
                for (var i = 0; i < funParam.length; i++) {
                    var name = funParam[i].fieldName;
                    var value = funParam[i].fieldValue;

                    url = url + "&" + name + "=" + encodeURIComponent("%" + value + "%");
                }
                //补充method方法
                url = url + "&method=search";
                FW.page.createControl(url, this);
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name public$filterMultField
            *@description [功能]对多个字段进行过滤
            *[思路]这里只拼接url进行跳转，不做其他操作
            *@param otherParam 函数参数
            *@param funParam 函数参数
            */
            "filterMultField": function(otherParam, funParam) {
                //用上层的api完成url修改
                url = FW.page.param2url(this.param, ['queryParam', 'start', 'length', 'method']);
                //处理查询参数
                for (var i = 0; i < funParam.length; i++) {
                    var name = funParam[i].fieldName;
                    var value = funParam[i].fieldValue;

                    url = url + "&" + name + "=" + encodeURIComponent(value);
                }

                FW.page.createControl(url, this);
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name public$openMod
            *@description 打开模型编辑框
            *@param param 参数类型，这里就是跳转的type
            *@param cid 标识符
            */
            "openMod": function(param, cid) {
                //if(cid或alias不存在){退出
                if (!cid || !this.param.alias) {
                    FW.alert("缺少关键参数alias或cid！");
                    return;
                }
                //}
                //else{打开新的页面
                else {
                    var url = "";
                    //用上层的api完成url修改
                    url = FW.page.param2url(this.param, ['type', 'queryObj', 'start', 'cid']);
                    //设定type
                    if (param) {
                        url += "&type=" + param;
                    } else {
                        url += "&type=single";
                    }
                    //设定cid
                    if (cid) {
                        url += "&cid=" + cid;
                    }
                    //调用页面转向
                    FW.page.createControl(url, this);
                }
                //}
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name public$deleteContent
            *@description 删除选中数据，注意因为要返回原来的list所以代码中不会使用delete的传入参数的type而是用原来url中type
            *@param type 指定type
            *@param cid 标识符
            *@param domid 节点标识
            *@param dom 节点
            */
            "deleteContent": function(type, cid, domid, dom) {
                //调用control的删除方法
                var result = this.API.father("deleteContent", type, cid, dom);
                if (result != 0) {
                    return result;
                }
                $(".modal").modal('hide');
                $(".modal-backdrop").hide();
                $("body").removeClass("modal-open");
                //重新刷新页面
                var url = "";
                //用上层的api完成url修改
                url = FW.page.param2url(this.param, ['queryObj']);
                FW.page.createControl(url, this);
                return 0;
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name public$openAdd
            *@description 打开添加页面
            */
            "openAdd": function(param) {
                var url = "";
                //用上层的api完成url修改
                url = FW.page.param2url(this.param, ['type']);

                if (param) {
                    url += "&type=" + param;
                } else {
                    url += "&type=single";
                }
                FW.page.createControl(url, this);
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name public$exportExcel
            *@description 导出excel
            */
            "exportExcel": function() {
                var url = "";
                //用上层的api完成url修改
                url = FW.page.param2url(this.param);
                //url += "&type=exportExcel";
                //FW.page.createControl(url,this);
                url = "?" + /\?.*/.exec(url)[0];
                window.open(Cfg.baseUrl + "/page/manager/CMSMgrExportExcel.jsp" + url, "_blank");
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name public$openDebug
            *@description 打开调试页面
            */
            "openDebug": function() {
                var url = "";
                //用上层的api完成url修改
                url = FW.page.param2url(this.param, ['type']);
                url += "&type=debugpage";
                FW.page.createControl(url, this);
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name public$go2page
            *@description 分页的相应事件
            *@param page 页码(0为第一页)
            */
            "go2page": function(page) {
                var url = "abc?";
                url = FW.page.param2url(this.param);
                url += "&start=" + page;
                FW.page.createControl(url, this);
            }
        },
        "private": {
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
                },
                {
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
            /**
            *@function
            *@memberOf CMSMgrDefaultListControl
            *@name private$processorShowData
            *@description 处理列表数据
            */
            "processorShowData": function() {
                //定义所有数据
                var allData = null;
                //请求当前alias数据
                var _queryData = this.queryData();
                //查询结果判断
                if (!_queryData || _queryData.code != 0) {
                    if (!_queryData) {
                        FW.alert("访问数据失败");
                    } else if (_queryData.code == 25) {
                        FW.alert("您没有权限进行本操作");
                    } else if (_queryData.code == 20) {
                        FW.alert("您没有权限/或页面已经超时请刷新页面");
                    } else {
                        FW.alert("操作错误,错误结果码是" + _queryData.code);
                    }
                    return null;
                }
                var _metadata = this.handleMetaDataBefore(_queryData.data);
                var _data = this.handleDataBefore(_queryData.data, _metadata);
                //分页数据
                var _queryCountData = this.queryDataCount(this.param.alias, this.param.queryParam, this.param.method);

                allData = {
                    alias: this.param.alias,
                    data: _data,
                    orgData: _queryData,
                    metadata: _metadata,
                    count: _queryCountData.data.cmsdata[0].count
                };
                //本gadget数据
                //--头部描述区显示数据
                var _titileData = _queryData.data.cmsmetadata.displayName;
                var _listBtnData = FW.use().evalJSON(window.systemCtx.listButton);
                if (window.customized && window.customized[this.param.alias] && window.customized[this.param.alias].listButton) {
                    _listBtnData = FW.use().evalJSON(window.customized[this.param.alias].listButton);
                }

                allData.titleData = _titileData;
                allData.btnData = _listBtnData;
                return allData;
            }
        },
        view: {
            'CMSMgrControl': require("./resource/CMSMgrDefaultListControl/CMSMgrControl.tpl"),
            'debugView': require("./resource/CMSMgrDefaultListControl/debugView.tpl")
        }

    },
    module);
    return FW;
});