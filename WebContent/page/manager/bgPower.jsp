<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.breeze.framwork.databus.BreezeContext"%>
<%@ page import="java.util.*"%>
<%
	if(session.getAttribute("manager")==null)
	{
		
		String loginUrl = "page/manager/"+request.getAttribute("Template")+"/login.jsp";
%>
		<script>
		   alert('请登录!');
		   location.href='${B}<%=loginUrl%>?backurl='+encodeURIComponent(window.location.toString());
		</script>
<%
	}
%>