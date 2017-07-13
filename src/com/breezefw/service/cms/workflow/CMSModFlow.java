package com.breezefw.service.cms.workflow;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Map;
import java.util.Set;

import com.breeze.base.db.COMMDB;
import com.breeze.base.log.Level;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.netserver.tool.ContextMgr;
import com.breeze.framwork.netserver.workflow.WorkFlowUnit;
import com.breeze.framwork.servicerg.ServiceTemplate;
import com.breeze.framwork.servicerg.TemplateItemParserAbs;
import com.breeze.framwork.servicerg.templateitem.CommTemplateItemParser;
import com.breeze.support.cfg.Cfg;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.module.CMSMetadataField;
import com.breezefw.service.cms.templateitem.CMSDBOperItem;
import com.breezefw.service.cms.util.CMSMuliUtil;
import com.breezefw.ability.btl.BTLExecutor;
import com.breezefw.ability.datarefresh.DataRefreshMgr;

public class CMSModFlow extends WorkFlowUnit {

	private String FLOWNAME = "CMSModFlow";
	public static final String ITEMNAME = "CMSOperItem";
	private Logger log = Logger
			.getLogger("com.breezefw.service.cms.workflow.CMSModFlow");

	@Override
	public String getName() {
		return FLOWNAME;
	}

	@Override
	public TemplateItemParserAbs[] getProcessParser() {
		return new TemplateItemParserAbs[] { new CommTemplateItemParser(
				ITEMNAME, CMSDBOperItem.class) };
	}

	@Override
	public int process(BreezeContext root, ServiceTemplate st, String alias,
			int lastResult) {
		if (log.isLoggable(Level.FINE)) {
			log.fine("go Process [" + this.getName() + "]lastResult["
					+ lastResult + "]");			
		}
		// 获取本业务的配置文件
		CMSDBOperItem item = (CMSDBOperItem) this.getItem(root, st, ITEMNAME);

		try {
			// 获取table
			String mpath = item.getMetadataContextPath() + '.'
					+ root.getContextByPath("_R.alias").toString();
			BreezeContext metadataContext = root.getContextByPath(mpath);
			if (metadataContext == null) {
				log.severe("metadataContext not found!");
				return 999;
			}

			CMSMetadata metadata = (CMSMetadata) metadataContext.getData();
			if (metadata == null) {
				log.severe("metadata is null!");
				return 999;
			}

			String refreshName = metadata.getDataRefresh();

			//判断是对付清操作还是对儿子操作
			if ("yes".equals(item.getIsFather())) {
				//2014-01-14 罗光瑜修改 要先判断权限，否则metadtata被修改成father就判断不对了
				if (!metadata.getRoleSetting()[5]){						
					if (log.isLoggable(Level.FINE)) {
						String logMsg = metadata.getAlias() + " no cms role for father!theAuth is\n";
						for (int i=0;i<metadata.getRoleSetting().length;i++){
							logMsg = logMsg + "," + metadata.getRoleSetting()[i];
						}
						logMsg = logMsg + " auth is in{5}";
						log.fine(logMsg);
						
					}
					return 20;
				}
				CMSMetadata father = metadata.getFather();
				if (father != null) {
					metadata = father;
					refreshName = metadata.getDataRefresh();					
				} else {
					log.fine("father is null!");
					return 101;
				}
			}
			//2014-01-14 罗光瑜修改 增加对权限的判断，对儿子的修改操作是序号1
			else{
				if (!metadata.getRoleSetting()[1]){
					if (log.isLoggable(Level.FINE)) {
						String logMsg = metadata.getAlias() + " no cms role!theAuth is\n";
						for (int i=0;i<metadata.getRoleSetting().length;i++){
							logMsg = logMsg + "," + metadata.getRoleSetting()[i];
						}
						logMsg = logMsg + " auth is in{1}";
						log.fine(logMsg);
						
					}
					return 20;
				}
			}

			// 2013-8-24罗光瑜修改，dataOwner支持多个选择从前面往后选择一个
			BTLExecutor[] dataOwnerPathArr = metadata.getDataOwner();
			String dataOwner = null;
			if (dataOwnerPathArr != null) {
				dataOwner = "%"+dataOwnerPathArr[0].execute(new Object[]{root}, null)+"%";
			}

			String tableName = metadata.getTableName();

			// 合成 sql参数
			StringBuilder sqlBuilder = new StringBuilder();
			//2015年10月22日15:59:47 FrankCheng
			//如果改表为多表 那么根据当前用的session中的muliTab进行多表查询 若不存在那么查询普通表
			if(CMSMuliUtil.getMuliTab() != null){
				if(metadata.getIsMuliTab() != null && metadata.getIsMuliTab().equals("1")){
					//获取用户中的信息
					BreezeContext userContext = ContextMgr.getRootContext().getContextByPath("_S.manager.muliTab");
					if(userContext!= null && !userContext.isNull() && !"".equals(userContext.toString())){
						tableName = userContext.toString() + "_" + tableName;
					}
				}
			}
			sqlBuilder.append("update ").append(tableName).append(" set ");

			ArrayList<Object> sqlParam = new ArrayList<Object>();
			BreezeContext param = root.getContextByPath("_R.param");
			boolean isFirst = true;
			if (param == null) {
				log.severe("the param is null!");
				return 999;
			}
			Object cid = null;
			Set<String> keySet = param.getMapSet();
			if (keySet == null) {
				log.severe("the param map is null!");
				return 999;
			}
			
			//2015年10月21日16:47:16 FrankCheng 若为cmsconfig修改 那么判断是否为特殊字段年修改
			if(metadata.getAlias().equals("cmsconfig") && param.getContext("name").toString().equals("muliTab")){
				//检查是否有应先数据 若有影响那么禁止修改 无影响正常修改
				String sql = "SELECT COUNT(*) AS `count` FROM cmsmetadata WHERE isMuliTab = '1'";
				ResultSet result = COMMDB.executeSql(sql);
				if(result.next()){
					String count = result.getString(1);
					if(!count.equals("0")){
						log.severe("You are modifying special fields");
						result.close();
						return 503;
					}else{
						//校验是否存在对应字段
						if(!CMSMuliUtil.checkKeyIsThere(item, root, param.getContext("value").toString())){
							log.severe("You are setting up a key field, but the data format is not up to standard.");
							result.close();
							return 502;
						}
					}
				}
				result.close();
			}
			
			for (String key : keySet) {
				if ("cid".equalsIgnoreCase(key)) {
					cid = ((BreezeContext) param.getContext(key)).getData();
					continue;
				}
				if ("opertime".equalsIgnoreCase(key)) {
					continue;
				}
				CMSMetadataField df = metadata.getFieldMap().get(key);
				if (df == null
						|| df.getBuildType() == CMSMetadataField.BUILDTYPE_OURTER) {
					continue;
				}
				if (isFirst) {
					isFirst = false;
				} else {
					sqlBuilder.append(',');
				}
				sqlBuilder.append(key).append("=?");
				if (df == null || df.getFieldTmp() == null) {
					String value = param.getContext(key).toString();
					sqlParam.add(value);
				} else {
					sqlParam.add(df.getFieldTmp().execute(new Object[]{root}, null));					
				}

			}
			sqlBuilder.append(",opertime=?");
			sqlParam.add(System.currentTimeMillis());
			sqlBuilder.append(" where cid =?");
			sqlParam.add(cid);

			if (dataOwner != null) {
				sqlBuilder.append(" and dataOwner like ?");
				sqlParam.add(dataOwner);
			}

			String sql = sqlBuilder.toString();

			log.fine("sql is :" + sql);
			log.fine("param is:" + sqlParam);
			int result = COMMDB.executeUpdate(sql, sqlParam);

			root.setContext(item.getResultContextName(), new BreezeContext(
					result));

			if (refreshName != null) {
				if (DataRefreshMgr.getInstance().getRefresh(refreshName) != null) {
					DataRefreshMgr.getInstance().getRefresh(refreshName)
							.refresh(root);
				}
			}

			return 0;
		} catch (SQLException e) {
			log.severe("encount a exception", e);
			return 10000 + e.getErrorCode();
		} catch (Exception e) {
			log.severe("encount a exception", e);
		}
		return 999;
	}

}
