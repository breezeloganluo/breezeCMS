package com.breezefw.service.cms.workflow.cmsfunction;

import java.util.ArrayList;

import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.support.tools.Md5;

public class Parser2Md5 extends CMSBTLFunctionAbs {

	private Logger log = Logger
			.getLogger("com.breezefw.ability.btl.function.sql.Parser2Md5");

	@Override
	protected String fun(String funParam, Object[] evenenvironment,
			ArrayList<Object> output) {
		BreezeContext root = (BreezeContext) evenenvironment[0];
		BreezeContext data = root.getContextByPath(funParam);
		if (data == null || data.isNull()) {
			return "";
		} else {
			try {
				return Md5.getMd5Str(data.getData().toString());
			} catch (Exception e) {
				log.severe("md5 excption!", e);
				throw new RuntimeException(e);
			}
		}		
	}

	@Override
	protected String getName() {
		return "md5";
	}

}
