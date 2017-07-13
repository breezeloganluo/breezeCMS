package com.breezefw.service.cms.workflow;


import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import com.breeze.base.db.COMMDB;
import com.breeze.base.log.Level;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.databus.ContextTools;
import com.breeze.framwork.netserver.tool.ContextMgr;
import com.breeze.framwork.netserver.workflow.WorkFlowUnit;
import com.breeze.framwork.servicerg.ServiceTemplate;
import com.breeze.framwork.servicerg.TemplateItemParserAbs;
import com.breeze.framwork.servicerg.templateitem.CommTemplateItemParser;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.module.CMSMetadataField;
import com.breezefw.service.cms.templateitem.CMSDBOperItem;
import com.breezefw.service.cms.util.CMSMuliUtil;
import com.breezefw.ability.btl.BTLExecutor;
import com.breezefw.ability.datarefresh.DataRefreshMgr;

public class CMSAddFlow extends WorkFlowUnit {

	private String FLOWNAME = "CMSAddFlow";
	public static final String ITEMNAME = "CMSOperItem";
	private static final HashMap String = null;
	private Logger log = Logger
			.getLogger("com.breezefw.service.cms.workflow.CMSAddFlow");

	@Override
	public String getName() {
		return FLOWNAME;
	}

	/**
	 * 增加了更新数据的刷新功能 通过调用initer来初始化刷新列表，到时可以根据刷新的配置来刷新数据
	 */
	@Override
	protected void loadingInit() {

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
			String cmsAlias = root.getContextByPath("_R.alias").toString();
			
			String mpath = item.getMetadataContextPath() + '.' + cmsAlias;
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

			//判断是对老爸操作还是对儿子操作
			if ("yes".equals(item.getIsFather())) {
				//2014-01-14 罗光瑜修改 要先判断权限，否则metadtata被修改成father就判断不对了
				if (!metadata.getRoleSetting()[4]){						
					if (log.isLoggable(Level.FINE)) {
						String logMsg = metadata.getAlias() + " no cms role for father!theAuth is\n";
						for (int i=0;i<metadata.getRoleSetting().length;i++){
							logMsg = logMsg + "," + metadata.getRoleSetting()[i];
						}
						logMsg = logMsg + " auth is in{4}";
						log.fine(logMsg);
						
					}
					return 20;
				}
				CMSMetadata father = metadata.getFather();
				if (father != null) {
					metadata = father;
					cmsAlias = father.getAlias();
					refreshName = metadata.getDataRefresh();					
				} else {
					log.fine("father is null!");
					return 101;
				}
			}
			//2014-01-14 罗光瑜修改 增加对权限的判断，对儿子的增加操作是序号0
			else{
				if (!metadata.getRoleSetting()[0]){
					if (log.isLoggable(Level.FINE)) {
						String logMsg = metadata.getAlias() + " no cms role!theAuth is\n";
						for (int i=0;i<metadata.getRoleSetting().length;i++){
							logMsg = logMsg + "," + metadata.getRoleSetting()[i];
						}
						logMsg = logMsg + " auth is in{0}";
						log.fine(logMsg);
						
					}
					return 20;
				}
			}
			// 2013-8-24罗光瑜修改，dataOwner支持多个选择从前面往后选择一个
			BTLExecutor[] dataOwnerPathArr = metadata.getDataOwner();
			String dataOwner = null;
			if (dataOwnerPathArr != null) {				
				dataOwner = dataOwnerPathArr[0].execute(new Object[]{root}, null);				
			}
			String tableName = metadata.getTableName();
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
				//如果插入的是关键表
				if(metadata.getIsMuliTab() != null && metadata.getIsMuliTab().equals("0") && metadata.getAlias().equals(CMSMuliUtil.getMuliTab()[0])){
					//进行多次插入
					//查找所有多表模式的表
					String sql = "select tableName,alias from cmsmetadata where isMuliTab = '1'";
					ResultSet rs = COMMDB.executeSql(sql);
					BreezeContext bc = root.getContextByPath("_R.param");
					String key = bc.getContext(CMSMuliUtil.getMuliTab()[1]).toString();
					Map<String, CMSMetadata> m = new HashMap();
					while(rs.next()){
						String newTableName = key + "_" + rs.getString(1);
						String value = null;
						// 这种情况走回老方法，先删除再增加
						StringBuilder sb = new StringBuilder();
						//根据alias获取指定metadata
						CMSMetadata _metadata = CmsIniter.getInstance().getDataByAlias(rs.getString(2));
						m.put(rs.getString(2), _metadata);
						sb.append("create table ").append(newTableName).append('(');
						for (String fieldName : _metadata.getFieldMap().keySet()) {
							CMSMetadataField field = _metadata.getFieldMap().get(fieldName);
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
						COMMDB.executeUpdate("drop table if exists " + newTableName);
						COMMDB.executeUpdate(sb.toString());
					}
					//生成视图
					Iterator iter = m.entrySet().iterator();
					while (iter.hasNext()) {
						Map.Entry entry = (Map.Entry) iter.next(); 
						Object val = entry.getValue();
						HashMap<Integer, Boolean> viewFlag = new HashMap<Integer, Boolean>();
						CmsIniter.getInstance().setView((CMSMetadata)val, viewFlag, key);
					}
					rs.close();
				}
			}
			// 合成 sql参数
			StringBuilder sqlBuilder1 = new StringBuilder();
			sqlBuilder1.append("insert into ").append(tableName).append('(');
			StringBuilder sqlBuilder2 = new StringBuilder();
			sqlBuilder2.append("values(");

			ArrayList<Object> sqlParam = new ArrayList<Object>();
			BreezeContext param = root.getContextByPath("_R.param");
			boolean isFirst = true;
			if (param == null) {
				log.severe("the param is null!");
				return 999;
			}

			Set<String> keySet = param.getMapSet();
			if (keySet == null) {
				log.severe("the param map is null!");
				return 999;
			}
			
			//2015-10-21 11:14:36 FrankCheng 若为cmsconfig添加 判断是否key值关键字
			if(cmsAlias.equals("cmsconfig") && !param.getContext("name").isEmpty() && param.getContext("name").toString().equals("muliTab")){
				//若value为空提示关键字段不可以为空
				if(param.getContext("value").isEmpty()){
					log.severe("You are setting up a key field, but the data can't be empty.");
					return 501;
				}
				//value为--表示不设置
				if(!param.getContext("value").toString().equals("--")){
					//校验字段内容是否符合标准
					if(CMSMuliUtil.checkKeyIsThere(item, root, param.getContext("value").toString())){
						//存在的话 去查询对应表的信息 若对应表有数据不让添加 必须为空表才可以
						CMSMetadata _metadata = CmsIniter.getInstance().getDataByAlias(param.getContext("value").toString().split("\\.")[0]);
						String sql = "select count(*) from " + _metadata.getTableName();
						ResultSet rs = COMMDB.executeSql(sql);
						if(rs.next()){
							String count = rs.getString(1);
							if(!count.equals("0")){
								log.severe("the muliTab table must be null");
								rs.close();
								return 504;
							}
							rs.close();
						}
					}else{
						log.severe("You are setting up a key field, but the data format is not up to standard.");
						return 502;
					}
				}
			}
			
			for (String key : keySet) {
				// cid自动增长的，被忽略，在5.0的mysql中传入cid=''这时是要报错的
				if ("cid".equalsIgnoreCase(key)) {
					continue;
				}
				// alias后面单独加
				if ("alias".equalsIgnoreCase(key)
						|| "opertime".equalsIgnoreCase(key)) {
					continue;
				}
				CMSMetadataField df = metadata.getFieldMap().get(key);
				if (df == null
						|| df.getBuildType() == CMSMetadataField.BUILDTYPE_OURTER) {
					continue;
				}
				// 2013-11-13日罗光瑜修改，如果客户端参数传上来的是一个空字符串，那么就不要填东西，便于使用数据库的默认值
				if ((df == null || df.getFieldTmp() == null)
						&& "".equals(param.getContext(key).toString())) {
					//2013-11-21日罗光瑜修改，如果客户端上传是一个空字符串，而且没有定义模板，那么才忽略，有模板的还不能忽略
					if (df == null || df.getFieldTmp() == null) {

						continue;
					}
				}

				if (isFirst) {
					isFirst = false;
				} else {
					sqlBuilder1.append(',');
					sqlBuilder2.append(',');
				}
				sqlBuilder1.append(key);
				sqlBuilder2.append('?');
				if (df == null || df.getFieldTmp() == null) {
					String value = param.getContext(key).toString();
					sqlParam.add(value);
				} else {
					sqlParam.add(df.getFieldTmp().execute(new Object[] { root }, null));
				}

			}
			if (dataOwner != null) {
				sqlBuilder1.append(",dataOwner");
				sqlBuilder2.append(",?");
				sqlParam.add(dataOwner);
			}
			sqlBuilder1.append(",alias,opertime)");
			sqlBuilder2.append(",?,?)");
			sqlParam.add(cmsAlias);
			sqlParam.add(System.currentTimeMillis());

			String sql = sqlBuilder1.toString() + sqlBuilder2.toString();
			log.fine("sql is :" + sql);
			log.fine("param is:" + sqlParam);
			int[] result = COMMDB.executeUpdateGetGenrateKey(sql, sqlParam);

			BreezeContext resultContext = new BreezeContext();
			for (int i = 0; i < result.length; i++) {
				resultContext.pushContext(new BreezeContext(result[i]));
			}

			root.setContext(item.getResultContextName(), resultContext);

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
