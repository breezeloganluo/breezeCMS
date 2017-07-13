/**
* @namespace
* @name treeView 
* @version 0.01 罗光瑜 初始版本
* @description  展示树的包装类，通过这个包装类有两个作用，一个是将对应的树组件封装成我们常用的gadget，二是
*作为和业务逻辑类的唯一接口和通讯，屏蔽底层树的具体实现方便后续更换树实现          
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    FW.register({
        "name": "treeView",
        /**
        *@function
        *@memberOf treeView
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {},
        "public": {
            /**
            *@function
            *@memberOf treeView
            *@name public$setEventCall
            *@description [功能]设置目录树的点击事件的回调函数
            *[思路]先取消节点原来的事件，然后用jquery的bind方法重新绑定
            *[接口.this.MY.treeDom]当前绑定节点的dom包装器
            *@param eventfun 回调函数名
            function(e,o){
            e为jquery的x-event对象
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
                //获取最终的绑定事件名
                if (eventName == null) {
                    eventName = "nodeSelected";
                }
                //移除dom上原来绑定事件
                this.MY.treeDom.unbind(eventName);
                //绑定新事件
                var newEvenFun = function(e, o) {
                    var data = {
                        info: [o]
                    }
                    eventfun(e, data);
                }
                this.MY.treeDom.bind(eventName, newEvenFun);
            },
            /**
            *@function
            *@memberOf treeView
            *@name public$setDataCallback
            *@description [功能]设置数据回调，即有些数据是按照层次逐步读取的，不是开始在init一口气设置的。这时，inti只设置第一层数据，在这个接口中，可以每次点击后的数据响应。即给懒加载时扩展使用
            *[思路]预先设置好一个内部变量，在初始化处理数据时就将这个回调机制设置进去，每次初始化后，都要再调用一次这个函数进行设置。
            *不过在本实现中无用，因为这个懒加载功能ACE树支持的，本组件不支持，但作为统计接口，扔保留做保留而已
            *@param getDataFun 一个回调函数
            function(item){
            item:是当前点击中的那个节点
            return 返回的数据，其格式为{
            name:xxxx
            type:"item/folder"
            其他自定义参数
            }
            }
            *@return 无
            *@example 无
            */
            "setDataCallback": function(getDataFun) {
                //toDo
            },
            /**
            *@function
            *@memberOf treeView
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
            *@memberOf treeView
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
            icon-img:"图标地址本接口无用",
            icon:"icon的样式内容，比如icon-music blue"，
            selectedIcon:"选中的图标",
            expanded:是否展开
            其他自定义属性,
            children:[儿子的内容，循环上面父亲的结构
            ]
            }
            ]
            *@param initParam 初始化的参数
            {
            color: "#000000",
            backColor: "#FFFFFF",
            }
            *@param target 放置目录树的节点id值，不填则为当前gadget的绑定对象,
            为空就是在绑定标签上显示树
            */
            "init": function(data, initParam, target) {
                //确定绑定目录树的dom
                if (target != null) {
                    this.MY.treeDom = $("#" + target);
                } else {
                    this.MY.treeDom = $("#" + this.id);
                }
                //保存初始化参数，便于转换参数时使用
                this.MY.initParam = initParam || {};
                //转换数据
                var treeData = this.API.private('changeData', data);
                this.MY.data = treeData;
                //显示树
                this.MY.treeDom.html("");
                this.MY.treeDom.treeview({
                    data: treeData,
                    highlightSelected: true
                });
                //返回首页数据
                var initDir = this.MY.initDir = (data && data[0] && data[0].dir) || "/";

                return {
                    info: [{
                        name: "",
                        realName: "",
                        dir: initDir,
                        type: "folder",
                        additionalParameters: {
                            children: treeData
                        }
                    }]
                }
            }
        },
        "private": {
            /**
            *@function
            *@memberOf treeView
            *@name private$changeData
            *@description [功能]进行数据转换，将通用数据格式转换成指定的目录树组件所需要的结构信息
            *[思路]通过递归的方式将数据嵌套的读取并输出
            *@param data 转换前数据
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
            *@return [{
            text: "Parent 1",
            nodes: [{
            text: "Child 1",
            nodes: [{
            text: "Grandchild 1",
            selected:true,//这个表示这个被选中的
            },
            {
            text: "Grandchild 2"
            }]
            },
            {
            text: "Child 2"
            }]
            }]
            */
            "changeData": function(data) {
                //声明结果对象
                var result = [];
                //while(每个成员){循环处理操作每个成员内容
                for (var i = 0; i < data.length; i++) {
                    //基本值负责
                    var oneResult = {};
                    result.push(oneResult);
                    oneResult.text = data[i].name;
					//展开选中状态处理
					//--当节点数据是展开时展开，如果是选中，则先展开在选中
                    oneResult.state = {
                        expanded: data[i].expanded || false,
                        selected: false
                    };
                    if (data[i].selected) {
                        oneResult.state = {
                            expanded: true,
                            selected: true
                        }
                    }
                    for (var n in data[i]) {
                        oneResult[n] = data[i][n];
                    }
                    //设置扩展的数值
                    if (this.MY.initParam) {
                        for (var n in this.MY.initParam) {
                            oneResult[n] = this.MY.initParam[n];
                        }
                    }
                    //if(叶子节点){直接返回结果
                    if (data[i].type == "item") {
                        //对其他值进行赋值
                        oneResult.treeType = "item";
                        continue;
                    }
                    //}
                    //else{递归调用，继续给儿子赋值
                    else {
                        //用递归赋值
                        var orgChildren = data[i].children;
                        if (orgChildren == null) {
                            continue;
                        }
                        oneResult.treeType = "floder";
                        var children = this.API.private('changeData', orgChildren);
                        oneResult.nodes = children;
                        
                    }
                    //}
                }
                //}
                //返回结果
                return result;
            }
        }
    },
    module);
    return FW;
});