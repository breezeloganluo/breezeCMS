package com.breezefw.service.authority.module;

import java.util.Map;

import com.breeze.support.tools.GsonTools;
import com.breezefw.service.authority.module.AuthorityAction;

public class AuthorityAction implements Comparable<AuthorityAction>  {

	private int actionid;
	private String actionName;
	private String serviceName;
	private String actionKey;
	private Map<String,Object> paramJson;
	private String paramJsonStr;
	
	public String getActionKey() {
		return actionKey;
	}


	public void setActionKey(String actionKey) {
		this.actionKey = actionKey;
	}


	/**
	 * @return the actionid
	 */
	public int getActionid() {
		return actionid;
	}


	/**
	 * @param actionid the actionid to set
	 */
	public void setActionid(int actionid) {
		this.actionid = actionid;
	}


	/**
	 * @return the actionName
	 */
	public String getActionName() {
		return actionName;
	}


	/**
	 * @param actionName the actionName to set
	 */
	public void setActionName(String actionName) {
		this.actionName = actionName.replaceAll("\\.", "_");
	}


	/**
	 * @return the serviceName
	 */
	public String getServiceName() {
		return serviceName;
	}


	/**
	 * @param serviceName the serviceName to set
	 */
	public void setServiceName(String serviceName) {
		this.serviceName = serviceName;
	}


	/**
	 * @return the paramJson
	 */
	public Map<String, Object> getParamJson() {
		return paramJson;
	}


	public void setParamJsonByJson(String json){
		Map<String, Object> jsonMap = GsonTools
				.parserJsonMapObj(json);
		this.paramJson = jsonMap;
		this.paramJsonStr = json;
	}

	public int compareTo(AuthorityAction o) {
		if (this.paramJson == null || this.paramJson.size() == 0){
			return -1;
		}
		if (o.paramJson == null || o.paramJson.size() == 0){
			return 1;
		}
		
		
		return this.paramJson.size() - o.paramJson.size();
	}
	
	public String toString(){
		StringBuilder sb = new StringBuilder();
		sb.append('{');
		sb.append("actionid:").append(this.actionid).append(',');
		sb.append("actionName:'").append(this.actionName).append("',");
		sb.append("serviceName:'").append(this.serviceName).append("',");
		sb.append("paramJson:").append(this.paramJsonStr).append(',');
		sb.append('}');
		return sb.toString();
	}

}
