package com.breezefw.service.cms;

import java.sql.SQLException;

import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breezefw.ability.datarefresh.DataRefreshIF;

public class RefreshSysParam implements DataRefreshIF {

	private static Logger log;
	@Override
	public String getRefreshName() {
		return "sysparam";
	}

	@Override
	public void refresh(BreezeContext root) {
		if (log == null){
			log = Logger.getLogger("com.breezefw.service.cms.RefreshSysParam");
		}
		CmsIniter in = new CmsIniter();
		try {
			in.initCMSParam();
		} catch (SQLException e) {			
			log.severe("exception", e);
		}
	}

}
