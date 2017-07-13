package com.breezefw.service.cms.workflow;

import java.util.HashMap;

import com.breeze.base.log.Level;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.netserver.workflow.WorkFlowUnit;
import com.breeze.framwork.servicerg.ServiceTemplate;
import com.breeze.framwork.servicerg.TemplateItemParserAbs;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.templateitem.LoanHelpInfo;
/**
 * 这个类主要作用就是合并来自service的信息，然后转换成要记录的操作员记录
 * @author 罗光瑜
 *
 */
public class PreOperRecord extends WorkFlowUnit {
	private static int seq = 0;
	private String FLOWNAME = "PreOperRecord";
	// public static final String ITEMNAME = "CMSOperItem";
	private Logger log = Logger
			.getLogger("com.breezefw.service.cms.PreOperRecord");

	@Override
	public String getName() {
		return FLOWNAME;
	}

	@Override
	public TemplateItemParserAbs[] getProcessParser() {
		return new TemplateItemParserAbs[] {};
	}

	public static HashMap<Integer, LoanHelpInfo> loanInfoMap = new HashMap<Integer, LoanHelpInfo>();

	@Override
	public int process(BreezeContext root, ServiceTemplate st, String alias,
			int lastResult) {
		if (log.isLoggable(Level.FINE)) {
			log.fine("go Process [" + this.getName() + "]lastResult["
					+ lastResult + "]");
		}
		try {
			String serviceName = root.getContext("_FServiceName").toString();
			//获取操作名
			String operName = null;
			if ("cms.addContent".equals(serviceName)){
				operName = "添加";
			}else if("cms.modifyContent".equals(serviceName)){
				operName = "修改";
			}else if("cms.deleteContent".equals(serviceName)){
				operName = "删除";
			}else if ("statusCtr.setStatus".equals(serviceName)){
				operName = "审核";
			}
			//根据alias获取别名名称
			String sAlias = root.getContextByPath("_R.alias").toString();
			
			String path = "_G."+CmsIniter.COMSPATHPRIFIX + "."+sAlias;
			CMSMetadata metadata = (CMSMetadata)root.getContextByPath(path).getData();
			operName += metadata.getShowName();
			//处理参数
			String param = root.getContextByPath("_R.param").toString();
			//将信息设置到上下文中
			root.setContextByPath("p.oper", new BreezeContext(operName));
			root.setContextByPath("p.param", new BreezeContext(param));
			return 0;
		} catch (Exception e) {
			log.severe("", e);
			return 999;
		}
	}

}
