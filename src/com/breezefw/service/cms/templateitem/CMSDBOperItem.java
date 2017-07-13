package com.breezefw.service.cms.templateitem;

import com.breeze.framwork.servicerg.FieldDesc;
import com.breeze.framwork.servicerg.TemplateItemBase;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.ability.btl.BTLExecutor;
import com.breezefw.ability.btl.BTLParser;

public class CMSDBOperItem extends TemplateItemBase {
	@FieldDesc(desc = "是否查询父类", title = "是否查询父类", valueRange = "[{yes:'yes',no:'no'}]", type = "Select")
	private String isFather;

	@FieldDesc(desc = "返回的结果比如data", title = "结果", valueRange = "", type = "Text")
	private String resultContextName;

	@FieldDesc(desc = "可选，所使用的sql如果不配置，使用默认的cms自动拼接sql实现", title = "sql", valueRange = "", type = "TextArea")
	private String sql;

	public String getResultContextName() {
		return "data";
	}

	public String getIsFather() {
		return isFather;
	}

	public String getMetadataContextPath() {
		return "_G."+CmsIniter.COMSPATHPRIFIX;
	}

	BTLExecutor sqlExec;

	public BTLExecutor getSql() {
		return sqlExec;
	}

	public void setSql(String sql) {
		this.sql = sql;
	}

	/**
	 * @param isFather
	 *            the isFather to set
	 */
	public void setIsFather(String isFather) {
		this.isFather = isFather;
	}

	/**
	 * @param resultContextName
	 *            the resultContextName to set
	 */
	public void setResultContextName(String resultContextName) {
		this.resultContextName = resultContextName;
	}

	@Override
	public void loadingInit() {
		if (sql != null && !"".equals(sql.trim())) {
			sqlExec = BTLParser.INSTANCE("sql").parser(sql);
		}else{
			sqlExec = null;
		}
	}
}
