package com.breezefw.service.cms.workflow;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;













import com.breeze.base.db.COMMDB;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.netserver.tool.ContextMgr;
import com.breezefw.service.cms.CmsIniter;
import com.breezefw.service.cms.module.CMSMetadata;
import com.breezefw.service.cms.module.CMSMetadataField;
import com.breezefw.service.cms.util.CMSMuliUtil;
/**
 * 这个类放置对CMS操作的一些公共的工具方法，全是静态的
 * @author Administrator
 *
 */
public class CMSTools {
	
	private static Logger log = Logger.getLogger("com.breezefw.service.cms.workflow.CMSTools");
	
	/**
	 * 根据数据库中cmsmetadata中定义的alias信息，定制alias
	 * @param alias
	 * @throws SQLException 
	 */
	public static int refreashDBByAlias(String alias,HashSet<String> alreadyProcess) throws SQLException{
		/*
		 *这里逻辑很复杂，整体思路如下：
		 *如果是非继承，分成修改和添加两种情况，而针对添加情况，旧对象理论上是不存在的。
		 *存在的可能性只有一种，就是之前添加失败了，阴差阳错，使得数据刷新是有东西的，也可以理解成
		 *修改的一种情况。但表是不存在的。这个时候，无论是存在也好，不存在也好。都按照如果不存在取自己
		 *存在用新对象的表。
		 *对于继承，如果是添加情况，理论上继承项的旧项目是不存在的，这样肯定不行。继承项一定是数据库的对比
		 *而就项目，实际只要其数据库的表信息，所以如果有继承，那么旧项目一定是父类就可以了。 
		 */
		//先获取对应alias
		CMSMetadata newOne = CmsIniter.getInstance().getDataByAlias(alias);
		String newTableName = newOne.getTableName();
		if (alreadyProcess!=null){
			if (alreadyProcess.contains(newTableName)){
				return 0;//已经处理过了，不要再处理
			}else{
				alreadyProcess.add(newTableName);
			}
		}

		CMSMetadata oldOneTmp = (newOne.getSuper()!=null)?newOne.getSuper():CmsIniter.getInstance().getOldDataByAlias(alias);

		CMSMetadata oldOne = null;
		//对于oldOne来讲就是table是有用的，其他字段无用
		if (oldOneTmp != null){
			//if (原来有父亲，现在没有父亲了){要拆表了
			if (oldOneTmp.getSuper()!= null && newOne.getSuper() == null ){
				//if(新旧对象表不一样){拆表处理，新建新表
				if (!oldOneTmp.getTableName().equals(newTableName)){
					oldOne = null;
				}
				//}
				//else{如果表一样，有问题啊，返回错误
				else{
					return 200;
				}
				//}
			}
			//}
			//else{
			else{
				oldOne = new CMSMetadata();
				oldOne.setTableName(oldOneTmp.getTableName());
			}
			//}
		}
		
		String oldTableName = oldOne == null ?  newTableName: oldOne
				.getTableName();

		// 修改要以实际的表的结构进行对比修改，不以存的数据描述来参照
		int oParserResult =(oldOne == null)?11: oldOne.parserTableFieldByTablename();
		//如果是创建表 或者是单表改多表 且单表不是关键表
		// 2015年10月22日15:00:04 FrankCheng 可能要进行修改
		// 判断是否存在特殊字段
		String[] muliTab = CMSMuliUtil.getMuliTab();
		if(muliTab != null && oldOneTmp !=null && oldOneTmp.getAlias().equals(muliTab[0])){
			log.severe("you are updating muliTab table! it can't change!");
			return 507;
		}
		if (oParserResult != 0 || ((oldOneTmp.getIsMuliTab() == null || oldOneTmp.getIsMuliTab().equals("0")) && newOne.getIsMuliTab().equals("1"))) {
			// 这一个判断就是让old根据表去获取字段信息，如果获取不到，那么无法修改，就只有先删后曾了
			// 2015年10月21日15:52:16 FrankCheng 若存在多表信息 那么循环执行创建  
			if(CMSMuliUtil.getMuliTab() == null || newOne.getIsMuliTab() == null || newOne.getIsMuliTab().equals("0")){
				return deleteCreate(oldTableName, newTableName, newOne);
			}else{
				//如果是那么返回506 提示自己是多表关键字 不可以设置为多表模式
				String[] strs = CMSMuliUtil.getMuliTab();
				String _alias = strs[0];
				if(_alias.equals(alias)){
					log.severe("you can't set the muliTab table to be the muliTabMode");
					return 506;
				}
				String _field = strs[1];
				String mpath = CmsIniter.COMSPATHPRIFIX + "." + _alias;
				CMSMetadata cmsMetadata = (CMSMetadata)ContextMgr.global.getContextByPath(mpath).getData();
				String _table = cmsMetadata.getTableName();
				String sql = "select " + _field + " from " + _table + " group by " + _field;
				ResultSet resultSet = COMMDB.executeSql(sql);
				int a=0;
				while(resultSet.next()){
					String prefix = resultSet.getString(1);
					String _oldTableName = prefix + "_" + oldTableName;
					String _newTableName = prefix + "_" + newTableName;
					a += deleteCreate(_oldTableName, _newTableName, newOne);
				}
				a += deleteCreate(oldTableName, newTableName, newOne);
				return a;
			}
		}
		log.fine("old Obj from global is :" + oldOne);
		// 从上下文中读取对应的要数据描述字符串和表名
		
		
		// 单表改多表 且不是关键表
		if(newOne.getIsMuliTab() != null && newOne.getIsMuliTab().equals("1")){
			//生成多张表
			CMSMetadata tab = CmsIniter.getInstance().getDataByAlias(muliTab[0]);
			String field = muliTab[1];
			String sql = "select " + field + " from " + tab.getTableName() + " where " + field + " is not null  group by " + field;
			ResultSet resultSet = COMMDB.executeSql(sql);
			int a=0;
			while(resultSet.next()){
				HashSet<String> sigSet = new HashSet<String>();
				StringBuilder sb = new StringBuilder();
				String _oldTableName = resultSet.getString(1) + "_" + oldTableName;
				String _newTableName = resultSet.getString(1) + "_" + newTableName;
				sb.append("ALTER TABLE ").append(_oldTableName).append(' ');
				boolean isFirst = true;
				if (!_oldTableName.equals(_newTableName)) {
					sb.append("RENAME TO ").append(_newTableName);
					isFirst = false;
				}
				// 第一轮，按照旧的表进行比较更新
				for (String key : oldOne.getFieldMap().keySet()) {
					CMSMetadataField oldField = oldOne.getFieldMap().get(key);
					CMSMetadataField newField = newOne.getFieldMap().get(key);

					sigSet.add(key);
					if (newField == null
							|| newField.getBuildType() == CMSMetadataField.BUILDTYPE_OURTER) {
						// 表示旧的多出来的，要删除
						if (isFirst) {
							isFirst = false;
						} else {
							sb.append(',');
						}
						sb.append("DROP ").append(key);
						continue;
					}
					if (oldField.equals(newField)) {
						continue;
					}
					// 表示要修改了
					if (isFirst) {
						isFirst = false;
					} else {
						sb.append(',');
					}
					sb.append("MODIFY ").append(key).append(' ')
							.append(newField.getFieldType());
					if (newField.getSize() > 0&&!newField.getFieldType().equals("Text")) {
						sb.append('(').append(newField.getSize()).append(')');
					}
					if (newField.getExtra() != null) {
						sb.append(' ').append(newField.getExtra());
					}
				}
				// 第二轮，new里面有的，就全部是新增加内容
				for (String key : newOne.getFieldMap().keySet()) {
					if (sigSet.contains(key)) {
						continue;
					}

					CMSMetadataField newField = newOne.getFieldMap().get(key);
					if (newField.getBuildType() == CMSMetadataField.BUILDTYPE_OURTER) {
						continue;
					}
					;
					// 表示要修改了
					if (isFirst) {
						isFirst = false;
					} else {
						sb.append(',');
					}

					sb.append("ADD ").append(key).append(' ')
							.append(newField.getFieldType());
					if (newField.getSize() > 0&&!newField.getFieldType().equals("Text")) {
						sb.append('(').append(newField.getSize()).append(')');
					}
					if (newField.getExtra() != null) {
						sb.append(' ').append(newField.getExtra());
					}
				}
				//若是单表变多表
				if (isFirst) {
					log.fine("nothing change!");
				} else {
					log.fine(sb.toString());
					COMMDB.executeUpdate(sb.toString());
				}
			}
		}
		HashSet<String> sigSet = new HashSet<String>();
		StringBuilder sb = new StringBuilder();
		sb.append("ALTER TABLE ").append(oldTableName).append(' ');
		boolean isFirst = true;
		if (!oldTableName.equals(newTableName)) {
			sb.append("RENAME TO ").append(newTableName);
			isFirst = false;
		}
		// 第一轮，按照旧的表进行比较更新
		for (String key : oldOne.getFieldMap().keySet()) {
			CMSMetadataField oldField = oldOne.getFieldMap().get(key);
			CMSMetadataField newField = newOne.getFieldMap().get(key);

			sigSet.add(key);
			if (newField == null
					|| newField.getBuildType() == CMSMetadataField.BUILDTYPE_OURTER) {
				// 表示旧的多出来的，要删除
				if (isFirst) {
					isFirst = false;
				} else {
					sb.append(',');
				}
				sb.append("DROP ").append(key);
				continue;
			}
			if (oldField.equals(newField)) {
				continue;
			}
			// 表示要修改了
			if (isFirst) {
				isFirst = false;
			} else {
				sb.append(',');
			}
			sb.append("MODIFY ").append(key).append(' ')
					.append(newField.getFieldType());
			if (newField.getSize() > 0&&!newField.getFieldType().equals("Text")) {
				sb.append('(').append(newField.getSize()).append(')');
			}
			if (newField.getExtra() != null) {
				sb.append(' ').append(newField.getExtra());
			}
		}
		// 第二轮，new里面有的，就全部是新增加内容
		for (String key : newOne.getFieldMap().keySet()) {
			if (sigSet.contains(key)) {
				continue;
			}

			CMSMetadataField newField = newOne.getFieldMap().get(key);
			if (newField.getBuildType() == CMSMetadataField.BUILDTYPE_OURTER) {
				continue;
			}
			;
			// 表示要修改了
			if (isFirst) {
				isFirst = false;
			} else {
				sb.append(',');
			}

			sb.append("ADD ").append(key).append(' ')
					.append(newField.getFieldType());
			if (newField.getSize() > 0&&!newField.getFieldType().equals("Text")) {
				sb.append('(').append(newField.getSize()).append(')');
			}
			if (newField.getExtra() != null) {
				sb.append(' ').append(newField.getExtra());
			}
		}
		// 执行sql语句
		if (isFirst) {
			log.fine("nothing change!");
		} else {
			log.fine(sb.toString());
			COMMDB.executeUpdate(sb.toString());
		}
		return 0;
	}
	
	private static  int deleteCreate(String oldTableName, String newTableName,
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
		return 0;
	}
}
