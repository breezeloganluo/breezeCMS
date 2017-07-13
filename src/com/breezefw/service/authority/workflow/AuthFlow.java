package com.breezefw.service.authority.workflow;

import java.util.Map;

import com.breeze.base.log.Level;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.netserver.workflow.WorkFlowUnit;
import com.breeze.framwork.servicerg.ServiceTemplate;
import com.breeze.framwork.servicerg.TemplateItemParserAbs;
import com.breeze.framwork.servicerg.templateitem.CommTemplateItemParser;
import com.breezefw.service.authority.AuthIniter;
import com.breezefw.service.authority.module.AuthorityAction;
import com.breezefw.service.authority.temmplate.AuthItem;

public class AuthFlow extends WorkFlowUnit {
	private final static String SINGLEITEMNAME = "AuthFlow";
	private Logger log = Logger
			.getLogger("com.breezefw.service.authority.workflow.AuthFlow");

	@Override
	public String getName() {
		return SINGLEITEMNAME;
	}

	@Override
	public TemplateItemParserAbs[] getProcessParser() {
		return new TemplateItemParserAbs[] { new CommTemplateItemParser(
				SINGLEITEMNAME, AuthItem.class) };
	}

	@Override
	public int process(BreezeContext context, ServiceTemplate st, String alias,
			int lastResult) {
		// 获取根上下文信息
		BreezeContext root = context;
		if (log.isLoggable(Level.FINE)) {
			log.fine("go Process [" + this.getName() + "]lastResult["
					+ lastResult + "]");
		}
		AuthItem authItem = (AuthItem) this.getItem(root, st, SINGLEITEMNAME);
		if (authItem == null || authItem.getRolePath() == null) {
			// 不需要校验
			log.fine("this service needn't auth!");
			return 0;
		}

		// 如果默认下什么都没有配置，那么就放行，否则根据规则获取actor名称
		String roleName = null;
		BreezeContext actorContext = root.getContextByPath(authItem
				.getRolePath());
		if (actorContext == null || actorContext.isNull()) {
			if (authItem.getDefaultRole() == null) {
				log.fine("needn't auth!");
				return 0;
			} else {
				roleName = authItem.getDefaultRole();
			}
		} else {
			roleName = actorContext.toString();
		}

		// 先进行全局的所有权限判断
		String fullServiceName = st.getPackageName() + '.'
				+ st.getServiceName();
		if (st.getPackageName() == null || "".equals(st.getPackageName())) {
			fullServiceName = st.getServiceName();
		}
		BreezeContext allActionRoot = root.getContextByPath("_G."
				+ AuthIniter.AUTHOPRITY_ALL);
		if (allActionRoot == null || allActionRoot.isNull()){
			log.fine("no data in all action auth pass");
			return 0;
		}
		BreezeContext allAction = allActionRoot.getContext(fullServiceName);

		boolean isInAllAuth = this.actionListJust(root, allAction);
		if (!isInAllAuth) {
			// 不在权限范围内，可以直接认为通过
			log.fine("not in all");
			return 0;
		}
		// 下面要进行真正的权限判断
		allActionRoot = root.getContextByPath("_G."
				+ AuthIniter.AUTHOPRITY_ROLE + '.' + roleName);
		if (allActionRoot == null){
			log.severe("no authFound in role with name:" + roleName);
			return 20;
		}
		allAction = allActionRoot.getContext(fullServiceName);
		if (allAction == null || allAction.isNull()) {
			log.fine("action not found!" + roleName);
			return 20;
		}

		boolean hasRight = this.actionListJust(root, allAction);
		if (hasRight) {
			return 0;
		}
		return 25;// 没权限
	}

	protected boolean actionListJust(BreezeContext root, BreezeContext allAction) {
		if (allAction == null || allAction.isNull()) {
			return false;
		}
		boolean isInAllAuth = false;
		for (int i = 0; i < allAction.getArraySize(); i++) {
			AuthorityAction aa = (AuthorityAction) allAction.getContext(i)
					.getData();
			Map<String, Object> paramMap = aa.getParamJson();
			if (paramMap == null) {
				// 表示这个大的service都加入到权限中了，要继续权限判断
				isInAllAuth = true;
				break;
			}
			boolean flag = true;
			for (String key : paramMap.keySet()) {
				BreezeContext ctValue = root.getContextByPath("_R." + key);
				Object reqValue = null;
				if (ctValue != null && !ctValue.isNull()) {
					reqValue = ctValue.getData();
				}
				Object authValue = paramMap.get(key);
				if (!authValue.equals(reqValue)) {
					// 这个action不是目标
					flag = false;
					break;
				}
			}
			// 如果最后是true，那么就真的是true了
			if (flag) {
				isInAllAuth = true;
				break;
			}
		}
		return isInAllAuth;
	}

}
