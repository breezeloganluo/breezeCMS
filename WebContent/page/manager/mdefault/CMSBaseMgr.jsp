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
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
	<link rel="stylesheet" href="./weui/style/weui.min.css"/>
	<link rel="stylesheet" href="./weui/example/example.css"/>
	<title></title>
	
	<jsp:include page="../cmsallhead.jsp"/>
	<jsp:include page="../bgPower.jsp"/>
</head>
<body class="ontouchstart">
<div class="weui_mask_transition" id="mask"></div>
    <div class="container">
	  <div>
		<div class="weui_tab_bd" id="CMSMgrControl"></div>
		
		<div class="weui_tabbar FWApp" id="lleftmenu">
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
	  </div>
	  <div id="submenu_lleftmenu"></div>
	</div>

	<!-- footer -->
	<jsp:include page="footer.jsp"/>
	<!-- /footer -->
	
	<!-- commjs -->
	<script src="${B}config/config.jsp"></script>
	<script src="${B}breeze/lib/js/jquery.js"></script>

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
