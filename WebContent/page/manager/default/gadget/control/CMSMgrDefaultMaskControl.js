/**
* @namespace
* @name CMSMgrDefaultMaskControl 
* @version 1.0 罗光瑜 本次修改重点是将mask的蒙版节点创建移动到selector中，本节点尽量保持和普通的control相同
* @description  蒙版的id是在param中的binddomid  
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    FW.register({
        "name": "CMSMgrDefaultMaskControl",
        "extends": ["CMSMgrControl"],
        /**
        *@function
        *@memberOf CMSMgrDefaultMaskControl
        *@name onCreate$onCreate
        *@description undefined
        */
        "onCreate": function() {
            this.showContent("appMainView");
        },
        "public": {
            /**
            *@function
            *@memberOf CMSMgrDefaultMaskControl
            *@name public$showDecorates
            *@description
            */
            "showDecorates": function() {
                var decorates = this.API.private("getDecorates");

                var allData = {};
                //列表显示区数据
                var _start = this.param.start || 0;
                var _lengh = this.param.length || 10;
                var _method = this.param.method || null;
                var _queryObj = this.param.queryObj || null;
                var _spes = this.param.spes || null;
                var _param = this.param.queryParam || null;
                var _CMSMgrDefaultListViewDecorate = this.queryData(this.param.alias, _param, _start, _lengh, _method, _queryObj, _spes);
                var _CMSMgrDefaultListViewDecorateMetadata = this.handleMetaDataBefore(_CMSMgrDefaultListViewDecorate.data);
                var _CMSMgrDefaultListViewDecorateData = this.handleDataBefore(_CMSMgrDefaultListViewDecorate.data, _CMSMgrDefaultListViewDecorateMetadata);
                allData.CMSMgrDefaultListViewDecorate = {
                    data: _CMSMgrDefaultListViewDecorateData,
                    metadata: _CMSMgrDefaultListViewDecorateMetadata
                };
                var _CMSMgrDefaultListPaginationDecorate = this.queryDataCount(this.param.alias, this.param.queryParam);
                var _CMSMgrDefaultListPaginationDecorateMetadata = this.handleMetaDataBefore(_CMSMgrDefaultListPaginationDecorate.data);
                var _CMSMgrDefaultListPaginationDecorateData = this.handleDataBefore(_CMSMgrDefaultListPaginationDecorate.data, _CMSMgrDefaultListPaginationDecorateMetadata);
                allData.CMSMgrDefaultListPaginationDecorate = {
                    data: _CMSMgrDefaultListPaginationDecorateData
                };

                if ($("#appMainView_appSelector").length == 0) {
                    $("body").append("<div id='appMainView_CMSMgrControl'></div>");
                }
                if ($("#mask-modal").length == 0) {
                    $("body").append("<div id='mask-modal' class='modal-backdrop  in'></div>");
                }

                this.createDecorateApps(decorates);
                var appData = FW.getApp("CMSMgrDefaultListView").getDisplayData(allData);
                this.API.show("appMainView", appData, 'appMainView');
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultMaskControl
            *@name public$searchMultField
            *@description [功能]对多个字段进行查询
            *[思路]这里只拼接url进行跳转，不做其他操作
            *@param otherParam 函数参数
            *@param funParam 函数参数
            */
            "searchMultField": function(otherParam, funParam) {
                var url = "abc?";
                var first = true;
                //用父节点查询参数
                url = FW.page.param2url(this.param, ['queryParam', 'start', 'length', 'decoratorCtr', 'method']);
                //处理查询参数
                for (var i = 0; i < funParam.length; i++) {
                    var name = funParam[i].fieldName;
                    var value = funParam[i].fieldValue;
                    if (first) {
                        first = false;
                    } else {
                        url += "&"
                    }
                    url = url + name + "=" + encodeURIComponent("%" + value + "%");
                }
                //补充method方法
                url = url + "&method=search";
                FW.page.createControl(url, this);
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultMaskControl
            *@name public$go2page
            *@description 分页的相应事件
            *@param page 页码(0为第一页)
            */
            "go2page": function(page) {
                var url = "abc?";
                var first = true;
                //用父节点查询参数
                url = FW.page.param2url(this.param, ['start']);
                url += "&start=" + page;
                FW.page.createControl(url, this);
            }
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrDefaultMaskControl
            *@name private$pagination
            *@description
            */
            "pagination": function(start, count) {
                if (!start) {
                    start = 0;
                }
                var pageCount = Math.ceil(count / 10);
                var nowPage = start % 10;
                if (nowPage == 0) {
                    nowPage = start / 10;
                } else {
                    nowPage = Math.floor(start / 10);
                }
                return {
                    "pageCount": pageCount,
                    "nowPage": nowPage
                };
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultMaskControl
            *@name private$getDecorates
            *@description 获取所有decorate数据
            */
            "getDecorates": function() {
                return [{
                    gadgetName: "CMSMgrDefaultListFilterDecorate",
                    view: "CMSMgrDefaultListFilterResourceView",
                    instance: "CMSMgrDefaultListFilterDecorate",
                    children: [{
                        gadgetName: "CMSMgrDefaultListViewDecorate",
                        view: "CMSMgrDefaultMaskListViewResourceView",
                        instance: "CMSMgrDefaultListViewDecorate",
                        children: [{
                            gadgetName: "CMSMgrDefaultListPaginationDecorate",
                            view: "CMSMgrDefaultListPaginationResourceView",
                            instance: "CMSMgrDefaultListPaginationDecorate"
                        }]
                    }]
                }];
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultMaskControl
            *@name private$processorShowData
            *@description 处理显示数据
            */
            "processorShowData": function() {
                //定义所有数据
                var allData = null;
                //请求当前alias数据
                var _queryData = this.queryData();
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
                if (window.customized && window.customized[_metadata.alias] && window.customized[_metadata.alias].listButton) {
                    _listBtnData = FW.use().evalJSON(window.customized[_metadata.alias].listButton);
                }

                allData.titleData = _titileData;
                allData.btnData = _listBtnData;
                return allData;
            }
        },
        "TrigerEvent": {
            /**
            *@function
            *@memberOf CMSMgrDefaultMaskControl
            *@name TrigerEvent$closeMask
            *@description
            */
            "closeMask": function() {
                $("#mask-modal").remove();
                this.API.show("");
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultMaskControl
            *@name TrigerEvent$maskChooseData
            *@description
            */
            "maskChooseData": function() {
                var alias = this.param.alias;
                //获取数据
                var data = {};
                $("input[type='radio']:checked").parent().parent().find("td[key]").each(function() {
                    var key = $(this).attr("key");
                    var value = $(this).text().trim();
                    eval("data." + key + "='" + value + "'||'';");

                });
                //关闭模型
                $("#mask-modal").remove();
                this.API.show("");
                //设置数据
                for (var i in data) {
                    $("[outer-data^='" + alias + "." + i + "']").val(data[i]);
                }
            }
        },
        view: {
            'appMainView': require("./resource/CMSMgrDefaultMaskControl/appMainView.tpl")
        }

    },
    module);
    return FW;
});