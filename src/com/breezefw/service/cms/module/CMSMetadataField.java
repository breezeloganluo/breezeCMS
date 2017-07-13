package com.breezefw.service.cms.module;

import com.breezefw.ability.btl.BTLExecutor;

/**
 * 2013年8月4日新增加了
 * ourterlink类型
 *
 */
public class CMSMetadataField {
	public static final int BUILDTYPE_NOMAL = 0;
	public static final int BUILDTYPE_OURTERKEY = 1;
	public static final int BUILDTYPE_OURTER = 2;
	public static final String OURTERFIELDNAME = "ourterField";
	
	public CMSMetadataField(String n,String t,int s){
		this.fieldName = n;
		this.fieldType = t;
		this.size = s;
	}
	public CMSMetadataField(String alias,String n,String t,int s){
		this.fieldName = n;
		this.fieldType = t;
		this.size = s;
		this.alias = alias;
	}
	public CMSMetadataField(String n,String t,int s,String d){
		this.fieldName = n;
		this.fieldType = t;
		this.size = s;
		this.extra = d;
	}
	
	public CMSMetadataField(String alias,String n,String t,int s,String d){
		this.fieldName = n;
		this.fieldType = t;
		this.size = s;
		this.extra = d;
		this.aliasField = alias + '.' + this.fieldName;
	}
	
	
	private String fieldName;
	private String fieldType;
	private int size;
	private String extra;
	//其格式为Alias.field
	private String aliasField;
	
	private BTLExecutor fieldTmp;
	//罗光瑜2014-09-29 增加客户端的类型
	private String clientType;
	
	
	public String getClientType() {
		return clientType;
	}
	public void setClientType(String clientType) {
		this.clientType = clientType;
	}


	/**
	 * 构建类型
	 * 0:正常类型
	 * 1:外链关键字
	 * 2:外链字段
	 */
	private int buildType;
	
	private boolean isList;

	//2014-09-04罗光瑜修改，创建的字段，要能知道是哪个alas设定的
	private String alias;
	
	public String getAlias() {
		return alias;
	}
	public void setAlias(String alias) {
		this.alias = alias;
	}
	/**
	 * @return the ourterLink
	 */
	public String getAliasField() {
		return aliasField;
	}
	/**
	 * @param aliasField the ourterLink to set
	 */
	public void setAliasField(String aliasField) {
		this.aliasField = aliasField;
	}
	/**
	 * @return the decorate
	 */
	public String getExtra() {
		return extra;
	}

	public boolean isList() {
		return isList;
	}
	public void setList(boolean isList) {
		this.isList = isList;
	}
	/**
	 * @return the buildType
	 */
	public int getBuildType() {
		return buildType;
	}
	/**
	 * @param buildType the buildType to set
	 */
	public void setBuildType(int buildType) {
		this.buildType = buildType;
	}
	/**
	 * @param decorate the decorate to set
	 */
	public void setExtra(String decorate) {
		this.extra = decorate;
	}

	/**
	 * @return the fieldName
	 */
	public String getFieldName() {
		return fieldName;
	}

	/**
	 * @return the fieldType
	 */
	public String getFieldType() {
		return fieldType;
	}

	
	public void setFieldType(String fieldType) {
		this.fieldType = fieldType;
	}
	/**
	 * @return the size
	 */
	public int getSize() {
		return size;
	}

	
	public void setSize(int size) {
		this.size = size;
	}
	public BTLExecutor getFieldTmp() {
		return fieldTmp;
	}
	public void setFieldTmp(BTLExecutor fieldTmp) {
		this.fieldTmp = fieldTmp;
	}
	
	
	public boolean equals(Object o) {
		try {
			CMSMetadataField f = (CMSMetadataField) o;
			if (f.fieldName != this.fieldName
					&& !(f.fieldName != null && f.fieldName
							.equals(this.fieldName))) {
				return false;
			}

			if (f.fieldType != this.fieldType
					&& !(f.fieldType != null && f.fieldType
							.equals(this.fieldType))) {
				return false;
			}

			if (f.size != this.size) {				
				return false;
			}
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	/**
	 * 字符串返回信息,这里直接返回相关的json数据
	 */
	public String toString(){
		StringBuilder resultBuilder = new StringBuilder();
		resultBuilder.append(this.fieldName).append(":{");
		resultBuilder.append("fieldType:'").append(this.fieldType).append("',");
		resultBuilder.append("fieldLen:'").append(this.size).append("',");
		resultBuilder.append("dataExt:'").append(this.extra).append("'");
		resultBuilder.append('}');
		return resultBuilder.toString();
	}
	
	
}
