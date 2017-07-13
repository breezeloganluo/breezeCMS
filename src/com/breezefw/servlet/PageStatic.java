package com.breezefw.servlet;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.databus.ContextTools;
import com.breeze.framwork.netserver.tool.ContextMgr;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;

/**
 * Servlet implementation class PageStatic
 */
@WebServlet("/PageStatic")
public class PageStatic extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public PageStatic() {
        super();
    }
    
    private BreezeContext checkAlias(String alias,String types){
    	BreezeContext bc = new BreezeContext();
    	String path = CmsIniter.COMSPATHPRIFIX + "." + alias;
		BreezeContext aliasContext = ContextMgr.global.getContextByPath(path) ;
		if(aliasContext!=null){
			CMSMetadata cmsMd = (CMSMetadata)aliasContext.getData();
			if(cmsMd!=null){
				BreezeContext cmsContext = cmsMd.getOtherChild();
				//获取所有该alias的模版信息
				if(cmsContext!=null){
					BreezeContext tmp = cmsContext.getContextByPath("cmsview");
					//将json转换成breezecontext
					if(tmp.getContext(types)==null)return null;
					BreezeContext tmpparam = tmp.getContext(types).getContext("tmpparam");
					System.out.println(tmpparam);
					if(tmpparam!=null&&tmpparam.toString().indexOf("\"")!=-1){
						tmpparam = ContextTools.getBreezeContext4Json(tmpparam.toString());
					}
					if(tmpparam!=null&&tmpparam.getContext("isStatic")!=null&&tmpparam.getContext("isStatic").toString().equals("true")){
						bc.setContext("isStatic", new BreezeContext("true"));
						Set<String> set = tmpparam.getMapSet();
						ArrayList<String> arry = new ArrayList<String>();
						for(String name : set){
							if(name.equals("isStatic"))continue;
							arry.add(name);
						}
						bc.setContext("param", new BreezeContext(arry));
						return bc;
					}else{
						return null;
					}
				}
			}
		}
		return null;
    }
    /**
     * 要判断是否是ie8，ie8用sentredirect，其他直接跳转
     * @param goUrl
     * @param request
     * @param response
     * @throws IOException 
     * @throws ServletException 
     */
    private void goPage(String goUrl,HttpServletRequest request,HttpServletResponse response) throws IOException, ServletException{
		request.getRequestDispatcher(goUrl).forward(request, response);
		return;
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 * 有两个地方没有改
	 * 1实际上IE的静态化是有问题的。所以判断是IE应该就直接跳大jsp了
	 * 2对应静态化的_d这种参数都没有处理
	 * 
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//地址必须符合标准
		//       http://www.test.com/page/[style]/alias/type.brp?cid=1
		//若是经过静态化
		//		  http://www.test.com/html/alias/typs_cid-1.html
		//未经过静态化
		//       http://www.test.com/page/[style]/alias/type.jsp?cid=1
		String servletPath = request.getServletPath();															//获取请求页面及其他地址
		String queryString = request.getQueryString();														//获取所有参数
		String url = servletPath; 																								//完整URL
		if(queryString!=null&&!queryString.equals(""))  url+= "?"+queryString;			//判断请求参数是否存在
		
		BreezeContext _style = ContextMgr.global.getContextByPath(CmsIniter.CMSPARAMPRIFIX+"."+"style"); 
		String style = _style==null?"style1":_style.getData().toString();								//读取系统参数style
														
		String html = "/html/";																								//新地址设置
		
		String[] str = url.split("/");																							//URL拆分
		String[] strs = new String[10];																						//定义新的string数组
		int check = 0;
		for(int i=0;i<str.length;i++){																						
			strs[check++] = str[i];
		}
		
		String $alias = null;																										
		String $types = null;																										
		String $style = null;																										
		String _types = null;
		
		//定义style(仅对JSP页面生效)
		$style = strs[str.length-3];				//e.g style1   
		$alias = strs[str.length-2];				//e.g project
		$types = strs[str.length-1];				//e.g product.brp?cid=1
		
		if($types.split("\\?").length>0)_types=$types.split("\\?")[0].replace(".brp", ""); //e.g product
		
		html+=$alias +"/"+$types;				//e.g /html/project/product.brp?cid=1
		
		//获取模版信息
		String path = CmsIniter.COMSPATHPRIFIX +"."+$alias;
		BreezeContext tmpObjCtx = null;
		BreezeContext aliasContext = ContextMgr.global.getContextByPath(path);
		if (aliasContext != null && !aliasContext.isNull()){
			CMSMetadata cmsMd = (CMSMetadata)aliasContext.getData();
			BreezeContext cmsContext = cmsMd.getOtherChild();
			if (cmsContext != null){
				tmpObjCtx = cmsContext.getContextByPath("cmsview." + _types);
			}
		}
		
		String tmpPath = null;
		if(tmpObjCtx!=null&&!tmpObjCtx.isNull()){
			tmpPath = tmpObjCtx.getContext("tmpname").getData().toString();
		}
		
		//检查是否静态化
		BreezeContext bc = checkAlias($alias, _types);
		
		if(bc!=null&&bc.getContext("isStatic").getData().toString().equals("true")){
			//访问HTML页面
			//e.g. product/productdesc-cid_2.html
			ArrayList<String> arry = (ArrayList<String>) bc.getContext("param").getData();
			for(int i =0;i<arry.size();i++){
				String param = arry.get(i);
				String val = request.getParameter(param);
				_types+="-"+param+"_"+val;
			}
			if($types.equals("")){
				html = html.replace("brp", "jsp");										//e.g /html/project/product.jsp?cid=1
			}else{
				html = html.replace($types, _types+".html");					//e.g /html/project/product_cid-1.html
			}
			this.goPage(html, request, response);
		}else{
			url = tmpPath == null ? url : tmpPath;
			this.goPage(url.replaceAll("brp", "jsp").replaceAll($alias, "page/"+style+"/"+$alias),request, response);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}
}
