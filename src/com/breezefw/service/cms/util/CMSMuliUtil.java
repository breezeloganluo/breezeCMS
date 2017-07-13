package com.breezefw.service.cms.util;

import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.databus.ContextTools;
import com.breeze.framwork.netserver.tool.ContextMgr;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.templateitem.CMSDBOperItem;
import com.breezefw.service.cms.workflow.CMSTools;

/**
 * @author FrankCheng
 * @date 2015年10月20日18:44:41
 * @explain CMS多表工具类
 * */
public class CMSMuliUtil {
	
	private static Logger log = Logger.getLogger("com.breezefw.service.cms.util.CMSMuliUtil");
	
	/**
	 * @author FrankCheng
	 * @date 2015年10月20日18:49:32
	 * @explain 校验对应alias及字段是否存在
	 * @description 检查设置的信息的alias及字段是否真实存在 如存在则返回true 不存在返回false 不符合标准也是false alias.field
	 * @param value 设置的值 
	 * */
	public static boolean checkKeyIsThere(CMSDBOperItem item, BreezeContext root, String value){
		if(value == null || value.isEmpty()){
			log.severe("value can't be null");
			return false;
		}
		String[] str = value.split("\\.");
		if(str.length < 2){
			log.severe("value dataformat is wrong");
			return false;
		}
		String alias = str[0];
		String filed = str[1];
		//校验alias是否真实存在
		String mpath = item.getMetadataContextPath() + '.' + alias;
		BreezeContext metadataContext = root.getContextByPath(mpath);
		if(metadataContext == null || metadataContext.isNull() || metadataContext.isEmpty()){
			log.severe("can't find the metadata");
			return false;
		}
		CMSMetadata metadata = (CMSMetadata) metadataContext.getData();
		if(metadata == null){
			log.severe("metadata is empty");
			return false;
		}
		//校验字段是否真实存在
		BreezeContext _metadata =  ContextTools.getBreezeContext4Json(metadata.getDataDesc());
		if(_metadata.getContext(filed) == null || _metadata.getContext(filed).isNull() || _metadata.getContext(filed).isEmpty()){
			log.severe("the filed isn't exist");
			return false;
		}
		return true;
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年10月20日19:09:182
	 * @explain 获取多表真实表名
	 * @description 获取真正的表名
	 * */
	public static boolean getRealTableName(){
		boolean isThere = true;
		return isThere;
	}
	
	/**
	 * @author FrankCheng
	 * @date 2015年10月21日17:04:23
	 * @explain 获取多表配置信息
	 * @description 存在就会返回以数组形式返回 不存在就会返回null
	 * */
	public static String[] getMuliTab(){
		//设置路径
		String muliTabPath = CmsIniter.CMSPARAMPRIFIX + ".muliTab";
		BreezeContext bc = ContextMgr.global.getContextByPath(muliTabPath);
		if(bc == null || bc.isNull() || bc.toString().equals("--")){
			return null;
		}
		String[] str = bc.toString().split("\\.");
		return str;
	}
}
