<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.breezefw.service.cms.CmsIniter"%>
<%@ page import="com.breeze.framwork.databus.BreezeContext"%>
<%@ page import="com.breeze.framwork.netserver.tool.ContextMgr"%>
<%@ page import="com.breezefw.service.cms.module.CMSMetadata"%>
<%@ page import="com.breeze.framwork.databus.ContextTools"%>
<%@page import="com.breeze.support.cfg.Cfg"%>
<%
    //2016-02-16日罗光瑜修改，这次修改主针对CMS的新版本，这个文件主要是进行分发，而不是做其他处理
	//获取所有的系统配置
	String path1 = CmsIniter.CMSPARAMPRIFIX;
	BreezeContext tmpObjCtx1 = ContextMgr.global.getContextByPath(path1);
	String template = "default";
	
	if (tmpObjCtx1 != null && !tmpObjCtx1.isNull()){
		BreezeContext templateCtx = tmpObjCtx1.getContext("Template");
		if (templateCtx!=null && !templateCtx.isNull()){
			Object tmpVal = tmpObjCtx1.getContext("Template").getData();
			if (tmpVal != null && !"".equals(tmpVal.toString().trim())){
				template = tmpVal.toString().trim();
			}
		}
	}
	request.setAttribute("Template", template);
	String baseUrl = this.getServletContext().getContextPath();
	String configUrlPrefix = Cfg.getCfg().getString("siteprefix");
	if (configUrlPrefix !=null && !configUrlPrefix.equals("--")){
		baseUrl = configUrlPrefix;
	}
	if ("/".equals(baseUrl)){
		baseUrl = "";
	}
	response.sendRedirect(baseUrl+"/page/manager/"+template+"/CMSBaseMgr.jsp");
%>