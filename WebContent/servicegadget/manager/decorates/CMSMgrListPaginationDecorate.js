/**
* @namespace
* @name CMSMgrListPaginationDecorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("../CMSMgrDecorate");
    FW.register({
        "name": "CMSMgrListPaginationDecorate",
        "extends": ["CMSMgrDecorate"],
        /**
        *@function
        *@memberOf CMSMgrListPaginationDecorate
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            //toDO
        },
        "public": {
            /**
            *@function
            *@memberOf CMSMgrListPaginationDecorate
            *@name public$pagination
            *@description 计算分页相关数据
            *@param start 启始位置
            *@param count 查询总数
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
            }
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrListPaginationDecorate
            *@name private$processingData
            *@description
            */
            "processingData": function(data) {
                var start = this.control.param && this.control.param.start;
                var count = data.count;
                return this.pagination(start, count);
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf CMSMgrListPaginationDecorate
            *@name FireEvent$go2page
            *@description 分页的相应事件
            *@param page 页码(0为第一页)
            */
            "go2page": function(page) {
				this.control.go2page(page * 10);
            }
        }
    },module);
    return FW;
});