package com.breezefw.service.cms.workflow;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.module.CMSMetadataField;
import com.breezefw.service.cms.templateitem.CMSDBOperItem;
import com.breezefw.service.cms.util.CMSMuliUtil;
import com.breezefw.ability.btl.BTLExecutor;

/**
 * 这个类是通用cms的sql查询类
 * 
 * @author Administrator 这个类处理客户端的查询，其参数是类似： { alias:xxx,
 *         resultset:xxx,method:'query'--有这个标识说明是模糊匹配，且字段和字段间是或关系 //result有三种
 *         count/list/all 缺省是all param:{ key:value }, spes{ limit : { start:xxx,
 *         length:xxx }, orderby :[ { name:xxxx desc:true } ] '', } } version
 *         0.02 陈卓增加了支持dataOwner可以多个查询角色 2014-05-16
 */
public class CMSQueryFlow extends WorkFlowUnit {
	public static final String NAME = "CMSQuery";
	public static final String ITEMNAME = "CMSOperItem";
	private Logger log = Logger
			.getLogger("com.breezefw.service.cms.workflow.CMSQueryFlow");

	@Override
	public String getName() {
		return NAME;
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
			log.fine("mpath:" + mpath);
			BreezeContext metadataContext = root.getContextByPath(mpath);
			if (metadataContext == null) {
				log.severe("metadataContext not found!");
				return 997;
			}

			CMSMetadata metadata = (CMSMetadata) metadataContext.getData();
			log.fine("metadata:" + metadataContext.getData());
			if (metadata == null) {
				log.severe("metadata is null!");
				return 998;
			}
			
			StringBuilder sqlBuilder = new StringBuilder();
			ArrayList<Object> sqlParam = new ArrayList<Object>();
			// 判断是对儿子操作还是对老爸操作
			if ("yes".equals(item.getIsFather())) {
				// 2014-01-14 罗光瑜修改 增加对权限的判断，对老爸的查询操作是序号7
				// 2014-01-14 罗光瑜修改 要先判断权限，否则metadtata被修改成father就判断不对了
				if (!metadata.getRoleSetting()[7]) {
					if (log.isLoggable(Level.FINE)) {
						String logMsg = metadata.getAlias()
								+ " no cms role for father!theAuth is\n";
						for (int i = 0; i < metadata.getRoleSetting().length; i++) {
							logMsg = logMsg + "," + metadata.getRoleSetting()[i];
						}
						logMsg = logMsg + " auth is in{7}";
						log.fine(logMsg);
					}
					return 20;
				}
				CMSMetadata father = metadata.getFather();
				if (father != null) {
					metadata = father;
				} else {
					log.fine("father is null so im father!");
					return 101;
				}
			}
			// 2014-01-14 罗光瑜修改 增加对权限的判断，对儿子的查询操作是序号3
			else {
				if (!metadata.getRoleSetting()[3]) {
					if (log.isLoggable(Level.FINE)) {
						String logMsg = metadata.getAlias()
								+ " no cms role!theAuth is\n";
						for (int i = 0; i < metadata.getRoleSetting().length; i++) {
							logMsg = logMsg + "," + metadata.getRoleSetting()[i];
						}
						logMsg = logMsg + " auth is in{3}";
						log.fine(logMsg);

					}
					return 20;
				}
			}
			int ret = 0;

			if(item.getSql()!=null){
				ret = buildSqlBySql(item, sqlBuilder, root, sqlParam);
			}else{
				ret = buildSqlByCms(item, metadata, root, sqlBuilder, sqlParam);
			}
			if (ret != 0){
				return ret;
			}
			String sql = sqlBuilder.toString();
			
			log.fine("sql is :" + sql);
			log.fine("param is:" + sqlParam);

			ResultSet result = COMMDB.executeSql(sql, sqlParam);
			BreezeContext oneSqlContext = new BreezeContext();
			while (result.next()) {
				BreezeContext oneRecord = new BreezeContext();
				for (int i = 0; i < result.getMetaData().getColumnCount(); i++) {
					// 得到结果集中的列名
					String culomnName = result.getMetaData().getColumnName(
							i + 1);
					// 得到每个列名的值，并把值放入BreezeContext
					oneRecord.setContext(culomnName,
							new BreezeContext(result.getString(culomnName)));
				}
				// 把得到的每条记录都放入resultSetContext
				oneSqlContext.pushContext(oneRecord);
			}
			BreezeContext resultCtx = new BreezeContext();

			BreezeContext cmsMetadata = this.createMetadata(metadata);
			resultCtx.setContext("cmsmetadata", cmsMetadata);
			resultCtx.setContext("cmsdata", oneSqlContext);
			root.setContext(item.getResultContextName(), resultCtx);
			result.close();
			return 0;
		} catch (SQLException e) {
			log.severe("encount a exception", e);
			return 10000 + e.getErrorCode();
		} catch (Exception e) {
			log.severe("encount a exception", e);
		}
		return 999;
	}
	private int buildSqlBySql(CMSDBOperItem item, StringBuilder sqlBuilder, BreezeContext root, ArrayList<Object> sqlParam){
		log.fine("buildSqlBySql!");
		BTLExecutor exe = item.getSql();
		String sql = (String) exe.execute(new Object[] { root }, sqlParam);
		sqlBuilder.append(sql);
		return 0;
	}
	/**
	 * @param item
	 * @param metadata
	 * @param root
	 * @param sqlBuilder
	 * @param sqlParam
	 * @return
	 */
	private int buildSqlByCms(CMSDBOperItem item,CMSMetadata metadata, BreezeContext root,
			StringBuilder sqlBuilder, ArrayList<Object> sqlParam) {
		log.fine("buildSqlByCms!");
		// 2013-8-24罗光瑜修改，dataOwner支持多个选择从前面往后选择一个
		BTLExecutor[] dataOwnerPathArr = metadata.getDataOwner();
		String dataOwner[] = null;
		if (dataOwnerPathArr != null) {
			dataOwner = new String[dataOwnerPathArr.length - 1];
			for (int i = 1; i < dataOwnerPathArr.length; i++) {
				dataOwner[i - 1] = "%"
						+ dataOwnerPathArr[i].execute(new Object[] { root },
								null) + "%";
			}
		}
		String tableName = metadata.getTableName();
		String WGalias = metadata.getAlias();

		@SuppressWarnings("unused")
		boolean hasMorTable = metadata.getOurterTableMap().size() > 0;
		// 2014-05-21罗光瑜加入，如果是自动排序
		boolean hasAutoSort = false;

		// 合成 sql参数
		sqlBuilder.append("select ");

		// 处理查询的结果集信息
		BreezeContext resultsetCtx = root.getContextByPath("_R.resultset");
		String resultset = "all";
		if (resultsetCtx != null && !resultsetCtx.isNull()) {
			resultset = resultsetCtx.getData().toString();
		}
		boolean isFirst = true;
		if ("count".equals(resultset)) {
			sqlBuilder.append("count(*) as count");
		} else {
			boolean isListResult = ("list".equals(resultset));
			for (String key : metadata.getFieldMap().keySet()) {
				CMSMetadataField oneField = metadata.getFieldMap().get(key);
				if (isListResult && !oneField.isList()) {
					continue;
				}
				if (isFirst) {
					isFirst = false;
				} else {
					sqlBuilder.append(',');
				}
				/*
				 * 和原来实现有改变，多表处理，采用视图，所以无需多表处理
				 * sqlBuilder.append(oneField.getAliasField ()).append(" as ")
				 * .append(oneField.getFieldName());
				 */
				//2014年11月25日18:27:59 程明剑 若tmp不为空且不是group by 那么支持mysql函数
				
				String filedName = oneField.getFieldName();
				BreezeContext fieldtmp = new BreezeContext();
				BreezeContext dataDesc = ContextTools.getBreezeContext4Json(metadata.getDataDesc());
				//非空校验
				if(
					dataDesc.getContext(filedName)!=null
					&&!dataDesc.getContext(filedName).isNull()
					&&!dataDesc.getContext(filedName).isEmpty()
					&&dataDesc.getContext(filedName).getContext("fieldtmp")!=null
					&&!dataDesc.getContext(filedName).getContext("fieldtmp").isNull()
					&&!dataDesc.getContext(filedName).getContext("fieldtmp").isEmpty()){
						fieldtmp = dataDesc.getContext(filedName).getContext("fieldtmp");
				}
				String fun = null;
				if(
					fieldtmp!=null
					&&!fieldtmp.isEmpty()
					&&!fieldtmp.isNull()
					&&!fieldtmp.toString().equals("")
					&&fieldtmp.toString().indexOf("group by")==-1
					&&fieldtmp.toString().indexOf("$")==-1){
						fun = fieldtmp.toString();
						//判断函数是否符合标准 不符合则不生效
						fun += (" as " + filedName);
				}
				if(fun==null){
					sqlBuilder.append(oneField.getFieldName());
				}else{
					sqlBuilder.append(fun);
				}
				if (!hasAutoSort && "sort".equals(oneField.getFieldName())) {
					hasAutoSort = true;
				}
			}
		}
		if (metadata.isViewNeede()) {
			BreezeContext manager = ContextMgr.getRootContext().getContextByPath("_S.manager.muliTab");
			//获取session中的信息
			if(manager == null || manager.isNull() || "".equals(manager.toString()) || CMSMuliUtil.getMuliTab() == null || metadata.getIsMuliTab() == null || metadata.getIsMuliTab().equals("0") || metadata.getIsMuliTab().equals("")){
				sqlBuilder.append(" from ").append(WGalias).append("_view ");
			}else{
				sqlBuilder.append(" from ").append(manager.toString()+"_").append(WGalias).append("_view ");
			}
		} else {
			//2015年10月22日15:59:47 FrankCheng
			//如果改表为多表 那么根据当前用的session中的muliTab进行多表查询 若不存在那么查询普通表
			if(CMSMuliUtil.getMuliTab() != null){
				if(metadata.getIsMuliTab() != null && metadata.getIsMuliTab().equals("1")){
					//获取用户中的信息
					BreezeContext userContext = ContextMgr.getRootContext().getContextByPath("_S.manager.muliTab");
					if(userContext!= null && !userContext.isNull()){
						tableName = userContext.toString() + "_" + tableName;
					}
				}
			}
			sqlBuilder.append(" from ").append(tableName).append(" ");
		}

		sqlBuilder.append(' ');
		
		int result = args(root, isFirst, sqlBuilder, metadata, sqlParam, log, dataOwner, resultset, hasAutoSort);
		return result == 0 ? 0 : result;
	}

	private BreezeContext createMetadata(CMSMetadata m) {
		BreezeContext bcResult = new BreezeContext();
		bcResult.setContext("alias", new BreezeContext(m.getAlias()));
		bcResult.setContext("ctypeid", new BreezeContext(m.getCid()));
		bcResult.setContext("dataDesc", new BreezeContext(m.getDataDesc()));
		bcResult.setContext("displayName", new BreezeContext(m.getShowName()));
		bcResult.setContext("outAlias", new BreezeContext(m.getOutAlias()));
		//2015年11月3日17:54:55 FrankCheng 加入表单校验信息
		bcResult.setContext("checkField", new BreezeContext(m.getCheckField()));
		bcResult.setContext("dataMemo", m.getDataMemo());
		if (m.getFather() != null) {
			bcResult.setContext("parentAlias", new BreezeContext(m.getFather()
					.getAlias()));
		}
		// 下面处理儿子
		// 2014-05-23日罗光瑜修改，根据outAlias输入的情况，过滤儿子，格式要求是{儿子:true,erzi:true}
		HashSet<String> hs = new HashSet<String>();
		boolean useFilter = false;
		if (m.getOutAlias() != null && !"".equals(m.getOutAlias())) {
			// 这里要保证输入确实是{}的情况，而不是存字符串，如果是纯字符串，那么这里就是真正的outAlias了
			Pattern p = Pattern.compile("\\{[^\\}]+\\}");
			Matcher mm = p.matcher(m.getOutAlias());
			if (mm.find()) {
				useFilter = true;
				p = Pattern.compile("(\\w+)\\s*:\\s*(\\w+)");
				mm = p.matcher(m.getOutAlias());
				while (mm.find()) {
					hs.add(mm.group(1));
				}
			}
		}

		ArrayList<CMSMetadata> children = m.getChildren();
		if (children != null && children.size() > 0) {
			BreezeContext childrenCtx = new BreezeContext();
			bcResult.setContext("children", childrenCtx);
			for (CMSMetadata child : children) {
				// 2005-05-23 罗光瑜添加，如果是有用filter且是{}那么这里就把儿子过滤掉
				if (useFilter && !hs.contains(child.getAlias())) {
					continue;
				}
				BreezeContext childInfo = new BreezeContext();
				childrenCtx.pushContext(childInfo);
				childInfo.setContext("alias",
						new BreezeContext(child.getAlias()));
				childInfo.setContext("showName",
						new BreezeContext(child.getShowName()));
			}
		}
		return bcResult;
	}
	
	//2014年12月22日11:27:15 FrankCheng 分页信息 使用范围CMS和CND
	public static void limit(BreezeContext limitContext,StringBuilder sqlBuilder){
		int start = 0;
		int length = -1;
		BreezeContext startContext = limitContext.getContext("start");
		if (startContext != null) {
			Object startObj = startContext.getData();
			if (startObj instanceof Integer) {
				start = ((Integer) startObj).intValue();
			} else {
				start = Integer.parseInt(startObj.toString());
			}
		}
		BreezeContext lengthContext = limitContext.getContext("length");
		if (lengthContext != null) {
			Object lengthObj = lengthContext.getData();
			if (lengthObj instanceof Integer) {
				length = ((Integer) lengthObj).intValue();
			} else {
				length = Integer.parseInt(lengthObj.toString());
			}
		}
		sqlBuilder.append(" limit ").append(start).append(',').append(length);
	}
	/**
	 * 有method和没有method是不一样的，这个值一旦存在，表示字段和字段间是或关系，而且用like进行模糊查询
	 */
	public static int args(BreezeContext root,boolean isFirst,StringBuilder sqlBuilder,CMSMetadata metadata,ArrayList<Object> sqlParam,Logger log,String[] dataOwner,String resultset,boolean hasAutoSort){
		BreezeContext param = root.getContextByPath("_R.param");
		BreezeContext methodCtx = root.getContextByPath("_R.method");
		String methodCombine = " and ";
		String methodOper = " = ? ";
		String noMethodOper = " = ";
		if (methodCtx != null && !methodCtx.isNull()) {
			methodOper = " like ? ";
			methodCombine = " or ";
			noMethodOper = " like ";
		}
		boolean hasWhere = false;
		
		if (param != null) {
			Set<String> keySet = param.getMapSet();

			if (keySet != null) {
				hasWhere = true;
				isFirst = true;
				int num = 0;
				for (String key : keySet) {
					// 2014年7月2日 2014年7月2日 16:49:14 程明剑 增加参数数组功能
					// 格式： "eg":["eg1","eg2"]
					int dataType = param.getContext(key).getType();
					// 字段名称
					// 2014年7月26日 15:34:50 程明剑 解决_baseAlias问题
					if(key.equals("_baseAlias")) continue;
					if(num++==0){
						sqlBuilder.append(" where (");
					}
					String sqlField = metadata.getFieldMap().get(key).getFieldName();
					// 0:TYPE_DATA
					// 1:TYPE_MAP
					// 2:TYPE_ARRAY
					switch (dataType) {
					case 0: {
						// data类型数据
						String value = param.getContext(key).toString();
						sqlParam.add(value);
						if (isFirst) {
							isFirst = false;
							if(sqlField.equals("nodeid")&&value.equals("-1")){
								sqlBuilder.append(" (").append(sqlField).append(methodOper).append(" || isnull(nodeid)) ");
							}else{
								sqlBuilder.append(sqlField).append(methodOper);
							}
						} else {
							if(sqlField.equals("nodeid")&&value.equals("-1")){
								sqlBuilder.append(methodCombine).append(" (").append(sqlField).append(methodOper).append(" || isnull(nodeid)) ");
							}else{
								sqlBuilder.append(methodCombine).append(sqlField).append(methodOper);
							}
						}
					}
						break;
					case 1: {
						// 错误参数类型提示
						log.severe("You have entered an incorrect parameter types");
						return 10000;
					}
					case 2: {
						// 数组类型数据
						// 2014年7月24日 16:51:46 程明剑 添加时间查询opertime
						// 2014年7月25日 17:03:09 程明剑 添加单时间查询
						// 2014年8月30日  罗光瑜修改，让所有时间类型字段都支持这种查询
						// 2014年12月22日16:12:23 FrankCheng 支持无sqlParam查询
						CMSMetadataField fieldDsg = metadata.getFieldMap().get(sqlField);
						String fieldPageType = fieldDsg.getClientType();
						if(sqlField.equals("opertime") || fieldPageType.indexOf("Picker")>0){
							String $first = "";
							if(isFirst){
								isFirst = false;
							}else{
								$first = " and ";
							}
							if(param.getContext(key).getContext(0).toString().equals("noStart") &&
									param.getContext(key).getContext(1).toString().equals("noEnd")){
								
							}else if(param.getContext(key).getContext(0).toString().equals("noStart")){
								sqlBuilder.append($first).append(' ').append(sqlField);
								if(sqlParam!=null){
									sqlBuilder.append(" < ? ");
									sqlParam.add(param.getContext(key).getContext(1).toString());
								}else{
									sqlBuilder.append(" < ").append(param.getContext(key).getContext(1).toString());
								}
								
							}else if(param.getContext(key).getContext(1).toString().equals("noEnd")){
								sqlBuilder.append($first).append(' ').append(sqlField);
								if(sqlParam!=null){
									sqlBuilder.append(" > ? ");
									sqlParam.add(param.getContext(key).getContext(0).toString());
								}else{
									sqlBuilder.append(" > ").append(param.getContext(key).getContext(0).toString());
								}
							}else{
								sqlBuilder.append($first).append(' ').append(sqlField);
								if(sqlParam!=null){
									sqlBuilder.append(" between ? and ? ");
									sqlParam.add(param.getContext(key).getContext(0).toString());
									sqlParam.add(param.getContext(key).getContext(1).toString());
								}else{
									sqlBuilder.append(" between ").append(param.getContext(key).getContext(0).toString()).append(" and ").append(param.getContext(key).getContext(1).toString());
								}
							}
						}else{
							if (isFirst) {
								isFirst = false;
								// 判断数组长度
								if (param.getContext(key).getArraySize() == 1) {
									sqlBuilder.append(sqlField);
									if(sqlParam!=null){
										sqlBuilder.append(methodOper);
										sqlParam.add(param.getContext(key).getContext(0).toString());
									}else{
										sqlBuilder.append(noMethodOper).append(param.getContext(key).getContext(0).toString());
									}
								} else {
									// 长度大于1 拼接符数量=数组长度-1
									sqlBuilder.append(" ( ");
									for (int i = 0; i < param.getContext(key).getArraySize(); i++) {
										if(sqlParam!=null){
											sqlParam.add(param.getContext(key).getContext(i).toString());
											sqlBuilder.append(sqlField).append(methodOper);
										}else{
											sqlBuilder.append(sqlField).append(noMethodOper).append(param.getContext(key).getContext(i).toString());
										}
										if (i < param.getContext(key).getArraySize() - 1) {
											sqlBuilder.append(" or ");
										}
									}
									sqlBuilder.append(" ) ");
								}
							} else {
								if (param.getContext(key).getArraySize() == 1) {
									if(sqlParam!=null){
										sqlBuilder.append(methodCombine).append(sqlField).append(methodOper);
										sqlParam.add(param.getContext(key).getContext(0).toString());									
									}else{
										sqlBuilder.append(methodCombine).append(sqlField).append(noMethodOper).append(param.getContext(key).getContext(0).toString());
									}
								} else {
									sqlBuilder.append(methodCombine).append(" ( ");
									for (int i = 0; i < param.getContext(key).getArraySize(); i++) {
										if(sqlParam!=null){
											sqlParam.add(param.getContext(key).getContext(i).toString());
											sqlBuilder.append(sqlField).append(methodOper);										
										}else{
											sqlBuilder.append(sqlField).append(noMethodOper).append(param.getContext(key).getContext(i).toString());
										}
										if (i < param.getContext(key).getArraySize() - 1) {
											sqlBuilder.append(" or ");
										}
									}
									sqlBuilder.append(" ) ");
								}
							}
						}
					}
						break;
					default: {
						// 错误参数类型提示
						log.severe("You have entered an incorrect parameter types");
						return 10000;
					}
					}
				}
				if(num!=0){
					sqlBuilder.append(" )");
				}
			}
		}
		
		//2014-09-05 罗光瑜修改，如果既无子类，又无父类，则正常通过，不处理，否则父类显示所有子类的
		if (!metadata.getSubMetadata().isEmpty() || metadata.getSuper() != null){
			if (!hasWhere){
				sqlBuilder.append("where ");
				hasWhere = true;
			}else{
				sqlBuilder.append("and ");
			}
			sqlBuilder.append(" (alias=NULl or alias in (");
			boolean aliasIsFirst = true;
			for (String eAlias:metadata.getAllSubAlias()){
				if (aliasIsFirst){
					aliasIsFirst = false;
				}else{
					sqlBuilder.append(',');
				}
				sqlBuilder.append("'").append(eAlias).append("'");
			}
			sqlBuilder.append("))");
		}
		if (hasWhere) {
			if (dataOwner != null) {
				sqlBuilder.append(" and (");
				if(sqlParam!=null){
					sqlBuilder.append("dataOwner like ?");
					sqlParam.add(dataOwner[0]);
				}else{
					sqlBuilder.append("dataOwner like ").append(dataOwner[0]);
				}
				
				for (int i = 1; i < dataOwner.length; i++) {
					if(sqlParam!=null){
						sqlBuilder.append(" or dataOwner like ?");
						sqlParam.add(dataOwner[i]);				
					}else{
						sqlBuilder.append(" or dataOwner like ").append(dataOwner[i]);
					}
				}
				sqlBuilder.append(")");
			}
		} else {
			if (dataOwner != null) {
				sqlBuilder.append(" where ");
				sqlBuilder.append("  (");
				if(sqlParam!=null){
					sqlBuilder.append("dataOwner like ?");
					sqlParam.add(dataOwner[0]);
				}else{
					sqlBuilder.append("dataOwner like ").append(dataOwner[0]);
				}

				for (int i = 1; i < dataOwner.length; i++) {
					if(sqlParam!=null){
						sqlBuilder.append(" or dataOwner like ?");
						sqlParam.add(dataOwner[i]);
					}else{
						sqlBuilder.append(" or dataOwner like ").append(dataOwner[i]);
					}
				}
				sqlBuilder.append(")");
			}
		}
		//拿取DESC中的排序信息
		BreezeContext _bc = ContextTools.getBreezeContext4Json(metadata.getDataDesc());
		BreezeContext descOrderBy = new BreezeContext();
		//2014年11月26日16:34:31 程明剑 获取group by 信息
		String groupBy = "group by ";
		//封装默认排序信息
		for(String key : _bc.getMapSet()){
				BreezeContext _descOrderBy = _bc.getContext(key).getContext("orderBy");
				if(_descOrderBy!=null&&_descOrderBy.getData() instanceof String&&(_descOrderBy.toString().equals("asc")||_descOrderBy.toString().equals("desc"))){
						descOrderBy.setContext(key, _descOrderBy);
				}
				BreezeContext _groupBy = _bc.getContext(key).getContext("fieldtmp");
				if(_groupBy!=null&&_groupBy.getData() instanceof String&&_groupBy.toString().equals("group by")){
					groupBy+=key+",";
				}
		}
		//2014年11月26日16:40:06 程明剑 处理groupby
		if(!groupBy.equals("group by ")){
			groupBy = groupBy.substring(0, groupBy.length()-1);
			sqlBuilder.append(groupBy);
			if("count".equals(resultset)){
				sqlBuilder.insert(0, "select IFNULL(SUM(ob.count),0) as count from (");
			}
		}
		
		
		
		// *处理orderby
		BreezeContext orderByContext = root
				.getContextByPath("_R.spes.orderby[0]");
		if (orderByContext != null) {
			BreezeContext startContext = orderByContext.getContext("name");
			if (startContext != null) {
				String orderByName = startContext.getData().toString();
				//2016-05-04 下面这句话应该是没有用的key值其实就是getFieldName里面的字段名
				//String sqlField = metadata.getFieldMap().get(orderByName)
				//		.getFieldName();
				sqlBuilder.append(" order by ").append(orderByName);

				BreezeContext descContext = orderByContext.getContext("desc");
				if (descContext != null) {
					String byWhat = " ASC";
					if ("true".equalsIgnoreCase(descContext.toString())) {
						byWhat = " DESC";
					}
					sqlBuilder.append(" ").append(byWhat);
				}
			}
		} else if (hasAutoSort) {
			// 2014-05-21如果有自动排序，则自动排序
			sqlBuilder.append(" order by sort ");
		} else  if(descOrderBy.getMapSet()!=null&&descOrderBy.getMapSet().size()>0){
				//2014年9月16日 14:02:36 添加默认
				for(String key : descOrderBy.getMapSet()){
						sqlBuilder.append(" order by ");
						sqlBuilder.append(key);
						sqlBuilder.append(" ");
						sqlBuilder.append(descOrderBy.getContext(key));
				}
		} else{
			sqlBuilder.append(" order by cid desc ");
		}

		// 处理限制信息*/
		BreezeContext limitContext = root.getContextByPath("_R.spes.limit");
		if (limitContext != null) {
			limit(limitContext, sqlBuilder);
		}
		//2014年11月26日16:54:36 程明剑 增加groupby支持
		if(!groupBy.equals("group by ")&&"count".equals(resultset)){
			sqlBuilder.append(") ob");
		}
		return 0;
	}
}
