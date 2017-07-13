package com.breezefw.service.cms;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

import com.breeze.base.db.COMMDB;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.netserver.tool.ContextMgr;
import com.breeze.init.Initable;
import com.breeze.init.LoadClasses;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.module.CMSMetadataField;
import com.breezefw.service.cms.workflow.CMSTools;
import com.breezefw.service.cms.workflow.cmsfunction.CMSBTLFunctionAbs;
import com.breezefw.ability.btl.BTLFunctionAbs;
import com.breezefw.ability.btl.BTLParser;
import com.breezefw.ability.datarefresh.DataRefreshIF;
import com.breezefw.ability.datarefresh.DataRefreshMgr;

/**
 * 关注这里的这个日志是不对的，因为由于初始化的配置扫描问题 所以日志初始化之前，该类就被java的加载器加载，并在加载器加载的时候，日志将被初始化
 * 2013-10-19日罗光瑜重构。为了更好的测试以及稳定，将静态方法全部取消，全部改成单例访问的方式。
 * 
 * @author Administrator
 * 
 */
public class CmsIniter implements Initable, DataRefreshIF {
	public static final String COMSPATHPRIFIX = "cms.metadata";
	public static final String CMSOLDMETADATAPATHPRIFIX = "cms.oldmetadata";
	public static final String CMSPARAMPRIFIX = "cms.param";
	private Logger log = Logger.getLogger("com.breezefw.service.cms.CmsIniter");

	// 害死人，这个不能定义成保护方法，外面初始化反射的时候要使用
	public CmsIniter() {
	};

	private static CmsIniter instance;

	public static CmsIniter getInstance() {
		if (instance == null) {
			synchronized (COMSPATHPRIFIX) {
				if (instance == null) {
					instance = new CmsIniter();
				}
			}
		}
		return instance;
	}

	/**
	 * 初始化cms那张表，将所有的CMSType的记录读入，并整理到内存中
	 * 内存将设置到ContextMgr.global里面(这也是一个BreezeContext类别)
	 * 设置的时候，name属性就是某条记录的alias值，value是CMSMetaddata对象
	 * 将每个记录设置到ContextMgr.global下面的cms.metadata.xxx xxx就是alias值
	 */
	public synchronized void reload() {
		this.reloadForRfreshTable(null);
	}

	public synchronized int reloadForRfreshTable(ArrayList<String> reloadTableList) {
		String processAlias = "";
		StringBuilder errMsg = null;
		try {
			// 合成sql语句
			String sql = "select * from cmsmetadata";
			// 执行sql语句
			ResultSet rs = COMMDB.executeSql(sql);
			// 初始化一个临时变量ArrayList<CMSMetaddata>tmpList
			ArrayList<CMSMetadata> tmpList = new ArrayList<CMSMetadata>();

			// 初始化上下文,原来的先做备份
			ContextMgr.global.setContextByPath(CMSOLDMETADATAPATHPRIFIX,
					ContextMgr.global.getContextByPath(COMSPATHPRIFIX));

			ContextMgr.global.setContextByPath(COMSPATHPRIFIX, new BreezeContext());

			// while(rs.next()){

			while (rs.next()) {
				// 先收集各个错误
				errMsg = new StringBuilder();

				// 根据每个rs，创建CMSMetaddata对象。
				CMSMetadata cmsMetadata = new CMSMetadata();
				cmsMetadata.setAlias(rs.getString("alias"));
				processAlias = rs.getString("alias");
				cmsMetadata.setCid(rs.getInt("cid"));
				cmsMetadata.setDataDesc(rs.getString("dataDesc"));
				cmsMetadata.setParentAlias(rs.getString("parentAlias"));
				cmsMetadata.setShowName(rs.getString("displayName"));
				cmsMetadata.setTableName(rs.getString("tableName"));
				cmsMetadata.setDataOwner(rs.getString("dataOwnerSet"));
				cmsMetadata.setDataRefresh(rs.getString("dataRefresh"));
				cmsMetadata.setOutAlias(rs.getString("outAlias"));
				cmsMetadata.setDataMemo(rs.getString("dataMemo"));
				// 2014-01-14 罗光瑜修改 增加了权限的设置
				cmsMetadata.setRoleSetting(rs.getString("roleSetting"));
				// 2015年10月21日15:14:19 FrankCheng 添加多表字段
				cmsMetadata.setIsMuliTab(rs.getString("isMuliTab"));
				// 2015年11月3日16:58:57 FrankCheng 添加表单验证
				cmsMetadata.setCheckField(rs.getString("checkField"));
				// cmsMetadata.parserTableFieldByDesc();//这个放到后面，等分类子类关系弄清楚了再弄这个
				// 将对象放到ContextMgr.global下
				// ContextMgr.global.setContextByPath("cms.metadata.xxx",new
				// BreezeContext(xxx对象))
				ContextMgr.global.setContextByPath(COMSPATHPRIFIX + '.' + cmsMetadata.getAlias(),
						new BreezeContext(cmsMetadata));
				// 同时加入到tmpList下面
				tmpList.add(cmsMetadata);
			}
			rs.close();
			errMsg.append("...process father and childer... \n");
			errMsg.append("tmpList is ").append(tmpList).append("\n");

			// 下面要整理他们之间的关系
			// for(CMSMetaddata metadata:tmpList){
			for (CMSMetadata oneData : tmpList) {
				String parentId = oneData.getParentAlias();
				errMsg.append("parentId is ").append(parentId).append("\n");
				if (parentId == null || "".equals(parentId.trim())) {
					continue;
				}
				// 获取老爸
				BreezeContext fatherObj = ContextMgr.global.getContextByPath(COMSPATHPRIFIX + '.' + parentId);
				errMsg.append("fatherObj is ").append(fatherObj).append("\n");
				if (fatherObj == null) {
					continue;
				}

				CMSMetadata father = (CMSMetadata) fatherObj.getData();
				if (father == null) {
					continue;
				}
				oneData.setFather(father);
				father.getChildren().add(oneData);
			}

			errMsg.append("...process extends... \n");

			// 下面要整理继承的父子关系2014-09-04
			// for(CMSMetaddata metadata:tmpList){
			for (CMSMetadata oneData : tmpList) {
				String supperid = oneData.getSuperid();
				errMsg.append("...supperid is ").append(supperid).append("\n");
				if (supperid == null || "".equals(supperid.trim())) {
					continue;
				}
				// 获取老爸
				BreezeContext fatherObj = ContextMgr.global.getContextByPath(COMSPATHPRIFIX + '.' + supperid);
				if (fatherObj == null) {
					continue;
				}

				CMSMetadata superMetadata = (CMSMetadata) fatherObj.getData();

				if (superMetadata == null) {
					continue;
				}

				oneData.setSupper(superMetadata);
				// 强制修改表名要和super的一样
				oneData.setTableName(superMetadata.getTableName());
				superMetadata.getSubMetadata().add(oneData);
			}

			// 这里再设置其字段的值
			for (CMSMetadata oneData : tmpList) {
				oneData.parserTableFieldByDesc();
			}

			errMsg.append("...process refresh db... \n");
			// 2014-09-04根据传入的数据，刷新数据库
			if (reloadTableList != null) {
				HashSet<String> tableSet = new HashSet<String>();
				for (String alias : reloadTableList) {
					int result = CMSTools.refreashDBByAlias(alias, tableSet);
					if (result != 0) {
						return result;
					}
				}
			}
			HashMap<Integer, Boolean> viewFlag = new HashMap<Integer, Boolean>();
			String checkHasMuli = "select count(alias) from cmsmetadata where alias = 'cmsconfig';";
			ResultSet __rs = COMMDB.executeSql(checkHasMuli);
			boolean ch = true;
			while (__rs.next()) {
				if (__rs.getString(1).equals("0")) {
					ch = false;
				}
			}
			// for(开始循环所有的metadata){
			for (CMSMetadata oneData : tmpList) {
				setView(oneData, viewFlag);
				// 2013-11-15日修改，同时处理挂接过来的其他表信息
				if ("channel".equals(oneData.getParentAlias())) {
					this.setOneContextAlias(oneData.getAlias());
				}
			}
			if (ch) {
				String muli = "SELECT `value` FROM wg_cmsconfig WHERE `name` = 'muliTab'";
				ResultSet _rs = COMMDB.executeSql(muli);
				String strs[];
				String _alias = null;
				String _field = null;
				if (_rs.next()) {
					String cfg = _rs.getString(1);
					if (cfg != null && !cfg.equals("--")) {
						strs = _rs.getString(1).split("\\.");
						_alias = strs[0];
						_field = strs[1];
					}
				}
				String _table = null;
				if (_alias != null && _field != null) {
					muli = "SELECT tableName from cmsmetadata where alias = '" + _alias + "'";
					ResultSet ___rs = COMMDB.executeSql(muli);
					if (___rs.next()) {
						_table = ___rs.getString(1);
					}
					if (___rs != null) {
						___rs.close();
					}
					for (CMSMetadata oneData : tmpList) {
						// 若多表信息存在且该表为多表
						if (oneData.getIsMuliTab() != null && oneData.getIsMuliTab().equals("1")) {
							String _sql = "select " + _field + " from " + _table + " where " + _field
									+ " is not null group by " + _field;
							ResultSet resultSet = COMMDB.executeSql(_sql);
							while (resultSet.next()) {
								setView(oneData, viewFlag, resultSet.getString(1));
							}
							if (resultSet != null) {
								resultSet.close();
							}
						}
					}
					// }
				}
				if (_rs != null) {
					_rs.close();
				}
			}
			if (__rs != null) {
				__rs.close();
			}

			// +下面装载CMS参数对象
			this.initCMSParam();
			// }
			return 0;
		} catch (Exception e) {

			System.out.println("init error!");
			e.printStackTrace();

			log.severe("process aias[" + processAlias + "]:\n{" + errMsg.toString() + "}\n", e);
			throw new RuntimeException(e);
		}
	}

	public CMSMetadata getDataByAlias(String alias) {
		BreezeContext resultCtx = ContextMgr.global.getContextByPath(COMSPATHPRIFIX + '.' + alias);
		if (resultCtx == null || resultCtx.isNull() || resultCtx.isEmpty()) {
			return null;
		}
		return (CMSMetadata) resultCtx.getData();
	}

	public CMSMetadata getOldDataByAlias(String alias) {
		BreezeContext resultCtx = ContextMgr.global.getContextByPath(CMSOLDMETADATAPATHPRIFIX + '.' + alias);
		if (resultCtx == null || resultCtx.isNull() || resultCtx.isEmpty()) {
			return null;
		}
		return (CMSMetadata) resultCtx.getData();
	}

	public int getInitOrder() {
		return 200;
	}

	public void doInit(HashMap<String, String> paramMap) {
		System.out.println("=========begin cms init======");
		log = Logger.getLogger("com.breezefw.service.cms.Initer");
		DataRefreshMgr.getInstance().init();
		// 下面进行BTL的初始化
		this.doInitBTL();
		System.out.println("=========before reload======");
		CmsIniter.getInstance().reload();
	}

	void doInitBTL() {
		BTLParser.init("cms");
		// 获取所有的初始化资源
		ArrayList<CMSBTLFunctionAbs> initList = LoadClasses.createObject("com.breezefw.service",
				CMSBTLFunctionAbs.class);
		for (BTLFunctionAbs btl : initList) {
			BTLParser.INSTANCE("cms").addFunction(btl);
		}
	}

	/**
	 * 这个函数用于根据元数据，创建实际可用的视图
	 * 
	 * @param m
	 *            要更新的cmsmetadata
	 * @param flagMap
	 *            标记map这个map用于记录相关的cid是否被处理过。
	 * @throws SQLException
	 */
	protected void setView(CMSMetadata metadata, HashMap<Integer, Boolean> flagMap) throws SQLException {
		setView(metadata, flagMap, null);
	}

	public void setView(CMSMetadata metadata, HashMap<Integer, Boolean> flagMap, String muliTab) throws SQLException {
		// 先做标识判断
		Boolean flag = flagMap.get(metadata.getCid());
		if (flag != null && muliTab == null) {
			// 说明已经处理过来，不用处理
			return;
		}
		// 否则设置一下，说明已经处理过来
		flagMap.put(metadata.getCid(), true);
		if (!metadata.isViewNeede()) {
			// 不需要创建视图
			return;
		}
		log.fine("begin create view for alias:" + metadata.getAlias());
		System.out.println("+++++++++++++++begin create view for alias:" + metadata.getAlias());
		StringBuilder sqlBuilder = new StringBuilder();
		// 林浩旋 2013年12月11日 21:14:56 修改 视图全部使用 alias_view 取名
		sqlBuilder.append("CREATE OR REPLACE VIEW ");
		if (muliTab != null) {
			sqlBuilder.append(muliTab).append("_").append(metadata.getAlias()).append("_view as select ");
		} else {
			sqlBuilder.append(metadata.getAlias()).append("_view as select ");
		}

		boolean isFirst = true;
		// 2013-12-05 林浩旋 因为关键字 修改成 关键字左右加 ` 号
		for (String key : metadata.getFieldMap().keySet()) {
			CMSMetadataField oneField = metadata.getFieldMap().get(key);
			if (isFirst) {
				isFirst = false;
			} else {
				sqlBuilder.append(',');
			}
			sqlBuilder.append(oneField.getAliasField()).append(" as ").append("`" + oneField.getFieldName() + "`");
		}
		if (muliTab != null) {
			sqlBuilder.append(" from ").append("`" + muliTab + "_" + metadata.getTableName() + "`").append(' ')
					.append("`" + metadata.getTableName() + "`");
		} else {
			sqlBuilder.append(" from ").append("`" + metadata.getTableName() + "`").append(' ')
					.append("`" + metadata.getTableName() + "`");
		}

		// 开始左关联
		isFirst = true;
		int number = 0;
		for (String rightAlias : metadata.getOurterTableMap().keySet()) {

			CMSMetadataField ourterkeyField = metadata.getOurterTableMap().get(rightAlias);
			if (isFirst) {
				isFirst = false;
			} else {
				// sqlBuilder.append(',');
			}
			CMSMetadata rightMetadata = getDataByAlias(rightAlias);

			if (rightMetadata == null) {
				throw new RuntimeException(
						"rightMetadata alias " + rightAlias + " not found! in processor alias:" + metadata.getAlias());
			}
			if (rightMetadata.isViewNeede()) {
				// 被关联的表也是一个视图
				// 先递归设置视图
				if (rightMetadata.getIsMuliTab() != null && rightMetadata.getIsMuliTab().equals("1")
						&& muliTab != null) {
					setView(rightMetadata, flagMap, muliTab);
					sqlBuilder.append(" LEFT JOIN ").append(muliTab).append("_").append(rightMetadata.getAlias())
							.append("_view ").append("`" + rightMetadata.getAlias() + "`");
				} else {
					setView(rightMetadata, flagMap, muliTab);
					sqlBuilder.append(" LEFT JOIN ").append(rightMetadata.getAlias()).append("_view ")
							.append("`" + rightMetadata.getAlias() + "`");
				}
			} else {
				// 这是普通情况
				if (rightMetadata.getIsMuliTab() != null && rightMetadata.getIsMuliTab().equals("1")
						&& muliTab != null) {
					sqlBuilder.append(" LEFT JOIN ").append("`" + muliTab + "_" + rightMetadata.getTableName() + "`")
							.append(' ').append("`" + rightMetadata.getAlias() + "`");
				} else {
					sqlBuilder.append(" LEFT JOIN ").append("`" + rightMetadata.getTableName() + "`").append(' ')
							.append("`" + rightMetadata.getAlias() + "`");
				}
			}
			if (muliTab != null) {
				sqlBuilder.append(" on ").append("`" + metadata.getTableName() + "`").append('.')
						.append("`" + ourterkeyField.getFieldName() + "`");
				sqlBuilder.append('=').append(ourterkeyField.getAliasField());
			} else {
				sqlBuilder.append(" on ").append("`" + metadata.getTableName() + "`").append('.')
						.append("`" + ourterkeyField.getFieldName() + "`");
				sqlBuilder.append('=').append(ourterkeyField.getAliasField());
			}
			number++;
		}
		log.fine("the sql is:" + sqlBuilder);
		try {
			COMMDB.executeUpdate(sqlBuilder.toString());
		} catch (Exception e) {
			e.printStackTrace();
			log.severe("sql is:" + sqlBuilder + " " + metadata.getAlias() + "\n", e);
		}
	}

	/**
	 * 输入一个alias，这个alias是挂接到CMSMetadata表中的。 将这个alias的数据读出来，并设置到原数据中
	 * 
	 * @param alias
	 *            参数别名
	 * @throws SQLException
	 */
	protected void setOneContextAlias(String alias) throws SQLException {
		// 调用getOneContextAliasData获取数据
		BreezeContext aliasData = this.getOneContextAliasData(alias);
		if (aliasData == null) {
			log.severe("getOneContextAliasData result is null");
			return;
		}
		// for (循环出数据结果){
		for (int i = 0; i < aliasData.getArraySize(); i++) {
			// //从数据中获取每个记录oneData
			BreezeContext oneData = aliasData.getContext(i);
			// //获取oneData的noteid
			BreezeContext nodeIdCtx = oneData.getContext("nodeid");
			if (nodeIdCtx == null || nodeIdCtx.isNull()) {
				log.severe("node id not found in record:" + oneData);
				return;
			}
			// //根据nodeid从Global中获取对应的CMSMetadata对象
			int nodeid = Integer.parseInt(nodeIdCtx.getData().toString());
			BreezeContext b = ContextMgr.global.getContextByPath(COMSPATHPRIFIX);
			for (String key : b.getMapSet()) {
				BreezeContext one = b.getContext(key);
				CMSMetadata oneM = (CMSMetadata) one.getData();
				int cid = oneM.getCid();
				if (cid == nodeid) {
					// //将这个oneData设置到这个CMSMetadata对象的otherChild对象中，并且要求otherChild先放置一个alias的节点，再把这个节点插入进去
					BreezeContext oneOChild = oneM.getOtherChild();
					if (oneOChild == null) {
						oneOChild = new BreezeContext();
						oneM.setOtherChild(oneOChild);
					}
					BreezeContext oneAlias = oneOChild.getContext(alias);
					if (oneAlias == null) {
						oneAlias = new BreezeContext();
						oneOChild.setContext(alias, oneAlias);
					}
					// 用关键字keyname来挂接
					BreezeContext keynameCtx = oneData.getContext("keyname");
					if (keynameCtx == null && keynameCtx.isNull()) {
						log.severe("can not found keyname!for " + oneData);
						continue;
					}
					oneAlias.setContext(oneData.getContext("keyname").toString(), oneData);
				}
			}
		}
		// }
	}

	/**
	 * 根据函数将noteid指向CMSMetadata记录的表的数据读出来
	 * 
	 * @param alias
	 *            father是指向CMSMetadata的alias
	 * @return 这个表的所有数据
	 * @throws SQLException
	 */
	protected BreezeContext getOneContextAliasData(String alias) throws SQLException {
		BreezeContext result = new BreezeContext();
		// 获取alias的元数据对象
		BreezeContext aliasCtx = ContextMgr.global.getContextByPath(COMSPATHPRIFIX + '.' + alias);
		if (aliasCtx == null) {
			log.severe("alias[" + alias + "]not exist!");
			return null;
		}
		// 从元数据对象中获取表名
		CMSMetadata metadata = (CMSMetadata) aliasCtx.getData();
		String tableName = metadata.getTableName();
		if (metadata.isViewNeede()) {
			tableName = metadata.getAlias() + "_view";
		}
		// 合成sql语句并执行查询
		String sql = "select * from " + tableName;
		log.fine(sql);
		ResultSet rs = COMMDB.executeSql(sql);
		// while (循环查询结果集合){
		while (rs.next()) {
			// //创建一个新的BreezeContext oneResult 变量，并push到result中
			BreezeContext oneResult = new BreezeContext();
			result.pushContext(oneResult);
			// //读取结果集，并将结果集的每一个字段，和对应的值加入到oneResult中
			BreezeContext oneRecord = new BreezeContext();
			for (int i = 0; i < rs.getMetaData().getColumnCount(); i++) {
				// 得到结果集中的列名
				String culomnName = rs.getMetaData().getColumnName(i + 1);
				// 得到每个列名的值，并把值放入BreezeContext
				oneResult.setContext(culomnName, new BreezeContext(rs.getString(culomnName)));
			}
		}
		rs.close();
		// }
		return result;
	}

	/**
	 * 设置CMS参数信息，格式是name->value
	 * 
	 * @throws SQLException
	 */
	/**
	 * @throws SQLException
	 */
	public void initCMSParam() throws SQLException {
		BreezeContext data = this.getOneContextAliasData("cmsconfig");
		if (data == null || data.isNull()) {
			return;
		}
		// redis端口
		int redis_port = 6379;
		String[] redis = null;

		for (int i = 0; i < data.getArraySize(); i++) {
			BreezeContext one = null;
			try {
				one = data.getContext(i);
				String name = one.getContext("name").getData().toString();
				BreezeContext value = one.getContext("value");
				if (name != null && name.equals("Redis_ServerPort")) {
					if (!value.getData().toString().equals("--")) {
						redis_port = Integer.parseInt(value.getData().toString());
					}
				} else if (name != null && name.equals("Redis_Server")) {
					if (!value.getData().toString().equals("--")) {
						redis = value.getData().toString().split("\\,");
					}
				} else {
					continue;
				}
			} catch (Exception e) {
				this.log.severe("parser error:[" + one + "]", e);
			}
		}

		RedisUtil redisUtil = null;
		GlobalBreezeContext globalBreezeContext = null;
		if (redis != null) {
			redisUtil = new RedisUtil(redis);
			globalBreezeContext = new GlobalBreezeContext(redisUtil);
		}

		for (int i = 0; i < data.getArraySize(); i++) {
			BreezeContext one = null;
			try {
				one = data.getContext(i);
				String name = one.getContext("name").getData().toString();
				BreezeContext value = one.getContext("value");
				if (redis == null) {
					ContextMgr.global.setContextByPath(CMSPARAMPRIFIX + '.' + name, value);
				} else {
					globalBreezeContext.setContext(name, value);
				}
			} catch (Exception e) {
				this.log.severe("parser error:[" + one + "]", e);
			}
		}
		if (redis != null) {
			ContextMgr.global.setContextByPath(CMSPARAMPRIFIX, globalBreezeContext);
		}
	}

	public String getInitName() {
		return "CMS";
	}

	@Override
	public String getRefreshName() {
		return "CMS";
	}

	@Override
	public void refresh(BreezeContext arg0) {
		this.reload();
	}
}
