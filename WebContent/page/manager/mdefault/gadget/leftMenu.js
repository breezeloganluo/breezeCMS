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
                //直接显示
                this.MY.data = data;
                this.API.show("treeView", data);
            }
        },
        "private": {
            /**
            *@function
            *@memberOf leftMenu
            *@name private$processImgDir
            *@description [功能]处理图片信息
            *@param imgdir 图片路径
            *@param cid 对象的cid
            */
            "processImgDir": function(imgdir, cid) {
                if (imgdir == null || imgdir == "") {
                    return "./weui/img/icon_nav_msg.png"
                }
                return Cfg.baseUrl + "/" + imgdir;
            },
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
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf leftMenu
            *@name FireEvent$clkckmenu
            *@description [功能]点击菜单，弹出二层菜单
            *[思路]弹出二层菜单功能
            *@param idx 当前菜单数组的索引
            *@param subIdx 子菜单索引
            */
            "clkckmenu": function(idx, subIdx) {
                //菜单索引
                var subMenu = this.MY.data[idx];
                //处理叶子节点
                if (subMenu.type == "item") {
                    this.MY.eventCall && this.MY.eventCall(null, {
                        info: [subMenu]
                    });
                    return;
                }
                //如果有子节点则按照二级菜单处理
                if (subIdx != null) {
                    subMenu = subMenu.children[subIdx];
                    this.MY.eventCall && this.MY.eventCall(null, {
                        info: [subMenu]
                    });
                    hideActionSheet($('#weui_actionsheet'), $('#mask'));
                    return;
                }
                //显示子菜单
                this.API.show("subMenu", {
                    idx: idx,
                    data: subMenu.children
                },
                "submenu");
                //绑定脚本
                var mask = $('#mask');
                var weuiActionsheet = $('#weui_actionsheet');
                weuiActionsheet.addClass('weui_actionsheet_toggle');
                mask.show().focus().addClass('weui_fade_toggle');
                $('#actionsheet_cancel').one('click',
                function() {
                    console.log(2);
                    hideActionSheet(weuiActionsheet, mask);
                });
                mask.unbind('transitionend').unbind('webkitTransitionEnd');

                function hideActionSheet(weuiActionsheet, mask) {
                    weuiActionsheet.removeClass('weui_actionsheet_toggle');
                    mask.removeClass('weui_fade_toggle');
                    mask.on('transitionend',
                    function() {
                        mask.hide();
                    }).on('webkitTransitionEnd',
                    function() {
                        mask.hide();
                    })
                }
            }
        },
        view: {
            'treeView': require("./resource/leftMenu/treeView.tpl"),
            'subMenu': require("./resource/leftMenu/subMenu.tpl")
        }

    },
    module);
    return FW;
});