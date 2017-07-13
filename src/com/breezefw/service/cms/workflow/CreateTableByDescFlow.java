package com.breezefw.service.cms.workflow;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Map;

import com.breeze.base.db.COMMDB;
import com.breeze.base.log.Level;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.netserver.workflow.WorkFlowUnit;
import com.breeze.framwork.servicerg.ServiceTemplate;
import com.breeze.framwork.servicerg.TemplateItemParserAbs;
import com.breeze.framwork.servicerg.templateitem.CommTemplateItemParser;
import com.breeze.support.tools.GsonTools;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.module.CMSMetadataField;
import com.breezefw.service.cms.templateitem.Desc2TableItem;
import com.breezefw.ability.datarefresh.DataRefreshMgr;

/**
 * 这个类是使用对象描述文件来创建表的方法 输入的是一个字符串，即一个描述文件字符串描述。 要做的事情就是把这个描述文件转换成表
 * 
 * @author Administrator
 */
public class CreateTableByDescFlow extends WorkFlowUnit {
	private Logger log = Logger
			.getLogger("com.breezefw.service.cms.workflow.createTableByDescFlow");
	public static final String NAME = "CreateTableByDesc";
	public static final String ITEMNAME = "descPath";

	@Override
	public String getName() {
		return NAME;
	}

	@Override
	public TemplateItemParserAbs[] getProcessParser() {
		return new TemplateItemParserAbs[] { new CommTemplateItemParser(
				ITEMNAME, Desc2TableItem.class) };
	}

	@Override
	public int process(BreezeContext root, ServiceTemplate st, String alas,
			int lastResult) {
		if (log.isLoggable(Level.FINE)) {
			log.fine("go Process [" + this.getName() + "]lastResult["
					+ lastResult + "]");
		}
		try {
			// 获取自身的alias
			String myAlias = root.getContextByPath("_R.alias").toString();
			ArrayList<String> aliasList = new ArrayList<String>();
			aliasList.add(myAlias);
 			return CmsIniter.getInstance().reloadForRfreshTable(aliasList);		
		} catch (Exception e) {
			
			log.severe("数据库异常", e);
			return 999;
		}
	}
}
