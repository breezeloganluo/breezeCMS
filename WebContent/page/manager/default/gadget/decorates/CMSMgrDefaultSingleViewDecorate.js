/**
* @namespace
* @name CMSMgrDefaultSingleViewDecorate 
* @description   
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/CMSMgrSingleViewDecorate");
    require("./typeoper/List_Decorate");
    require("./typeoper/Pics_Decorate");
    FW.register({
        "name": "CMSMgrDefaultSingleViewDecorate",
        "extends": ["CMSMgrSingleViewDecorate"],
        "public": {
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleViewDecorate
            *@name public$getCfgInfo
            *@description 获取系统配置的信息
            */
            "getCfgInfo": function() {
                //返回详情页的定制项目
                return {
                    name: "详情页定制按钮",
                    sig: "singleButton"
                };
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleViewDecorate
            *@name public$getDisplayCfg
            *@description 返回显示显示配置的html片段
            *@param cfgObj 配置对象
            *@return 显示的html片段
            */
            "getDisplayCfg": function(cfgObj) {
                //显示配置信息
                return this.API.show("configView", cfgObj, "_");
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleViewDecorate
            *@name public$getCfgSetting
            *@description 由页面配置获取配置内容，提供默认方法，这种方法页面元素有前提要求：
            *$(domSelector).find("tr").not(".list-tr-hidden").find("td").not(".center")
            *并且值的标签使用属性attr-d来标识属性名的
            *@param domSelector 进行判断的jqueryselector
            *@return 返回设置的对象
            */
            "getCfgSetting": function(domSelector) {
                //设定初值变量
                var data = [];
                var _data = {};
                //block(dom里面所有的td){
                $(domSelector).find("tr").not(".list-tr-hidden").find("td").not(".center").each(function() {
                    //读入dom中值，兼容input,select,textarea情况
                    var text = $(this).find("input").val();
                    if (!text) {
                        text = $(this).find("textarea").val();
                    }
                    if (!text) {
                        text = $(this).find(":selected").val();
                    }
                    //if (用重复名称记录){记录当前行，新起一行
                    if (_data[$(this).attr("attr-d")]) {
                        //加入一行
                        data.push(_data);
                        //新起一行
                        _data = {};
                    }
                    //}
                    //处理读入的值，为空就退出，否则记录一条记录
                    if (!text) {
                        return;
                    }
                    if ($(this).attr("attr-d") == "fun") {
                        _data.oper = {};
                        _data.oper[$(this).attr("attr-d")] = text;
                    } else {
                        _data[$(this).attr("attr-d")] = text;
                    }

                });
                //}
                //补充记录最后一条记录，并返回
                var isNull = true;
                for (var i in _data) {
                    isNull = false;
                    break;
                }
                if (isNull) {
                    return null;
                }
                data.push(_data);
                return data;
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleViewDecorate
            *@name public$getData
            *@description 获取data方法，这个方法从父类中移动过来，因为不同的页面获取数据的方法是不同的
            */
            "getData": function() {
                var data = {};
                var _this = this;
                //还原html
                if (this.MY.editor && this.MY.editor.length > 0) {
                    for (var i = 0; i < _this.MY.editor.length; i++) {
                        _this.MY.editor[i].getSource();
                    }
                }

                var data = FW.use().getFormValue("singleFormData");

                if (FW.getApp("CMSMgrControl").param.queryParam && FW.getApp("CMSMgrControl").param.queryParam.nodeid) {
                    data.nodeid = FW.getApp("CMSMgrControl").param.queryParam.nodeid;
                }
                return FW.use().evalJSON(FW.use().toJSONString(data));
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleViewDecorate
            *@name public$parserValueData
            *@description [功能]在写入value值中引号等是要被转义的否则值不对
            *[思路]字符串替换完成
            *注意，要给后代类，即各种typedecorate使用，所以方法要改成公有方法
            *@param value 输入进来的值
            */
            "parserValueData": function(value) {
                //如果为空，返回空字符
                if (value == null) {
                    return "";
                }
                //直接转义
                var result = value.replace(/&/g, "&amp;");
                result = result.replace(/</g, "&lt;");
                result = result.replace(/>/g, "&gt;");
                result = result.replace(/"/g, "&quot;");
                result = result.replace(/'/g, "&#039;");
                return result;
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleViewDecorate
            *@name public$createMainForm
            *@description [功能]创建并显示整个表单主体
            *[思路]根据输入的元数据和值，进行页面模板显示，然后在对应的类型下面显示不同的数据类型
            *@param metadata 元数据
            *@param data 数据
            *@param prefix 前缀，因为这个函数可能被列表类型直接调用。所以列表类型弹出的部分的id可能就要有意识的和普通外层区分，否则id可能会冲突掉。当然正常情况，这个值不填
            */
            "createMainForm": function(metadata, data, prefix) {
                //获取当前的表单数据
                var result = this.API.show("mainForm", {
                    metadata: metadata,
                    data: data,
                    idPrefix: prefix || ""
                },
                "_");
                //返回结果
                return result;
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleViewDecorate
            *@name public$createTypeDecorateEditData
            *@description 创建某一个type类型decorate的html片段
            *注意：创建app的时候用的是var app = FW.createApp(appId, gadgetName, this, appId);
            *这里的appid实际就是本fieldid
            *@param appId 这个就是每个组件name所用的字符串，用于反解信息用
            *@param type type类型
            *@param metadata 描述数据
            *@param data 显示数据
            *@param idprefix parserMain可能是被list调用的，而这个函数又是被parserMain的tpl视图反向调用的，所以前缀也是必要的，当然默认为空。这个参数主要是绑定app的id便于后续定位使用
            */
            "createTypeDecorateEditData": function(appId, type, metadata, data, idprefix) {
                //先用viewid去完成表单
                var viewid = "type_" + type;
                if (this.view[viewid]) {
                    return this.API.show(viewid, {
                        appId: appId,
                        type: type,
                        metadata: metadata,
                        data: data
                    },
                    "_");
                }
                //如果视图不存在，就用app去完成
                if (idprefix == null) {
                    idprefix = "";
                }
                var gadgetName = type + "_Decorate";
                var gadget = FW.getGadget(gadgetName);
                if (gadget) {
                    var app = FW.createApp("field_" + idprefix + appId, gadgetName, this, true);
                    app.myFather = this;
                    app.fieldId = appId;
                    return app.getTypeDecorateEditData(metadata, data);
                } else {

                    return "<div style='display:none'></div>";
                }
            }
        },
        "private": {
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleViewDecorate
            *@name private$afterShowProcessor
            *@description [功能]继承父函数，进行显示后的处理
            *[思路]这里是做初始化工作的，直接初始化代码堆一起即可
            *[接口.this.MY.xxx]这里描述内部全局变量定义
            *[接口.service.pkg.name.param]{这里描述服务pkg.name要传入参数内容}
            *[接口.service.pkg.name.return]{这里描述doserver返回值的json的结构}
            *@param data 原始数据，一般无用
            */
            "afterShowProcessor": function(data) {
                var _this = this;
                //block(块){初始化富媒体编辑
                _this.MY.editor = [];
                try {
                    if ($('.xheditor').length) {
                        $('.xheditor').each(function(index) {
                            _this.MY.editor[index] = $(".xheditor:eq(" + index + ")").xheditor({
                                urlType: "rel",
                                skin: 'nostyle',
                                width: '100%',
                                height: '300px',
                                upLinkUrl: "upload.php",
                                upLinkExt: "zip,rar,txt",
                                upImgUrl: "upload.php",
                                upImgExt: "jpg,jpeg,gif,png",
                                upFlashUrl: "upload.php",
                                upFlashExt: "swf",
                                upMediaUrl: "upload.php",
                                upMediaExt: "avi"
                            });
                        })
                    }
                } catch(e) {}
                //}
                //block(块){初始化时间控件
                try {
                    $('.datepickerset').datetimepicker({
                        format: "yyyy-mm-dd",
                        autoclose: true,
                        startView: 2,
                        minView: 2
                    });

                    $('.datepickerset').datetimepicker().on('changeDate',
                    function(ev) {
                        $(this).parent().find(".realValue").val(ev.date.getTime());
                    });
                } catch(e) {
                    alert(0);
                }

                try {
                    $('.datetimepickerset').datetimepicker({
                        format: "yyyy-mm-dd hh:ii:ss",
                        autoclose: true,
                        startView: 2,
                        minView: 0
                    });

                    $('.datetimepickerset').datetimepicker().on('changeDate',
                    function(ev) {
                        $(this).parent().find(".realValue").val(ev.date.getTime());
                    });
                } catch(e) {
                    alert("ace模版暂不支持DateTimePicker类型");
                    console.log(e);
                }

                try {
                    $('.timepickerset').datetimepicker({
                        language: "zh-CN",
                        weekStart: 1,
                        todayBtn: 1,
                        autoclose: 1,
                        todayHighlight: 1,
                        startView: 1,
                        minView: 0,
                        maxView: 1,
                        forceParse: 0
                    });

                    $('.timepickerset').datetimepicker().on('changeDate',
                    function(ev) {
                        $(this).parent().find(".realValue").val(ev.date.getTime());
                    });
                } catch(e) {
                    // 处理异常
                }
                //}
                //block(块){初始化多图
                try {
                    $(".col-lg-10[data-type=Pics]").each(function() {
                        var dom = $(this);
                        var appid = ($(this).attr("data-value"));
                        var picsApp = FW.getApp("field_" + appid);
                        var ImgArr = picsApp.param.data || [];
                        swfu = new SWFUpload({
                            // Backend Settings
                            upload_url: Cfg.swfuploadUrl,
                            post_params: {
                                "PHPSESSID": "session_id()"
                            },
                            // File Upload Settings
                            file_size_limit: "1 MB",
                            // 2MB
                            file_types: "*.jpg; *.gif; *.png",
                            file_types_description: "选择 JPEG/GIF/PNG 格式图片",
                            file_upload_limit: "0",
                            // Event Handler Settings - these functions as defined in Handlers.js
                            //  The handlers are not part of SWFUpload but are part of my website and control how
                            //  my website reacts to the SWFUpload events.
                            file_queue_error_handler: fileQueueError,
                            file_dialog_complete_handler: fileDialogComplete,
                            upload_progress_handler: uploadProgress,
                            upload_error_handler: uploadError,
                            // upload_success_handler : uploadSuccess,
                            // upload_complete_handler : uploadComplete,
                            //上传成功回调函数
                            upload_success_handler: function(file, result) {

                                var picUrl = FW.use().evalJSON(result).succUrl;
                                ImgArr.push({
                                    picUrl: picUrl,
                                    alt: ""
                                });
                                picsApp.showResult(ImgArr);
                            },

                            upload_complete_handler: function(file) {
                                dom.find(' .ProgressContainer').show();
                                dom.find(' .ProgressContainer').css({
                                    'width': '0%'
                                });
                                dom.find('#progressName').html('');
                                this.startUpload();
                            },
                            // Button Settings,
                            button_placeholder_id: "spanButtonPlaceholder",
                            button_width: 230,
                            button_height: 18,
                            button_text: '<span class="button">选择本地图片 <span class="buttonSmall">(单图最大为 1 MB，支持多选)</span></span>',
                            button_text_style: '.button {color:#ffffff; font-family: Helvetica, Arial, sans-serif; font-size: 12pt; } .buttonSmall { font-size: 10pt; }',
                            button_text_top_padding: 0,
                            button_text_left_padding: 0,
                            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                            button_cursor: SWFUpload.CURSOR.HAND,
                            // Flash Settings
                            flash_url: Cfg.baseUrl + "/breeze/swfupload/swfupload.swf",

                            custom_settings: {
                                upload_target: "ProgressContainer"
                            },
                            // Debug Settings
                            debug: false
                        });
                        //banding删除按钮
                        dom.find(" .PicsClass").delegate(".delpic", "click",
                        function() {
                            $(this).parent().remove();
                        })
                    });
                } catch(e) {
                    // 处理异常
                    console.log(e);
                }
                //}
                //block(块){单图初始化
                try {
                    $(".col-lg-10[data-type=Pic]").each(function() {
                        var dom = $(this);
                        var onclickStr = "this.id = this.id.replace(/\]/ig,'_');";
                        onclickStr = onclickStr + "this.id = this.id.replace(/[\[\.]/ig,'_');";
                        onclickStr = onclickStr + "var tmpid=this.id;";
                        onclickStr = onclickStr + "var tmpi='#'+tmpid;";
                        onclickStr = onclickStr + "$.ajaxFileUpload({";
                        onclickStr = onclickStr + "url:'" + Cfg.ajaxFileUpLoadUrl + "',";
                        onclickStr = onclickStr + "secureuri:false,";
                        onclickStr = onclickStr + "fileElementId:tmpid,";
                        onclickStr = onclickStr + "dataType: 'json',";
                        onclickStr = onclickStr + "success: function (data, status){";
                        onclickStr = onclickStr + "$(tmpi).prevAll('input').val(data.succUrl);";
                        onclickStr = onclickStr + "$(tmpi).parent().next().find('img').attr('src',Cfg.baseUrl+'/'+data.succUrl);";
                        onclickStr = onclickStr + "}";
                        onclickStr = onclickStr + "})";
                        $(this).find("input[name=upload]").attr("onchange", onclickStr);
                    });

                } catch(e) {

}
                //}
                //block(块){文件初始化
                try {
                    $(".col-lg-10[data-type=File]").each(function() {
                        var dom = $(this);
                        var onclickStr = "this.id = this.id.replace(/\]/ig,'_');";
                        onclickStr = onclickStr + "this.id = this.id.replace(/[\[\.]/ig,'_');";
                        onclickStr = onclickStr + "var tmpid=this.id;";
                        onclickStr = onclickStr + "var tmpi='#'+tmpid;";
                        onclickStr = onclickStr + "$.ajaxFileUpload({";
                        onclickStr = onclickStr + "url:'" + Cfg.ajaxFileUpLoadUrl + "',";
                        onclickStr = onclickStr + "secureuri:false,";
                        onclickStr = onclickStr + "fileElementId:tmpid,";
                        onclickStr = onclickStr + "dataType: 'json',";
                        onclickStr = onclickStr + "success: function (data, status){";
                        onclickStr = onclickStr + "$(tmpi).prevAll('input').val(data.succUrl);";
                        onclickStr = onclickStr + "}";
                        onclickStr = onclickStr + "})";
                        $(this).find("input[name=upload]").attr("onchange", onclickStr);
                    });
                } catch(e) {

}
                //}
            }
        },
        "FireEvent": {
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleViewDecorate
            *@name FireEvent$saveAddNew
            *@description 给作为alias统一配置时，默认页面的方法使用
            */
            "saveAddNew": function() {
                //调用父类进行设置
                this.configCtr.saveAddNew(this.getCfgInfo().sig);
            },
            /**
            *@function
            *@memberOf CMSMgrDefaultSingleViewDecorate
            *@name FireEvent$closeAddNew
            *@description 响应关闭，该方法只用于模型定制
            *@param dom 事件节点处理
            */
            "closeAddNew": function(dom) {
                //关闭窗口
                this.configCtr.closeAddNew();
            }
        },
        view: {
            'CMSMgrDefaultSingleViewResourceView': require("./resource/CMSMgrDefaultSingleViewDecorate/CMSMgrDefaultSingleViewResourceView.tpl"),
            'configView': require("./resource/CMSMgrDefaultSingleViewDecorate/configView.tpl"),
            'type_CheckBox': require("./resource/CMSMgrDefaultSingleViewDecorate/type_CheckBox.tpl"),
            'type_DatePicker': require("./resource/CMSMgrDefaultSingleViewDecorate/type_DatePicker.tpl"),
            'type_DateTimePicker': require("./resource/CMSMgrDefaultSingleViewDecorate/type_DateTimePicker.tpl"),
            'type_File': require("./resource/CMSMgrDefaultSingleViewDecorate/type_File.tpl"),
            'type_Hidden': require("./resource/CMSMgrDefaultSingleViewDecorate/type_Hidden.tpl"),
            'type_Html': require("./resource/CMSMgrDefaultSingleViewDecorate/type_Html.tpl"),
            'type_OuterLink': require("./resource/CMSMgrDefaultSingleViewDecorate/type_OuterLink.tpl"),
            'type_Pic': require("./resource/CMSMgrDefaultSingleViewDecorate/type_Pic.tpl"),
            'type_Radio': require("./resource/CMSMgrDefaultSingleViewDecorate/type_Radio.tpl"),
            'type_ReadOnly': require("./resource/CMSMgrDefaultSingleViewDecorate/type_ReadOnly.tpl"),
            'type_Select': require("./resource/CMSMgrDefaultSingleViewDecorate/type_Select.tpl"),
            'type_TextArea': require("./resource/CMSMgrDefaultSingleViewDecorate/type_TextArea.tpl"),
            'type_Text': require("./resource/CMSMgrDefaultSingleViewDecorate/type_Text.tpl"),
            'type_TimePicker': require("./resource/CMSMgrDefaultSingleViewDecorate/type_TimePicker.tpl"),
            'mainForm': require("./resource/CMSMgrDefaultSingleViewDecorate/mainForm.tpl"),
            'type_SelectText': require("./resource/CMSMgrDefaultSingleViewDecorate/type_SelectText.tpl")
        }

    },
    module);
    return FW;
});