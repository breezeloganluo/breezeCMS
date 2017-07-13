package com.breezefw.service.cms.workflow;

import java.util.ArrayList;

import com.breeze.base.log.Level;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.netserver.workflow.WorkFlowUnit;
import com.breeze.framwork.servicerg.ServiceTemplate;
import com.breeze.framwork.servicerg.TemplateItemParserAbs;
import com.breeze.framwork.servicerg.templateitem.CommTemplateItemParser;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.templateitem.Desc2TableItem;

public class DeleteTableByDescFlow extends WorkFlowUnit {
	private Logger log = Logger
			.getLogger("com.breezefw.service.cms.workflow.deleteTableByDescFlow");
	public static final String NAME = "DeleteTableByDesc";
	public static final String ITEMNAME = "descPath";
	private static Object lock = new Object();

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
		synchronized (lock) {

			if (log.isLoggable(Level.FINE)) {
				 log.fine("go Process [" + this.getName() + "]lastResult["
				 + lastResult + "]");
			}

			

			// 执行sql语句
			try {
				// 获取自身的alias
				String myAlias = root.getContextByPath("_R.alias").toString();
				CMSMetadata delObj = CmsIniter.getInstance().getDataByAlias(myAlias);
				if (delObj == null){
					log.severe("deleteed alias not found");
					return 101;
				}
				ArrayList<String> changeList = new ArrayList<String>();
				if (delObj.getSuper()!= null){
					changeList.add(delObj.getSuper().getAlias());
				}
				if (delObj.getSubMetadata()!=null){
					for(CMSMetadata a : delObj.getSubMetadata()){
						changeList.add(a.getAlias());
					}
				}
				return 0;
			} catch (Exception ee) {
				log.severe("other exception", ee);
			}
			return 999;
		}
	}

}
