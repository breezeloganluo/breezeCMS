package com.breezefw.service.cms.workflow.btlfun;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.breeze.framwork.databus.BreezeContext;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.module.CMSMetadataField;
import com.breezefw.service.cms.workflow.CMSQueryFlow;
import com.breezefw.framework.workflow.sqlfunction.SqlFunctionAbs;

public class Parse2CND extends SqlFunctionAbs {

	protected String getName() {
		return "cnd";
	}

	protected String fun(String funParam, Object[] evenenvironment,
			ArrayList<Object> output) {
		BreezeContext root = (BreezeContext)evenenvironment[0];
		String param = root.getContextByPath(funParam).getData().toString();
		BreezeContext data = root.getContextByPath("_G."+CmsIniter.COMSPATHPRIFIX+"."+param);
		if (data == null || data.isNull()){
			return "_____";
		}
		CMSMetadata cmss = (CMSMetadata)data.getData();
		
		if (data.getType() != BreezeContext.TYPE_DATA){
			//不是数组抛出异常
			throw new RuntimeException("type error:input path is not data");
		}
		
		BreezeContext params = root.getContextByPath("_R.param");
		
		StringBuilder sql = new StringBuilder();
		//判断是否存在参数
		if(params != null && !params.isEmpty() && params.getMapSet().size()!=1){
			sql.append(" (");
			int i = params.getMapSet().size()-1;
			int k = 1;
			for(String key:params.getMapSet()){
				if(!key.equals("_baseAlias")){
					sql.append(key).append(" like '").append(params.getContext(key).toString()).append("' ");
					if(k++<i){
						sql.append(" or ");
					}
				}
			}
			//条件拼接结束
			sql.append(") and ");
		}
		
		//获取关联字段
		BreezeContext $bc = root.getContextByPath("_R.param._baseAlias");
		if($bc!=null){
			String baseAlias = root.getContextByPath("_R.param._baseAlias").toString();
			data = root.getContextByPath("_G."+CmsIniter.COMSPATHPRIFIX+"."+baseAlias);
			cmss = (CMSMetadata)data.getData();
		}
		String alias = root.getContextByPath("_R.alias").toString();
		String keyValue = null;
		String baseKeyValue = null;
		
		
		
		if(cmss.getOutAlias()==null||cmss.getOutAlias().equals("")||$bc==null){
			sql.append("1=1");
		}else{
			HashMap<String,CMSMetadataField> map = cmss.getFieldMap();
			Iterator<Entry<String, CMSMetadataField>> iter = map.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry entry = (Map.Entry) iter.next();
				String key = entry.getKey().toString();
				CMSMetadataField val = (CMSMetadataField)entry.getValue();
				if(val.getBuildType()!=1){
					continue;
				}
				String ms = val.getAliasField();
				Pattern pat = Pattern.compile("(.+?)\\.(.+)");
				Matcher math = pat.matcher(ms);
				if(math.find()){
					String mathString = math.group(1);
					if(mathString.equals(alias)){
						keyValue = math.group(2);
						baseKeyValue = val.getFieldName();
					}
				}
			}
			String tableName = cmss.getTableName();
			if (cmss.isViewNeede()){
				tableName = cmss.getAlias()+"_view";
			}
			sql.append(keyValue).append(" not in ( select ").append(baseKeyValue).append(" from ").append(tableName);
			
			if(root.getContextByPath("_R._nodeid")!=null&&!root.getContextByPath("_R._nodeid").equals("")){
				sql.append(" where nodeid = ").append(root.getContextByPath("_R._nodeid").toString()).append(")");
			}else{
				sql.append(")");
			}
		}
		
		//分页
		BreezeContext limitContext = root.getContextByPath("_R.spes.limit");
		if (limitContext != null) {
			CMSQueryFlow.limit(limitContext, sql);
		}
		
		return sql.toString();
	}

	protected String getPackage() {
		return "sql";
	}
}
