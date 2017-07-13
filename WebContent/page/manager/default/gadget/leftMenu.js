/**
* @namespace
* @name leftMenu 
* @version 0.01 罗光瑜 初始版本
* @description  左侧菜单树，注意只有简单的两层结构，没有意义上的真正的无限层次树，所以只做入口菜单用，不做其他用途      
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("../../../../servicegadget/manager/CMSTreeLeftMenu");
    FW.register({
        "name": "leftMenu",
        "extends": ["CMSTreeLeftMenu"],
        "public": {
            /**
            *@function
            *@memberOf leftMenu
            *@name public$setEventCall
            *@description [功能]设置目录树的点击事件的回调函数
            *[思路]先取消节点原来的事件，然后用jquery的bind方法重新绑定
            *[接口.this.MY.treeDom]当前绑定节点的dom包装器
            *@param eventfun 回调函数名
            function(e,o){
            e为jquery的x-event对象，这里是不可用的
            o为被选中节点结构如下：
            {
            info:[//多选时是选中的节点数组
            {
            被选中节点数据
            }
            ]
            }
            }
            *@param eventName 事件名，不填缺省为selected
            */
            "setEventCall": function(eventfun, eventName) {
                //直接设置
                this.MY.eventCall = eventfun;
            },
            /**
            *@function
            *@memberOf leftMenu
            *@name public$expDir
            *@description [功能]自动展开文件路径,注意，展开的目录会和初始目录进行比较，然后刨去初始部分
            *[思路]参考ace的目录树的展开原理，从顶层开始逐步判断展开
            *@param dir 文件路径，用/或者\做间隔符，例如：abc/sdf/dd
            */
            "expDir": function(dir) {
                //toDo
            },
            /**
            *@function
            *@memberOf leftMenu
            *@name public$init
            *@description [功能]初始化一棵树
            *[思路]将输入的数据转换成约定格式的数据
            *[接口.转换后树数据]{
            *            name: "基本信息",
            *            type: "item",
            *           其他自定义属性
            *        },
            *        "baseInfo2": {
            *            name: "第二个菜单",
            *            type: "folder",
            *            'additionalParameters': {
            *                 'children': {
            *                      'motorcycles': {
            *                                 name: 'Motorcycles',
            *                                 type: 'item'
            *                                 其他自定义属性
            *                       },
            *                      'boats': {
            *                                 name: 'Boats',
            *                                 type: 'item'
            *                                 其他自定义属性
            *                      }
            *                 }
            *             },
            *             其他自定义属性
            *        }
            *[接口.this.MY.treeDom]当前绑定节点的dom包装器
            *[接口.this.MY.getData]处理数据的回调函数
            *[接口.this.MY.DataSourceTree]treeview组件需要的一个数据对象onCreate中声明
            *@param data 目录树数据:
            [
            {
            name:"显示名称",
            type:"item/folder",
            icon-class:"添加的icon的class样式",
            icon-img:"图标地址",
            icon:"icon的样式内容，比如icon-music blue"，
            其他自定义属性,
            children:[儿子的内容，循环上面父亲的结构
            ]
            }
            ]
            *@param initParam 初始化的参数，结构如下：
            {
            multiSelect: false,提供默认设置
            }
            *@param target 放置目录树的节点id值，不填则为当前gadget的绑定对象
            *@return 返回首目录要处理成的数据内容
            */
            "init": function(data, initParam, target) {
                //合成属性数据和目录树数据
                var allData = {
                    tree: data,
                    param: initParam
                }
                //记录到内存中
                this.MY.data = allData;
                //取消所有事件
                $(".treeMenu").unbind();
                //show到页面上
                this.API.show("treeView", allData, target);
                //设置事件
                _this = this;
                $(".treeMenu").bind("click",
                function(event) {
                    var dataStr = "data" + $(this).attr("datapath");
                    var clickObj = eval("(" + dataStr + ")");
                    _this.MY.eventCall && _this.MY.eventCall(event, {
                        info: [clickObj]
                    });
                });
            },
            /**
            *@function
            *@memberOf leftMenu
            *@name public$_getMgrPagetSetting
            *@description [功能]返回页面的参数设置
            *[思路]直接静态写死要处理的数据，数据格式参见pagesetting_Control的注释说明
            *@param p1 toDo
            */
            "_getMgrPagetSetting": function(p1) {
                //直接返回
                return {
                    menubgcolor: {
                        title: "菜单树背景颜色",
                        type: "Text",
                        desc: "左侧菜单的背景颜色设置，例如#334433"
                    },
                    fontcolor: {
                        title: "字体颜色",
                        type: "Text",
                        desc: '设置前端字体的颜色，例如#334433'
                    }
                }
            }
        },
        "private": {
            /**
            *@function
            *@memberOf leftMenu
            *@name private$menuDisplay
            *@description [功能]真正的页面显示功能
            *[思路]调用树组件显示目录树
            *@param treeData 树的数据
            */
            "menuDisplay": function(treeData) {
                //显示树
                this.init(treeData);
                //设置树事件
                var _this = this;
                this.setEventCall(function(e, o) {
                    var url = o.info[0].url;
                    _this.API.private('go2selector', url);
                });
                //修改样式
                this.API.private('setCss');
            },
            /**
            *@function
            *@memberOf leftMenu
            *@name private$setCss
            *@description [功能]在整个菜单显示出来后，根据后台的设置，改变样式
            *[思路]用jquery去改变
            */
            "setCss": function() {
                //获取设置信息
                var allSettingStr = systemCtx["pagesetting_" + window.systemCtx.Template];
                if (allSettingStr == null) {
                    return;
                }
                var allSetting = eval("(" + allSettingStr + ")");
                if (allSetting == null) {
                    return;
                }
                //block(块){设置背景
                //设置正常背景
                var menubgcolor = allSetting.menubgcolor;
                if (menubgcolor != null && !/^\s*$/.test(menubgcolor)) {
                    $(".menubgcolor").css("background-color", menubgcolor);
                    $(".menu-first").css("background-color", menubgcolor);
                    $(".menu-first").css("border-top-color", menubgcolor);
                    //计算背景颜色和右边边框的值依据f5->ee = -7
                    var diff = -17;
                    var ri = "ff";
                    var gi = "ff";
                    var bi = "ff";
                    var execresult = /#([abcdef\d]{2})([abcdef\d]{2})([abcdef\d]{2})/i.exec(menubgcolor);
                    if (execresult != null) {
                        ri = execresult[1];
                        gi = execresult[2];
                        bi = execresult[3];
                    } else {
                        execresult = /#([abcdef\d])([abcdef\d])([abcdef\d])/i.exec(menubgcolor);
                        if (execresult != null) {
                            ri = execresult[1] + execresult[1];
                            gi = execresult[2] + execresult[2];
                            bi = execresult[3] + execresult[3];
                        }
                    }
                    var rs = this.API.private('settingToHex', (parseInt(ri, 16) + diff).toString(16));;
                    var gs = this.API.private('settingToHex', (parseInt(gi, 16) + diff).toString(16));
                    var bs = this.API.private('settingToHex', (parseInt(bi, 16) + diff).toString(16));
                    var settingColor = "#" + rs + gs + bs;
                    $(".menubgcolor").css("border-right-color", settingColor);
                    $(".menu-first").css("border-bottom-color", settingColor);
                    $(".menu-second li a").css("border-bottom-color", settingColor);
                    $(".menu-second li a").css("border-top-color", settingColor);
                    //计算二级菜单颜色f5-f9=+4
                    diff = 4;
                    rs = this.API.private('settingToHex', (parseInt(ri, 16) + diff).toString(16));
                    gs = this.API.private('settingToHex', (parseInt(gi, 16) + diff).toString(16));
                    bs = this.API.private('settingToHex', (parseInt(bi, 16) + diff).toString(16));
                    settingColor = "#" + rs + gs + bs;
                    $(".menu-second li a").css("background-color", settingColor);
                }
                //}
                //block(块){设置前端字体
                var fontcolor = allSetting.fontcolor;
                if (fontcolor != null && !/^\s*$/.test(fontcolor)) {
                    $(".menu-first").css("color", fontcolor);
                    $(".menu-second li a").css("color", fontcolor);
                }
                //}
            },
            /**
            *@function
            *@memberOf leftMenu
            *@name private$settingToHex
            *@description [功能]处理最后的16进制字符串，超过的就变成ff少于2位的补0，这个方法是设置页面颜色时，在页面上反向调用的
            *@param str 字符串
            */
            "settingToHex": function(str) {
                if (str.length > 2) {
                    return "ff";
                }
                if (str.length == 1) {
                    return "0" + str;
                }
                return str;
            }
        },
        view: {
            'treeView': require("./resource/leftMenu/treeView.tpl")
        }

    },
    module);
    return FW;
});