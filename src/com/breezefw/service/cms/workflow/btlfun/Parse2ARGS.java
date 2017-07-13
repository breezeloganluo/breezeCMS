package com.breezefw.service.cms.workflow.btlfun;

import java.util.ArrayList;

import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.module.CMSMetadataField;
import com.breezefw.service.cms.workflow.CMSQueryFlow;
import com.breezefw.ability.btl.BTLExecutor;
import com.breezefw.framework.workflow.sqlfunction.SqlFunctionAbs;

public class Parse2ARGS extends SqlFunctionAbs {

	private Logger log = Logger.getLogger("com.breezefw.service.cms.workflow.btlfun.Parse2ARGS");
	
	@Override
	protected String fun(String funParam, Object[] evenenvironment, ArrayList<Object> output) {
		BreezeContext root = (BreezeContext)evenenvironment[0];
		String param = root.getContextByPath(funParam).getData().toString();
		BreezeContext data = root.getContextByPath("_G."+CmsIniter.COMSPATHPRIFIX+"."+param);
		if (data == null || data.isNull()){
			return "_____";
		}
		//获取元数据
		CMSMetadata metadata = (CMSMetadata)data.getData();
		//用于存放sql语句
		StringBuilder sqlBuilder = new StringBuilder();
		BTLExecutor[] dataOwnerPathArr = metadata.getDataOwner();
		String dataOwner[] = null;
		if (dataOwnerPathArr != null) {
			dataOwner = new String[dataOwnerPathArr.length - 1];
			for (int i = 1; i < dataOwnerPathArr.length; i++) {
				dataOwner[i - 1] = "%"
						+ dataOwnerPathArr[i].execute(new Object[] { root },
								null) + "%";
			}
		}
		//处理查询的结果集信息
		BreezeContext resultsetCtx = root.getContextByPath("_R.resultset");
		String resultset = "all";
		if (resultsetCtx != null && !resultsetCtx.isNull()) {
			resultset = resultsetCtx.getData().toString();
		}
		//查找是否存在默认排序
		boolean hasAutoSort = false;
		for (String key : metadata.getFieldMap().keySet()) {
			CMSMetadataField oneField = metadata.getFieldMap().get(key);
			if (!hasAutoSort && "sort".equals(oneField.getFieldName())) {
				hasAutoSort = true;
			}
		}
		
		CMSQueryFlow.args(root, true, sqlBuilder, metadata, null, log, dataOwner, resultset, hasAutoSort);
		return sqlBuilder.toString();
	}

	@Override
	protected String getName() {
		return "args";
	}

}
