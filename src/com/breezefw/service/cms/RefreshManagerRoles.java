package com.breezefw.service.cms;

import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breezefw.service.authority.AuthIniter;
import com.breezefw.ability.datarefresh.DataRefreshIF;

/**
 * @author FrankCheng
 * @version 1.01
 * @describe 刷新权限缓存
 * */
public class RefreshManagerRoles implements DataRefreshIF{
	
	private static Logger log;
	
	@Override
	public String getRefreshName() {
		return "managerRoles";
	}

	@Override
	public void refresh(BreezeContext root) {
		if(log == null){
			log = Logger.getLogger("com.breezefw.service.cms.RefreshManagerRoles");
		}
		AuthIniter ai = new AuthIniter();
		ai.refresh(root);
		log.fine("refresh manager roles");
	}
}
