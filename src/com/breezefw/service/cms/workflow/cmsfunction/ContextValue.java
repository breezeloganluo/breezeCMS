package com.breezefw.service.cms.workflow.cmsfunction;

import java.util.ArrayList;

import com.breeze.framwork.databus.BreezeContext;

public class ContextValue extends CMSBTLFunctionAbs {

	@Override
	protected String fun(String funParam, Object[] evenenvironment,
			ArrayList<Object> output) {
		BreezeContext root = (BreezeContext) evenenvironment[0];
		BreezeContext data = root.getContextByPath(funParam);
		if(data == null){
			return "";
		}else{
			return data.getData().toString();
		}
	}

	@Override
	protected String getName() {
		return "ctx";
	}

}
