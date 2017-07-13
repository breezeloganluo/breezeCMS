<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="com.breeze.framwork.databus.*"%>
<%@page import="com.breeze.framwork.netserver.tool.ContextMgr"%>
<%@page import="java.util.HashMap"%>
<%@page import="java.util.Iterator"%>
<%@page import="java.util.Map"%>
<%@page import="com.breeze.support.cfg.Cfg"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="java.io.File"%>
<%!
	private List<String> getGadget(String basePath,String template,File ... files){
		List<String> list = new ArrayList<String>();
		for(File file : files){
			if(file.isDirectory()){
				list.addAll(getGadget(basePath,template,file.listFiles()));
			}else if(file.isFile()){
				if(file.getName().indexOf("js")!=-1){
					String _path = file.getPath().replace(basePath, "");
					_path = _path.substring(0,_path.length()).replace("\\","/");
					if(_path.startsWith("/")){
						_path = _path.replaceFirst("/", "");
					}
					if(_path.indexOf("CMSMgrResource") != -1 || _path.indexOf("resource") != -1){
						if(_path.indexOf(template) == -1){
							continue;
						}
					}
					list.add("'"+_path+"'");
				}
			}
		}
		return list;
	}
%>
<%
String baseUrl = this.getServletContext().getContextPath();
String configUrlPrefix = Cfg.getCfg().getString("siteprefix");
if (configUrlPrefix !=null && !configUrlPrefix.equals("--")){
	baseUrl = configUrlPrefix;
}
if ("/".equals(baseUrl)){
	request.setAttribute("B","/");
	baseUrl = "";
}else{
	request.setAttribute("B",baseUrl+'/');
}

request.setAttribute("S",baseUrl+"/breeze.brz");
request.setAttribute("_","$");
%>