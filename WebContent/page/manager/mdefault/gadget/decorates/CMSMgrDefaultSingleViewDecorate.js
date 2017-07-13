/**
* @namespace
* @name CMSMgrDefaultSingleViewDecorate 
* @description  undefined 
*/
define(function(require, exports, module) {
    var FW = require("breeze/framework/js/BreezeFW");
    require("servicegadget/manager/decorates/CMSMgrSingleViewDecorate");
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
                } catch(e) {
                    // 处理异常
                }
                //}
                //block(块){初始化上传
                try {
                    $(".picsUpload").each(function() {
                        var dom = $(this);
                        var appid = ($(this).attr("data-value"));
                        var picsApp = FW.getApp(appid);
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
                }
                //}
                //block(块){单图初始化
                try {
                    $(".col-lg-6.pic").each(function() {
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
                    $(".col-lg-6.file").each(function() {
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
            'configView': require("./resource/CMSMgrDefaultSingleViewDecorate/configView.tpl")
        }

    },
    module);
    return FW;
});