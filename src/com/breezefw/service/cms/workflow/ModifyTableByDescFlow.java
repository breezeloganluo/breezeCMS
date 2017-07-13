package com.breezefw.service.cms.workflow;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
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
 * 修改表不是用alert实现，而是使用drop再创建的方式 注意，有可能不用修改表的，这个时候表描述文件的上下文路径是找不到对应数据，
 * 这个属于正常情况，程序不能报错 当两个alias关联同一个表，然后改其中一张表时，会将这张表直接删除，没有考虑到这张表还有另一张表关联着的
 * 这个问题要修改！
 * 
 * @author Administrator
 * 
 */
public class ModifyTableByDescFlow extends WorkFlowUnit {
	private Logger log = Logger
			.getLogger("com.breezefw.service.cms.workflow.modifyTableByDescFlow");
	public static final String NAME = "ModifyTableByDesc";
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
		// 获取自身的alias
		String myAlias = root.getContextByPath("_R.alias").toString();
		try {
			ArrayList<String> reloadTableList = new ArrayList<String>();
			CMSMetadata opmetadata = CmsIniter.getInstance().getDataByAlias(
					myAlias);
			if (opmetadata == null) {
				log.severe("deleteed alias not found");
				return 101;// 原来的对象未找到
			}
			reloadTableList.add(opmetadata.getAlias());
			CMSMetadata superMetadata = opmetadata.getSuper();
			if (superMetadata != null) {
				reloadTableList.add(superMetadata.getAlias());
			}
			return CmsIniter.getInstance()
					.reloadForRfreshTable(reloadTableList);
		} catch (Exception ee) {
			log.severe("exception!", ee);
		}
		return 999;
	}

	protected void deleteCreate(String oldTableName, String newTableName,
			CMSMetadata cmsm) throws SQLException {
		CMSMetadata newOne = cmsm;
		// 这种情况走回老方法，先删除再增加
		StringBuilder sb = new StringBuilder();
		sb.append("create table ").append(newTableName).append('(');
		for (String fieldName : newOne.getFieldMap().keySet()) {
			CMSMetadataField field = newOne.getFieldMap().get(fieldName);
			if (field.getBuildType() == CMSMetadataField.BUILDTYPE_OURTER) {
				continue;
			}
			// 每个fieldName就是字段名，而Map对应的值还是map是其字段声明文件
			sb.append(fieldName).append(' ').append(field.getFieldType());// .append(" varchar(1024) default NULL,");
			if (field.getSize() > 0) {
				sb.append('(').append(field.getSize()).append(")");
			}
			if (field.getExtra() != null) {
				sb.append(' ').append(field.getExtra());
			}
			sb.append(',');
		}
		sb.append("PRIMARY KEY  (cid)");
		sb.append(')');

		COMMDB.executeUpdate("drop table if exists " + oldTableName);
		COMMDB.executeUpdate(sb.toString());
		this.refreshGlobal();
	}

	private void doPermissions(BreezeContext root) throws SQLException {
		// 添加权限
		BreezeContext isRoles = root.getContextByPath("_R.isRoles");
		BreezeContext alias = root.getContextByPath("_R.alias");
		BreezeContext displayName = root.getContextByPath("_R.displayName");

		if (isRoles != null && !isRoles.isNull()) {
			// 增加权限
			if (isRoles.getData().toString().equals("1")) {
				String sqlString = "delete from wg_action where paramJson='{alias:\""
						+ alias + "\"}'";
				COMMDB.executeUpdate(sqlString);

				sqlString = "insert into wg_action(paramJson,alias,actionName,serviceName) "
						+ "values('{alias:\""
						+ alias
						+ "\"}','action','查询"
						+ displayName + "','cms.queryContent')";
				COMMDB.executeUpdate(sqlString);
				sqlString = "insert into wg_action(paramJson,alias,actionName,serviceName) "
						+ "values('{alias:\""
						+ alias
						+ "\"}','action','新增"
						+ displayName + "','cms.addContent')";
				COMMDB.executeUpdate(sqlString);
				sqlString = "insert into wg_action(paramJson,alias,actionName,serviceName) "
						+ "values('{alias:\""
						+ alias
						+ "\"}','action','修改"
						+ displayName + "','cms.modifyContent')";
				COMMDB.executeUpdate(sqlString);
				sqlString = "insert into wg_action(paramJson,alias,actionName,serviceName) "
						+ "values('{alias:\""
						+ alias
						+ "\"}','action','删除"
						+ displayName + "','cms.deleteContent')";
				COMMDB.executeUpdate(sqlString);
				// 节点

				if (root.getContextByPath("_R.parentAlias") != null
						&& !root.getContextByPath("_R.parentAlias").isNull()) {
					sqlString = "insert into wg_action(paramJson,alias,actionName,serviceName) "
							+ "values('{alias:\""
							+ alias
							+ "\"}','action','新增"
							+ displayName + "节点','cms.addNode')";
					COMMDB.executeUpdate(sqlString);
					sqlString = "insert into wg_action(paramJson,alias,actionName,serviceName) "
							+ "values('{alias:\""
							+ alias
							+ "\"}','action','修改"
							+ displayName + "节点','cms.modifyNode')";
					COMMDB.executeUpdate(sqlString);
					sqlString = "insert into wg_action(paramJson,alias,actionName,serviceName) "
							+ "values('{alias:\""
							+ alias
							+ "\"}','action','删除"
							+ displayName + "节点','cms.deleteNode')";
					COMMDB.executeUpdate(sqlString);
				}
				DataRefreshMgr.getInstance().getRefresh("refreshAuth");
			}
			// 删除
			else if (isRoles.getData().toString().equals("2")) {
				String sqlString = "delete from wg_action where paramJson='{alias:\""
						+ alias + "\"}'";
				COMMDB.executeUpdate(sqlString);
			}
		}
	}

	protected CMSMetadata getDataByAlias(String rightAlias) {
		return CmsIniter.getInstance().getDataByAlias(rightAlias);
	}

	protected void refreshGlobal() {
		CmsIniter.getInstance().reload();
	}
}
