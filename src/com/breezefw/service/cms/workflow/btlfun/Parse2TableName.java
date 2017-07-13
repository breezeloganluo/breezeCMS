package com.breezefw.service.cms.workflow.btlfun;

import java.util.ArrayList;

import com.breeze.framwork.databus.BreezeContext;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.framework.workflow.sqlfunction.SqlFunctionAbs;

public class Parse2TableName extends SqlFunctionAbs {

	protected String getName() {
		return "tab";
	}

	protected String fun(String funParam, Object[] evenenvironment,
			ArrayList<Object> output) {
		boolean useView = false;
		BreezeContext root = (BreezeContext)evenenvironment[0];
		
		String param = funParam;
		if (param !=null){
			String[] spArr = param.split(",");
			if (spArr.length>1 ){
				param = spArr[0];
				if ("view".equals(spArr[1])){
					useView = true;
				}
			}
		}
		
		String alias = root.getContextByPath(param).getData().toString();
		//2014-08-15罗光瑜修改：这个函数要支持转换成view，但如果输入的格式是[alias],org那么还是用本表
		BreezeContext data = root.getContextByPath("_G."+CmsIniter.COMSPATHPRIFIX+"."+alias);
		if (data == null || data.isNull()){
			return "_____";
		}
		CMSMetadata cmss = (CMSMetadata)data.getData();
		
		if (data.getType() != BreezeContext.TYPE_DATA){
			//不是数组抛出异常
			throw new RuntimeException("type error:input path is not data");
		}
		
		String tableName =cmss.getTableName();

		if (useView && cmss.isViewNeede()){
			tableName = cmss.getAlias()+"_view";
		}

		return tableName;
	}

	protected String getPackage() {
		return "sql";
	}
}
