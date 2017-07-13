package com.breezefw.service.cms.workflow.btlfun;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.breeze.framwork.databus.BreezeContext;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.module.CMSMetadataField;
import com.breezefw.framework.workflow.sqlfunction.SqlFunctionAbs;

public class Parse2CountOrAll extends SqlFunctionAbs {

	protected String getName() {
		return "types";
	}

	protected String fun(String funParam, Object[] evenenvironment,
			ArrayList<Object> output) {
		BreezeContext root = (BreezeContext)evenenvironment[0];
		String sql = "*";
		if(root.getContextByPath("_R.resultset")!=null){
			if(root.getContextByPath("_R.resultset").getData().toString().equals("count")){
				sql = " count(*) as count ";
			}
		}
		
		return sql;
	}

	protected String getPackage() {
		return "sql";
	}
}
