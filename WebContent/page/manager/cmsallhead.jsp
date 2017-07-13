<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="com.breeze.framwork.databus.*"%>
<%@page import="com.breeze.framwork.netserver.tool.ContextMgr"%>
<%@page import="com.breezefw.service.cms.module.CMSMetadata"%>
<%@page import="com.breezefw.service.cms.*"%>
<%@page import="java.util.HashMap"%>
<%@page import="java.util.Iterator"%>
<%@page import="java.util.Map"%>
<%@page import="com.breeze.support.cfg.Cfg"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="java.io.File"%>
<%@page import="java.util.regex.Matcher"%>
<%@page import="java.util.regex.Pattern"%>
<%@page import="com.breeze.framwork.netserver.FunctionInvokePoint"%>
<%@page import="java.util.regex.Matcher"%>
<%@page import="java.util.HashSet"%>
<%@page import="com.breezefw.service.authority.AuthIniter"%>
<%
/*
这个公共文件在这个版本中，因为是无刷新模式，所以实际只加载一次，所以性能还好
*/
%>

<%
    //2016-2-15 这段是简单的修改cms ·metadata的处理，这一段是将cmsmetadata下面的定制数据，就是每个alias对应的定制配置信息，获取回来，并最终放到customized中
	BreezeContext allContext = ContextMgr.global.getContextByPath(CmsIniter.COMSPATHPRIFIX);
	BreezeContext bc = new BreezeContext();
	for(String key:allContext.getMapSet()){
		CMSMetadata cmsMd = (CMSMetadata)allContext.getContext(key).getData();
		BreezeContext dataMemo = cmsMd.getDataMemo();
		if (dataMemo != null && !dataMemo.isEmpty()){
			BreezeContext aliasCfg = dataMemo.getContext("aliasCfg");
			BreezeContext allSystemSetCtx = new BreezeContext();
			//遍历并读取里面所有的配置
			if (aliasCfg!=null && !aliasCfg.isEmpty()){
				for (String keyName:aliasCfg.getMapSet()){
					allSystemSetCtx.setContext(keyName, aliasCfg.getContext(keyName));
				}
			}
			bc.setContext(key, allSystemSetCtx);
		}
	}
	if(bc!=null&&!bc.isNull()){
		request.setAttribute("customized", ContextTools.getJsonString(bc, null));
	}
	
%>
<%
	//这一段将单独某个alias的相关的metadata信息获取到，但这段是否有用，还是未知
	String alias = request.getParameter("alias");
	String path = CmsIniter.COMSPATHPRIFIX + "."+alias;
	BreezeContext aliasContext = ContextMgr.global.getContextByPath(path) ;
	if (aliasContext != null && !aliasContext.isNull()){
		CMSMetadata cmsMd = (CMSMetadata)aliasContext.getData();
		//设置cmsmetadata相关的内容到attribute中
		request.setAttribute("cms.cid",cmsMd.getCid());
		request.setAttribute("cms.alias",cmsMd.getAlias());
		request.setAttribute("cms.parentAlias",cmsMd.getParentAlias());
		request.setAttribute("cms.showName",cmsMd.getShowName());

		//设置扩展信息到系统中
		BreezeContext dataMemo = cmsMd.getDataMemo();
		if (dataMemo != null && !dataMemo.isEmpty()){
			BreezeContext aliasCfg = dataMemo.getContext("aliasCfg");
			//遍历并读取里面所有的配置
			if (aliasCfg!=null && !aliasCfg.isEmpty()){
				for (String keyName:aliasCfg.getMapSet()){
					if (request.getAttribute(keyName)==null){
						request.setAttribute(keyName,aliasCfg.getContext(keyName).getData());
					}				
				}
			}		
		}
	}
%>
<%
	//获取所有的系统配置
	String path1 = CmsIniter.CMSPARAMPRIFIX;
	BreezeContext tmpObjCtx1 = ContextMgr.global.getContextByPath(path1);
	request.setAttribute("skin","defalut");
	BreezeContext allSystemSetCtx = new BreezeContext();
	if (tmpObjCtx1 != null && !tmpObjCtx1.isNull()){
		//把系统配置设置到request里面
		
		for (String key : tmpObjCtx1.getMapSet()) {
			//如果模板本身有设置了值，那么这里不要重复设置
			if ("Template".equals(key)){
				if (request.getAttribute("Template")!=null){
					continue;
				}
			}

			BreezeContext sysValCtx = tmpObjCtx1.getContext(key);
			if (sysValCtx == null){
				continue;
			}
			String val = sysValCtx.getData() == null ? null : sysValCtx.getData().toString();
			//2014-06-15罗光瑜修改，如果key值不存在才进行赋值
			if (request.getAttribute(key)==null){
				request.setAttribute(key,val);
				allSystemSetCtx.setContext(key, new BreezeContext(val));
			}
		}
		request.setAttribute("systemCtx", ContextTools.getJsonString(allSystemSetCtx, null));
	}
%>
<%
    //这一段专门处理模板的
	if (request.getAttribute("Template") == null){
		request.setAttribute("Template","default");
	}
	String tmplateStr = request.getAttribute("Template").toString();
%>
<%
   //这一段是获取左边节点菜单树的，以及菜单树要引用的control
   BreezeContext funParam = new BreezeContext();
   funParam.setContext("alias",new BreezeContext("leftmenu"));
   BreezeContext leftTreeCtx = FunctionInvokePoint.getInc().breezeInvokeUsedCtxAsParam("cms.queryNode",funParam,request,response);
   

   String leftMenuData = "{}";
   HashSet<String>controlUrlSet = new HashSet<String>();
   if ("0".equals(leftTreeCtx.getContext("code").toString())){
	   //设置左边菜单树数据，并用这个变量传于页面
	   BreezeContext leftctx = leftTreeCtx.getContext("data").getContext("cmsdata");
	   leftMenuData = ContextTools.getJsonString(leftctx, null);
	   //下面要分析每一个菜单的alias，并获取其controler
	   for (int i=0;i<leftctx.getArraySize();i++){
		   BreezeContext oneMenuCtx = leftctx.getContext(i);
           String menuTemplate = "default";
		   BreezeContext menuTemplateCtx = oneMenuCtx.getContext("template");
		   if (menuTemplateCtx!= null && !menuTemplateCtx.isNull()){
			   menuTemplate = menuTemplateCtx.toString();
		   }
		   if (!tmplateStr.equals(menuTemplate)){
			   continue;
		   }
		   BreezeContext urlctx = oneMenuCtx.getContext("menuUrl");
		   if (urlctx != null && !urlctx.isNull()){
				String leftMenuUrl = java.net.URLDecoder.decode(urlctx.toString().trim(), "utf-8");
				
				Pattern pattern = Pattern.compile("type=([\\w\\.]+)");
				Matcher matcher = pattern.matcher(leftMenuUrl);
				if  (matcher.find()) {
					String typeUrl = matcher.group(1);
					String[] alltypearray = typeUrl.split("\\.");
					if (alltypearray.length == 1){
						//如果是list就是默认的列表页面，这个不要加入
						if ("list".equals(alltypearray[0])){
							continue;
						}
						//说明是默认的情况，这个路径，将会从page/manager/当前魔板名/gadget/control/开始
						String gadgetAddr = "page/manager/"+tmplateStr+"/gadget/control/"+alltypearray[0]+"_Control";
						controlUrlSet.add(gadgetAddr);
					}else{
						//说明是外部service的情况，外部service的时候，type的结构是xxx.xxx这是目录，并且将会从page开始寻找
						String gadgetAddr = "page";
						for (int ii=0;ii<alltypearray.length;ii++){
							gadgetAddr+=("/"+alltypearray[ii]);
						}
						gadgetAddr+="_Control";
					}
				}
				else if (!"".equals(leftMenuUrl)){
					//默认模板情况
					String controlUrlstr = "page/manager/"+tmplateStr+"/gadget/control/CMSMgrDefaultListControl";
					controlUrlSet.add(controlUrlstr);
				}
		   }
	   }
   }
   boolean isFirst = true;
   StringBuilder controlGadgetBuilder = new StringBuilder();
   for (String one : controlUrlSet){
	   if (isFirst){
		   isFirst = false;
	   }
	   else{
		   controlGadgetBuilder.append(',');
	   }
	   controlGadgetBuilder.append("'").append(one).append("'");
   }
   request.setAttribute("controlGadget",controlGadgetBuilder.toString());
%>

<%
  //这一段从系统配置信息中获取对应的引用参数，从系统中引入gadget，默认模板的系统参数是GadgetImport，否则是[tmplate]GadgetImport
  String templatePrefix = ("default".equals(tmplateStr))?"":tmplateStr;
  BreezeContext gictx = allSystemSetCtx.getContext(templatePrefix+"GadgetInclude");
  if (gictx != null && !gictx.isNull()){
      String[] gadgets = gictx.toString().split(",");
      StringBuilder allSystemGadgetsBuilder = new StringBuilder();
      for (int i=0;i<gadgets.length;i++){
          allSystemGadgetsBuilder.append(",").append('"').append(gadgets[i]).append('"');
      }
	  request.setAttribute("SysGadgetInclude",allSystemGadgetsBuilder.toString());
  }
%>

<%
   //获取权限的信息
	BreezeContext user = (BreezeContext)session.getAttribute("manager");
	if(user==null)return;
	BreezeContext roleCtx = user.getContext("role");
	String authJson = AuthIniter.getActorJson(roleCtx);
	if ("".equals(authJson)){
		authJson = "null";
	}
%>
<script>
	window.systemCtx = ${systemCtx};
	window.customized = ${customized};
	window.cmsleftmenudata = <%=leftMenuData%>
	window.authorityData = <%=authJson%>;
</script>