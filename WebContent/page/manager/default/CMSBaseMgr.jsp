<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="com.breeze.framwork.databus.*"%>
<%@page import="com.breeze.framwork.netserver.tool.ContextMgr"%>
<%@page import="com.breeze.framwork.databus.ContextTools"%>
<%@page import="com.breezefw.service.cms.*"%>
<%@page import="java.util.HashMap"%>
<%@page import="java.util.Iterator"%>
<%@page import="java.util.Map"%>
<%@page import="java.util.regex.*"%>


<jsp:include page="../../allhead.jsp"/>
<%
    //这里可以手动切换到其他的设置页面，右上角的设置菜单要手工处理
    //request.setAttribute("Template","ace");
%>



<!doctype html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta content="width=device-width, initial-scale=1.0" name="viewport" />
	<meta content="" name="description" />
	<meta content="" name="author" />
	<!--[if IE]>
    	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <![endif]-->
	
	
	<link rel="stylesheet" href="./bootstrap-3.3.5/css/bootstrap.min.css" />
	<link rel="stylesheet" href="./bootstrap-3.3.5/css/bootstrap-theme.min.css" />
	<link rel="stylesheet" href="./css/main.css" />
	<!--pulg in-->
	<link rel="stylesheet" href="./plugin/datetimepicker/css/datetimepicker.css" />
	<link rel="stylesheet" href="./plugin/treeview/bootstrap-treeview.min.css" />
	<title></title>
	
	<jsp:include page="../cmsallhead.jsp"/>
	<jsp:include page="../bgPower.jsp"/>
</head>
<body>
	<div id="maskLayer"></div>
	<div id="top" class="navbar navbar-static-top bs-docs-nav FWApp" style="background-color:#445566;position: fixed;top: 0px;width:100%">
		<!--@head@{}-->
	</div>
	<div class="container-fluid">
		<div class="row">
			<div class="col-sm-3 col-md-2 sidebar FWApp menubgcolor">
			    <!--@leftMenu@
					{
					  template:"${Template}",
					  'none':''
					  ${LeftMenuAlias}
					  ${LeftMenuClearCach}
					  ${LeftMenuTreeDate}
					}
				-->
			</div>
              
			<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main" id="CMSMgrControl" style="margin-top: 53px;">
			</div>
		</div>
	</div>
	<!-- footer -->
	<jsp:include page="footer.jsp"/>
	<!-- /footer -->
	
	<!-- commjs -->
	<script src="${B}config/config.jsp"></script>
	<script src="${B}breeze/lib/js/jquery.js"></script>
	<script src="${B}breeze/lib/js/ajaxfileupload.js"></script>
	<script src="${B}breeze/swfupload/swfupload.js"></script>
	<script src="${B}breeze/swfupload/handlers.js"></script>
	
	<!-- bootstrap -->
	<script src="./bootstrap-3.3.5/js/bootstrap.min.js"></script>
	
	<!-- plug in -->
	<script src="./plugin/datetimepicker/js/bootstrap-datetimepicker.min.js"></script>
	<script src="./plugin/treeview/bootstrap-treeview.min.js"></script>
	
	<!-- html编辑器 -->
	<script src="${B}breeze/xheditor/jquery-migrate-1.1.0.min.js"></script>
	<script src="${B}breeze/xheditor/xheditor-1.2.1.min.js"></script>
	<script src="${B}breeze/xheditor/xheditor_lang/zh-cn.js"></script>


	<!-- breeze -->
	<script src="${B}breeze/lib/js/sea.js"></script>
	<script src="${B}breeze/lib/js/seajs-text.js"></script>
	
	<script>
		seajs.config({base:"${B}"});
		seajs.use([${controlGadget}${SysGadgetInclude},'page/manager/${Template}/gadget/leftMenu',
		'page/manager/${Template}/gadget/head',
		'page/manager/${Template}/gadget/control/pagesetting_Control'],function(a) {
			a.go("${S}","CMSMgrSelector");
			window.FW = a;
		});
		
		if( ('onhashchange' in window) && ((typeof document.documentMode==='undefined') || document.documentMode==8)) {
			// 浏览器支持onhashchange事件
			window.onhashchange = function(){
				if (!window.hashChangeBySelector){
					var urlParams = location.hash.replace("#", "");
					if (urlParams == null || urlParams == ""){
						return;
					}
					FW.page.createControl(urlParams);
				}
				window.hashChangeBySelector = false;
			}
		}
	</script>
</body>
</html>
