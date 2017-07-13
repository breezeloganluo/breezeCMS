package com.breezefw.service.cms.templateitem;

import com.breeze.framwork.servicerg.FieldDesc;
import com.breeze.framwork.servicerg.TemplateItemBase;

/**
 * 描述文件到表的flow处理数据字段
 * @author Administrator
 *
 */
public class Desc2TableItem extends TemplateItemBase {
	@FieldDesc(desc = "描述从上下文什么地方取到描述信息路径", title = "描述文件路径", valueRange = "")
	private String descContextPath;
	@FieldDesc(desc = "描述从上下文什么地方取到表名路径", title = "表名路径", valueRange = "")
	private String tableContextPath;
	@FieldDesc(desc = "类型别名上下文获取该值的地方", title = "别名路径", valueRange = "")
	private String aliasNamePath;
	
	public String getDescContextPath(){
		return this.descContextPath;
	}
	
	public String getTableContextPath(){
		return this.tableContextPath;
	}
	
	public void setDescContextPath(String p){
		this.descContextPath = p;
	}
	
	public void setTableContextPath(String p){
		this.tableContextPath = p;
	}

	/**
	 * @return the aliasNamePath
	 */
	public String getAliasNamePath() {
		return aliasNamePath;
	}

	/**
	 * @param aliasNamePath the aliasNamePath to set
	 */
	public void setAliasNamePath(String aliasNamePath) {
		this.aliasNamePath = aliasNamePath;
	}
	
	
}
