/**
* @namespace
* @name CMSMgrDefaultNodeDecorate 
* @version 0.01 罗光瑜 更换目录树显示实例
* @description  左边菜单树，点击的时候，默认是不给type或者照操原来的参数
*但是param中的clickType参数，是可以强制指定对应的参数的。这个参数，没有默认值，所以没有在类中声明，但是会出现在代码中，treeSelectct中       
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/CMSMgrNodeDecorate");
    require("../../plugin/treeview/treeView");
    FW.register({
        "name": "CMSMgrDefaultNodeDecorate",
        "extends": ["CMSMgrNodeDecorate"],
        /**
        *@function
        *@memberOf CMSMgrDefaultNodeDecorate
        *@name onCreate$onCreate
        *@description [功能]初始化创建treeView实例
        *[思路]这里描述实现的基本思路
        */
        "onCreate": function() {
            //创建目录树实例
            this.MY.treeView = FW.createApp("treeview", "treeView", this);
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrDefaultNodeDecorate
            *@name private$afterShowProcessor
            *@description [功能]显示以后处理目录树内容，同时这里要设置事件使得节点树数据和实际的要一样
            *[思路]这里用treeview结构树处理
            *@param data 传入的数据内容
            */
            "afterShowProcessor": function(data) {
                //判断是否要处理
                if (!this.MY.data) {
                    return;
                }
                //处理当前选中数据
                if (this.MY.data.select) {
                    this.API.private('setAttByCid', this.MY.data.select, {
                        selected: true
                    },
                    null, {
                        selected: false
                    })
                }
                //显示树
                this.MY.treeView.init(this.MY.data.treeData, null, "nodeTree");
                //设置事件
                var _this = this;
                this.MY.treeView.setEventCall(function(e, o) {
                    var node = o.info[0];
                    var cid = node.cid;
                    var expanded = o.info[0].state.expanded;
                    _this.API.private('setAttByCid', cid, {
                        expanded: true
                    });
                    FW.use().save("treedata_" + _this.MY.data.treeSign, _this.MY.data);
                    _this.API.private("treeSelect", cid);
                });

                this.MY.treeView.setEventCall(function(e, o) {
                    var node = o.info[0];
                    var cid = o.info[0].cid;
                    var expanded = o.info[0].state.expanded;
                    _this.API.private('setAttByCid', cid, {
                        expanded: true
                    });
                    FW.use().save("treedata_" + _this.MY.data.treeSign, _this.MY.data);
                },
                "nodeExpanded");

                this.MY.treeView.setEventCall(function(e, o) {
                    var node = o.info[0];
                    var cid = o.info[0].cid;
                    var expanded = o.info[0].state.expanded;
                    _this.API.private('setAttByCid', cid, {
                        expanded: false
                    });
                    FW.use().save("treedata_" + _this.MY.data.treeSign, _this.MY.data);
                },
                "nodeCollapsed");
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultNodeDecorate
            *@name private$setAttByCid
            *@description [功能]通过cid，去设置目录树数据
            *[思路]递归遍历每一个节点，然后进行设置
            *[接口.this.MY.data.treeData]实际的数据信息
            *@param cid 要设置的cid
            *@param attObj json结构的对象值
            *@param parent 父亲节点，表名是否是父亲，如果为空，则不是父亲
            *@param notObj 如果不能匹配到cid，则进行这个赋值。不填则不不赋值
            *@return 如果找到了，就返回true，否则返回false
            */
            "setAttByCid": function(cid, attObj, parent, notObj) {
                //获取并设置本层的值
                //--因为递归每次循环不同的层，这里实际对第三个参数进行处理
                var dataObj = parent || this.MY.data.treeData;
                //while(所有本层信息){进行查询和赋值
                for (var i = 0; i < dataObj.length; i++) {
                    //取出数据单个循环数据
                    var one = dataObj[i];
                    //if(符合cid){设置值
                    if (cid == one.cid) {
                        //设置，并且return true
                        for (var n in attObj) {
                            one[n] = attObj[n];
                        }
                        //if(notObj没有赋值){直接返回true
                        if (!notObj) {
                            //直接返回
                            return true;
                        }
                        //}
                    }
                    //}
                    //else if(notObj有赋值){则进行赋值
                    else if (notObj) {
                        //进行赋值操作
                        for (var n in notObj) {
                            one[n] = notObj[n];
                        }
                    }
                    //}
                    //if(有子节点){递归设置
                    if (one.children) {
                        //递归调用
                        var dresult = this.API.private('setAttByCid', cid, attObj, one.children, notObj);
                        //if(递归结果是真，就是找到了，且notObj没有赋值){返回真
                        if (dresult && !notObj) {
                            //返回真
                            return true;
                        }
                        //}
                    }
                    //}
                }
                //}
                //返回假
                return false;
            }
        },
        view: {
            'CMSMgrDefaultNodeResourceView': require("./resource/CMSMgrDefaultNodeDecorate/CMSMgrDefaultNodeResourceView.tpl")
        }

    },
    module);
    return FW;
});