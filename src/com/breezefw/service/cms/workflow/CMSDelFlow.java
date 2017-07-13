package com.breezefw.service.cms.workflow;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
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
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.templateitem.CMSDBOperItem;
import com.breezefw.service.cms.util.CMSMuliUtil;
import com.breezefw.ability.btl.BTLExecutor;
import com.breezefw.ability.datarefresh.DataRefreshMgr;

public class CMSDelFlow extends WorkFlowUnit {

	private String FLOWNAME = "CMSDelFlow";
	public static final String ITEMNAME = "CMSOperItem";
	private Logger log = Logger
			.getLogger("com.breezefw.service.cms.workflow.CMSDelFlow");

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
			// 判断是对付清操作还是对儿子操作
			if ("yes".equals(item.getIsFather())) {
				// 2014-01-14 罗光瑜修改 要先判断权限，否则metadtata被修改成father就判断不对了
				if (!metadata.getRoleSetting()[6]) {
					if (log.isLoggable(Level.FINE)) {
						String logMsg = metadata.getAlias()
								+ " no cms role for father!theAuth is\n";
						for (int i = 0; i < metadata.getRoleSetting().length; i++) {
							logMsg = logMsg + ","
									+ metadata.getRoleSetting()[i];
						}
						logMsg = logMsg + " auth is in{6}";
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
			// 2014-01-14 罗光瑜修改 增加对权限的判断，对儿子的删除操作是序号2
			else {
				if (!metadata.getRoleSetting()[2]) {
					if (log.isLoggable(Level.FINE)) {
						String logMsg = metadata.getAlias()
								+ " no cms role!theAuth is\n";
						for (int i = 0; i < metadata.getRoleSetting().length; i++) {
							logMsg = logMsg + ","
									+ metadata.getRoleSetting()[i];
						}
						logMsg = logMsg + " auth is in{2}";
						log.fine(logMsg);

					}
					return 20;
				}
			}

			// 2013-8-24罗光瑜修改，dataOwner支持多个选择从前面往后选择一个
			// 2014-1-17罗光瑜修改，data使用打他模板方式处理
			BTLExecutor[] dataOwnerPathArr = metadata.getDataOwner();
			String dataOwner = null;
			if (dataOwnerPathArr != null) {
				dataOwner = "%"
						+ dataOwnerPathArr[1].execute(new Object[] { root },
								null) + "%";
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
				//如果是关键表进行删除 进行提示 此表仅可以进行插入操作
				if(metadata.getIsMuliTab() != null && metadata.getIsMuliTab().equals("0") && metadata.getAlias().equals(CMSMuliUtil.getMuliTab()[0])){
					log.severe("you can't delete from muliTab table!");
					return 508;
				}
			}
			sqlBuilder.append("delete from ").append(tableName);

			ArrayList<Object> sqlParam = new ArrayList<Object>();
			BreezeContext param = root.getContextByPath("_R.param");
			boolean hasWhere = false;
			if (param != null) {
				Set<String> keySet = param.getMapSet();

				if (keySet != null) {
					sqlBuilder.append(" where ");
					hasWhere = true;
					for (String key : keySet) {
						String value = param.getContext(key).toString();
						sqlParam.add(value);
						sqlBuilder.append(key).append("=? and ");
					}
				}
			}

			if (hasWhere) {
				if (dataOwner != null) {
					// 2014-01-17 罗光瑜修改 dataOwner改成可以支持多个分组
					sqlBuilder.append("dataOwner like ?");
					sqlParam.add(dataOwner);
				} else {
					sqlBuilder.append("1 = 1 ");
				}
			} else {
				if (dataOwner != null) {
					sqlBuilder.append(" where dataOwner like ?");
					sqlParam.add(dataOwner);
				}
			}
			
			//2015-10-21 19:35:56 FrankCheng 若为cmsconfig修改 那么判断是否为特殊字段年修改
			//删除普通的参数直接报空指针异常了，这里普通删除只会传cid怎么会有name呢，这段代码是有疑问的
			if(metadata.getAlias().equals("cmsconfig") && param.getContext("name")!= null && param.getContext("name").toString().equals("muliTab")){
				//检查是否有应先数据 若有影响那么禁止修改 无影响正常修改
				String sql = "SELECT COUNT(*) AS `count` FROM cmsmetadata WHERE isMuliTab = '1'";
				ResultSet result = COMMDB.executeSql(sql);
				if(result.next()){
					String count = result.getString(1);
					if(!count.equals("0")){
						log.severe("if you want to delete the muliTab there must no muliTab tables!");
						result.close();
						return 505;
					}
				}
				result.close();
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
			// 2014年8月16日 14:24:04 程明剑 删除操作
			String $alias = root.getContextByPath("_R.alias").toString();
			// 2014年12月15日15:26:15 程明剑 修正无cid错误问题
			if (!$alias.equals("channel")&&!$alias.equals("cmsview")) {
				if(root.getContextByPath("_R.param.cid")!=null){
					plDelete(metadata,root.getContextByPath("_R.param.cid").toString());
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

	public void plDelete(CMSMetadata meta,String cid){
		StringBuffer $sql = null;
		ArrayList<String> $arry = new ArrayList<String>();
		ResultSet $rs = null;
		try {
			ArrayList<CMSMetadata> arry = meta.getChildren();
			for(int i=0;i<arry.size();i++){
				//获取儿子的metadata
				CMSMetadata metadata = arry.get(i);
				$sql = new StringBuffer();
				//获取该metadata所有数据
				$sql.append("select * from ").append(metadata.getTableName()).append(" where nodeid = ?");
				$arry = new ArrayList<String>();
				$arry.add(cid);
				$rs = COMMDB.executeSql($sql.toString(), $arry);
				while($rs.next()){
					//递归执行
					plDelete(metadata, $rs.getString("cid"));
				}
				resultClose($rs);
				//删除儿子中的数据
				$sql = new StringBuffer();
				$sql.append("delete from ").append(metadata.getTableName()).append(" where nodeid = ?");
				$arry = new ArrayList<String>();
				$arry.add(cid);
				COMMDB.executeUpdate($sql.toString(), $arry);
			}
			//查询自己挂接
			//2014年12月16日09:34:34 FrankCheng 修正删除无关数据问题
			if(arry.size()>0){
				$sql = new StringBuffer();
				$sql.append("select cid from ").append(meta.getTableName()).append(" where nodeid = ?");
				$arry = new ArrayList<String>();
				$arry.add(cid);
				$rs = COMMDB.executeSql($sql.toString(), $arry);
				while($rs.next()){
					String _cid = $rs.getString("cid");
					plDelete(meta,_cid);
				}
				resultClose($rs);
				String del = "delete from " + meta.getTableName() + " where nodeid = ?";
				ArrayList<String> _arry = new ArrayList<String>();
				_arry.add(cid);
				COMMDB.executeUpdate(del, _arry);
			}
		} catch (Exception e) {
		}
	}
	
	public void resultClose(ResultSet rs){
		try {
			if(rs!=null){
				rs.close();
			}
		} catch (Exception e) {
			// TODO: handle exception
		}
	}
}
