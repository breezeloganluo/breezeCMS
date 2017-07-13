/**
* @namespace
* @name CMSMgrSelector 
* @version 1.01 FrankCheng 选择器初始版本
1.02 罗光瑜 createApp要支持蒙板层的管理
* @description  后台CMS系统选择器 负责创建对应的选择器 gadget名称=type+"_Control"                                       
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    FW.register({
        "name": "CMSMgrSelector",
        "param": {
            /**
            *@memberOf CMSMgrSelector
            *@name mainviewdomid
            *@description 主体的要绑定的control的id值
            */
            "mainviewdomid": "CMSMgrControl"
        },
        /**
        *@function
        *@memberOf CMSMgrSelector
        *@name onCreate$onCreate
        *@description 初始化方法 页面入口，创建初始化的内部变量：
        *[this.MY.controls]=[
        *{
        *  alis:"alias",
        *  type"type"
        *}
        *]
        *[this.MY.curControl]={
        *  alias:"xxx",
        *  type:"xxx"
        *}
        */
        "onCreate": function() {
            //创建controls变量
            this.MY.controls = [];
            this.MY.curControl = {};
            //获取url中所有参数
            var urlParams = window.location.search.replace("?", "");
            //if(--){--
            if (urlParams == null || urlParams == "") {
                //不显示内容 返回
                urlParams = location.hash.replace("#", "");
                if (urlParams == null || urlParams == "") {
                    return;
                }
            }
            //}
            //根据参数创建控制器control
            this.createControl(urlParams);
        },
        "public": {
            /**
            *@function
            *@memberOf CMSMgrSelector
            *@name public$getLastControl
            *@description 往堆栈里面找，把和自己相同的清除掉，再返回上一个
            *@param alias 对应alias
            *@param type 类型
            *@return 输入信息的上一个control
            */
            "getLastControl": function(alias, type) {
                //if (没有输入参数){只返回最近信息
                if (alias == null && type == null) {
                    return this.MY.controls.pop();
                }
                //}
                //获取control对象
                var controlObj = {
                    alias: alias,
                    type: type
                };
                //出栈
                var historyControl = this.MY.controls.pop();
                //找到不是mask的类型
                while (historyControl.type == "mask") {
                    historyControl = this.MY.controls.pop();
                }
                //while(this.my记录不为空，且出栈内容不是输入的control){继续出栈
                while (this.MY.controls.length > 0 && (historyControl.alias != controlObj.alias || historyControl.type != controlObj.type)) {
                    //出栈
                    historyControl = this.MY.controls.pop();
                }
                //}
                //再出栈
                historyControl = this.MY.controls.pop();
                //返回
                return historyControl;
            },
            /**
            *@function
            *@memberOf CMSMgrSelector
            *@name public$clearLastControl
            *@description 清除上一个信息
            *@param alias 别名
            *@param type 类型
            */
            "clearLastControl": function(alias, type) {
                //获取control对象
                var controlObj = {
                    alias: alias,
                    control: type
                };
                //出栈
                var historyControl = this.MY.controls.pop();
                //找到不是mask的类型
                while (historyControl.type && historyControl.type == "mask") {
                    historyControl = this.MY.controls.pop();
                }
                //while(this.my记录不为空，且出栈内容不是输入的control){继续出栈
                while (this.MY.controls.length > 0 && (historyControl.alias != controlObj.alias || historyControl.type != controlObj.type)) {
                    //出栈
                    historyControl = this.MY.controls.pop();
                }
                //}
                //返回
                return historyControl;
            },
            /**
            *@function
            *@memberOf CMSMgrSelector
            *@name public$createMaskControl
            *@description [功能]创建一个蒙版的control类
            *[思路]先appen一个蒙板层的标签，然后再进行不同创建，不过就是带上创建的目标id
            *[接口.this.MY.xxx]这里描述内部全局变量定义
            *[接口.service.pkg.name.param]{这里描述服务pkg.name要传入参数内容}
            *[接口.service.pkg.name.return]{这里描述doserver返回值的json的结构}
            *@param url control的url
            */
            "createMaskControl": function(url) {
                //创建蒙版标签
                //--注意，完成蒙板层的标签是外部标签，所以标签的规则是视图名_应用名
                var maskid = "appMaskView";
                if ($("#appMainView_appSelector").length == 0) {
                    $("body").append("<div id='" + maskid + "'></div>");
                }
                if ($("#mask-modal").length == 0) {
                    $("body").append("<div id='mask-modal' class='modal-backdrop  in'></div>");
                }
                //创建control
                this.createControl(url, maskid);
            },
            /**
            *@function
            *@memberOf CMSMgrSelector
            *@name public$createControl
            *@description 创建基本控制器,在创建控制器的同时记录当前的控制器信息，便于历史调用,
            *信息的结构构成为：参考oncreate方法。
            *做一次改动，就是要增加一个appObj参数，这个参数传入的是绑定标签信息。思路：
            *1. 创建control的时候，通过设定的最后一个参数，能够设定绑定control的标签
            *2. 通过这个特性，把app绑定到蒙板层时，就是一个蒙板层应用了
            *3. 如果是一个蒙板层应用里面的某个组件，比如分页要进行跳转，那么就要分页调用的本方法，传入第二个参数，来说明重新的跳转是在本基本页中还是在蒙板层中
            *4. control的历史信息也要有两份，各自独立，这个先不做，本版本值将和默认目标相等的放入历史对象中，其他不放
            *5. url是否记录hash，要看是否绑定的是基本内容
            *重要参数mainviewdomid代表control所绑定的那个viewid
            *@param url 页面地址信息，注意，可以只是参数部分
            *@param appObj app的Obj，这里要根据app传入的param参数确定对应的所创建app的绑定标签名。用法:appObj.param.binddomid
            */
            "createControl": function(url, appObj) {
                //block(块){设置目标绑定id值
                //设置要绑定标签的变量值
                var targetDomId = null;
                //if(为空情况){使用默认值
                if (appObj == null) {
                    //进行赋值
                    targetDomId = this.param.mainviewdomid;
                }
                //}
                //else if(不为空，且是字符串){直接赋值
                else if (appObj != null && /string/i.test(typeof(appObj))) {
                    //直接进行赋值
                    targetDomId = appObj;
                }
                //}
                //else{是对象，用对象赋值
                else {
                    //用对象赋值
                    targetDomId = appObj.param.binddomid || this.param.mainviewdomid;
                }
                //}
                //}
                //block(块){设置hash控制url的参数
                //if (是默认url的情况才进行hash控制){hash控制
                if (targetDomId == this.param.mainviewdomid) {
                    //设置hash信息
                    window.hashChangeBySelector = true;
                    location.hash = url;
                }
                //}
                //}
                //根据url设置参数
                //--因为下面的跳转代码，会自动把mainviewdomid设置到_param.queryParam.binddomid中，这个会导致查询失败，这里不一一改后面的跳转代码了，集中在这里清除掉，保持和原来的兼容性
                var _param = this.API.private("analyticParameter", url);
                _param.type = _param.type || "list";
                _param.binddomid = targetDomId;
                if (_param.queryParam && _param.queryParam.binddomid) {
                    delete _param.queryParam.binddomid;
                }
                var alias = _param.alias;
                var type = _param.type;
                //根据type获取gadget名
                var gadgetName = this.API.private('getControlName', alias, type);
                //设定创建新gadget的resource
                var resource = {
                    param: _param,
                    id: gadgetName
                };
                //获取gadget对象
                var gadget = FW.getGadget(gadgetName);
                //if(gadget存在){正常的创建
                if (gadget) {
                    //创建app
                    //--用整理后的对象设置目标id
                    FW.createApp(targetDomId, gadgetName, resource, true);
                }
                //}
                //else{转向到debugpage上
                else {
                    //修改resource
                    resource.param.forward = true;
                    //创建app
                    FW.createApp("CMSMgrControl", "debugpage_Control", resource, targetDomId);
                }
                //}
                //block(块){将信息录入到controls的histroy列表中
                //--这个版本不做过多处理，仅仅是放入默认对象的才记录到control堆栈中其他先不记录
                //if(当前的目标是默认目标){写入control队列
                if (targetDomId == this.param.mainviewdomid) {
                    //写入control堆栈
                    this.MY.curControl = {
                        alias: alias,
                        type: type
                    }
                    this.MY.controls.push(this.MY.curControl);
                }
                //}
                //}
            },
            /**
            *@function
            *@memberOf CMSMgrSelector
            *@name public$param2url
            *@description [功能]给下面的子类使用，用于将param中对象转换成url
            *[思路]硬编码即可
            *@param param 参数对象
            *@param filter 过滤关键字数组
            *@return 转换好的url
            */
            "param2url": function(param, filter) {
                //初始化所有变量
                var url = "abc?";
                var first = true;
                var filterStr = filter && "|" + filter.join("|") + "|" || "";
                //for(param){处理
                for (var i in param) {
                    //过滤参数
                    if (filterStr.indexOf("|" + i + "|") >= 0) {
                        continue;
                    }
                    //if(queryParam){查询处理
                    if (i == "queryParam") {
                        for (var j in param.queryParam) {
                            if (filterStr.indexOf("|" + j + "|") >= 0) {
                                continue;
                            }
                            if (first) {
                                first = false;
                            } else {
                                url += "&";
                            }
                            url += j + "=" + encodeURIComponent(param.queryParam[j]);
                        }
                    }
                    //}
                    //else if (decoratorCtr){处理
                    else if (i == "decoratorCtr") {
                        var decoratorCtrStr = FW.use().toJSONString(param.decoratorCtr);
                        if (first) {
                            first = false;
                        } else {
                            url += "&";
                        }
                        url = url + "decoratorCtr=" + encodeURIComponent(decoratorCtrStr);
                    }
                    //}
                    //else if(处理spes){合成spes并处理
                    else if (i == "spes") {
                        //转换成url片段并合入结果
                        var spes = FW.use().toJSONString(param.spes);
                        if (first) {
                            first = false;
                        } else {
                            url += "&";
                        }
                        url = url + "spes=" + encodeURIComponent(spes);
                    }
                    //}
                    //else{
                    else {
                        if (first) {
                            first = false;
                        } else {
                            url += "&";
                        }
                        url += i + "=" + encodeURIComponent(param[i]);
                    }
                    //}
                }
                //}
                //返回结果
                return url;
            }
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrSelector
            *@name private$getControlName
            *@description 根据alias以及相关的参数，获取control字符串
            *@param alias 当前请求的别名
            *@param type 当前的type
            */
            "getControlName": function(alias, type) {
                //声明返回变量
                var gadgetName = null;
                //if(alias存在){处理特殊的channel和mask情况
                if (alias) {
                    //if (如果是list情况){使用默认列表
                    if (type == "list") {
                        gadgetName = "CMSMgrDefaultListControl";
                    }
                    //}
                    //else if(如果是single){普通表单或者模型定义情况
                    else if (type == "single") {
                        if (alias == "channel") {
                            gadgetName = "CMSMgrModSingleControl";
                        } else {
                            gadgetName = "CMSMgrDefaultSingleControl";
                        }
                    }
                    //}
                    //else if(蒙板层情况){使用蒙板层
                    else if (type == "mask") {
                        gadgetName = "CMSMgrDefaultMaskControl";
                    }
                    //}
                    //else{用type拼接
                    else {
                        gadgetName = type + "_Control";
                    }
                    //}
                }
                //}
                //else{用type拼接页面
                else {
                    if (type) {
                        gadgetName = type + "_Control";
                    } else {
                        alert("type can't be null!!");
                        return;
                    }
                }
                //}
                return gadgetName;
            },
            /**
            *@function
            *@memberOf CMSMgrSelector
            *@name private$analyticParameter
            *@description 解析参数
            *固定参数名： "norole" "threadSignal"忽略
            *其他参数："alias" ， "start"， "length" ， "method" ， "queryObj"， "spes"， "type" ， "parentAlias"， "nid" ，"mode" ，"mid" 放到一级param中
            *其他的，全部作为查询参数放入到param.queryObj中queryParam
            *@param url 整个请求参数
            *@return json
            */
            "analyticParameter": function(url) {
                //if(不存在=){表示该值是alias
                if (!/\=/ig.test(url)) {
                    return {
                        "alias": url
                    };
                }
                //}
                //else{
                else {
                    //声明结果变量
                    var param = {};
                    var testReg = /([^=\?&\s]+)=([^=\?&\s]+)/ig;
                    //for(块){循环处理，解析里面的每一个参数
                    while (true) {
                        //判断是否结束
                        var execResult = testReg.exec(url);
                        if (execResult == null) {
                            break;
                        }
                        var name = execResult[1];
                        var value = decodeURIComponent(execResult[2]);
                        //if(应该直接忽略的情况){直接忽略
                        if (name == "norole" || name == "threadSignal" || name == "actionKey") {
                            //忽略
                            continue;
                        }
                        //}
                        //else if(要放入直接参数中的){解析并放入直接参数中
                        else if (name == "method" || name == "alias" || name == "start" || name == "length" || name == "method" || name == "queryObj" || name == "type" || name == "parentAlias" || name == "nid" || name == "mode" || name == "mid") {
                            //直接加入
                            param[name] = value;
                        }
                        //}
                        //else if(decoratorCtr处理的){进行decorateCtr处理
                        else if (name == "decoratorCtr") {
                            //获取字符串内容对象
                            var input = value;
                            var inputObj = eval("(" + input + ")");
                            //给内容赋值
                            param.decoratorCtr = inputObj;
                        }
                        //}
                        //else if(spes的处理){对spes处理
                        else if (name == "spes") {
                            //获取字符串内容对象
                            var input = value;
                            var inputObj = eval("(" + input + ")");
                            //给内容赋值
                            param.spes = inputObj;
                        }
                        //}
                        //else{全部是查询参数了
                        else {
                            //保证数据不为空
                            //--这里%做间隔符是有问题的
                            param.queryParam = param.queryParam || {};
                            //设置内容
                            if (value.indexOf("[") != -1) {
                                param.queryParam[name] = value.replace(/[\[\]]/ig, "").split("\,");
                            } else {
                                param.queryParam[name] = value;
                            }
                        }
                        //}
                    }
                    //}
                    //返回结果
                    return param;
                }
                //}
            }
        }
    },
    module);
    return FW;
});