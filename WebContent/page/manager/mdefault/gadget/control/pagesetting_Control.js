/**
* @namespace
* @name pagesetting_Control 
* @version 0.01 罗光瑜 初始版本
* @description  进行页面设置的gadget，这个gadget不继承原来的control，自己玩。
*主要功能是扫描所有已加载的gadget，配套这些gadget，将其配置写下。已加载gadget，要存在方法:_getMgrPagetSetting方法。而返回的结果就是一个大的结构{
*  gadget:{//来源的gadget名
*  "title":{
*       title:显示名称,
*       type:"Text/Select/Pic"
*       desc:描述
*       valueRange:[
*          { 
*                name:value
*          }
*       ]
*  }
*  }
*}上例中title就是字段键值   
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    FW.register({
        "name": "pagesetting_Control",
        /**
        *@function
        *@memberOf pagesetting_Control
        *@name onCreate$onCreate
        *@description
        */
        "onCreate": function() {
            this.showForm();
        },
        "public": {
            /**
            *@function
            *@memberOf pagesetting_Control
            *@name public$showForm
            *@description [功能]显示表单
            *[思路]将表单显示出来，这里要根据获取到的表单结构去做，先调用私有方法获取所有gadget的表单数据
            */
            "showForm": function() {
                //获取所有要设置的参数
                var settingData = this.getAttr();
                //获取原来的旧值
                var oldData = this.API.private('getOldValue');
                if (oldData != null) {
                    this.MY.valueid = oldData.cid;

                    var oldData = eval("(" + oldData.value + ")");

                    this.API.show("mainformwithhvalue", {
                        datadesc: settingData,
                        data: oldData
                    });
                } else {
                    this.API.show("mainform", settingData);
                }
            },
            /**
            *@function
            *@memberOf pagesetting_Control
            *@name public$getAttr
            *@description [功能]这里描述基本功能
            *[思路]从gadget集合中获取所有的字段信息
            *@return 参见类说明中的结构
            */
            "getAttr": function() {
                //声明结果
                var result = {};
                //获取对应参数
                var allGadget = FW.getGadget();
                //while(所有gadget){将有方法名_getMgrPagetSetting的获取出来
                for (var n in allGadget) {
                    var one = allGadget[n];
                    //if(有方法名_getMgrPagetSetting){加入结果
                    if (one["public"] && one["public"]._getMgrPagetSetting) {
                        //加入结果
                        result[n] = one["public"]._getMgrPagetSetting();
                    }
                    //}
                }
                //}
                //返回结果
                return result;
            }
        },
        "private": {
            /**
            *@function
            *@memberOf pagesetting_Control
            *@name private$getOldValue
            *@description [功能]获取原来的值
            *[思路]用cms从后台查询
            */
            "getOldValue": function() {
                //获取原值
                var oldvalueResult = this.API.doServer("queryContent", "cms", {
                    "alias": "cmsconfig",
                    "param": {
                        name: "pagesetting_" + window.systemCtx.Template
                    }
                });
                if (oldvalueResult && oldvalueResult.code == 0 && oldvalueResult.data && oldvalueResult.data.cmsdata) {
                    var value = oldvalueResult.data.cmsdata[0];
                    return value;
                }
                return null;
            },
            /**
            *@function
            *@memberOf pagesetting_Control
            *@name private$parserNull
            *@description [功能]将空返回成空字符串
            *@param str 输入字符
            */
            "parserNull": function(str) {
                if (str == null) {
                    return "";
                }
                return str;
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf pagesetting_Control
            *@name FireEvent$setValue
            *@description [功能]将页面设置的值保存起来，没有就添加
            *[思路]根据是否有查询原值为界限进行判断，是否有值，有值就改，没值就添加
            *[this.MY.valueid]保存了原来的数据库cid，没有则为空
            */
            "setValue": function() {
                //获取页面参数
                var value = FW.use().getFormValue("pagesetting");
                var valuestr = FW.use().toJSONString(value);
                var code = 0;
                console.log(valuestr);
                //if(原来有值){修改操作
                if (this.MY.valueid) {
                    //修改发起
                    var result = this.API.doServer("modifyContent", "cms", {
                        "alias": "cmsconfig",
                        "param": {
                            name: "pagesetting_" + window.systemCtx.Template,
                            value: valuestr,
                            cfgDesc: "test魔板的配置设置",
                            cid: this.MY.valueid
                        }

                    });
                    code = result.code;
                }
                //}
                //else if(原来没值){添加操作
                else {
                    //添加新的参数值
                    var result = this.API.doServer("addContent", "cms", {
                        "alias": "cmsconfig",
                        "param": {
                            name: "pagesetting_" + window.systemCtx.Template,
                            value: valuestr,
                            cfgDesc: "test魔板的配置设置"
                        }

                    });
                    code = result.code;
                }
                //}
                //统一提示成功
                if (code == 0) {
                    alert("设置成功");
                } else {
                    alert("设置失败");
                }
                window.location = "./CMSBaseMgr.jsp";
            }
        },
        view: {
            'mainform': require("./resource/pagesetting_Control/mainform.tpl"),
            'mainformwithhvalue': require("./resource/pagesetting_Control/mainformwithhvalue.tpl")
        }

    },
    module);
    return FW;
});