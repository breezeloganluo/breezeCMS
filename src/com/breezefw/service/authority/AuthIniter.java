package com.breezefw.service.authority;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;





import com.breeze.base.db.COMMDB;
import com.breeze.base.log.Logger;
import com.breeze.framwork.databus.BreezeContext;
import com.breeze.framwork.databus.ContextTools;
import com.breeze.framwork.netserver.tool.ContextMgr;
import com.breeze.init.Initable;
import com.breezefw.service.authority.module.AuthorityAction;
import com.breezefw.ability.datarefresh.DataRefreshIF;

public class AuthIniter implements Initable, DataRefreshIF {
	//全局对象的路径设置：_G.authority.all.[servicename][n]= AuthorityAction;
	public static final String AUTHOPRITY_ALL = "authority.all";
	//全局对象的路径设置：_G.authority.actor.[actorName].[servicename][n]= AuthorityAction;
	public static final String AUTHOPRITY_ROLE = "authority.role";

	private Logger log = Logger
			.getLogger("com.breezefw.service.authority.AuthIniter");

	public String getRefreshName() {
		return "refreshAuth";
	}

	public void refresh(BreezeContext root) {
		try {
			// step 1 先读入全局 权限表并整理到全局变量中
			
			//设定全局信息表中的上下文
			BreezeContext authContext = new BreezeContext();
			//最后再改变上下文

			//sql查询并整理结果
			String sql = "select * from wg_action";
			ResultSet rs = COMMDB.executeSql(sql);

			HashMap<Integer, AuthorityAction> authMap = new HashMap<Integer, AuthorityAction>();
			ArrayList<AuthorityAction>allAList = new ArrayList<AuthorityAction>();
			while (rs.next()) {
				AuthorityAction aa = new AuthorityAction();
				aa.setActionid(rs.getInt("cid"));
				aa.setActionName(rs.getString("actionName"));
				aa.setServiceName(rs.getString("serviceName"));
				aa.setActionKey(rs.getString("actionKey"));
				String json = rs.getString("paramJson");
				if (json != null) {
					aa.setParamJsonByJson(json);
				}
				authMap.put(aa.getActionid(), aa);//map是给第二次处理关系时用的
				allAList.add(aa);//列表是处理全局信息的时候用的
			}
			rs.close();
			//下面要对所有的内容排序
			Collections.sort(allAList);
			//加入到全局的所有对象的service中
			for (AuthorityAction aa:allAList){
				BreezeContext sCtx = authContext.getContext(aa.getServiceName());
				if (sCtx == null || sCtx.isNull()){
					sCtx = new BreezeContext();
					authContext.setContext(aa.getServiceName(),sCtx);
				}
				sCtx.pushContext(new BreezeContext(aa));
			}

			// step 2 整理role和权限的关系
			
			//设定角色相关的全局信息
			BreezeContext roleContext = new BreezeContext();
			
			//将所有数据读出
			sql = "select a.name as roleName,b.actionCid as actionId from wg_roles a,wg_rolesaction b where a.cid = b.nodeid";
			rs = COMMDB.executeSql(sql);
			HashSet<String> roleNameSet = new HashSet<String>();//记录所有的角色名称
			//将数据绑定到actor这一层，还没分service,同时权限部分也只有id
			while (rs.next()) {
				roleNameSet.add(rs.getString("roleName"));
				String path = rs.getString("roleName") + "[]";
				roleContext.setContextByPath(path, new BreezeContext(rs.getInt("actionId")));
			}
			rs.close();

			// 整理每个角色下的列表，再按照service进行一次分类
			for (String aName : roleNameSet) {
				BreezeContext actorListContext = roleContext.getContext(aName);
				//某个角色下的serviceName和对应的权限列表
				HashMap<String, ArrayList<AuthorityAction>> aMapList = new HashMap<String, ArrayList<AuthorityAction>>();
				// 这个是某个actor下的所有权限了，下面要循环并且将其安装Service划分。
				for (int i = 0; i < actorListContext.getArraySize(); i++) {
					Integer tmpAId = (Integer) actorListContext.getContext(i)
							.getData();
					if (tmpAId == null) {
						continue;
					}
					AuthorityAction aaObj = authMap.get(tmpAId);
					if (aaObj == null) {
						continue;
					}
					//设置这个serviceName的列表设置
					ArrayList<AuthorityAction> nList = aMapList.get(aaObj
							.getServiceName());
					if (nList == null) {
						nList = new ArrayList<AuthorityAction>();
						aMapList.put(aaObj.getServiceName(), nList);
					}
					nList.add(aaObj);
				}
				//经过上面处理，当前的这个actor的数据已经全部记录到aMapList中，重置原来的actor那个Context
				actorListContext = new BreezeContext();
				roleContext.setContext(aName, actorListContext);

				// 对这个map进行处理，重新排序
				for (String sName : aMapList.keySet()) {
					BreezeContext sCtx = new BreezeContext();
					actorListContext.setContext(sName, sCtx);
					
					ArrayList<AuthorityAction> sortList = aMapList.get(sName);
					Collections.sort(sortList);
					for (AuthorityAction value : sortList) {
						sCtx.pushContext(new BreezeContext(value));
					}
				}
			}
			ContextMgr.global.setContextByPath(AUTHOPRITY_ALL, authContext);
			ContextMgr.global.setContextByPath(AUTHOPRITY_ROLE, roleContext);
		} catch (Exception e) {
			log.severe("enc a exception", e);
		}
	}

	public int getInitOrder() {
		return 200;
	}

	public void doInit(HashMap<String, String> paramMap) {
		this.refresh(null);
	}

	public String getInitName() {
		return "Authority";
	}


	public static String getActorJson(BreezeContext roleCtx){
		if (roleCtx == null || roleCtx.isNull()){			
			return null;
		}
		String role = roleCtx.getData().toString();
		String contextPath = AUTHOPRITY_ROLE + '.' + role;
		BreezeContext actionList = ContextMgr.global.getContextByPath(contextPath);		
		String result = ContextTools.getJsonString(actionList, null);
		return result;
	}

}
