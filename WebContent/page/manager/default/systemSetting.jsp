<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%><%
	request.setAttribute("LeftMenuClearCach","\n,clearCach:true");
	String B = this.getServletContext().getContextPath()+'/';
	String leftMenuData ="{";
	leftMenuData += ("'系统参数':{url:'page/manager/CMSMgr.jsp?alias=cmsconfig&norole=true'},");
	leftMenuData += "\"菜单配置\":{url:'page/manager/CMSMgr.jsp?alias=leftmenu&type=single&norole=true'},";
	leftMenuData += "\"视图模板\":{url:'page/manager/CMSMgr.jsp?alias=cmsviewtemplate&norole=true'}";
	leftMenuData +="}";
	request.setAttribute("LeftMenuTreeDate","\n,treeDate:"+leftMenuData);
	request.getRequestDispatcher("CMSBaseMgr.jsp").forward(request,response);
%>